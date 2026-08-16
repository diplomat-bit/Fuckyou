from datetime import datetime, date
from decimal import Decimal
import xml.etree.ElementTree as ET
from typing import Optional, List, Union
from pydantic import BaseModel, Field

# --- XML Parsing Helpers ---

def get_local_tag(elem: ET.Element) -> str:
    """Extracts the local tag name, ignoring any XML namespace."""
    return elem.tag.split('}')[-1]

def find_child(elem: Optional[ET.Element], tag: str) -> Optional[ET.Element]:
    """Finds the first child element matching the local tag name."""
    if elem is None:
        return None
    for child in elem:
        if get_local_tag(child) == tag:
            return child
    return None

def find_children(elem: Optional[ET.Element], tag: str) -> List[ET.Element]:
    """Finds all child elements matching the local tag name."""
    if elem is None:
        return []
    return [child for child in elem if get_local_tag(child) == tag]

def get_child_text(elem: Optional[ET.Element], tag: str) -> Optional[str]:
    """Retrieves the text content of the first matching child element."""
    child = find_child(elem, tag)
    return child.text if child is not None else None

def parse_datetime(val: Optional[str]) -> Optional[datetime]:
    """Parses an ISO 8601 datetime string, handling 'Z' suffix and date-only fallbacks."""
    if not val:
        return None
    try:
        if val.endswith('Z'):
            val = val[:-1] + '+00:00'
        return datetime.fromisoformat(val)
    except ValueError:
        try:
            d = date.fromisoformat(val)
            return datetime(d.year, d.month, d.day)
        except ValueError:
            return None

def parse_date(val: Optional[str]) -> Optional[date]:
    """Parses an ISO 8601 date string."""
    if not val:
        return None
    try:
        return date.fromisoformat(val)
    except ValueError:
        try:
            dt = datetime.fromisoformat(val.replace('Z', '+00:00'))
            return dt.date()
        except ValueError:
            return None


# --- Shared Pydantic Models ---

class Amount(BaseModel):
    value: Decimal = Field(..., description="The monetary amount value.")
    currency: str = Field(..., description="Three-letter ISO currency code.")


class Party(BaseModel):
    name: Optional[str] = Field(None, description="Name of the party.")
    bic: Optional[str] = Field(None, description="Bank Identifier Code (BIC).")
    iban: Optional[str] = Field(None, description="International Bank Account Number (IBAN).")
    other_id: Optional[str] = Field(None, description="Other proprietary identification.")


class Balance(BaseModel):
    type_code: str = Field(..., description="Balance type code (e.g., OPBD, CLBD, ITBD).")
    amount: Amount = Field(..., description="Balance amount and currency.")
    credit_debit: str = Field(..., description="Credit/Debit indicator (CRDT or DBIT).")
    date: datetime = Field(..., description="Date and time of the balance.")


class TransactionDetails(BaseModel):
    instruction_id: Optional[str] = Field(None, description="Instruction Identification.")
    end_to_end_id: Optional[str] = Field(None, description="End to End Identification.")
    uetr: Optional[str] = Field(None, description="Unique End-to-End Transaction Reference.")
    tx_id: Optional[str] = Field(None, description="Transaction Identification.")
    amount: Amount = Field(..., description="Transaction amount.")
    credit_debit: str = Field(..., description="Credit/Debit indicator (CRDT or DBIT).")
    debtor: Optional[Party] = Field(None, description="Debtor party details.")
    creditor: Optional[Party] = Field(None, description="Creditor party details.")
    remittance_info: Optional[str] = Field(None, description="Unstructured remittance information.")
    additional_info: Optional[str] = Field(None, description="Additional transaction information.")


class Entry(BaseModel):
    entry_ref: Optional[str] = Field(None, description="Unique reference of the entry.")
    amount: Amount = Field(..., description="Entry amount.")
    credit_debit: str = Field(..., description="Credit/Debit indicator (CRDT or DBIT).")
    status: str = Field(..., description="Status of the entry (e.g., BOOK, PDNG).")
    booking_date: Optional[datetime] = Field(None, description="Date and time when entry was booked.")
    value_date: Optional[datetime] = Field(None, description="Date and time when entry becomes value effective.")
    acct_servicer_ref: Optional[str] = Field(None, description="Account Servicer Reference.")
    reversal_indicator: bool = Field(False, description="Indicates if the entry is a reversal.")
    transaction_details: List[TransactionDetails] = Field(default_factory=list, description="Detailed transaction records.")


class Account(BaseModel):
    iban: Optional[str] = Field(None, description="IBAN of the account.")
    other_id: Optional[str] = Field(None, description="Other proprietary account identification.")
    currency: Optional[str] = Field(None, description="Account currency.")
    owner_name: Optional[str] = Field(None, description="Name of the account owner.")


