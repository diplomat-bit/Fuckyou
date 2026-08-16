import os
import sys
import xml.etree.ElementTree as ET
from decimal import Decimal, InvalidOperation
from datetime import datetime, date, timedelta
from dataclasses import dataclass, field
from typing import List, Tuple, Optional, Dict, Any
import io

# Try importing pandas and streamlit for the interactive UI
try:
    import pandas as pd
    import streamlit as st
    HAS_UI_LIBS = True
except ImportError:
    HAS_UI_LIBS = False

# ==========================================
# DATA MODELS
# ==========================================

@dataclass
class CamtBalance:
    type_code: str  # OPBD (Opening), CLBD (Closing), etc.
    amount: Decimal
    currency: str
    indicator: str  # CRDT (Credit), DBIT (Debit)
    date: date

    @property
    def signed_amount(self) -> Decimal:
        return self.amount if self.indicator == "CRDT" else -self.amount


@dataclass
class CamtEntry:
    entry_id: str
    amount: Decimal
    currency: str
    indicator: str  # CRDT (Credit), DBIT (Debit)
    booking_date: date
    value_date: Optional[date]
    account_servicer_ref: str
    end_to_end_id: str
    proprietary_ref: str
    additional_info: str
    matched: bool = False

    @property
    def signed_amount(self) -> Decimal:
        return self.amount if self.indicator == "CRDT" else -self.amount


@dataclass
class CamtStatement:
    statement_id: str
    account_iban: str
    account_other_id: str
    currency: str
    opening_balance: Optional[CamtBalance] = None
    closing_balance: Optional[CamtBalance] = None
    entries: List[CamtEntry] = field(default_factory=list)


@dataclass
class LedgerEntry:
    ledger_id: str
    amount: Decimal
    indicator: str  # CRDT (Credit), DBIT (Debit)
    entry_date: date
    reference: str
    description: str
    matched: bool = False

    @property
    def signed_amount(self) -> Decimal:
        return self.amount if self.indicator == "CRDT" else -self.amount


@dataclass
class BalanceReconciliationResult:
    statement_id: str
    opening_balance_matched: bool
    closing_balance_matched: bool
    mathematically_consistent: bool
    statement_opening: Decimal
    statement_closing: Decimal
    calculated_closing: Decimal
    ledger_opening: Optional[Decimal] = None
    ledger_closing: Optional[Decimal] = None
    opening_discrepancy: Decimal = Decimal("0.00")
    closing_discrepancy: Decimal = Decimal("0.00")
    mathematical_discrepancy: Decimal = Decimal("0.00")


@dataclass
class EntryMatch:
    bank_entry: CamtEntry
    ledger_entry: LedgerEntry
    match_type: str  # "EXACT", "FUZZY_REF", "AMOUNT_DATE"
    confidence_score: float  # 0.0 to 1.0


@dataclass
class ReconciliationReport:
    balance_result: BalanceReconciliationResult
    matched_entries: List[EntryMatch] = field(default_factory=list)
    unmatched_bank_entries: List[CamtEntry] = field(default_factory=list)
    unmatched_ledger_entries: List[LedgerEntry] = field(default_factory=list)
    amount_mismatches: List[Tuple[CamtEntry, LedgerEntry, Decimal]] = field(default_factory=list)


# ==========================================
# CAMT.053 XML PARSER
# ==========================================

