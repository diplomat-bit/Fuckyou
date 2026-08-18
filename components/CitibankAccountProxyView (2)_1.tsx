import React, { useState, useCallback } from 'react';
import { useMoneyMovement } from './MoneyMovementContext';
import {
  SourceAccounts,
  AccountProxyTransfersPreprocessResponse,
  AccountProxyTransfersResponse,
  AdhocAccountProxyTransfersPreprocessWithAddPayeeResponse,
} from './sdk';

// The James Burvel O'Callaghan III Code - CitibankAccountProxyView

const CitibankAccountProxyView: React.FC = () => {
  const { api, accessToken, uuid, generateNewUuid } = useMoneyMovement();

  // A. UI State Variables
  const [A1_isLoading, A2_setIsLoading] = useState(false);
  const [A3_error, A4_setError] = useState<string | null>(null);

  // B. Eligibility State Variables
  const [B1_proxyPaymentTypeForEligibility, B2_setProxyPaymentTypeForEligibility] = useState('PAY_BY_PHONE');
  const [B3_eligibleAccounts, B4_setEligibleAccounts] = useState<SourceAccounts[]>([]);

  // C. Transfer Form State Variables
  const [C1_isAdhoc, C2_setIsAdhoc] = useState(false);
  const [C3_sourceAccountId, C4_setSourceAccountId] = useState('');
  const [C5_amount, C6_setAmount] = useState('');
  const [C7_currency, C8_setCurrency] = useState('USD');
  const [C9_proxyId, C10_setProxyId] = useState('');
  const [C11_proxyIdType, C12_setProxyIdType] = useState('PHONE');
  const [C13_proxyPaymentType, C14_setProxyPaymentType] = useState('PAY_BY_PHONE');
  const [C15_remarks, C16_setRemarks] = useState('Proxy payment');
  const [C17_transferPurpose, C18_setTransferPurpose] = useState('Personal Transfer');

  // D. Ad-hoc Specific State Variables
  const [D1_payeeNickName, D2_setPayeeNickName] = useState('');
  const [D3_enrollPayee, D4_setEnrollPayee] = useState(true);

  // E. API Response State Variables
  const [E1_preprocessData, E2_setPreprocessData] = useState<AccountProxyTransfersPreprocessResponse | AdhocAccountProxyTransfersPreprocessWithAddPayeeResponse | null>(null);
  const [E3_confirmationData, E4_setConfirmationData] = useState<AccountProxyTransfersResponse | null>(null);

  // F. Utility Function: Handle API Calls
  const F1_handleApiCall = useCallback(
    async <T,>(
      F2_apiMethod: () => Promise<T>,
      F3_onSuccess: (data: T) => void
    ) => {
      if (!accessToken || !api) {
        A4_setError('Not authenticated. Please set the access token.');
        return;
      }
      A2_setIsLoading(true);
      A4_setError(null);
      E2_setPreprocessData(null);
      E4_setConfirmationData(null);
      generateNewUuid(); // Generate a new UUID for each request

      try {
        const F4_result = await F2_apiMethod();
        F3_onSuccess(F4_result);
      } catch (F5_e: any) {
        A4_setError(`API Error: ${F5_e.message || 'An unknown error occurred.'}`);
      } finally {
        A2_setIsLoading(false);
      }
    },
    [accessToken, api, generateNewUuid]
  );

  // G. API Call: Check Eligibility
  const G1_handleCheckEligibility = useCallback(() => {
    if (!api) return;
    F1_handleApiCall(
      () => api.accountProxyTransfersSourceAccountEligibility(accessToken!, uuid, B1_proxyPaymentTypeForEligibility),
      (G2_data) => {
        const G3_response = G2_data as any; // Casting to any because SDK returns 'any' or generic response
        B4_setEligibleAccounts(G3_response.sourceAccounts || []);
        if (G3_response.sourceAccounts && G3_response.sourceAccounts.length > 0) {
          C4_setSourceAccountId(G3_response.sourceAccounts[0].sourceAccountId);
        }
      }
    );
  }, [api, accessToken, uuid, B1_proxyPaymentTypeForEligibility, F1_handleApiCall]);

  // H. API Call: Preprocess Transfer
  const H1_handlePreprocess = useCallback(() => {
    if (!api || !C3_sourceAccountId || !C5_amount) {
      A4_setError("Please select a source account and enter an amount.");
      return;
    }

    if (C1_isAdhoc) {
      F1_handleApiCall(
        () => api.adhocAccountProxyTransfersPreprocessWithAddPayee(accessToken!, uuid, {
          proxyPaymentType: C13_proxyPaymentType,
          sourceAccountId: C3_sourceAccountId,
          transactionAmount: parseFloat(C5_amount),
          transactionCurrencyCode: C7_currency,
          transferCurrencyIndicator: 'SOURCE_CURRENCY',
          proxyAccountId: C9_proxyId,
          proxyAccountIdType: C11_proxyIdType,
          chargeBearer: 'BENEFICIARY',
          remarks: C15_remarks,
          transferPurpose: C17_transferPurpose,
          payeeNickName: D1_payeeNickName,
          payeeEnrollmentFlag: D3_enrollPayee,
        }),
        (H2_data) => E2_setPreprocessData(H2_data)
      );
    } else {
      F1_handleApiCall(
        () => api.createAccountProxyTransfersPreprocess(accessToken!, uuid, {
          proxyPaymentType: C13_proxyPaymentType,
          sourceAccountId: C3_sourceAccountId,
          transactionAmount: parseFloat(C5_amount),
          transactionCurrencyCode: C7_currency,
          transferCurrencyIndicator: 'SOURCE_CURRENCY',
          proxyAccountId: C9_proxyId,
          proxyAccountIdType: C11_proxyIdType,
          chargeBearer: 'BENEFICIARY',
          remarks: C15_remarks,
          transferPurpose: C17_transferPurpose,
        }),
        (H3_data) => E2_setPreprocessData(H3_data)
      );
    }
  }, [api, accessToken, uuid, C3_sourceAccountId, C5_amount, C7_currency, C9_proxyId, C11_proxyIdType, C13_proxyPaymentType, C15_remarks, C17_transferPurpose, C1_isAdhoc, D1_payeeNickName, D3_enrollPayee, F1_handleApiCall]);

  // I. API Call: Confirm Transfer
  const I1_handleConfirm = useCallback(() => {
    if (!api || !E1_preprocessData?.controlFlowId) {
      A4_setError("No preprocess data available to confirm.");
      return;
    }
    F1_handleApiCall(
      () => api.executeAccountProxyTransfers(accessToken!, uuid, {
        controlFlowId: E1_preprocessData.controlFlowId,
      }),
      (I2_data) => {
        E4_setConfirmationData(I2_data);
        E2_setPreprocessData(null); // Clear preprocess data after confirmation
      }
    );
  }, [api, accessToken, uuid, E1_preprocessData, F1_handleApiCall]);

    // J. Return JSX
  return (
    <div className="container">
      <h2>Account Proxy Transfers - The James Burvel O'Callaghan III Code</h2>
      <p>Initiate transfers using proxy identifiers (phone numbers, emails, national IDs).</p>

      {A3_error && <div className="error-message">{A3_error}</div>}
      {A1_isLoading && <div className="loading-spinner">Loading...</div>}

      {/* Step 1: Eligibility Check */}
      <div className="card">
        <h3>Step 1: Check Source Account Eligibility</h3>
        <p>Determine eligible source accounts for proxy transfers based on payment type.</p>
        <div className="form-group">
          <label htmlFor="eligibility-proxy-type">Proxy Payment Type:</label>
          <select
            id="eligibility-proxy-type"
            value={B1_proxyPaymentTypeForEligibility}
            onChange={(J1_e) => B2_setProxyPaymentTypeForEligibility(J1_e.target.value)}
          >
            <option value="PAY_BY_PHONE">Pay by Phone</option>
            <option value="PAY_BY_EMAIL">Pay by Email</option>
            <option value="PAY_BY_NATIONAL_ID">Pay by National ID</option>
          </select>
        </div>
        <button onClick={G1_handleCheckEligibility} disabled={A1_isLoading}>
          Check Eligibility
        </button>
        {B3_eligibleAccounts.length > 0 && (
          <div className="results">
            <h4>Eligible Source Accounts:</h4>
            <p>The following source accounts are eligible for proxy transfers.</p>
            <pre>{JSON.stringify(B3_eligibleAccounts, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Step 2: Transfer Form & Preprocess */}
      <div className="card">
        <h3>Step 2: Initiate and Preprocess Transfer</h3>
        <p>Enter transfer details and preprocess the transaction for confirmation.</p>
        <div className="form-group">
          <label>
            <input type="checkbox" checked={C1_isAdhoc} onChange={(J2_e) => C2_setIsAdhoc(J2_e.target.checked)} />
            Ad-hoc Transfer (with Payee Creation)
          </label>
        </div>
        <div className="form-group">
          <label htmlFor="source-account">Source Account:</label>
          <select
            id="source-account"
            value={C3_sourceAccountId}
            onChange={(J3_e) => C4_setSourceAccountId(J3_e.target.value)}
            disabled={B3_eligibleAccounts.length === 0}
          >
            <option value="">-- Select Source Account --</option>
            {B3_eligibleAccounts.map((J4_acc) => (
              <option key={J4_acc.sourceAccountId} value={J4_acc.sourceAccountId}>
                {J4_acc.accountNickName || J4_acc.productName} ({J4_acc.displaySourceAccountNumber})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="proxy-payment-type">Proxy Payment Type:</label>
          <select
            id="proxy-payment-type"
            value={C13_proxyPaymentType}
            onChange={(J5_e) => C14_setProxyPaymentType(J5_e.target.value)}
          >
            <option value="PAY_BY_PHONE">Pay by Phone</option>
            <option value="PAY_BY_EMAIL">Pay by Email</option>
            <option value="PAY_BY_NATIONAL_ID">Pay by National ID</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="proxy-id-type">Proxy ID Type:</label>
          <select
            id="proxy-id-type"
            value={C11_proxyIdType}
            onChange={(J6_e) => C12_setProxyIdType(J6_e.target.value)}
          >
            <option value="PHONE">Phone</option>
            <option value="EMAIL">Email</option>
            <option value="NATIONAL_ID">National ID</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="proxy-id">Proxy Identifier (e.g., Phone Number, Email):</label>
          <input
            id="proxy-id"
            type="text"
            value={C9_proxyId}
            onChange={(J7_e) => C10_setProxyId(J7_e.target.value)}
            placeholder="Enter phone, email, or ID"
          />
        </div>
        <div className="form-group">
          <label htmlFor="amount">Amount:</label>
          <input
            id="amount"
            type="number"
            value={C5_amount}
            onChange={(J8_e) => C6_setAmount(J8_e.target.value)}
            placeholder="e.g., 100.00"
          />
        </div>
        <div className="form-group">
          <label htmlFor="currency">Currency:</label>
          <input
            id="currency"
            type="text"
            value={C7_currency}
            onChange={(J9_e) => C8_setCurrency(J9_e.target.value)}
            placeholder="e.g., USD"
          />
        </div>
        {C1_isAdhoc && (
          <>
            <div className="form-group">
              <label htmlFor="payee-nickname">Payee Nickname:</label>
              <input
                id="payee-nickname"
                type="text"
                value={D1_payeeNickName}
                onChange={(J10_e) => D2_setPayeeNickName(J10_e.target.value)}
                placeholder="e.g., John Doe"
              />
            </div>
            <div className="form-group">
              <label>
                <input type="checkbox" checked={D3_enrollPayee} onChange={(J11_e) => D4_setEnrollPayee(J11_e.target.checked)} />
                Enroll this Payee
              </label>
            </div>
          </>
        )}
        <button onClick={H1_handlePreprocess} disabled={A1_isLoading || !C3_sourceAccountId || !C5_amount || !C9_proxyId}>
          Preprocess Transfer
        </button>
        {E1_preprocessData && (
          <div className="results">
            <h4>Preprocess Response:</h4>
            <p>The response from the preprocess API call.</p>
            <pre>{JSON.stringify(E1_preprocessData, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Step 3: Confirmation */}
      <div className="card">
        <h3>Step 3: Confirm Transfer</h3>
        <p>Confirm the transfer after reviewing the preprocess information.</p>
        <button onClick={I1_handleConfirm} disabled={A1_isLoading || !E1_preprocessData?.controlFlowId}>
          Confirm Transfer
        </button>
        {E3_confirmationData && (
          <div className="results success-message">
            <h4>Transfer Confirmed!</h4>
            <p>The transfer has been successfully confirmed.</p>
            <pre>{JSON.stringify(E3_confirmationData, null, 2)}</pre>
          </div>
        )}
      </div>

      <style>{`
        .container {
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .card {
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        input[type="text"],
        input[type="number"],
        select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
        }
        button {
          background-color: #00529b;
          color: white;
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        button:disabled {
          background-color: #a0a0a0;
          cursor: not-allowed;
        }
        .results {
          margin-top: 20px;
          background-color: #f0f0f0;
          padding: 15px;
          border-radius: 4px;
        }
        .error-message {
          color: red;
          background-color: #ffebee;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .success-message {
          color: green;
          background-color: #e8f5e9;
        }
        .loading-spinner {
          text-align: center;
          padding: 20px;
          font-size: 18px;
        }
      `}</style>
    </div>
  );
};

export default CitibankAccountProxyView;