class Statement(BaseModel):
    id: str = Field(..., description="Unique statement identification.")
    sequence_number: Optional[Decimal] = Field(None, description="Electronic sequence number.")
    legal_sequence_number: Optional[Decimal] = Field(None, description="Legal sequence number.")
    creation_datetime: datetime = Field(..., description="Statement creation date and time.")
    from_datetime: Optional[datetime] = Field(None, description="Start date/time of the statement period.")
    to_datetime: Optional[datetime] = Field(None, description="End date/time of the statement period.")
    account: Account = Field(..., description="Account details.")
    balances: List[Balance] = Field(default_factory=list, description="Statement balances.")
    entries: List[Entry] = Field(default_factory=list, description="Statement entries.")


class GroupHeader(BaseModel):
    message_id: str = Field(..., description="Unique message identification.")
    creation_datetime: datetime = Field(..., description="Message creation date and time.")
    recipient: Optional[str] = Field(None, description="Message recipient.")
    pagination_page_number: Optional[str] = Field(None, description="Current page number.")
    pagination_last_page_indicator: Optional[bool] = Field(None, description="Indicates if this is the last page.")


class BankToCustomerStatement(BaseModel):
    group_header: GroupHeader = Field(..., description="Group header details.")
    statements: List[Statement] = Field(default_factory=list, description="List of statements.")


