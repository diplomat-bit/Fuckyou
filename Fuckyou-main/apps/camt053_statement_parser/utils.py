import xml.etree.ElementTree as ET
from datetime import datetime
from decimal import Decimal, InvalidOperation
from typing import List, Optional
from pydantic import BaseModel, Field


# =====================================================================
# Shared Pydantic Models for CAMT.053.001.02
# =====================================================================

class Amount(BaseModel):
    value: Decimal
    currency: str


class Account(BaseModel):
    iban: Optional[str] = None
    bban: Optional[str] = None
    currency: Optional[str] = None
    proprietary_id: Optional[str] = None


class Balance(BaseModel):
    balance_type: str  # e.g., OPBD (Opening Booked), CLBD (Closing Booked)
    amount: Amount
    credit_debit_indicator: str  # CRDT or DBIT
    date: datetime


class Party(BaseModel):
    name: Optional[str] = None
    postal_address: Optional[str] = None


class TransactionParty(BaseModel):
    party: Optional[Party] = None
    account: Optional[Account] = None


class EntryDetail(BaseModel):
    end_to_end_id: Optional[str] = None
    mandate_id: Optional[str] = None
    instruction_id: Optional[str] = None
    remittance_info: Optional[str] = None
    debtor: Optional[TransactionParty] = None
    creditor: Optional[TransactionParty] = None


class StatementEntry(BaseModel):
    entry_reference: Optional[str] = None
    amount: Amount
    credit_debit_indicator: str  # CRDT or DBIT
    status: str  # BOOK or PDNG
    booking_date: Optional[datetime] = None
    value_date: Optional[datetime] = None
    bank_transaction_code: Optional[str] = None
    proprietary_code: Optional[str] = None
    additional_entry_info: Optional[str] = None
    details: List[EntryDetail] = Field(default_factory=list)


class Statement(BaseModel):
    statement_id: str
    electronic_sequence_number: Optional[int] = None
    creation_date_time: Optional[datetime] = None
    from_date_time: Optional[datetime] = None
    to_date_time: Optional[datetime] = None
    account: Account
    balances: List[Balance] = Field(default_factory=list)
    entries: List[StatementEntry] = Field(default_factory=list)


class Camt053Report(BaseModel):
    group_header_id: str
    creation_date_time: datetime
    statements: List[Statement] = Field(default_factory=list)


# =====================================================================
# XML Parsing Utility Functions
# =====================================================================

def parse_datetime(val: Optional[str]) -> Optional[datetime]:
    """Parses ISO datetime strings, handling timezone offsets and dates."""
    if not val:
        return None
    val = val.strip()
    try:
        # Handle simple date format (YYYY-MM-DD)
        if len(val) == 10:
            return datetime.strptime(val, "%Y-%m-%d")
        # Normalize Zulu timezone indicator to ISO standard offset
        normalized = val.replace("Z", "+00:00")
        return datetime.fromisoformat(normalized)
    except ValueError:
        # Fallback for custom/unexpected formats
        for fmt in ("%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S"):
            try:
                return datetime.strptime(val, fmt)
            except ValueError:
                continue
        return None


def parse_decimal(val: Optional[str]) -> Decimal:
    """Safely parses a string value into a Decimal."""
    if not val:
        return Decimal("0.00")
    try:
        return Decimal(val.strip())
    except (InvalidOperation, ValueError):
        return Decimal("0.00")


