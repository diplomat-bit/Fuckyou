import xml.etree.ElementTree as ET
import csv
import io
import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.responses import HTMLResponse, StreamingResponse, JSONResponse

# ==========================================
# 1. PYDANTIC MODELS (API Schemas)
# ==========================================

class AccountInfo(BaseModel):
    id: str = Field(..., description="Account IBAN or other identifier")
    currency: str = Field(..., description="Account currency code (e.g., EUR)")

class BalanceInfo(BaseModel):
    type: str = Field(..., description="Balance type (e.g., OPBD - Opening, CLBD - Closing)")
    amount: float = Field(..., description="Balance amount (positive for credit, negative for debit)")
    currency: str = Field(..., description="Balance currency")
    date: str = Field(..., description="Balance date")

class TransactionEntry(BaseModel):
    amount: float = Field(..., description="Transaction amount (positive for inflow, negative for outflow)")
    currency: str = Field(..., description="Transaction currency")
    status: str = Field(..., description="Transaction status (e.g., BOOK, PDNG)")
    booking_date: str = Field(..., description="Booking date of the transaction")
    value_date: str = Field(..., description="Value date of the transaction")
    end_to_end_id: Optional[str] = Field(None, description="End-to-end transaction reference")
    counterparty_name: str = Field(..., description="Name of the counterparty")
    counterparty_iban: Optional[str] = Field(None, description="IBAN of the counterparty")
    remittance_info: str = Field(..., description="Remittance information / payment description")
    direction: str = Field(..., description="INFLOW or OUTFLOW")
    category: Optional[str] = Field(None, description="Inferred financial category")

class StatementDetails(BaseModel):
    statement_id: str = Field(..., description="Unique statement identifier")
    creation_date_time: str = Field(..., description="Statement creation timestamp")
    account: AccountInfo
    balances: List[BalanceInfo]
    entries: List[TransactionEntry]

class CategoryBreakdown(BaseModel):
    category: str
    amount: float

class CounterpartyBreakdown(BaseModel):
    counterparty: str
    amount: float

class DailyFlow(BaseModel):
    date: str
    net_flow: float

class BalanceTrendPoint(BaseModel):
    date: str
    balance: float

class StatementAnalytics(BaseModel):
    statement_id: str
    account_id: str
    currency: str
    total_income: float
    total_expense: float
    net_flow: float
    transaction_count: int
    category_breakdown: List[CategoryBreakdown]
    counterparty_breakdown: List[CounterpartyBreakdown]
    daily_breakdown: List[DailyFlow]
    balance_trend: List[BalanceTrendPoint]

# ==========================================
# 2. CAMT.053 PARSING ENGINE
# ==========================================

def find_element(parent: ET.Element, path: str, ns: str = "") -> Optional[ET.Element]:
    parts = path.split("/")
    current = parent
    for part in parts:
        if current is None:
            return None
        # Try with namespace
        child = current.find(f"{ns}{part}")
        if child is None:
            # Try without namespace
            child = current.find(part)
        if child is None:
            # Try searching children ignoring namespace
            found = False
            for c in current:
                if c.tag.split('}')[-1] == part:
                    child = c
                    found = True
                    break
            if not found:
                return None
        current = child
    return current

def find_elements(parent: ET.Element, path: str, ns: str = "") -> List[ET.Element]:
    parts = path.split("/")
    current_level = [parent]
    for part in parts[:-1]:
        next_level = []
        for item in current_level:
            children = [c for c in item if c.tag.split('}')[-1] == part]
            next_level.extend(children)
        current_level = next_level
        if not current_level:
            return []
            
    last_part = parts[-1]
    results = []
    for item in current_level:
        children = [c for c in item if c.tag.split('}')[-1] == last_part]
        results.extend(children)
    return results

def find_text(parent: ET.Element, path: str, ns: str = "") -> str:
    el = find_element(parent, path, ns)
    return el.text.strip() if el is not None and el.text else ""