class Camt053Parser:
    """
    Robust, namespace-agnostic parser for CAMT.053 XML files.
    """
    @staticmethod
    def _find_path(element: ET.Element, path_list: List[str]) -> List[ET.Element]:
        current_elements = [element]
        for tag in path_list:
            next_elements = []
            for curr in current_elements:
                for child in curr:
                    # Strip namespace
                    child_tag = child.tag.split('}')[-1]
                    if child_tag == tag:
                        next_elements.append(child)
            current_elements = next_elements
            if not current_elements:
                return []
        return current_elements

    @classmethod
    def _get_path_text(cls, element: ET.Element, path_list: List[str], default: str = "") -> str:
        elems = cls._find_path(element, path_list)
        if elems and elems[0].text:
            return elems[0].text.strip()
        return default

    @classmethod
    def parse(cls, xml_content: bytes) -> List[CamtStatement]:
        try:
            root = ET.fromstring(xml_content)
        except ET.ParseError as e:
            raise ValueError(f"Invalid XML format: {str(e)}")

        statements = []
        # Find all Stmt elements under BkToCstmrStmt
        stmt_elements = cls._find_path(root, ["BkToCstmrStmt", "Stmt"])
        if not stmt_elements:
            # Try direct search if nested differently
            stmt_elements = []
            for elem in root.iter():
                if elem.tag.split('}')[-1] == 'Stmt':
                    stmt_elements.append(elem)

        for stmt_elem in stmt_elements:
            stmt_id = cls._get_path_text(stmt_elem, ["Id"])
            
            # Account details
            iban = cls._get_path_text(stmt_elem, ["Acct", "Id", "IBAN"])
            other_id = cls._get_path_text(stmt_elem, ["Acct", "Id", "Othr", "Id"])
            currency = cls._get_path_text(stmt_elem, ["Acct", "Ccy"])

            statement = CamtStatement(
                statement_id=stmt_id,
                account_iban=iban,
                account_other_id=other_id,
                currency=currency
            )

            # Parse Balances
            bal_elements = cls._find_path(stmt_elem, ["Bal"])
            for bal_elem in bal_elements:
                type_code = cls._get_path_text(bal_elem, ["Tp", "CdOrPrtry", "Cd"])
                
                amt_elem = cls._find_path(bal_elem, ["Amt"])
                amount_val = Decimal("0.00")
                bal_currency = currency
                if amt_elem:
                    amount_val = Decimal(amt_elem[0].text or "0.00")
                    bal_currency = amt_elem[0].attrib.get("Ccy", currency)

                indicator = cls._get_path_text(bal_elem, ["CdtDbtInd"])
                
                # Date parsing
                date_str = cls._get_path_text(bal_elem, ["Dt", "Dt"])
                if not date_str:
                    date_time_str = cls._get_path_text(bal_elem, ["Dt", "DtTm"])
                    if date_time_str:
                        date_str = date_time_str[:10]
                
                bal_date = date.today()
                if date_str:
                    try:
                        bal_date = datetime.strptime(date_str, "%Y-%m-%d").date()
                    except ValueError:
                        pass

                balance = CamtBalance(
                    type_code=type_code,
                    amount=amount_val,
                    currency=bal_currency,
                    indicator=indicator,
                    date=bal_date
                )

                if type_code == "OPBD":
                    statement.opening_balance = balance
                elif type_code == "CLBD":
                    statement.closing_balance = balance

            # Parse Entries
            ntry_elements = cls._find_path(stmt_elem, ["Ntry"])
            for idx, ntry_elem in enumerate(ntry_elements):
                amt_elem = cls._find_path(ntry_elem, ["Amt"])
                amount_val = Decimal("0.00")
                entry_currency = currency
                if amt_elem:
                    amount_val = Decimal(amt_elem[0].text or "0.00")
                    entry_currency = amt_elem[0].attrib.get("Ccy", currency)

                indicator = cls._get_path_text(ntry_elem, ["CdtDbtInd"])
                
                # Booking Date
                book_date_str = cls._get_path_text(ntry_elem, ["BookgDt", "Dt"])
                if not book_date_str:
                    book_date_time_str = cls._get_path_text(ntry_elem, ["BookgDt", "DtTm"])
                    if book_date_time_str:
                        book_date_str = book_date_time_str[:10]
                
                booking_date = date.today()
                if book_date_str:
                    try:
                        booking_date = datetime.strptime(book_date_str, "%Y-%m-%d").date()
                    except ValueError:
                        pass

                # Value Date
                val_date_str = cls._get_path_text(ntry_elem, ["ValDt", "Dt"])
                if not val_date_str:
                    val_date_time_str = cls._get_path_text(ntry_elem, ["ValDt", "DtTm"])
                    if val_date_time_str:
                        val_date_str = val_date_time_str[:10]
                
                value_date = None
                if val_date_str:
                    try:
                        value_date = datetime.strptime(val_date_str, "%Y-%m-%d").date()
                    except ValueError:
                        pass

                acct_servicer_ref = cls._get_path_text(ntry_elem, ["AcctSvcrRef"])
                
                # Transaction Details / References
                tx_details = cls._find_path(ntry_elem, ["NtryDtls", "TxDtls"])
                end_to_end_id = ""
                proprietary_ref = ""
                additional_info = cls._get_path_text(ntry_elem, ["AddtlNtryInf"])

                if tx_details:
                    end_to_end_id = cls._get_path_text(tx_details[0], ["Refs", "EndToEndId"])
                    proprietary_ref = cls._get_path_text(tx_details[0], ["Refs", "Prtry", "Ref"])
                    if not additional_info:
                        additional_info = cls._get_path_text(tx_details[0], ["RmtInf", "Ustrd"])

                entry = CamtEntry(
                    entry_id=f"{statement.statement_id}_E{idx}",
                    amount=amount_val,
                    currency=entry_currency,
                    indicator=indicator,
                    booking_date=booking_date,
                    value_date=value_date,
                    account_servicer_ref=acct_servicer_ref,
                    end_to_end_id=end_to_end_id,
                    proprietary_ref=proprietary_ref,
                    additional_info=additional_info
                )
                statement.entries.append(entry)

            statements.append(statement)

        return statements


