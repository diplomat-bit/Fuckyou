import React, { useState, useEffect, useMemo } from 'react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface OfxTransaction {
  type: string;
  datePosted: string;
  amount: number;
  fitId: string;
  name: string;
  memo: string;
}

export interface OfxAccount {
  bankId?: string;
  accountId: string;
  accountType: string;
  currency: string;
  balance?: number;
  transactions: OfxTransaction[];
}

export interface CitiAccount {
  accountId: string;
  productName: string;
  accountNickname?: string;
  accountDescription: string;
  balanceType: string;
  displayAccountNumber: string;
  currencyCode: string;
  accountStatus: string;
  currentBalance: number;
  availableBalance?: number;
  accountGroup: string;
}

export interface CitiTransaction {
  accountId: string;
  currencyCode: string;
  transactionAmount: number;
  transactionDate: string;
  transactionDescription: string;
  transactionStatus: string;
  transactionType: string;
  debitCreditMemo: string;
  transactionId: string;
}

// ==========================================
// HIGH-FIDELITY MOCK DATA (Citi B2B API)
// ==========================================

const MOCK_CITI_ACCOUNTS: CitiAccount[] = [
  {
    accountId: "da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f6",
    productName: "Business Checking",
    accountNickname: "Primary Operating Account",
    accountDescription: "Business Checking - 9594",
    balanceType: "ASSET",
    displayAccountNumber: "XXXXXX9594",
    currencyCode: "USD",
    accountStatus: "ACTIVE",
    currentBalance: 15000.25,
    availableBalance: 15000.25,
    accountGroup: "CHECKING"
  },
  {
    accountId: "8035a60debb671e89bd451c9ad0f283e8f1b8868dd4dc65520ceb7bdfeb4142999f574c9db37917ef0edfae296745142543e3ad2bc034887f37212ecbde83ee0",
    productName: "Citi Rewards+℠ Card",
    accountDescription: "Citi Rewards+℠ Card - 7899",
    balanceType: "LIABILITY",
    displayAccountNumber: "XXXXXXXXXXXX7899",
    currencyCode: "USD",
    accountStatus: "ACTIVE",
    currentBalance: -1250.40,
    accountGroup: "CREDITCARD"
  }
];

const MOCK_CITI_TRANSACTIONS: Record<string, CitiTransaction[]> = {
  "da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f6": [
    {
      accountId: "da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f6",
      currencyCode: "USD",
      transactionAmount: -120.50,
      transactionDate: "2026-08-10",
      transactionDescription: "OFFICE DEPOT #912",
      transactionStatus: "POSTED",
      transactionType: "DEBIT",
      debitCreditMemo: "DEBIT",
      transactionId: "TXN001"
    },
    {
      accountId: "da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f6",
      currencyCode: "USD",
      transactionAmount: 2500.00,
      transactionDate: "2026-08-12",
      transactionDescription: "ACH DEPOSIT - ACME CORP",
      transactionStatus: "POSTED",
      transactionType: "DEPOSIT",
      debitCreditMemo: "CREDIT",
      transactionId: "TXN002"
    },
    {
      accountId: "da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f6",
      currencyCode: "USD",
      transactionAmount: -45.00,
      transactionDate: "2026-08-14",
      transactionDescription: "STARBUCKS COFFEE",
      transactionStatus: "POSTED",
      transactionType: "DEBIT",
      debitCreditMemo: "DEBIT",
      transactionId: "TXN003"
    },
    {
      accountId: "da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f6",
      currencyCode: "USD",
      transactionAmount: -850.00,
      transactionDate: "2026-08-15",
      transactionDescription: "MONTHLY OFFICE RENT",
      transactionStatus: "POSTED",
      transactionType: "DEBIT",
      debitCreditMemo: "DEBIT",
      transactionId: "TXN004"
    }
  ],
  "8035a60debb671e89bd451c9ad0f283e8f1b8868dd4dc65520ceb7bdfeb4142999f574c9db37917ef0edfae296745142543e3ad2bc034887f37212ecbde83ee0": [
    {
      accountId: "8035a60debb671e89bd451c9ad0f283e8f1b8868dd4dc65520ceb7bdfeb4142999f574c9db37917ef0edfae296745142543e3ad2bc034887f37212ecbde83ee0",
      currencyCode: "USD",
      transactionAmount: -350.00,
      transactionDate: "2026-08-11",
      transactionDescription: "DELTA AIRLINES",
      transactionStatus: "BILLED",
      transactionType: "PURCHASE",
      debitCreditMemo: "DEBIT",
      transactionId: "TXN005"
    },
    {
      accountId: "8035a60debb671e89bd451c9ad0f283e8f1b8868dd4dc65520ceb7bdfeb4142999f574c9db37917ef0edfae296745142543e3ad2bc034887f37212ecbde83ee0",
      currencyCode: "USD",
      transactionAmount: -12.99,
      transactionDate: "2026-08-13",
      transactionDescription: "ADOBE SYSTEMS INC",
      transactionStatus: "BILLED",
      transactionType: "PURCHASE",
      debitCreditMemo: "DEBIT",
      transactionId: "TXN006"
    }
  ]
};