def parse_camt053_xml(xml_content: bytes) -> List[Dict[str, Any]]:
    try:
        root = ET.fromstring(xml_content)
    except ET.ParseError as e:
        raise ValueError(f"Invalid XML format: {str(e)}")
    
    ns = ""
    if root.tag.startswith("{"):
        ns = root.tag.split("}")[0] + "}"
        
    statements = []
    stmt_elements = root.findall(f".//{ns}Stmt") if ns else root.findall(".//Stmt")
    if not stmt_elements:
        stmt_elements = [el for el in root.iter() if el.tag.split('}')[-1] == 'Stmt']
        
    for stmt in stmt_elements:
        stmt_id = find_text(stmt, "Id", ns)
        cre_dt_tm = find_text(stmt, "CreDtTm", ns)
        
        # Account Details
        acct_el = find_element(stmt, "Acct", ns)
        account_id = ""
        currency = ""
        if acct_el is not None:
            iban_el = find_element(acct_el, "Id/IBAN", ns)
            if iban_el is not None:
                account_id = iban_el.text.strip() if iban_el.text else ""
            else:
                othr_id_el = find_element(acct_el, "Id/Othr/Id", ns)
                if othr_id_el is not None:
                    account_id = othr_id_el.text.strip() if othr_id_el.text else ""
            ccy_el = find_element(acct_el, "Ccy", ns)
            if ccy_el is not None:
                currency = ccy_el.text.strip() if ccy_el.text else ""
                
        # Balances
        balances = []
        bal_elements = find_elements(stmt, "Bal", ns)
        for bal in bal_elements:
            bal_type_el = find_element(bal, "Tp/CdOrPrtry/Cd", ns)
            bal_type = bal_type_el.text.strip() if bal_type_el is not None and bal_type_el.text else "UNKNOWN"
            
            amt_el = find_element(bal, "Amt", ns)
            amount = float(amt_el.text) if amt_el is not None and amt_el.text else 0.0
            
            cdt_dbt_el = find_element(bal, "CdtDbtInd", ns)
            cdt_dbt = cdt_dbt_el.text.strip() if cdt_dbt_el is not None and cdt_dbt_el.text else "CRDT"
            
            dt_el = find_element(bal, "Dt/Dt", ns)
            if dt_el is None:
                dt_el = find_element(bal, "Dt/DtTm", ns)
            date_str = dt_el.text.strip() if dt_el is not None and dt_el.text else ""
            
            balances.append({
                "type": bal_type,
                "amount": amount if cdt_dbt == "CRDT" else -amount,
                "currency": amt_el.attrib.get("Ccy") if amt_el is not None else currency,
                "date": date_str
            })
            
        # Entries (Transactions)
        entries = []
        ntry_elements = find_elements(stmt, "Ntry", ns)
        for ntry in ntry_elements:
            amt_el = find_element(ntry, "Amt", ns)
            amount = float(amt_el.text) if amt_el is not None and amt_el.text else 0.0
            
            cdt_dbt_el = find_element(ntry, "CdtDbtInd", ns)
            cdt_dbt = cdt_dbt_el.text.strip() if cdt_dbt_el is not None and cdt_dbt_el.text else "CRDT"
            
            status_el = find_element(ntry, "Sts", ns)
            status_val = status_el.text.strip() if status_el is not None and status_el.text else "BOOK"
            
            book_dt_el = find_element(ntry, "BookgDt/Dt", ns)
            if book_dt_el is None:
                book_dt_el = find_element(ntry, "BookgDt/DtTm", ns)
            booking_date = book_dt_el.text.strip() if book_dt_el is not None and book_dt_el.text else ""
            
            val_dt_el = find_element(ntry, "ValDt/Dt", ns)
            if val_dt_el is None:
                val_dt_el = find_element(ntry, "ValDt/DtTm", ns)
            value_date = val_dt_el.text.strip() if val_dt_el is not None and val_dt_el.text else ""
            
            tx_details = find_element(ntry, "NtryDtls/TxDtls", ns)
            
            end_to_end_id = ""
            debtor_name = ""
            debtor_iban = ""
            creditor_name = ""
            creditor_iban = ""
            remittance_info = ""
            
            if tx_details is not None:
                ete_el = find_element(tx_details, "Refs/EndToEndId", ns)
                if ete_el is not None and ete_el.text:
                    end_to_end_id = ete_el.text.strip()
                    
                dbtr_el = find_element(tx_details, "RltdPties/Dbtr/Nm", ns)
                if dbtr_el is not None and dbtr_el.text:
                    debtor_name = dbtr_el.text.strip()
                dbtr_acct_el = find_element(tx_details, "RltdPties/DbtrAcct/Id/IBAN", ns)
                if dbtr_acct_el is not None and dbtr_acct_el.text:
                    debtor_iban = dbtr_acct_el.text.strip()
                    
                cdtr_el = find_element(tx_details, "RltdPties/Cdtr/Nm", ns)
                if cdtr_el is not None and cdtr_el.text:
                    creditor_name = cdtr_el.text.strip()
                cdtr_acct_el = find_element(tx_details, "RltdPties/CdtrAcct/Id/IBAN", ns)
                if cdtr_acct_el is not None and cdtr_acct_el.text:
                    creditor_iban = cdtr_acct_el.text.strip()
                    
                rem_el = find_element(tx_details, "RmtInf/Ustrd", ns)
                if rem_el is not None and rem_el.text:
                    remittance_info = rem_el.text.strip()
            
            if not remittance_info:
                rem_el = find_element(ntry, "RmtInf/Ustrd", ns)
                if rem_el is not None and rem_el.text:
                    remittance_info = rem_el.text.strip()
                    
            if cdt_dbt == "CRDT":
                counterparty_name = debtor_name or "Unknown Debtor"
                counterparty_iban = debtor_iban or ""
            else:
                counterparty_name = creditor_name or "Unknown Creditor"
                counterparty_iban = creditor_iban or ""
                
            signed_amount = amount if cdt_dbt == "CRDT" else -amount
            
            entries.append({
                "amount": signed_amount,
                "currency": amt_el.attrib.get("Ccy") if amt_el is not None else currency,
                "status": status_val,
                "booking_date": booking_date,
                "value_date": value_date,
                "end_to_end_id": end_to_end_id,
                "counterparty_name": counterparty_name,
                "counterparty_iban": counterparty_iban,
                "remittance_info": remittance_info,
                "direction": "INFLOW" if cdt_dbt == "CRDT" else "OUTFLOW"
            })
            
        statements.append({
            "statement_id": stmt_id,
            "creation_date_time": cre_dt_tm,
            "account": {
                "id": account_id,
                "currency": currency
            },
            "balances": balances,
            "entries": entries
        })
        
    return statements

# ==========================================
# 3. CATEGORIZATION & ANALYTICS ENGINE
# ==========================================