# ==========================================
# RECONCILIATION ENGINE
# ==========================================

class ReconciliationEngine:
    """
    Core engine to reconcile CAMT.053 statements against internal ledger records.
    """
    def __init__(self, date_tolerance_days: int = 3):
        self.date_tolerance_days = date_tolerance_days

    def reconcile(
        self, 
        statement: CamtStatement, 
        ledger_entries: List[LedgerEntry],
        ledger_opening_balance: Optional[Decimal] = None,
        ledger_closing_balance: Optional[Decimal] = None
    ) -> ReconciliationReport:
        
        # 1. Balance Reconciliation
        bal_result = self.reconcile_balances(
            statement, 
            ledger_opening_balance, 
            ledger_closing_balance
        )

        # Make copies of entries to track matching state
        bank_entries = [e for e in statement.entries]
        ledger_pool = [l for l in ledger_entries]

        matched_entries: List[EntryMatch] = []
        amount_mismatches: List[Tuple[CamtEntry, LedgerEntry, Decimal]] = []

        # --- MATCHING STEP 1: Exact Reference & Exact Amount & Direction ---
        for b_entry in bank_entries:
            if b_entry.matched:
                continue
            
            for l_entry in ledger_pool:
                if l_entry.matched:
                    continue

                # Check references
                ref_match = False
                if b_entry.end_to_end_id and b_entry.end_to_end_id == l_entry.reference:
                    ref_match = True
                elif b_entry.proprietary_ref and b_entry.proprietary_ref == l_entry.reference:
                    ref_match = True
                elif b_entry.account_servicer_ref and b_entry.account_servicer_ref == l_entry.reference:
                    ref_match = True

                if ref_match:
                    # Check amount and direction
                    if b_entry.amount == l_entry.amount and b_entry.indicator == l_entry.indicator:
                        # Check date tolerance
                        date_diff = abs((b_entry.booking_date - l_entry.entry_date).days)
                        if date_diff <= self.date_tolerance_days:
                            b_entry.matched = True
                            l_entry.matched = True
                            matched_entries.append(EntryMatch(
                                bank_entry=b_entry,
                                ledger_entry=l_entry,
                                match_type="EXACT",
                                confidence_score=1.0
                            ))
                            break

        # --- MATCHING STEP 2: Amount & Date Match (No Reference Match) ---
        for b_entry in bank_entries:
            if b_entry.matched:
                continue

            for l_entry in ledger_pool:
                if l_entry.matched:
                    continue

                if b_entry.amount == l_entry.amount and b_entry.indicator == l_entry.indicator:
                    date_diff = abs((b_entry.booking_date - l_entry.entry_date).days)
                    if date_diff <= self.date_tolerance_days:
                        b_entry.matched = True
                        l_entry.matched = True
                        matched_entries.append(EntryMatch(
                            bank_entry=b_entry,
                            ledger_entry=l_entry,
                            match_type="AMOUNT_DATE",
                            confidence_score=0.8
                        ))
                        break

        # --- MATCHING STEP 3: Reference Match but Amount Mismatch ---
        for b_entry in bank_entries:
            if b_entry.matched:
                continue

            for l_entry in ledger_pool:
                if l_entry.matched:
                    continue

                ref_match = False
                if b_entry.end_to_end_id and b_entry.end_to_end_id == l_entry.reference:
                    ref_match = True
                elif b_entry.proprietary_ref and b_entry.proprietary_ref == l_entry.reference:
                    ref_match = True

                if ref_match and b_entry.indicator == l_entry.indicator:
                    date_diff = abs((b_entry.booking_date - l_entry.entry_date).days)
                    if date_diff <= self.date_tolerance_days:
                        # Flag as amount mismatch instead of fully matching
                        diff = abs(b_entry.amount - l_entry.amount)
                        amount_mismatches.append((b_entry, l_entry, diff))
                        # Mark as matched to prevent further matching, but keep in mismatch list
                        b_entry.matched = True
                        l_entry.matched = True
                        break

        # Collect unmatched entries
        unmatched_bank = [b for b in bank_entries if not b.matched]
        unmatched_ledger = [l for l in ledger_pool if not l.matched]

        return ReconciliationReport(
            balance_result=bal_result,
            matched_entries=matched_entries,
            unmatched_bank_entries=unmatched_bank,
            unmatched_ledger_entries=unmatched_ledger,
            amount_mismatches=amount_mismatches
        )

    def reconcile_balances(
        self, 
        statement: CamtStatement, 
        ledger_opening_balance: Optional[Decimal] = None,
        ledger_closing_balance: Optional[Decimal] = None
    ) -> BalanceReconciliationResult:
        
        stmt_op = statement.opening_balance.signed_amount if statement.opening_balance else Decimal("0.00")
        stmt_cl = statement.closing_balance.signed_amount if statement.closing_balance else Decimal("0.00")

        # Calculate expected closing balance based on entries
        total_entries_sum = sum(entry.signed_amount for entry in statement.entries)
        calculated_closing = stmt_op + total_entries_sum

        # Check mathematical consistency
        mathematical_discrepancy = stmt_cl - calculated_closing
        mathematically_consistent = abs(mathematical_discrepancy) < Decimal("0.01")

        # Compare with ledger balances if provided
        opening_balance_matched = True
        closing_balance_matched = True
        opening_discrepancy = Decimal("0.00")
        closing_discrepancy = Decimal("0.00")

        if ledger_opening_balance is not None:
            opening_discrepancy = stmt_op - ledger_opening_balance
            opening_balance_matched = abs(opening_discrepancy) < Decimal("0.01")

        if ledger_closing_balance is not None:
            closing_discrepancy = stmt_cl - ledger_closing_balance
            closing_balance_matched = abs(closing_discrepancy) < Decimal("0.01")

        return BalanceReconciliationResult(
            statement_id=statement.statement_id,
            opening_balance_matched=opening_balance_matched,
            closing_balance_matched=closing_balance_matched,
            mathematically_consistent=mathematically_consistent,
            statement_opening=stmt_op,
            statement_closing=stmt_cl,
            calculated_closing=calculated_closing,
            ledger_opening=ledger_opening_balance,
            ledger_closing=ledger_closing_balance,
            opening_discrepancy=opening_discrepancy,
            closing_discrepancy=closing_discrepancy,
            mathematical_discrepancy=mathematical_discrepancy
        )