class Camt053Document(BaseModel):
    statement_report: BankToCustomerStatement = Field(..., description="Bank to Customer Statement Report.")

    @classmethod
    def from_xml(cls, xml_content: Union[str, bytes]) -> "Camt053Document":
        """Parses a CAMT.053.001.02 XML string or bytes into the Pydantic model structure."""
        if isinstance(xml_content, str):
            xml_content = xml_content.encode('utf-8')
        
        root = ET.fromstring(xml_content)
        
        # Locate BkToCstmrStmt
        bk_to_cstmr_stmt_elem = find_child(root, "BkToCstmrStmt")
        if bk_to_cstmr_stmt_elem is None:
            if get_local_tag(root) == "BkToCstmrStmt":
                bk_to_cstmr_stmt_elem = root
            else:
                raise ValueError("Could not find BkToCstmrStmt element in XML.")

        # Parse Group Header
        gr_hdr_elem = find_child(bk_to_cstmr_stmt_elem, "GrpHdr")
        if gr_hdr_elem is None:
            raise ValueError("Group Header (GrpHdr) is missing.")
        
        msg_id = get_child_text(gr_hdr_elem, "MsgId") or "UNKNOWN"
        cre_dt_tm = parse_datetime(get_child_text(gr_hdr_elem, "CreDtTm")) or datetime.now()
        
        msg_rcpt_elem = find_child(gr_hdr_elem, "MsgRcpt")
        recipient = get_child_text(msg_rcpt_elem, "Nm") if msg_rcpt_elem is not None else None
            
        msg_pgntn_elem = find_child(gr_hdr_elem, "MsgPgntn")
        page_num = None
        last_page_ind = None
        if msg_pgntn_elem is not None:
            page_num = get_child_text(msg_pgntn_elem, "PgNb")
            last_page_str = get_child_text(msg_pgntn_elem, "LastPgInd")
            if last_page_str:
                last_page_ind = last_page_str.lower() == 'true'

        group_header = GroupHeader(
            message_id=msg_id,
            creation_datetime=cre_dt_tm,
            recipient=recipient,
            pagination_page_number=page_num,
            pagination_last_page_indicator=last_page_ind
        )

        # Parse Statements
        statements = []
        stmt_elems = find_children(bk_to_cstmr_stmt_elem, "Stmt")
        for stmt_elem in stmt_elems:
            stmt_id = get_child_text(stmt_elem, "Id") or "UNKNOWN"
            
            seq_nb_str = get_child_text(stmt_elem, "ElctrncSeqNb")
            seq_nb = Decimal(seq_nb_str) if seq_nb_str else None
            
            lgl_seq_nb_str = get_child_text(stmt_elem, "LglSeqNb")
            lgl_seq = Decimal(lgl_seq_nb_str) if lgl_seq_nb_str else None
            
            stmt_cre_dt_tm = parse_datetime(get_child_text(stmt_elem, "CreDtTm")) or datetime.now()
            
            # Statement Period
            fr_to_dt_elem = find_child(stmt_elem, "FrToDt")
            fr_dt_tm = None
            to_dt_tm = None
            if fr_to_dt_elem is not None:
                fr_dt_tm = parse_datetime(get_child_text(fr_to_dt_elem, "FrDtTm"))
                to_dt_tm = parse_datetime(get_child_text(fr_to_dt_elem, "ToDtTm"))
                if not fr_dt_tm:
                    fr_dt = parse_date(get_child_text(fr_to_dt_elem, "FrDt"))
                    if fr_dt:
                        fr_dt_tm = datetime(fr_dt.year, fr_dt.month, fr_dt.day)
                if not to_dt_tm:
                    to_dt = parse_date(get_child_text(fr_to_dt_elem, "ToDt"))
                    if to_dt:
                        to_dt_tm = datetime(to_dt.year, to_dt.month, to_dt.day)

            # Account Details
            acct_elem = find_child(stmt_elem, "Acct")
            account = Account()
            if acct_elem is not None:
                id_elem = find_child(acct_elem, "Id")
                iban = None
                other_id = None
                if id_elem is not None:
                    iban = get_child_text(id_elem, "IBAN")
                    othr_elem = find_child(id_elem, "Othr")
                    if othr_elem is not None:
                        other_id = get_child_text(othr_elem, "Id")
                
                ccy = get_child_text(acct_elem, "Ccy")
                
                owner_name = None
                ownr_elem = find_child(acct_elem, "Ownr")
                if ownr_elem is not None:
                    owner_name = get_child_text(ownr_elem, "Nm")
                
                account = Account(
                    iban=iban,
                    other_id=other_id,
                    currency=ccy,
                    owner_name=owner_name
                )

            # Balances
            balances = []
            bal_elems = find_children(stmt_elem, "Bal")
            for bal_elem in bal_elems:
                tp_elem = find_child(bal_elem, "Tp")
                type_code = "UNKNOWN"
                if tp_elem is not None:
                    cd_or_prtry = find_child(tp_elem, "CdOrPrtry")
                    if cd_or_prtry is not None:
                        type_code = get_child_text(cd_or_prtry, "Cd") or get_child_text(cd_or_prtry, "Prtry") or "UNKNOWN"
                
                amt_elem = find_child(bal_elem, "Amt")
                amt_val = Decimal(amt_elem.text) if amt_elem is not None and amt_elem.text else Decimal('0.00')
                amt_ccy = amt_elem.attrib.get('Ccy', account.currency or 'EUR') if amt_elem is not None else (account.currency or 'EUR')
                
                cdt_dbt_ind = get_child_text(bal_elem, "CdtDbtInd") or "CRDT"
                
                dt_elem = find_child(bal_elem, "Dt")
                bal_dt = None
                if dt_elem is not None:
                    bal_dt = parse_datetime(get_child_text(dt_elem, "DtTm"))
                    if not bal_dt:
                        b_date = parse_date(get_child_text(dt_elem, "Dt"))
                        if b_date:
                            bal_dt = datetime(b_date.year, b_date.month, b_date.day)
                
                if not bal_dt:
                    bal_dt = datetime.now()

                balances.append(Balance(
                    type_code=type_code,
                    amount=Amount(value=amt_val, currency=amt_ccy),
                    credit_debit=cdt_dbt_ind,
                    date=bal_dt
                ))

            # Entries
            entries = []
            ntry_elems = find_children(stmt_elem, "Ntry")
            for ntry_elem in ntry_elems:
                entry_ref = get_child_text(ntry_elem, "NtryRef")
                
                amt_elem = find_child(ntry_elem, "Amt")
                amt_val = Decimal(amt_elem.text) if amt_elem is not None and amt_elem.text else Decimal('0.00')
                amt_ccy = amt_elem.attrib.get('Ccy', account.currency or 'EUR') if amt_elem is not None else (account.currency or 'EUR')
                
                cdt_dbt_ind = get_child_text(ntry_elem, "CdtDbtInd") or "CRDT"
                status = get_child_text(ntry_elem, "Sts") or "BOOK"
                
                # Booking Date
                bookg_dt_elem = find_child(ntry_elem, "BookgDt")
                booking_date = None
                if bookg_dt_elem is not None:
                    booking_date = parse_datetime(get_child_text(bookg_dt_elem, "DtTm"))
                    if not booking_date:
                        b_date = parse_date(get_child_text(bookg_dt_elem, "Dt"))
                        if b_date:
                            booking_date = datetime(b_date.year, b_date.month, b_date.day)

                # Value Date
                val_dt_elem = find_child(ntry_elem, "ValDt")
                value_date = None
                if val_dt_elem is not None:
                    value_date = parse_datetime(get_child_text(val_dt_elem, "DtTm"))
                    if not value_date:
                        v_date = parse_date(get_child_text(val_dt_elem, "Dt"))
                        if v_date:
                            value_date = datetime(v_date.year, v_date.month, v_date.day)

                acct_servicer_ref = get_child_text(ntry_elem, "AcctSvcrRef")
                
                rvsl_ind_str = get_child_text(ntry_elem, "RvslInd")
                reversal_indicator = rvsl_ind_str.lower() == 'true' if rvsl_ind_str else False

                # Entry Details -> Transaction Details
                tx_details_list = []
                ntry_dtls_elems = find_children(ntry_elem, "NtryDtls")
                for ntry_dtls in ntry_dtls_elems:
                    tx_dtls_elems = find_children(ntry_dtls, "TxDtls")
                    for tx_dtls in tx_dtls_elems:
                        # References
                        refs_elem = find_child(tx_dtls, "Refs")
                        instr_id = None
                        end_to_end_id = None
                        uetr = None
                        tx_id = None
                        if refs_elem is not None:
                            instr_id = get_child_text(refs_elem, "InstrId")
                            end_to_end_id = get_child_text(refs_elem, "EndToEndId")
                            uetr = get_child_text(refs_elem, "UETR")
                            tx_id = get_child_text(refs_elem, "TxId")

                        # Amount
                        tx_amt_elem = find_child(tx_dtls, "Amt")
                        if tx_amt_elem is not None:
                            tx_amt_val = Decimal(tx_amt_elem.text) if tx_amt_elem.text else Decimal('0.00')
                            tx_amt_ccy = tx_amt_elem.attrib.get('Ccy', amt_ccy)
                        else:
                            tx_amt_val = amt_val
                            tx_amt_ccy = amt_ccy

                        tx_cdt_dbt_ind = get_child_text(tx_dtls, "CdtDbtInd") or cdt_dbt_ind

                        # Related Parties
                        rltd_pties_elem = find_child(tx_dtls, "RltdPties")
                        debtor = None
                        creditor = None
                        if rltd_pties_elem is not None:
                            # Debtor
                            dbtr_elem = find_child(rltd_pties_elem, "Dbtr")
                            if dbtr_elem is not None:
                                dbtr_name = get_child_text(dbtr_elem, "Nm")
                                debtor = Party(name=dbtr_name)
                                dbtr_acct_elem = find_child(rltd_pties_elem, "DbtrAcct")
                                if dbtr_acct_elem is not None:
                                    dbtr_id_elem = find_child(dbtr_acct_elem, "Id")
                                    if dbtr_id_elem is not None:
                                        debtor.iban = get_child_text(dbtr_id_elem, "IBAN")
                            
                            # Creditor
                            cdtr_elem = find_child(rltd_pties_elem, "Cdtr")
                            if cdtr_elem is not None:
                                cdtr_name = get_child_text(cdtr_elem, "Nm")
                                creditor = Party(name=cdtr_name)
                                cdtr_acct_elem = find_child(rltd_pties_elem, "CdtrAcct")
                                if cdtr_acct_elem is not None:
                                    cdtr_id_elem = find_child(cdtr_acct_elem, "Id")
                                    if cdtr_id_elem is not None:
                                        creditor.iban = get_child_text(cdtr_id_elem, "IBAN")

                        # Remittance Info
                        rmt_inf_elem = find_child(tx_dtls, "RmtInf")
                        remittance_info = None
                        if rmt_inf_elem is not None:
                            remittance_info = get_child_text(rmt_inf_elem, "Ustrd")

                        # Additional Info
                        addtl_tx_inf = get_child_text(tx_dtls, "AddtlTxInf")

                        tx_details_list.append(TransactionDetails(
                            instruction_id=instr_id,
                            end_to_end_id=end_to_end_id,
                            uetr=uetr,
                            tx_id=tx_id,
                            amount=Amount(value=tx_amt_val, currency=tx_amt_ccy),
                            credit_debit=tx_cdt_dbt_ind,
                            debtor=debtor,
                            creditor=creditor,
                            remittance_info=remittance_info,
                            additional_info=addtl_tx_inf
                        ))

                entries.append(Entry(
                    entry_ref=entry_ref,
                    amount=Amount(value=amt_val, currency=amt_ccy),
                    credit_debit=cdt_dbt_ind,
                    status=status,
                    booking_date=booking_date,
                    value_date=value_date,
                    acct_servicer_ref=acct_servicer_ref,
                    reversal_indicator=reversal_indicator,
                    transaction_details=tx_details_list
                ))

            statements.append(Statement(
                id=stmt_id,
                sequence_number=seq_nb,
                legal_sequence_number=lgl_seq,
                creation_datetime=stmt_cre_dt_tm,
                from_datetime=fr_dt_tm,
                to_datetime=to_dt_tm,
                account=account,
                balances=balances,
                entries=entries
            ))

        return cls(
            statement_report=BankToCustomerStatement(
                group_header=group_header,
                statements=statements
            )
        )