def categorize_transaction(remittance: str, counterparty: str, amount: float) -> str:
    text = f"{remittance} {counterparty}".lower()
    if amount > 0:
        if any(kw in text for kw in ["salary", "wage", "payroll", "employer", "stipend"]):
            return "Salary"
        if any(kw in text for kw in ["dividend", "interest", "yield", "investment"]):
            return "Investment Income"
        if any(kw in text for kw in ["refund", "reimbursement", "cashback"]):
            return "Refunds"
        return "Other Income"
    else:
        if any(kw in text for kw in ["rent", "mortgage", "landlord", "lease", "housing"]):
            return "Housing & Rent"
        if any(kw in text for kw in ["electric", "water", "gas", "utility", "power", "heating", "telecom", "internet", "phone", "mobile"]):
            return "Utilities"
        if any(kw in text for kw in ["supermarket", "grocery", "groceries", "lidl", "aldi", "tesco", "carrefour", "walmart", "coop", "ah", "jumbo"]):
            return "Groceries"
        if any(kw in text for kw in ["restaurant", "cafe", "coffee", "starbucks", "mcdonald", "uber eats", "deliveroo", "pub", "bar", "bistro"]):
            return "Dining & Drinks"
        if any(kw in text for kw in ["uber", "taxi", "train", "metro", "bus", "railway", "flight", "airline", "fuel", "gas station", "shell", "bp", "parking"]):
            return "Transport & Travel"
        if any(kw in text for kw in ["netflix", "spotify", "amazon prime", "disney+", "subscription", "gym", "membership", "cloud"]):
            return "Subscriptions"
        if any(kw in text for kw in ["amazon", "ebay", "shopping", "store", "mall", "clothing", "zara", "h&m", "decathlon"]):
            return "Shopping"
        if any(kw in text for kw in ["insurance", "allianz", "axa", "health", "medical", "pharmacy", "doctor", "dentist"]):
            return "Insurance & Medical"
        if any(kw in text for kw in ["tax", "revenue", "customs", "fine", "penalty", "belasting"]):
            return "Taxes & Fines"
        if any(kw in text for kw in ["fee", "commission", "charge", "interest charge", "service fee", "bank cost"]):
            return "Bank Fees"
        return "General Expense"

def analyze_statement_data(statement: Dict[str, Any]) -> Dict[str, Any]:
    entries = statement.get("entries", [])
    
    total_income = 0.0
    total_expense = 0.0
    categories = {}
    daily_flows = {}
    top_counterparties = {}
    
    for entry in entries:
        amt = entry["amount"]
        rem = entry["remittance_info"] or ""
        cp = entry["counterparty_name"] or ""
        date = entry["booking_date"] or entry["value_date"] or "Unknown Date"
        if len(date) >= 10:
            date = date[:10]
            
        cat = categorize_transaction(rem, cp, amt)
        entry["category"] = cat
        
        if amt > 0:
            total_income += amt
        else:
            total_expense += abs(amt)
            
        categories[cat] = categories.get(cat, 0.0) + amt
        daily_flows[date] = daily_flows.get(date, 0.0) + amt
        
        if cp:
            top_counterparties[cp] = top_counterparties.get(cp, 0.0) + amt

    category_breakdown = [{"category": k, "amount": round(v, 2)} for k, v in categories.items()]
    counterparty_breakdown = [{"counterparty": k, "amount": round(v, 2)} for k, v in top_counterparties.items()]
    daily_breakdown = [{"date": k, "net_flow": round(v, 2)} for k, v in sorted(daily_flows.items())]
    
    opening_bal = 0.0
    for bal in statement.get("balances", []):
        if bal["type"] in ["OPBD", "PRCD"]:
            opening_bal = bal["amount"]
            break
            
    balance_trend = []
    current_bal = opening_bal
    sorted_entries = sorted(entries, key=lambda x: x.get("booking_date") or x.get("value_date") or "")
    
    daily_totals = {}
    for entry in sorted_entries:
        date = entry["booking_date"] or entry["value_date"] or "Unknown Date"
        if len(date) >= 10:
            date = date[:10]
        daily_totals[date] = daily_totals.get(date, 0.0) + entry["amount"]
        
    for date, flow in sorted(daily_totals.items()):
        current_bal += flow
        balance_trend.append({"date": date, "balance": round(current_bal, 2)})

    return {
        "statement_id": statement.get("statement_id"),
        "account_id": statement.get("account", {}).get("id"),
        "currency": statement.get("account", {}).get("currency"),
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "net_flow": round(total_income - total_expense, 2),
        "transaction_count": len(entries),
        "category_breakdown": category_breakdown,
        "counterparty_breakdown": counterparty_breakdown,
        "daily_breakdown": daily_breakdown,
        "balance_trend": balance_trend
    }

# ==========================================
# 4. EXPORT & CONVERSION UTILITIES
# ==========================================

def convert_statements_to_csv(statements: List[Dict[str, Any]]) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "Statement ID", "Account ID", "Currency", "Booking Date", "Value Date", 
        "Amount", "Direction", "Counterparty Name", "Counterparty IBAN", "Remittance Info", "Category"
    ])
    
    for stmt in statements:
        stmt_id = stmt.get("statement_id", "")
        acct_id = stmt.get("account", {}).get("id", "")
        currency = stmt.get("account", {}).get("currency", "")
        
        for entry in stmt.get("entries", []):
            amt = entry.get("amount", 0.0)
            rem = entry.get("remittance_info", "")
            cp = entry.get("counterparty_name", "")
            cat = categorize_transaction(rem, cp, amt)
            
            writer.writerow([
                stmt_id,
                acct_id,
                currency,
                entry.get("booking_date", ""),
                entry.get("value_date", ""),
                amt,
                entry.get("direction", ""),
                cp,
                entry.get("counterparty_iban", ""),
                rem,
                cat
            ])
            
    return output.getvalue()

# ==========================================
# 5. SAMPLE CAMT.053 XML GENERATOR
# ==========================================