# ==========================================
# DEMO DATA GENERATORS
# ==========================================

def get_mock_camt053_xml() -> bytes:
    return b"""<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
    <BkToCstmrStmt>
        <Stmt>
            <Id>ST-2023-11-01-001</Id>
            <Acct>
                <Id>
                    <IBAN>DE89370400440532013000</IBAN>
                </Id>
                <Ccy>EUR</Ccy>
            </Acct>
            <Bal>
                <Tp>
                    <CdOrPrtry>
                        <Cd>OPBD</Cd>
                    </CdOrPrtry>
                </Tp>
                <Amt Ccy="EUR">150000.00</Amt>
                <CdtDbtInd>CRDT</CdtDbtInd>
                <Dt>
                    <Dt>2023-11-01</Dt>
                </Dt>
            </Bal>
            <Ntry>
                <Amt Ccy="EUR">1250.00</Amt>
                <CdtDbtInd>CRDT</CdtDbtInd>
                <BookgDt>
                    <Dt>2023-11-01</Dt>
                </BookgDt>
                <ValDt>
                    <Dt>2023-11-01</Dt>
                </ValDt>
                <AcctSvcrRef>REF-99201</AcctSvcrRef>
                <NtryDtls>
                    <TxDtls>
                        <Refs>
                            <EndToEndId>E2E-TX-1001</EndToEndId>
                        </Refs>
                        <RmtInf>
                            <Ustrd>Invoice payment ACME Corp</Ustrd>
                        </RmtInf>
                    </TxDtls>
                </NtryDtls>
            </Ntry>
            <Ntry>
                <Amt Ccy="EUR">450.00</Amt>
                <CdtDbtInd>DBIT</CdtDbtInd>
                <BookgDt>
                    <Dt>2023-11-02</Dt>
                </BookgDt>
                <ValDt>
                    <Dt>2023-11-02</Dt>
                </ValDt>
                <AcctSvcrRef>REF-99202</AcctSvcrRef>
                <NtryDtls>
                    <TxDtls>
                        <Refs>
                            <EndToEndId>E2E-TX-1002</EndToEndId>
                        </Refs>
                        <RmtInf>
                            <Ustrd>Office supplies purchase</Ustrd>
                        </RmtInf>
                    </TxDtls>
                </NtryDtls>
            </Ntry>
            <Ntry>
                <Amt Ccy="EUR">3200.00</Amt>
                <CdtDbtInd>CRDT</CdtDbtInd>
                <BookgDt>
                    <Dt>2023-11-03</Dt>
                </BookgDt>
                <ValDt>
                    <Dt>2023-11-03</Dt>
                </ValDt>
                <AcctSvcrRef>REF-99203</AcctSvcrRef>
                <NtryDtls>
                    <TxDtls>
                        <Refs>
                            <EndToEndId>E2E-TX-1003</EndToEndId>
                        </Refs>
                        <RmtInf>
                            <Ustrd>Consulting services rendered</Ustrd>
                        </RmtInf>
                    </TxDtls>
                </NtryDtls>
            </Ntry>
            <Ntry>
                <Amt Ccy="EUR">150.00</Amt>
                <CdtDbtInd>DBIT</CdtDbtInd>
                <BookgDt>
                    <Dt>2023-11-03</Dt>
                </BookgDt>
                <ValDt>
                    <Dt>2023-11-03</Dt>
                </ValDt>
                <AcctSvcrRef>REF-99204</AcctSvcrRef>
                <NtryDtls>
                    <TxDtls>
                        <Refs>
                            <EndToEndId>E2E-TX-1004</EndToEndId>
                        </Refs>
                        <RmtInf>
                            <Ustrd>Bank service charge</Ustrd>
                        </RmtInf>
                    </TxDtls>
                </NtryDtls>
            </Ntry>
            <Bal>
                <Tp>
                    <CdOrPrtry>
                        <Cd>CLBD</Cd>
                    </CdOrPrtry>
                </Tp>
                <Amt Ccy="EUR">153850.00</Amt>
                <CdtDbtInd>CRDT</CdtDbtInd>
                <Dt>
                    <Dt>2023-11-03</Dt>
                </Dt>
            </Bal>
        </Stmt>
    </BkToCstmrStmt>
</Document>
"""