const SAMPLE_OFX_CONTENT = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <TRNUID>1</TRNUID>
      <STATUS>
        <CODE>0</CODE>
        <SEVERITY>INFO</SEVERITY>
      </STATUS>
      <STMTRS>
        <CURDEF>USD</CURDEF>
        <BANKACCTFROM>
          <BANKID>122401710</BANKID>
          <ACCTID>XXXXXX9594</ACCTID>
          <ACCTTYPE>CHECKING</ACCTTYPE>
        </BANKACCTFROM>
        <BANKTRANLIST>
          <DTSTART>20260801000000</DTSTART>
          <DTEND>20260817000000</DTEND>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>20260810120000</DTPOSTED>
            <TRNAMT>-120.50</TRNAMT>
            <FITID>FIT001</FITID>
            <NAME>OFFICE DEPOT #912</NAME>
            <MEMO>Office supplies</MEMO>
          </STMTTRN>
          <STMTTRN>
            <TRNTYPE>CREDIT</TRNTYPE>
            <DTPOSTED>20260812120000</DTPOSTED>
            <TRNAMT>2500.00</TRNAMT>
            <FITID>FIT002</FITID>
            <NAME>ACH DEPOSIT - ACME CORP</NAME>
            <MEMO>Invoice payment</MEMO>
          </STMTTRN>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>20260813120000</DTPOSTED>
            <TRNAMT>-45.00</TRNAMT>
            <FITID>FIT003</FITID>
            <NAME>STARBUCKS COFFEE</NAME>
            <MEMO>Fuzzy match test - date shifted by 1 day</MEMO>
          </STMTTRN>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>20260816120000</DTPOSTED>
            <TRNAMT>-15.75</TRNAMT>
            <FITID>FIT004</FITID>
            <NAME>LOCAL DELI</NAME>
            <MEMO>OFX Only transaction</MEMO>
          </STMTTRN>
        </BANKTRANLIST>
        <LEDGERBAL>
          <BALAMT>15000.25</BALAMT>
          <DTASOF>20260817000000</DTASOF>
        </LEDGERBAL>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;

// ==========================================
// PARSER UTILITIES
// ==========================================

const convertOfxToXml = (ofxRaw: string): string => {
  const ofxStartIndex = ofxRaw.indexOf('<OFX>');
  if (ofxStartIndex === -1) return '';
  const body = ofxRaw.substring(ofxStartIndex);
  
  const lines = body.split('\n');
  const xmlLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    // Match <TAG>value (no closing tag, no nested tags)
    const match = trimmed.match(/^<([A-Z0-9_]+)>([^<]+)$/i);
    if (match) {
      const tag = match[1];
      const value = match[2];
      return `<${tag}>${value}</${tag}>`;
    }
    return trimmed;
  });
  return xmlLines.join('\n');
};