def generate_sample_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Id>STMT-2023-11-001</Id>
      <CreDtTm>2023-11-30T18:30:00Z</CreDtTm>
      <Acct>
        <Id>
          <IBAN>NL99ABNA0123456789</IBAN>
        </Id>
        <Ccy>EUR</Ccy>
      </Acct>
      <Bal>
        <Tp>
          <CdOrPrtry>
            <Cd>OPBD</Cd>
          </CdOrPrtry>
        </Tp>
        <Amt Ccy="EUR">5250.50</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt>
          <Dt>2023-11-01</Dt>
        </Dt>
      </Bal>
      <Bal>
        <Tp>
          <CdOrPrtry>
            <Cd>CLBD</Cd>
          </CdOrPrtry>
        </Tp>
        <Amt Ccy="EUR">7125.20</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt>
          <Dt>2023-11-30</Dt>
        </Dt>
      </Bal>
      <Ntry>
        <Amt Ccy="EUR">3500.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt>
          <Dt>2023-11-01</Dt>
        </BookgDt>
        <ValDt>
          <Dt>2023-11-01</Dt>
        </ValDt>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <EndToEndId>E2E-SALARY-11</EndToEndId>
            </Refs>
            <RltdPties>
              <Dbtr>
                <Nm>ACME Corporation Europe</Nm>
              </Dbtr>
              <DbtrAcct>
                <Id>
                  <IBAN>DE89370400440532013000</IBAN>
                </Id>
              </DbtrAcct>
            </RltdPties>
            <RmtInf>
              <Ustrd>Monthly Salary Payment November 2023</Ustrd>
            </RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
      <Ntry>
        <Amt Ccy="EUR">1200.00</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt>
          <Dt>2023-11-03</Dt>
        </BookgDt>
        <ValDt>
          <Dt>2023-11-03</Dt>
        </ValDt>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <EndToEndId>E2E-RENT-11</EndToEndId>
            </Refs>
            <RltdPties>
              <Cdtr>
                <Nm>Prime Real Estate Holdings</Nm>
              </Cdtr>
              <CdtrAcct>
                <Id>
                  <IBAN>NL12INGB0001234567</IBAN>
                </Id>
              </CdtrAcct>
            </RltdPties>
            <RmtInf>
              <Ustrd>Apartment Rent November 2023</Ustrd>
            </RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
      <Ntry>
        <Amt Ccy="EUR">84.50</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt>
          <Dt>2023-11-05</Dt>
        </BookgDt>
        <ValDt>
          <Dt>2023-11-05</Dt>
        </ValDt>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <EndToEndId>E2E-GROC-05</EndToEndId>
            </Refs>
            <RltdPties>
              <Cdtr>
                <Nm>Albert Heijn Supermarket</Nm>
              </Cdtr>
            </RltdPties>
            <RmtInf>
              <Ustrd>Weekly Groceries Amsterdam</Ustrd>
            </RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
      <Ntry>
        <Amt Ccy="EUR">15.99</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt>
          <Dt>2023-11-10</Dt>
        </BookgDt>
        <ValDt>
          <Dt>2023-11-10</Dt>
        </ValDt>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <EndToEndId>E2E-NETFLIX-10</EndToEndId>
            </Refs>
            <RltdPties>
              <Cdtr>
                <Nm>Netflix Subscription Service</Nm>
              </Cdtr>
            </RltdPties>
            <RmtInf>
              <Ustrd>Netflix Premium Plan</Ustrd>
            </RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
      <Ntry>
        <Amt Ccy="EUR">45.00</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt>
          <Dt>2023-11-12</Dt>
        </BookgDt>
        <ValDt>
          <Dt>2023-11-12</Dt>
        </ValDt>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <EndToEndId>E2E-UTILITY-12</EndToEndId>
            </Refs>
            <RltdPties>
              <Cdtr>
                <Nm>Vattenfall Energy NL</Nm>
              </Cdtr>
            </RltdPties>
            <RmtInf>
              <Ustrd>Electricity and Gas Prepayment</Ustrd>
            </RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
      <Ntry>
        <Amt Ccy="EUR">120.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt>
          <Dt>2023-11-15</Dt>
        </BookgDt>
        <ValDt>
          <Dt>2023-11-15</Dt>
        </ValDt>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <EndToEndId>E2E-REFUND-15</EndToEndId>
            </Refs>
            <RltdPties>
              <Dbtr>
                <Nm>Amazon EU Sarl</Nm>
              </Dbtr>
            </RltdPties>
            <RmtInf>
              <Ustrd>Refund for returned item Order 203-12345</Ustrd>
            </RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
      <Ntry>
        <Amt Ccy="EUR">250.00</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt>
          <Dt>2023-11-20</Dt>
        </BookgDt>
        <ValDt>
          <Dt>2023-11-20</Dt>
        </ValDt>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <EndToEndId>E2E-SHOP-20</EndToEndId>
            </Refs>
            <RltdPties>
              <Cdtr>
                <Nm>Apple Store Amsterdam</Nm>
              </Cdtr>
            </RltdPties>
            <RmtInf>
              <Ustrd>AppleCare Protection Plan</Ustrd>
            </RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
      <Ntry>
        <Amt Ccy="EUR">4.80</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt>
          <Dt>2023-11-22</Dt>
        </BookgDt>
        <ValDt>
          <Dt>2023-11-22</Dt>
        </ValDt>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <EndToEndId>E2E-COFFEE-22</EndToEndId>
            </Refs>
            <RltdPties>
              <Cdtr>
                <Nm>Starbucks Central Station</Nm>
              </Cdtr>
            </RltdPties>
            <RmtInf>
              <Ustrd>Coffee and Croissant</Ustrd>
            </RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>