def get_mock_ledger_csv() -> str:
    return """ledger_id,amount,indicator,entry_date,reference,description
L-001,1250.00,CRDT,2023-11-01,E2E-TX-1001,ACME Corp Invoice Payment
L-002,450.00,DBIT,2023-11-02,E2E-TX-1002,Office Supplies
L-003,3200.00,CRDT,2023-11-03,E2E-TX-1003,Consulting Services
L-004,140.00,DBIT,2023-11-03,E2E-TX-1004,Bank Service Charge (Amount Mismatch Demo)
L-005,999.00,CRDT,2023-11-04,E2E-TX-9999,Unmatched Ledger Entry Demo
"""


# ==========================================
# STREAMLIT INTERACTIVE APP
# ==========================================

def run_streamlit_app():
    st.set_page_config(
        page_title="CAMT.053 Balance & Entry Reconciler",
        page_icon="⚖️",
        layout="wide"
    )

    st.title("⚖️ CAMT.053 Balance & Entry Reconciler")
    st.markdown(
        "Upload your ISO 20022 CAMT.053 bank statement and your internal ledger records "
        "to automatically reconcile balances and transaction entries."
    )

    # Sidebar Configuration
    st.sidebar.header("Configuration")
    date_tolerance = st.sidebar.slider(
        "Date Tolerance (Days)", 
        min_value=0, 
        max_value=14, 
        value=3,
        help="Maximum allowed difference between bank booking date and ledger entry date."
    )

    st.sidebar.subheader("Ledger Balances (Optional)")
    ledger_op_input = st.sidebar.text_input("Expected Opening Balance", value="150000.00")
    ledger_cl_input = st.sidebar.text_input("Expected Closing Balance", value="153850.00")

    try:
        ledger_op = Decimal(ledger_op_input) if ledger_op_input else None
    except InvalidOperation:
        ledger_op = None
        st.sidebar.error("Invalid Opening Balance format")

    try:
        ledger_cl = Decimal(ledger_cl_input) if ledger_cl_input else None
    except InvalidOperation:
        ledger_cl = None
        st.sidebar.error("Invalid Closing Balance format")

    # Demo Data Button
    use_demo = st.sidebar.checkbox("Use Demo Data", value=True)

    col1, col2 = st.columns(2)

    camt_bytes = None
    ledger_csv_str = None

    with col1:
        st.subheader("1. Bank Statement (CAMT.053 XML)")
        camt_file = st.file_uploader("Upload CAMT.053 XML file", type=["xml"])
        if camt_file:
            camt_bytes = camt_file.read()
        elif use_demo:
            camt_bytes = get_mock_camt053_xml()
            st.info("Using demo CAMT.053 statement.")

    with col2:
        st.subheader("2. Internal Ledger (CSV)")
        ledger_file = st.file_uploader("Upload Ledger CSV file", type=["csv"])
        if ledger_file:
            ledger_csv_str = ledger_file.read().decode("utf-8")
        elif use_demo:
            ledger_csv_str = get_mock_ledger_csv()
            st.info("Using demo Ledger CSV.")

    if camt_bytes and ledger_csv_str:
        try:
            # Parse CAMT.053
            statements = Camt053Parser.parse(camt_bytes)
            if not statements:
                st.error("No statements found in the CAMT.053 file.")
                return
            
            statement = statements[0]  # Reconcile the first statement in the file

            # Parse Ledger CSV
            ledger_df = pd.read_csv(io.StringIO(ledger_csv_str))
            
            # Validate columns
            required_cols = {"ledger_id", "amount", "indicator", "entry_date", "reference", "description"}
            if not required_cols.issubset(ledger_df.columns):
                st.error(f"Ledger CSV must contain columns: {', '.join(required_cols)}")
                return

            ledger_entries = []
            for _, row in ledger_df.iterrows():
                try:
                    ledger_entries.append(LedgerEntry(
                        ledger_id=str(row["ledger_id"]),
                        amount=Decimal(str(row["amount"])),
                        indicator=str(row["indicator"]).strip().upper(),
                        entry_date=datetime.strptime(str(row["entry_date"]).strip(), "%Y-%m-%d").date(),
                        reference=str(row["reference"]).strip(),
                        description=str(row["description"])
                    ))
                except Exception as e:
                    st.warning(f"Skipping invalid ledger row: {row.to_dict()} - Error: {str(e)}")

            # Run Reconciliation Engine
            engine = ReconciliationEngine(date_tolerance_days=date_tolerance)
            report = engine.reconcile(statement, ledger_entries, ledger_op, ledger_cl)

            # Display Results
            st.header("Reconciliation Report")

            # Metrics Summary
            m1, m2, m3, m4 = st.columns(4)
            m1.metric(
                "Statement Opening Balance", 
                f"{statement.currency} {report.balance_result.statement_opening:,.2f}"
            )
            m2.metric(
                "Statement Closing Balance", 
                f"{statement.currency} {report.balance_result.statement_closing:,.2f}"
            )
            
            # Balance Match Status
            bal_status = "✅ MATCHED" if report.balance_result.opening_balance_matched and report.balance_result.closing_balance_matched else "❌ DISCREPANCY"
            m3.metric("Balance Match Status", bal_status)

            # Entry Match Rate
            total_bank_entries = len(statement.entries)
            matched_count = len(report.matched_entries)
            match_rate = (matched_count / total_bank_entries * 100) if total_bank_entries > 0 else 0
            m4.metric("Entry Match Rate", f"{match_rate:.1f}%", f"{matched_count} of {total_bank_entries}")

            # Balance Reconciliation Details
            with st.expander("🔍 Balance Reconciliation Details", expanded=True):
                bal_data = {
                    "Metric": [
                        "Opening Balance (Statement vs Ledger)",
                        "Closing Balance (Statement vs Ledger)",
                        "Mathematical Consistency (Opening + Entries = Closing)"
                    ],
                    "Statement Value": [
                        f"{report.balance_result.statement_opening:,.2f}",
                        f"{report.balance_result.statement_closing:,.2f}",
                        f"Calculated: {report.balance_result.calculated_closing:,.2f}"
                    ],
                    "Ledger/Expected Value": [
                        f"{report.balance_result.ledger_opening:,.2f}" if report.balance_result.ledger_opening is not None else "N/A",
                        f"{report.balance_result.ledger_closing:,.2f}" if report.balance_result.ledger_closing is not None else "N/A",
                        f"Statement: {report.balance_result.statement_closing:,.2f}"
                    ],
                    "Discrepancy": [
                        f"{report.balance_result.opening_discrepancy:,.2f}",
                        f"{report.balance_result.closing_discrepancy:,.2f}",
                        f"{report.balance_result.mathematical_discrepancy:,.2f}"
                    ],
                    "Status": [
                        "✅ OK" if report.balance_result.opening_balance_matched else "❌ MISMATCH",
                        "✅ OK" if report.balance_result.closing_balance_matched else "❌ MISMATCH",
                        "✅ OK" if report.balance_result.mathematically_consistent else "❌ MISMATCH"
                    ]
                }
                st.table(pd.DataFrame(bal_data))

            # Matched Entries
            st.subheader("✅ Matched Entries")
            if report.matched_entries:
                matched_rows = []
                for match in report.matched_entries:
                    matched_rows.append({
                        "Bank Date": match.bank_entry.booking_date,
                        "Ledger Date": match.ledger_entry.entry_date,
                        "Reference": match.bank_entry.end_to_end_id or match.bank_entry.proprietary_ref,
                        "Amount": f"{match.bank_entry.signed_amount:,.2f}",
                        "Match Type": match.match_type,
                        "Confidence": f"{match.confidence_score * 100:.0f}%"
                    })
                st.dataframe(pd.DataFrame(matched_rows), use_container_width=True)
            else:
                st.info("No entries matched.")

            # Discrepancies & Unmatched
            st.subheader("⚠️ Discrepancies & Unmatched Entries")
            tab1, tab2, tab3 = st.tabs([
                "Amount Mismatches", 
                "Unmatched Bank Entries (Missing in Ledger)", 
                "Unmatched Ledger Entries (Missing in Bank)"
            ])

            with tab1:
                if report.amount_mismatches:
                    mismatch_rows = []
                    for b_ent, l_ent, diff in report.amount_mismatches:
                        mismatch_rows.append({
                            "Reference": b_ent.end_to_end_id or b_ent.proprietary_ref,
                            "Bank Amount": f"{b_ent.signed_amount:,.2f}",
                            "Ledger Amount": f"{l_ent.signed_amount:,.2f}",
                            "Difference": f"{diff:,.2f}",
                            "Bank Date": b_ent.booking_date,
                            "Ledger Date": l_ent.entry_date
                        })
                    st.dataframe(pd.DataFrame(mismatch_rows), use_container_width=True)
                else:
                    st.success("No amount mismatches found!")

            with tab2:
                if report.unmatched_bank_entries:
                    unmatched_bank_rows = []
                    for b_ent in report.unmatched_bank_entries:
                        unmatched_bank_rows.append({
                            "Booking Date": b_ent.booking_date,
                            "Value Date": b_ent.value_date,
                            "Amount": f"{b_ent.signed_amount:,.2f}",
                            "End-to-End ID": b_ent.end_to_end_id,
                            "Proprietary Ref": b_ent.proprietary_ref,
                            "Additional Info": b_ent.additional_info
                        })
                    st.dataframe(pd.DataFrame(unmatched_bank_rows), use_container_width=True)
                else:
                    st.success("All bank entries matched!")

            with tab3:
                if report.unmatched_ledger_entries:
                    unmatched_ledger_rows = []
                    for l_ent in report.unmatched_ledger_entries:
                        unmatched_ledger_rows.append({
                            "Entry Date": l_ent.entry_date,
                            "Ledger ID": l_ent.ledger_id,
                            "Amount": f"{l_ent.signed_amount:,.2f}",
                            "Reference": l_ent.reference,
                            "Description": l_ent.description
                        })
                    st.dataframe(pd.DataFrame(unmatched_ledger_rows), use_container_width=True)
                else:
                    st.success("All ledger entries matched!")

        except Exception as e:
            st.error(f"An error occurred during reconciliation: {str(e)}")
            st.exception(e)