const formatDate = (ofxDate: string): string => {
  if (ofxDate.length >= 8) {
    const year = ofxDate.substring(0, 4);
    const month = ofxDate.substring(4, 6);
    const day = ofxDate.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  return ofxDate;
};

const parseOfxXml = (xmlStr: string): OfxAccount[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, 'text/xml');
  const accounts: OfxAccount[] = [];
  
  const stmtrsList = doc.getElementsByTagName('STMTRS');
  const ccstmtrsList = doc.getElementsByTagName('CCSTMTRS');
  
  const processStatement = (statementNode: Element, isCreditCard: boolean) => {
    const currency = statementNode.getElementsByTagName('CURDEF')[0]?.textContent || 'USD';
    let accountId = '';
    let bankId = '';
    let accountType = isCreditCard ? 'CREDITCARD' : 'CHECKING';
    
    if (isCreditCard) {
      const ccAcct = statementNode.getElementsByTagName('CCACCTFROM')[0];
      if (ccAcct) {
        accountId = ccAcct.getElementsByTagName('ACCTID')[0]?.textContent || '';
      }
    } else {
      const bankAcct = statementNode.getElementsByTagName('BANKACCTFROM')[0];
      if (bankAcct) {
        bankId = bankAcct.getElementsByTagName('BANKID')[0]?.textContent || '';
        accountId = bankAcct.getElementsByTagName('ACCTID')[0]?.textContent || '';
        accountType = bankAcct.getElementsByTagName('ACCTTYPE')[0]?.textContent || 'CHECKING';
      }
    }
    
    let balance: number | undefined = undefined;
    const ledgerBal = statementNode.getElementsByTagName('LEDGERBAL')[0];
    if (ledgerBal) {
      const balAmtStr = ledgerBal.getElementsByTagName('BALAMT')[0]?.textContent;
      if (balAmtStr) {
        balance = parseFloat(balAmtStr);
      }
    }
    
    const transactions: OfxTransaction[] = [];
    const stmtTrnList = statementNode.getElementsByTagName('STMTTRN');
    for (let i = 0; i < stmtTrnList.length; i++) {
      const trn = stmtTrnList[i];
      const type = trn.getElementsByTagName('TRNTYPE')[0]?.textContent || '';
      const datePosted = trn.getElementsByTagName('DTPOSTED')[0]?.textContent || '';
      const amountStr = trn.getElementsByTagName('TRNAMT')[0]?.textContent || '0';
      const fitId = trn.getElementsByTagName('FITID')[0]?.textContent || '';
      const name = trn.getElementsByTagName('NAME')[0]?.textContent || trn.getElementsByTagName('MEMO')[0]?.textContent || '';
      const memo = trn.getElementsByTagName('MEMO')[0]?.textContent || '';
      
      transactions.push({
        type,
        datePosted: formatDate(datePosted),
        amount: parseFloat(amountStr),
        fitId,
        name,
        memo
      });
    }
    
    accounts.push({
      bankId,
      accountId,
      accountType,
      currency,
      balance,
      transactions
    });
  };
  
  for (let i = 0; i < stmtrsList.length; i++) {
    processStatement(stmtrsList[i], false);
  }
  for (let i = 0; i < ccstmtrsList.length; i++) {
    processStatement(ccstmtrsList[i], true);
  }
  
  return accounts;
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function OfxParserView() {
  // API Connection & Mode States
  const [useMock, setUseMock] = useState<boolean>(true);
  const [apiStatus, setApiStatus] = useState<'connected' | 'error' | 'loading'>('connected');
  
  // Citi B2B API States
  const [citiAccounts, setCitiAccounts] = useState<CitiAccount[]>([]);
  const [selectedCitiAccountId, setSelectedCitiAccountId] = useState<string>('');
  const [citiTransactions, setCitiTransactions] = useState<CitiTransaction[]>([]);
  const [routingInfo, setRoutingInfo] = useState<{ routingNumber?: string; encryptedAccountNumber?: string } | null>(null);
  const [loadingCiti, setLoadingCiti] = useState<boolean>(false);
  const [citiError, setCitiError] = useState<string | null>(null);

  // OFX Upload States
  const [ofxAccounts, setOfxAccounts] = useState<OfxAccount[]>([]);
  const [selectedOfxAccountIndex, setSelectedOfxAccountIndex] = useState<number>(0);
  const [ofxError, setOfxError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Fetch Citi Accounts on Mount or Mode Change
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoadingCiti(true);
      setCitiError(null);
      if (useMock) {
        setCitiAccounts(MOCK_CITI_ACCOUNTS);
        if (MOCK_CITI_ACCOUNTS.length > 0) {
          setSelectedCitiAccountId(MOCK_CITI_ACCOUNTS[0].accountId);
        }
        setApiStatus('connected');
        setLoadingCiti(false);
      } else {
        try {
          const response = await fetch('/api/accounts/account-transactions/partner/v1/accounts/details', {
            headers: {
              'Authorization': 'Bearer mock-token',
              'uuid': crypto.randomUUID(),
              'Accept': 'application/json',
              'client_id': 'mock-client-id'
            }
          });
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          
          // Parse AccountsGroupDetailsList
          const accountsList: CitiAccount[] = [];
          if (data.accountGroupDetails) {
            data.accountGroupDetails.forEach((group: any) => {
              const groupName = group.accountGroup;
              if (group.checkingAccountsDetails) {
                group.checkingAccountsDetails.forEach((acc: any) => {
                  accountsList.push({ ...acc, accountGroup: groupName });
                });
              }
              if (group.creditCardAccountsDetails) {
                group.creditCardAccountsDetails.forEach((acc: any) => {
                  accountsList.push({ ...acc, accountGroup: groupName });
                });
              }
            });
          }
          setCitiAccounts(accountsList);
          if (accountsList.length > 0) {
            setSelectedCitiAccountId(accountsList[0].accountId);
          }
          setApiStatus('connected');
        } catch (err: any) {
          console.error(err);
          setCitiError('Failed to connect to Citi B2B API. Falling back to Mock Mode.');
          setApiStatus('error');
          setUseMock(true);
        } finally {
          setLoadingCiti(false);
        }
      }
    };

    fetchAccounts();
  }, [useMock]);

  // Fetch Citi Transactions when Selected Account Changes
  useEffect(() => {
    if (!selectedCitiAccountId) return;

    const fetchTransactions = async () => {
      setLoadingCiti(true);
      setCitiError(null);
      setRoutingInfo(null);
      if (useMock) {
        setCitiTransactions(MOCK_CITI_TRANSACTIONS[selectedCitiAccountId] || []);
        setLoadingCiti(false);
      } else {
        try {
          const response = await fetch(`/api/accounts/account-transactions/partner/v1/accounts/${selectedCitiAccountId}/transactions?transactionFromDate=2026-01-01&transactionToDate=2026-08-17`, {
            headers: {
              'Authorization': 'Bearer mock-token',
              'uuid': crypto.randomUUID(),
              'Accept': 'application/json',
              'client_id': 'mock-client-id'
            }
          });
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          
          // Extract transactions based on account type
          let txList: CitiTransaction[] = [];
          if (data.checkingAccountTransactions) {
            txList = data.checkingAccountTransactions;
          } else if (data.creditCardAccountTransactions) {
            txList = data.creditCardAccountTransactions;
          }
          setCitiTransactions(txList);
        } catch (err: any) {
          console.error(err);
          setCitiError('Failed to fetch transactions from Citi B2B API.');
        } finally {
          setLoadingCiti(false);
        }
      }
    };

    fetchTransactions();
  }, [selectedCitiAccountId, useMock]);

  // Fetch Routing Info
  const handleFetchRoutingInfo = async () => {
    if (!selectedCitiAccountId) return;
    setLoadingCiti(true);
    if (useMock) {
      setRoutingInfo({
        routingNumber: "122401710",
        encryptedAccountNumber: "JWE-Encrypted-Payload-Mock-9594"
      });
      setLoadingCiti(false);
    } else {
      try {
        const response = await fetch(`/api/accounts/account-transactions/partner/v1/accounts/${selectedCitiAccountId}/encrypt/accountRoutingNumber`, {
          headers: {
            'Authorization': 'Bearer mock-token',
            'uuid': crypto.randomUUID(),
            'Accept': 'application/json',
            'client_id': 'mock-client-id'
          }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setRoutingInfo({
          routingNumber: data.routingNumber,
          encryptedAccountNumber: data.encryptedAccountNumber?.encryptedPayload?.ciphertext || 'Encrypted'
        });
      } catch (err: any) {
        console.error(err);
        setCitiError('Failed to fetch routing information.');
      } finally {
        setLoadingCiti(false);
      }
    }
  };

  // OFX File Processing
  const handleOfxText = (text: string) => {
    try {
      setOfxError(null);
      const xmlStr = convertOfxToXml(text);
      if (!xmlStr) {
        throw new Error('Could not convert OFX to XML. Please verify the file format.');
      }
      const parsed = parseOfxXml(xmlStr);
      if (parsed.length === 0) {
        throw new Error('No accounts or transactions found in the OFX file.');
      }
      setOfxAccounts(parsed);
      setSelectedOfxAccountIndex(0);
    } catch (err: any) {
      setOfxError(err.message || 'An error occurred while parsing the OFX file.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        handleOfxText(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleOfxText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const loadSampleOfx = () => {
    handleOfxText(SAMPLE_OFX_CONTENT);
  };

  // Reconciliation Logic
  const selectedOfxAccount = ofxAccounts[selectedOfxAccountIndex];
  
  const reconciliation = useMemo(() => {
    if (!selectedOfxAccount || citiTransactions.length === 0) {
      return { matched: [], citiOnly: citiTransactions, ofxOnly: selectedOfxAccount?.transactions || [] };
    }

    const matched: Array<{ citi: CitiTransaction; ofx: OfxTransaction; type: 'exact' | 'fuzzy' }> = [];
    const citiOnly: CitiTransaction[] = [...citiTransactions];
    const ofxOnly: OfxTransaction[] = [...selectedOfxAccount.transactions];

    // Pass 1: Exact Match (Amount and Date match exactly)
    for (let i = ofxOnly.length - 1; i >= 0; i--) {
      const oTx = ofxOnly[i];
      const exactMatchIndex = citiOnly.findIndex(cTx => {
        return Math.abs(cTx.transactionAmount - oTx.amount) < 0.01 && cTx.transactionDate === oTx.datePosted;
      });

      if (exactMatchIndex !== -1) {
        matched.push({
          citi: citiOnly[exactMatchIndex],
          ofx: oTx,
          type: 'exact'
        });
        citiOnly.splice(exactMatchIndex, 1);
        ofxOnly.splice(i, 1);
      }
    }

    // Pass 2: Fuzzy Match (Amount matches, Date is within 3 days)
    for (let i = ofxOnly.length - 1; i >= 0; i--) {
      const oTx = ofxOnly[i];
      const fuzzyMatchIndex = citiOnly.findIndex(cTx => {
        if (Math.abs(cTx.transactionAmount - oTx.amount) >= 0.01) return false;
        const cDate = new Date(cTx.transactionDate);
        const oDate = new Date(oTx.datePosted);
        const diffTime = Math.abs(cDate.getTime() - oDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3;
      });

      if (fuzzyMatchIndex !== -1) {
        matched.push({
          citi: citiOnly[fuzzyMatchIndex],
          ofx: oTx,
          type: 'fuzzy'
        });
        citiOnly.splice(fuzzyMatchIndex, 1);
        ofxOnly.splice(i, 1);
      }
    }

    return { matched, citiOnly, ofxOnly };
  }, [selectedOfxAccount, citiTransactions]);

  // Export Reconciliation Report to CSV
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Status,Citi Date,Citi Description,Citi Amount,OFX Date,OFX Name,OFX Amount,Difference\n";

    reconciliation.matched.forEach(m => {
      csvContent += `Matched (${m.type}),${m.citi.transactionDate},"${m.citi.transactionDescription}",${m.citi.transactionAmount},${m.ofx.datePosted},"${m.ofx.name}",${m.ofx.amount},0\n`;
    });

    reconciliation.citiOnly.forEach(c => {
      csvContent += `Citi Only,${c.transactionDate},"${c.transactionDescription}",${c.transactionAmount},,,,\n`;
    });

    reconciliation.ofxOnly.forEach(o => {
      csvContent += `OFX Only,,,,${o.datePosted},"${o.name}",${o.amount},\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reconciliation_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 rounded-xl p-6 mb-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Citi B2B OFX Statement Parser & Reconciliation
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Upload local OFX bank statements and reconcile them in real-time with official Citi B2B API transactions.
          </p>
        </div>
        
        {/* Mode Selector */}
        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
          <button
            onClick={() => setUseMock(false)}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${!useMock ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Live Citi API
          </button>
          <button
            onClick={() => setUseMock(true)}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${useMock ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Mock Sandbox
          </button>
          <span className={`w-2.5 h-2.5 rounded-full mr-1 ${apiStatus === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'}`} title={apiStatus === 'connected' ? 'API Connected' : 'API Connection Error'} />
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Left Column: Citi B2B API Data */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              </span>
              Citi B2B Account Data
            </h2>
            {loadingCiti && (
              <span className="text-xs text-blue-600 flex items-center gap-1">
                <svg className="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </span>
            )}
          </div>

          {citiError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-3 mb-4">
              {citiError}
            </div>
          )}

          {/* Account Selector */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Citi Account</label>
            <select
              value={selectedCitiAccountId}
              onChange={(e) => setSelectedCitiAccountId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {citiAccounts.map((acc) => (
                <option key={acc.accountId} value={acc.accountId}>
                  {acc.productName} ({acc.displayAccountNumber}) - Balance: {acc.currentBalance.toLocaleString('en-US', { style: 'currency', currency: acc.currencyCode })}
                </option>
              ))}
            </select>
          </div>

          {/* Routing & Encryption Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Routing & Security</h4>
              {routingInfo ? (
                <div className="mt-1 text-sm text-slate-700 space-y-1">
                  <div><span className="font-semibold">Routing Number:</span> {routingInfo.routingNumber}</div>
                  <div className="truncate max-w-xs" title={routingInfo.encryptedAccountNumber}>
                    <span className="font-semibold">Encrypted Acct:</span> {routingInfo.encryptedAccountNumber}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-1">Secure routing details not loaded.</p>
              )}
            </div>
            <button
              onClick={handleFetchRoutingInfo}
              disabled={!selectedCitiAccountId}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              Retrieve Routing Info
            </button>
          </div>

          {/* Citi Transactions Table */}
          <div className="flex-1 overflow-y-auto max-h-80 border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-3">Date</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {citiTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-slate-400 text-xs">
                      No transactions found for this account.
                    </td>
                  </tr>
                ) : (
                  citiTransactions.map((tx) => (
                    <tr key={tx.transactionId} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-500 whitespace-nowrap">{tx.transactionDate}</td>
                      <td className="p-3 font-medium text-slate-800">{tx.transactionDescription}</td>
                      <td className={`p-3 text-right font-semibold ${tx.transactionAmount < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {tx.transactionAmount.toLocaleString('en-US', { style: 'currency', currency: tx.currencyCode })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Column: Local OFX Upload & Parse */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </span>
              Local OFX Statement Parser
            </h2>
            <button
              onClick={loadSampleOfx}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Load Sample OFX
            </button>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all mb-4 relative ${
              dragActive ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              id="ofx-file-input"
              accept=".ofx,.qfx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="ofx-file-input" className="cursor-pointer flex flex-col items-center justify-center">
              <svg className="w-10 h-10 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-semibold text-slate-700">Drag and drop your OFX/QFX file here</span>
              <span className="text-xs text-slate-400 mt-1">or click to browse from your computer</span>
            </label>
          </div>

          {ofxError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg p-3 mb-4">
              {ofxError}
            </div>
          )}

          {/* Parsed OFX Account Details */}
          {ofxAccounts.length > 0 && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Parsed OFX Accounts</label>
                {ofxAccounts.length > 1 && (
                  <div className="flex gap-1">
                    {ofxAccounts.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedOfxAccountIndex(idx)}
                        className={`px-2 py-0.5 text-xs rounded ${selectedOfxAccountIndex === idx ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                      >
                        Acc #{idx + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4 text-sm text-slate-700 grid grid-cols-2 gap-3">
                <div><span className="font-semibold text-slate-500">Account ID:</span> {selectedOfxAccount.accountId}</div>
                <div><span className="font-semibold text-slate-500">Type:</span> {selectedOfxAccount.accountType}</div>
                <div><span className="font-semibold text-slate-500">Currency:</span> {selectedOfxAccount.currency}</div>
                <div>
                  <span className="font-semibold text-slate-500">Ledger Balance:</span>{' '}
                  {selectedOfxAccount.balance !== undefined
                    ? selectedOfxAccount.balance.toLocaleString('en-US', { style: 'currency', currency: selectedOfxAccount.currency })
                    : 'N/A'}
                </div>
              </div>
            </div>
          )}

          {/* Parsed OFX Transactions Table */}
          <div className="flex-1 overflow-y-auto max-h-80 border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-3">Date</th>
                  <th className="p-3">Name / Memo</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {!selectedOfxAccount || selectedOfxAccount.transactions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-slate-400 text-xs">
                      Upload an OFX file to view parsed transactions.
                    </td>
                  </tr>
                ) : (
                  selectedOfxAccount.transactions.map((tx, idx) => (
                    <tr key={tx.fitId || idx} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-500 whitespace-nowrap">{tx.datePosted}</td>
                      <td className="p-3">
                        <div className="font-medium text-slate-800">{tx.name}</div>
                        {tx.memo && <div className="text-xs text-slate-400 truncate max-w-xs">{tx.memo}</div>}
                      </td>
                      <td className={`p-3 text-right font-semibold ${tx.amount < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {tx.amount.toLocaleString('en-US', { style: 'currency', currency: selectedOfxAccount.currency })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Reconciliation Dashboard */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </span>
              Reconciliation Dashboard
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Automated matching of local OFX statement transactions against official Citi B2B records.
            </p>
          </div>
          <button
            onClick={exportToCSV}
            disabled={!selectedOfxAccount || citiTransactions.length === 0}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Reconciliation Report
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Matched Transactions</div>
            <div className="text-2xl font-extrabold text-emerald-900 mt-1">{reconciliation.matched.length}</div>
            <div className="text-xs text-emerald-600 mt-1">Verified in both systems</div>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">Citi Only (Missing in OFX)</div>
            <div className="text-2xl font-extrabold text-amber-900 mt-1">{reconciliation.citiOnly.length}</div>
            <div className="text-xs text-amber-600 mt-1">Pending local import</div>
          </div>
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
            <div className="text-xs font-bold text-rose-700 uppercase tracking-wider">OFX Only (Missing in Citi)</div>
            <div className="text-2xl font-extrabold text-rose-900 mt-1">{reconciliation.ofxOnly.length}</div>
            <div className="text-xs text-rose-600 mt-1">Unrecorded or external transactions</div>
          </div>
        </div>

        {/* Reconciliation Details Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3">Status</th>
                <th className="p-3">Citi Record</th>
                <th className="p-3 text-right">Citi Amount</th>
                <th className="p-3">OFX Record</th>
                <th className="p-3 text-right">OFX Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {reconciliation.matched.length === 0 && reconciliation.citiOnly.length === 0 && reconciliation.ofxOnly.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                    Please select a Citi account and upload an OFX file to run reconciliation.
                  </td>
                </tr>
              ) : (
                <>
                  {/* Matched */}
                  {reconciliation.matched.map((m, idx) => (
                    <tr key={`matched-${idx}`} className="hover:bg-slate-50/50">
                      <td className="p-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          m.type === 'exact' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {m.type === 'exact' ? 'Exact Match' : 'Fuzzy Match'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-800">{m.citi.transactionDescription}</div>
                        <div className="text-xs text-slate-400">{m.citi.transactionDate}</div>
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-700">
                        {m.citi.transactionAmount.toLocaleString('en-US', { style: 'currency', currency: m.citi.currencyCode })}
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-800">{m.ofx.name}</div>
                        <div className="text-xs text-slate-400">{m.ofx.datePosted}</div>
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-700">
                        {m.ofx.amount.toLocaleString('en-US', { style: 'currency', currency: selectedOfxAccount?.currency || 'USD' })}
                      </td>
                    </tr>
                  ))}

                  {/* Citi Only */}
                  {reconciliation.citiOnly.map((c, idx) => (
                    <tr key={`citi-${idx}`} className="bg-amber-50/20 hover:bg-amber-50/40">
                      <td className="p-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          Citi Only
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-800">{c.transactionDescription}</div>
                        <div className="text-xs text-slate-400">{c.transactionDate}</div>
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-700">
                        {c.transactionAmount.toLocaleString('en-US', { style: 'currency', currency: c.currencyCode })}
                      </td>
                      <td className="p-3 text-slate-400 italic" colSpan={2}>
                        Missing from uploaded statement
                      </td>
                    </tr>
                  ))}

                  {/* OFX Only */}
                  {reconciliation.ofxOnly.map((o, idx) => (
                    <tr key={`ofx-${idx}`} className="bg-rose-50/20 hover:bg-rose-50/40">
                      <td className="p-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          OFX Only
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 italic" colSpan={2}>
                        Missing from Citi records
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-800">{o.name}</div>
                        <div className="text-xs text-slate-400">{o.datePosted}</div>
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-700">
                        {o.amount.toLocaleString('en-US', { style: 'currency', currency: selectedOfxAccount?.currency || 'USD' })}
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}