"""

# ==========================================
# 6. FASTAPI APPLICATION SETUP
# ==========================================

app = FastAPI(
    title="CAMT.053 Statement Parser & Analytics Service",
    description="A production-grade service to parse, analyze, visualize, and convert ISO 20022 CAMT.053 bank statements.",
    version="1.0.0"
)

# ==========================================
# 7. API ENDPOINTS
# ==========================================

@app.get("/", response_class=HTMLResponse)
async def serve_dashboard():
    """Serves the 4-in-1 Interactive Dashboard UI."""
    html_content = """
    <!DOCTYPE html>
    <html lang="en" class="h-full bg-slate-50">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CAMT.053 Statement Hub</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://unpkg.com/lucide@latest"></script>
        <style>
            .tab-active {
                border-color: #4f46e5;
                color: #4f46e5;
            }
        </style>
    </head>
    <body class="h-full flex flex-col">
        <!-- Header -->
        <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="bg-indigo-600 text-white p-2 rounded-lg">
                        <i data-lucide="landmark" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h1 class="text-lg font-bold text-slate-900">CAMT.053 Statement Hub</h1>
                        <p class="text-xs text-slate-500">ISO 20022 Bank Statement Parser & Analytics</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <button onclick="loadSampleData()" class="inline-flex items-center px-3.5 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <i data-lucide="sparkles" class="w-4 h-4 mr-2 text-indigo-500"></i>
                        Load Sample Statement
                    </button>
                    <a href="/api/v1/sample" download="sample_camt053.xml" class="inline-flex items-center px-3.5 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
                        <i data-lucide="download" class="w-4 h-4 mr-2"></i>
                        Download Sample XML
                    </a>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
            <!-- Left Sidebar: Upload & File Info -->
            <div class="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
                <!-- Upload Card -->
                <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 class="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                        <i data-lucide="upload-cloud" class="w-4 h-4 mr-2 text-indigo-500"></i>
                        Upload Statement
                    </h2>
                    <div class="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-500 transition cursor-pointer relative" id="dropzone">
                        <input type="file" id="fileInput" accept=".xml" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onchange="handleFileSelect(event)">
                        <i data-lucide="file-text" class="w-10 h-10 mx-auto text-slate-400 mb-2"></i>
                        <p class="text-xs font-medium text-slate-700">Drag & drop your CAMT.053 XML</p>
                        <p class="text-[10px] text-slate-500 mt-1">or click to browse</p>
                    </div>
                    <div id="fileDetails" class="mt-4 hidden">
                        <div class="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <div class="flex items-center space-x-2 overflow-hidden">
                                <i data-lucide="file" class="w-4 h-4 text-indigo-500 flex-shrink-0"></i>
                                <span id="fileName" class="text-xs font-medium text-slate-700 truncate">statement.xml</span>
                            </div>
                            <button onclick="clearFile()" class="text-slate-400 hover:text-red-500">
                                <i data-lucide="x" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Account Metadata Card -->
                <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1" id="metadataCard">
                    <h2 class="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                        <i data-lucide="info" class="w-4 h-4 mr-2 text-indigo-500"></i>
                        Statement Metadata
                    </h2>
                    <div class="space-y-4 text-xs text-slate-600">
                        <div>
                            <span class="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Statement ID</span>
                            <span id="metaStmtId" class="font-medium text-slate-900">-</span>
                        </div>
                        <div>
                            <span class="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Account IBAN</span>
                            <span id="metaIban" class="font-medium text-slate-900">-</span>
                        </div>
                        <div>
                            <span class="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Currency</span>
                            <span id="metaCurrency" class="font-medium text-slate-900">-</span>
                        </div>
                        <div>
                            <span class="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Created At</span>
                            <span id="metaCreated" class="font-medium text-slate-900">-</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Content Area: Tabs & Views -->
            <div class="flex-1 flex flex-col gap-6">
                <!-- Navigation Tabs -->
                <div class="border-b border-slate-200">
                    <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onclick="switchTab('dashboard')" id="tab-dashboard" class="tab-active border-b-2 py-4 px-1 text-sm font-medium flex items-center">
                            <i data-lucide="layout-dashboard" class="w-4 h-4 mr-2"></i>
                            Dashboard
                        </button>
                        <button onclick="switchTab('transactions')" id="tab-transactions" class="border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 border-b-2 py-4 px-1 text-sm font-medium flex items-center">
                            <i data-lucide="list" class="w-4 h-4 mr-2"></i>
                            Transactions
                        </button>
                        <button onclick="switchTab('analytics')" id="tab-analytics" class="border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 border-b-2 py-4 px-1 text-sm font-medium flex items-center">
                            <i data-lucide="pie-chart" class="w-4 h-4 mr-2"></i>
                            Financial Analytics
                        </button>
                        <button onclick="switchTab('developer')" id="tab-developer" class="border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 border-b-2 py-4 px-1 text-sm font-medium flex items-center">
                            <i data-lucide="code" class="w-4 h-4 mr-2"></i>
                            Developer API & Export
                        </button>
                    </nav>
                </div>

                <!-- Tab 1: Dashboard View -->
                <div id="view-dashboard" class="space-y-6">
                    <!-- Summary Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-medium text-slate-500">Opening Balance</span>
                                <span class="p-1.5 bg-slate-100 text-slate-600 rounded-lg"><i data-lucide="arrow-up-right" class="w-4 h-4"></i></span>
                            </div>
                            <p id="cardOpeningBal" class="text-xl font-bold text-slate-900 mt-2">-</p>
                        </div>
                        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-medium text-slate-500">Closing Balance</span>
                                <span class="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><i data-lucide="wallet" class="w-4 h-4"></i></span>
                            </div>
                            <p id="cardClosingBal" class="text-xl font-bold text-slate-900 mt-2">-</p>
                        </div>
                        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-medium text-slate-500">Net Cash Flow</span>
                                <span id="flowIconContainer" class="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><i data-lucide="trending-up" class="w-4 h-4"></i></span>
                            </div>
                            <p id="cardNetFlow" class="text-xl font-bold text-slate-900 mt-2">-</p>
                        </div>
                        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-medium text-slate-500">Transactions</span>
                                <span class="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><i data-lucide="activity" class="w-4 h-4"></i></span>
                            </div>
                            <p id="cardTxCount" class="text-xl font-bold text-slate-900 mt-2">-</p>
                        </div>
                    </div>

                    <!-- Charts Grid -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 class="text-sm font-semibold text-slate-900 mb-4">Balance Trend</h3>
                            <div class="h-64">
                                <canvas id="trendChart"></canvas>
                            </div>
                        </div>
                        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 class="text-sm font-semibold text-slate-900 mb-4">Income vs Expense</h3>
                            <div class="h-64">
                                <canvas id="flowChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tab 2: Transactions View -->
                <div id="view-transactions" class="space-y-4 hidden">
                    <!-- Filters -->
                    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
                        <div class="flex items-center space-x-2 w-full md:w-72">
                            <i data-lucide="search" class="w-4 h-4 text-slate-400"></i>
                            <input type="text" id="txSearch" oninput="filterTransactions()" placeholder="Search counterparty or description..." class="w-full text-sm border-0 focus:ring-0 placeholder-slate-400">
                        </div>
                        <div class="flex items-center space-x-4">
                            <select id="filterDirection" onchange="filterTransactions()" class="text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="ALL">All Directions</option>
                                <option value="INFLOW">Inflow</option>
                                <option value="OUTFLOW">Outflow</option>
                            </select>
                            <select id="filterCategory" onchange="filterTransactions()" class="text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="ALL">All Categories</option>
                            </select>
                        </div>
                    </div>

                    <!-- Table -->
                    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-slate-200">
                                <thead class="bg-slate-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Counterparty</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                        <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody id="txTableBody" class="divide-y divide-slate-200 bg-white text-sm text-slate-700">
                                    <tr>
                                        <td colspan="5" class="px-6 py-12 text-center text-slate-400">
                                            <i data-lucide="file-question" class="w-8 h-8 mx-auto mb-2"></i>
                                            No statement loaded yet. Upload a file or load sample data.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Tab 3: Financial Analytics View -->
                <div id="view-analytics" class="space-y-6 hidden">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Category Breakdown Chart -->
                        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                            <h3 class="text-sm font-semibold text-slate-900 mb-4">Expense Breakdown by Category</h3>
                            <div class="h-80 flex items-center justify-center">
                                <canvas id="categoryChart"></canvas>
                            </div>
                        </div>

                        <!-- Top Counterparties -->
                        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                            <h3 class="text-sm font-semibold text-slate-900 mb-4">Top Counterparties</h3>
                            <div class="flex-1 overflow-y-auto space-y-4" id="counterpartyList">
                                <p class="text-xs text-slate-400 text-center py-12">No data available</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tab 4: Developer API & Export View -->
                <div id="view-developer" class="space-y-6 hidden">
                    <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 class="text-sm font-semibold text-slate-900 mb-4">Export Options</h3>
                        <div class="flex flex-wrap gap-4">
                            <button onclick="exportToCSV()" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700">
                                <i data-lucide="file-spreadsheet" class="w-4 h-4 mr-2"></i>
                                Export to CSV
                            </button>
                            <button onclick="downloadJSON()" class="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                                <i data-lucide="download" class="w-4 h-4 mr-2"></i>
                                Download Parsed JSON
                            </button>
                        </div>
                    </div>

                    <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 class="text-sm font-semibold text-slate-900 mb-4">Raw Parsed JSON Response</h3>
                        <div class="bg-slate-900 rounded-lg p-4 overflow-x-auto max-h-96">
                            <pre id="jsonViewer" class="text-xs text-emerald-400 font-mono">{}</pre>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <footer class="bg-white border-t border-slate-200 py-4">
            <div class="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
                CAMT.053 Statement Parser & Analytics Service &copy; 2023. Built with FastAPI, Tailwind CSS, and Chart.js.
            </div>
        </footer>

        <!-- JavaScript Logic -->
        <script>
            // Global State
            let statementData = null;
            let analyticsData = null;
            let activeTab = 'dashboard';
            let charts = {};

            // Initialize Lucide Icons
            lucide.createIcons();

            function switchTab(tabId) {
                document.querySelectorAll('nav button').forEach(btn => {
                    btn.classList.remove('tab-active', 'border-indigo-500', 'text-indigo-600');
                    btn.classList.add('border-transparent', 'text-slate-500');
                });
                const activeBtn = document.getElementById(`tab-${tabId}`);
                activeBtn.classList.add('tab-active', 'border-indigo-500', 'text-indigo-600');
                activeBtn.classList.remove('border-transparent', 'text-slate-500');

                ['dashboard', 'transactions', 'analytics', 'developer'].forEach(view => {
                    document.getElementById(`view-${view}`).classList.add('hidden');
                });
                document.getElementById(`view-${tabId}`).classList.remove('hidden');
                activeTab = tabId;

                // Re-render charts if switching to dashboard or analytics to fix sizing issues
                if (tabId === 'dashboard' || tabId === 'analytics') {
                    renderCharts();
                }
            }

            async function handleFileSelect(event) {
                const file = event.target.files[0];
                if (!file) return;

                document.getElementById('fileName').innerText = file.name;
                document.getElementById('fileDetails').classList.remove('hidden');

                const formData = new FormData();
                formData.append('file', file);

                try {
                    // Parse Statement
                    const parseRes = await fetch('/api/v1/parse', { method: 'POST', body: formData });
                    if (!parseRes.ok) throw new Error('Failed to parse statement');
                    const parsed = await parseRes.json();
                    statementData = parsed[0]; // Take first statement

                    // Analyze Statement
                    const analyzeRes = await fetch('/api/v1/analyze', { method: 'POST', body: formData });
                    if (!analyzeRes.ok) throw new Error('Failed to analyze statement');
                    analyticsData = await analyzeRes.json();

                    updateUI();
                } catch (err) {
                    alert('Error processing file: ' + err.message);
                }
            }

            async function loadSampleData() {
                try {
                    const res = await fetch('/api/v1/sample');
                    const xmlText = await res.text();
                    const blob = new Blob([xmlText], { type: 'text/xml' });
                    const file = new File([blob], 'sample_camt053.xml', { type: 'text/xml' });

                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    document.getElementById('fileInput').files = dataTransfer.files;

                    // Trigger change event
                    const event = new Event('change', { bubbles: true });
                    document.getElementById('fileInput').dispatchEvent(event);
                } catch (err) {
                    alert('Error loading sample data: ' + err.message);
                }
            }

            function clearFile() {
                document.getElementById('fileInput').value = '';
                document.getElementById('fileDetails').classList.add('hidden');
                statementData = null;
                analyticsData = null;
                resetUI();
            }

            function resetUI() {
                document.getElementById('metaStmtId').innerText = '-';
                document.getElementById('metaIban').innerText = '-';
                document.getElementById('metaCurrency').innerText = '-';
                document.getElementById('metaCreated').innerText = '-';

                document.getElementById('cardOpeningBal').innerText = '-';
                document.getElementById('cardClosingBal').innerText = '-';
                document.getElementById('cardNetFlow').innerText = '-';
                document.getElementById('cardTxCount').innerText = '-';

                document.getElementById('txTableBody').innerHTML = `
                    <tr>
                        <td colspan="5" class="px-6 py-12 text-center text-slate-400">
                            <i data-lucide="file-question" class="w-8 h-8 mx-auto mb-2"></i>
                            No statement loaded yet. Upload a file or load sample data.
                        </td>
                    </tr>
                `;
                lucide.createIcons();

                document.getElementById('jsonViewer').innerText = '{}';
                destroyCharts();
            }

            function updateUI() {
                if (!statementData || !analyticsData) return;

                // Metadata
                document.getElementById('metaStmtId').innerText = statementData.statement_id || 'N/A';
                document.getElementById('metaIban').innerText = statementData.account.id || 'N/A';
                document.getElementById('metaCurrency').innerText = statementData.account.currency || 'N/A';
                document.getElementById('metaCreated').innerText = new Date(statementData.creation_date_time).toLocaleString() || 'N/A';

                // Summary Cards
                const currency = statementData.account.currency;
                const opBal = statementData.balances.find(b => b.type === 'OPBD')?.amount || 0;
                const clBal = statementData.balances.find(b => b.type === 'CLBD')?.amount || 0;

                document.getElementById('cardOpeningBal').innerText = formatCurrency(opBal, currency);
                document.getElementById('cardClosingBal').innerText = formatCurrency(clBal, currency);
                
                const netFlow = analyticsData.net_flow;
                const netFlowEl = document.getElementById('cardNetFlow');
                netFlowEl.innerText = formatCurrency(netFlow, currency);
                const flowIconContainer = document.getElementById('flowIconContainer');
                if (netFlow >= 0) {
                    netFlowEl.className = "text-xl font-bold text-emerald-600 mt-2";
                    flowIconContainer.className = "p-1.5 bg-emerald-50 text-emerald-600 rounded-lg";
                    flowIconContainer.innerHTML = '<i data-lucide="trending-up" class="w-4 h-4"></i>';
                } else {
                    netFlowEl.className = "text-xl font-bold text-rose-600 mt-2";
                    flowIconContainer.className = "p-1.5 bg-rose-50 text-rose-600 rounded-lg";
                    flowIconContainer.innerHTML = '<i data-lucide="trending-down" class="w-4 h-4"></i>';
                }

                document.getElementById('cardTxCount').innerText = analyticsData.transaction_count;

                // Populate Category Filter
                const catFilter = document.getElementById('filterCategory');
                catFilter.innerHTML = '<option value="ALL">All Categories</option>';
                const uniqueCategories = [...new Set(statementData.entries.map(e => e.category))];
                uniqueCategories.forEach(cat => {
                    if (cat) {
                        const opt = document.createElement('option');
                        opt.value = cat;
                        opt.innerText = cat;
                        catFilter.appendChild(opt);
                    }
                });

                // Populate Transactions Table
                renderTransactionsTable(statementData.entries);

                // Populate Counterparties
                const cpList = document.getElementById('counterpartyList');
                cpList.innerHTML = '';
                const sortedCPs = [...analyticsData.counterparty_breakdown].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)).slice(0, 5);
                sortedCPs.forEach(cp => {
                    const div = document.createElement('div');
                    div.className = "flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100";
                    div.innerHTML = `
                        <div>
                            <p class="text-xs font-semibold text-slate-800 truncate max-w-[180px]">${cp.counterparty}</p>
                        </div>
                        <span class="text-xs font-bold ${cp.amount >= 0 ? 'text-emerald-600' : 'text-slate-700'}">
                            ${formatCurrency(cp.amount, currency)}
                        </span>
                    `;
                    cpList.appendChild(div);
                });

                // JSON Viewer
                document.getElementById('jsonViewer').innerText = JSON.stringify(analyticsData, null, 2);

                // Render Charts
                renderCharts();
                lucide.createIcons();
            }

            function renderTransactionsTable(entries) {
                const tbody = document.getElementById('txTableBody');
                tbody.innerHTML = '';

                if (entries.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="5" class="px-6 py-12 text-center text-slate-400">
                                <i data-lucide="search-code" class="w-8 h-8 mx-auto mb-2"></i>
                                No matching transactions found.
                            </td>
                        </tr>
                    `;
                    lucide.createIcons();
                    return;
                }

                entries.forEach(tx => {
                    const tr = document.createElement('tr');
                    tr.className = "hover:bg-slate-50 transition";
                    tr.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap text-xs text-slate-500">${tx.booking_date || tx.value_date}</td>
                        <td class="px-6 py-4 whitespace-nowrap font-medium text-slate-900 max-w-[200px] truncate">${tx.counterparty_name}</td>
                        <td class="px-6 py-4 text-slate-500 max-w-[300px] truncate">${tx.remittance_info || '-'}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-800">
                                ${tx.category || 'Uncategorized'}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right font-semibold ${tx.amount >= 0 ? 'text-emerald-600' : 'text-slate-900'}">
                            ${formatCurrency(tx.amount, tx.currency)}
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            function filterTransactions() {
                if (!statementData) return;
                const searchVal = document.getElementById('txSearch').value.toLowerCase();
                const dirVal = document.getElementById('filterDirection').value;
                const catVal = document.getElementById('filterCategory').value;

                const filtered = statementData.entries.filter(tx => {
                    const matchesSearch = tx.counterparty_name.toLowerCase().includes(searchVal) || 
                                          (tx.remittance_info && tx.remittance_info.toLowerCase().includes(searchVal));
                    const matchesDir = dirVal === 'ALL' || tx.direction === dirVal;
                    const matchesCat = catVal === 'ALL' || tx.category === catVal;

                    return matchesSearch && matchesDir && matchesCat;
                });

                renderTransactionsTable(filtered);
            }

            function formatCurrency(amount, currency) {
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'EUR' }).format(amount);
            }

            function destroyCharts() {
                Object.keys(charts).forEach(key => {
                    if (charts[key]) {
                        charts[key].destroy();
                        charts[key] = null;
                    }
                });
            }

            function renderCharts() {
                if (!analyticsData) return;
                destroyCharts();

                // 1. Trend Chart
                const trendCtx = document.getElementById('trendChart').getContext('2d');
                charts.trend = new Chart(trendCtx, {
                    type: 'line',
                    data: {
                        labels: analyticsData.balance_trend.map(p => p.date),
                        datasets: [{
                            label: 'Balance',
                            data: analyticsData.balance_trend.map(p => p.balance),
                            borderColor: '#4f46e5',
                            backgroundColor: 'rgba(79, 70, 229, 0.05)',
                            fill: true,
                            tension: 0.2,
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { grid: { color: '#f1f5f9' } },
                            x: { grid: { display: false } }
                        }
                    }
                });

                // 2. Flow Chart (Income vs Expense)
                const flowCtx = document.getElementById('flowChart').getContext('2d');
                charts.flow = new Chart(flowCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Income', 'Expense'],
                        datasets: [{
                            data: [analyticsData.total_income, analyticsData.total_expense],
                            backgroundColor: ['#10b981', '#ef4444'],
                            borderRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { grid: { color: '#f1f5f9' } },
                            x: { grid: { display: false } }
                        }
                    }
                });

                // 3. Category Breakdown Chart
                const catCtx = document.getElementById('categoryChart').getContext('2d');
                const expensesOnly = analyticsData.category_breakdown.filter(c => c.amount < 0);
                charts.category = new Chart(catCtx, {
                    type: 'doughnut',
                    data: {
                        labels: expensesOnly.map(c => c.category),
                        datasets: [{
                            data: expensesOnly.map(c => Math.abs(c.amount)),
                            backgroundColor: [
                                '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', 
                                '#ef4444', '#ec4899', '#8b5cf6', '#64748b'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right',
                                labels: { boxWidth: 12, font: { size: 11 } }
                            }
                        }
                    }
                });
            }

            async function exportToCSV() {
                const fileInput = document.getElementById('fileInput');
                if (fileInput.files.length === 0) {
                    alert('Please upload a file first.');
                    return;
                }
                const formData = new FormData();
                formData.append('file', fileInput.files[0]);

                try {
                    const res = await fetch('/api/v1/convert/csv', { method: 'POST', body: formData });
                    if (!res.ok) throw new Error('CSV conversion failed');
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'statement_export.csv';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                } catch (err) {
                    alert('Error exporting CSV: ' + err.message);
                }
            }

            function downloadJSON() {
                if (!analyticsData) {
                    alert('No data to download.');
                    return;
                }
                const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `statement_${analyticsData.statement_id || 'export'}.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@app.post("/api/v1/parse", response_model=List[StatementDetails])
async def parse_statement(file: UploadFile = File(...)):
    """
    App 1: Core Parser API
    Accepts a CAMT.053 XML file, parses it, and returns structured JSON.
    """
    if not file.filename.endswith('.xml'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only CAMT.053 XML files are supported."
        )
    
    try:
        content = await file.read()
        statements = parse_camt053_xml(content)
        
        # Enrich with categories
        for stmt in statements:
            for entry in stmt.get("entries", []):
                entry["category"] = categorize_transaction(
                    entry.get("remittance_info", ""),
                    entry.get("counterparty_name", ""),
                    entry.get("amount", 0.0)
                )
                
        return statements
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to parse CAMT.053 statement: {str(e)}"
        )

@app.post("/api/v1/analyze", response_model=StatementAnalytics)
async def analyze_statement(file: UploadFile = File(...)):
    """
    App 2: Financial Analytics Engine
    Parses the statement and returns rich financial analytics, category breakdowns, and trends.
    """
    if not file.filename.endswith('.xml'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only CAMT.053 XML files are supported."
        )
    
    try:
        content = await file.read()
        statements = parse_camt053_xml(content)
        if not statements:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No valid statements found in the XML file."
            )
        
        # Analyze the first statement in the file
        analytics = analyze_statement_data(statements[0])
        return analytics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to analyze statement: {str(e)}"
        )

@app.post("/api/v1/convert/csv")
async def convert_to_csv(file: UploadFile = File(...)):
    """
    App 3: Format Converter API
    Converts the uploaded CAMT.053 XML file into a flat, downloadable CSV file.
    """
    if not file.filename.endswith('.xml'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only CAMT.053 XML files are supported."
        )
    
    try:
        content = await file.read()
        statements = parse_camt053_xml(content)
        csv_data = convert_statements_to_csv(statements)
        
        return StreamingResponse(
            io.StringIO(csv_data),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=statement_export.csv"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to convert statement to CSV: {str(e)}"
        )

@app.get("/api/v1/sample")
async def get_sample_statement():
    """
    App 4: Sample Generator API
    Returns a valid, realistic CAMT.053 XML sample file for testing and development.
    """
    sample_xml = generate_sample_xml()
    return StreamingResponse(
        io.StringIO(sample_xml),
        media_type="application/xml",
        headers={"Content-Disposition": "attachment; filename=sample_camt053.xml"}
    )

# ==========================================
# 8. RUNNER
# ==========================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)