# ==========================================
# COMMAND LINE INTERFACE (FALLBACK)
# ==========================================

def run_cli():
    print("=" * 60)
    print("CAMT.053 Balance & Entry Reconciler (CLI Mode)")
    print("=" * 60)
    
    # Load mock data
    camt_bytes = get_mock_camt053_xml()
    ledger_csv_str = get_mock_ledger_csv()

    print("\n[1] Parsing CAMT.053 Statement...")
    statements = Camt053Parser.parse(camt_bytes)
    statement = statements[0]
    print(f"    Statement ID: {statement.statement_id}")
    print(f"    Account IBAN: {statement.account_iban}")
    print(f"    Currency: {statement.currency}")
    print(f"    Opening Balance: {statement.opening_balance.signed_amount if statement.opening_balance else 'N/A'}")
    print(f"    Closing Balance: {statement.closing_balance.signed_amount if statement.closing_balance else 'N/A'}")
    print(f"    Total Entries: {len(statement.entries)}")

    print("\n[2] Parsing Ledger CSV...")
    ledger_entries = []
    # Simple CSV parser for CLI fallback
    lines = ledger_csv_str.strip().split("\n")[1:]
    for line in lines:
        parts = line.split(",")
        ledger_entries.append(LedgerEntry(
            ledger_id=parts[0],
            amount=Decimal(parts[1]),
            indicator=parts[2],
            entry_date=datetime.strptime(parts[3], "%Y-%m-%d").date(),
            reference=parts[4],
            description=parts[5]
        ))
    print(f"    Total Ledger Entries: {len(ledger_entries)}")

    print("\n[3] Running Reconciliation Engine...")
    engine = ReconciliationEngine(date_tolerance_days=3)
    report = engine.reconcile(
        statement, 
        ledger_entries, 
        ledger_opening_balance=Decimal("150000.00"),
        ledger_closing_balance=Decimal("153850.00")
    )

    print("\n" + "=" * 40)
    print("RECONCILIATION REPORT SUMMARY")
    print("=" * 40)
    print(f"Opening Balance Match: {'✅ MATCHED' if report.balance_result.opening_balance_matched else '❌ MISMATCH'}")
    print(f"Closing Balance Match: {'✅ MATCHED' if report.balance_result.closing_balance_matched else '❌ MISMATCH'}")
    print(f"Mathematical Consistency: {'✅ OK' if report.balance_result.mathematically_consistent else '❌ DISCREPANCY'}")
    print(f"Matched Entries: {len(report.matched_entries)}")
    print(f"Unmatched Bank Entries: {len(report.unmatched_bank_entries)}")
    print(f"Unmatched Ledger Entries: {len(report.unmatched_ledger_entries)}")
    print(f"Amount Mismatches: {len(report.amount_mismatches)}")
    print("=" * 40)

    if report.amount_mismatches:
        print("\n⚠️ AMOUNT MISMATCHES:")
        for b_ent, l_ent, diff in report.amount_mismatches:
            print(f"  - Ref: {b_ent.end_to_end_id} | Bank: {b_ent.signed_amount} | Ledger: {l_ent.signed_amount} | Diff: {diff}")

    if report.unmatched_bank_entries:
        print("\n⚠️ UNMATCHED BANK ENTRIES:")
        for b_ent in report.unmatched_bank_entries:
            print(f"  - Date: {b_ent.booking_date} | Amt: {b_ent.signed_amount} | Ref: {b_ent.end_to_end_id or b_ent.proprietary_ref}")

    if report.unmatched_ledger_entries:
        print("\n⚠️ UNMATCHED LEDGER ENTRIES:")
        for l_ent in report.unmatched_ledger_entries:
            print(f"  - Date: {l_ent.entry_date} | Amt: {l_ent.signed_amount} | Ref: {l_ent.reference}")


if __name__ == "__main__":
    # If streamlit and pandas are available, run the interactive UI. Otherwise, run CLI.
    if HAS_UI_LIBS:
        # Check if running inside streamlit context
        try:
            import streamlit.web.cli as stcli
            if st.runtime.exists():
                run_streamlit_app()
            else:
                # Run the streamlit app directly
                sys.argv = ["streamlit", "run", __file__]
                sys.exit(stcli.main())
        except Exception:
            run_cli()
    else:
        run_cli()