def parse_camt053_xml(xml_data: bytes) -> Camt053Report:
    """
    Parses a CAMT.053.001.02 XML file and extracts statement details,
    balances, and entries into the shared Pydantic models.
    """
    root = ET.fromstring(xml_data)

    # Extract namespace dynamically
    ns = ""
    if root.tag.startswith("{"):
        ns = root.tag.split("}")[0] + "}"

    def find_path(element, path: str):
        """Helper to find a nested element using namespace-prefixed tags."""
        parts = path.split("/")
        curr = element
        for part in parts:
            if curr is None:
                return None
            curr = curr.find(f"{ns}{part}")
        return curr

    def find_tags(element, tag_name: str):
        """Helper to find all direct child elements matching a tag name."""
        if element is None:
            return []
        return element.findall(f"{ns}{tag_name}")

    def get_path_text(element, path: str, default: Optional[str] = None) -> Optional[str]:
        """Helper to get text from a nested element path."""
        el = find_path(element, path)
        return el.text.strip() if el is not None and el.text is not None else default

    # 1. Parse Group Header
    grpHdr = find_path(root, "BkToCstmrStmt/GrpHdr")
    if grpHdr is None:
        # Fallback if root is BkToCstmrStmt directly
        grpHdr = find_path(root, "GrpHdr")

    if grpHdr is None:
        raise ValueError("Invalid CAMT.053: Missing Group Header (GrpHdr)")

    group_header_id = get_path_text(grpHdr, "MsgId", "UNKNOWN")
    cre_dt_tm_str = get_path_text(grpHdr, "CreDtTm")
    creation_date_time = parse_datetime(cre_dt_tm_str) or datetime.utcnow()

    # 2. Parse Statements
    statements = []
    bk_to_cstmr_stmt = find_path(root, "BkToCstmrStmt") or root
    stmt_elements = find_tags(bk_to_cstmr_stmt, "Stmt")

    for stmt_el in stmt_elements:
        statement_id = get_path_text(stmt_el, "Id", "UNKNOWN")
        seq_nb_str = get_path_text(stmt_el, "ElctrncSeqNb")
        electronic_sequence_number = int(seq_nb_str) if seq_nb_str and seq_nb_str.isdigit() else None
        stmt_cre_dt_tm = parse_datetime(get_path_text(stmt_el, "CreDtTm"))

        # From/To Dates
        from_dt_str = get_path_text(stmt_el, "FrToDt/FrDtTm") or get_path_text(stmt_el, "FrToDt/FrDt")
        to_dt_str = get_path_text(stmt_el, "FrToDt/ToDtTm") or get_path_text(stmt_el, "FrToDt/ToDt")
        from_date_time = parse_datetime(from_dt_str)
        to_date_time = parse_datetime(to_dt_str)

        # Account Details
        acct_el = find_path(stmt_el, "Acct")
        iban = None
        bban = None
        proprietary_id = None
        currency = None
        if acct_el is not None:
            iban = get_path_text(acct_el, "Id/IBAN")
            bban = get_path_text(acct_el, "Id/Othr/Id")
            proprietary_id = get_path_text(acct_el, "Id/Othr/Id") if not iban else None
            currency = get_path_text(acct_el, "Ccy")

        account = Account(
            iban=iban,
            bban=bban,
            currency=currency,
            proprietary_id=proprietary_id
        )

        # Balances
        balances = []
        bal_elements = find_tags(stmt_el, "Bal")
        for bal_el in bal_elements:
            bal_type = get_path_text(bal_el, "Tp/CdOrPrtry/Cd") or get_path_text(bal_el, "Tp/CdOrPrtry/Prtry", "UNKNOWN")
            amt_el = find_path(bal_el, "Amt")
            amt_val = parse_decimal(amt_el.text) if amt_el is not None else Decimal("0.00")
            amt_ccy = amt_el.attrib.get("Ccy", currency or "") if amt_el is not None else (currency or "")
            cdt_dbt_ind = get_path_text(bal_el, "CdtDbtInd", "CRDT")

            bal_dt_str = get_path_text(bal_el, "Dt/DtTm") or get_path_text(bal_el, "Dt/Dt")
            bal_date = parse_datetime(bal_dt_str) or datetime.utcnow()

            balances.append(Balance(
                balance_type=bal_type,
                amount=Amount(value=amt_val, currency=amt_ccy),
                credit_debit_indicator=cdt_dbt_ind,
                date=bal_date
            ))

        # Entries
        entries = []
        entry_elements = find_tags(stmt_el, "Ntry")
        for entry_el in entry_elements:
            entry_ref = get_path_text(entry_el, "NtryRef")
            amt_el = find_path(entry_el, "Amt")
            amt_val = parse_decimal(amt_el.text) if amt_el is not None else Decimal("0.00")
            amt_ccy = amt_el.attrib.get("Ccy", currency or "") if amt_el is not None else (currency or "")
            cdt_dbt_ind = get_path_text(entry_el, "CdtDbtInd", "CRDT")
            status = get_path_text(entry_el, "Sts", "BOOK")

            booking_dt_str = get_path_text(entry_el, "BookgDt/DtTm") or get_path_text(entry_el, "BookgDt/Dt")
            booking_date = parse_datetime(booking_dt_str)

            val_dt_str = get_path_text(entry_el, "ValDt/DtTm") or get_path_text(entry_el, "ValDt/Dt")
            value_date = parse_datetime(val_dt_str)

            bank_transaction_code = get_path_text(entry_el, "BkTxCd/Domn/Cd") or get_path_text(entry_el, "BkTxCd/Domn/Fmly/Cd")
            proprietary_code = get_path_text(entry_el, "BkTxCd/Prtry/Cd")
            additional_entry_info = get_path_text(entry_el, "AddtlNtryInf")

            # Entry Details (Transactions)
            details = []
            ntry_dtls = find_path(entry_el, "NtryDtls")
            tx_details_elements = find_tags(ntry_dtls, "TxDtls") if ntry_dtls is not None else []

            for tx_el in tx_details_elements:
                end_to_end_id = get_path_text(tx_el, "Refs/EndToEndId")
                mandate_id = get_path_text(tx_el, "Refs/MndtId")
                instruction_id = get_path_text(tx_el, "Refs/InstrId")
                remittance_info = get_path_text(tx_el, "RmtInf/Ustrd")

                # Debtor Party & Account
                dbtr_name = get_path_text(tx_el, "RltdPties/Dbtr/Nm")
                dbtr_postal = get_path_text(tx_el, "RltdPties/Dbtr/PstlAdr/AdrLine")
                dbtr_party = Party(name=dbtr_name, postal_address=dbtr_postal) if dbtr_name else None

                dbtr_iban = get_path_text(tx_el, "RltdPties/DbtrAcct/Id/IBAN")
                dbtr_bban = get_path_text(tx_el, "RltdPties/DbtrAcct/Id/Othr/Id")
                dbtr_acct = Account(iban=dbtr_iban, bban=dbtr_bban) if (dbtr_iban or dbtr_bban) else None

                debtor = TransactionParty(party=dbtr_party, account=dbtr_acct) if (dbtr_party or dbtr_acct) else None

                # Creditor Party & Account
                cdtr_name = get_path_text(tx_el, "RltdPties/Cdtr/Nm")
                cdtr_postal = get_path_text(tx_el, "RltdPties/Cdtr/PstlAdr/AdrLine")
                cdtr_party = Party(name=cdtr_name, postal_address=cdtr_postal) if cdtr_name else None

                cdtr_iban = get_path_text(tx_el, "RltdPties/CdtrAcct/Id/IBAN")
                cdtr_bban = get_path_text(tx_el, "RltdPties/CdtrAcct/Id/Othr/Id")
                cdtr_acct = Account(iban=cdtr_iban, bban=cdtr_bban) if (cdtr_iban or cdtr_bban) else None

                creditor = TransactionParty(party=cdtr_party, account=cdtr_acct) if (cdtr_party or cdtr_acct) else None

                details.append(EntryDetail(
                    end_to_end_id=end_to_end_id,
                    mandate_id=mandate_id,
                    instruction_id=instruction_id,
                    remittance_info=remittance_info,
                    debtor=debtor,
                    creditor=creditor
                ))

            entries.append(StatementEntry(
                entry_reference=entry_ref,
                amount=Amount(value=amt_val, currency=amt_ccy),
                credit_debit_indicator=cdt_dbt_ind,
                status=status,
                booking_date=booking_date,
                value_date=value_date,
                bank_transaction_code=bank_transaction_code,
                proprietary_code=proprietary_code,
                additional_entry_info=additional_entry_info,
                details=details
            ))

        statements.append(Statement(
            statement_id=statement_id,
            electronic_sequence_number=electronic_sequence_number,
            creation_date_time=stmt_cre_dt_tm,
            from_date_time=from_date_time,
            to_date_time=to_date_time,
            account=account,
            balances=balances,
            entries=entries
        ))

    return Camt053Report(
        group_header_id=group_header_id,
        creation_date_time=creation_date_time,
        statements=statements
    )