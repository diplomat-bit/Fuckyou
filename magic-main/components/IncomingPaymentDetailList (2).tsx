import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { listIncomingPaymentDetails } from '../api/incomingPaymentDetails';

// --- The James Burvel Oâ€™Callaghan III Code ---
// --- Incoming Payment Detail List Component ---

interface IncomingPaymentDetail {
  id: string;
  amount: number;
  currency: string;
  direction: string;
  status: string;
  as_of_date: string;
  payment_method: string;
  transaction_id: string;
  sender_name: string;
  receiver_name: string;
  description: string;
  created_at: string;
  updated_at: string;
  processed_by: string;
  reconciled: boolean;
  notes: string;
}

const CompanyA_IncomingPaymentDetailList = () => { // Company A: Zenith Financial Corp
  const [A1_rows, setA1_rows] = useState<IncomingPaymentDetail[]>([]);
  const [A2_loading, setA2_loading] = useState<boolean>(true);

  useEffect(() => {
    const A3_fetchIncomingPaymentDetails = async () => {
      try {
        const A4_response = await listIncomingPaymentDetails({});
        setA1_rows(A4_response || []);
      } catch (A5_error) {
        console.error('CompanyA: Failed to fetch incoming payment details:', A5_error);
        setA1_rows([]);
      } finally {
        setA2_loading(false);
      }
    };
    A3_fetchIncomingPaymentDetails();
  }, []);

  const A6_columns: GridColDef[] = [
    { field: 'id', headerName: 'ID (A6-A)', width: 200, renderCell: (params: GridRenderCellParams) => <a href={`/incoming_payments/${params.row.id}`}> {params.value} </a> },
    { field: 'amount', headerName: 'Amount (A6-B)', width: 150 },
    { field: 'currency', headerName: 'Currency (A6-C)', width: 100 },
    { field: 'status', headerName: 'Status (A6-D)', width: 120 },
    { field: 'direction', headerName: 'Direction (A6-E)', width: 120 },
    { field: 'as_of_date', headerName: 'As of Date (A6-F)', width: 150 },
    { field: 'payment_method', headerName: 'Payment Method (A6-G)', width: 150 },
    { field: 'transaction_id', headerName: 'Transaction ID (A6-H)', width: 200 },
    { field: 'sender_name', headerName: 'Sender Name (A6-I)', width: 150 },
    { field: 'receiver_name', headerName: 'Receiver Name (A6-J)', width: 150 },
    { field: 'description', headerName: 'Description (A6-K)', width: 200 },
    { field: 'created_at', headerName: 'Created At (A6-L)', width: 180 },
    { field: 'updated_at', headerName: 'Updated At (A6-M)', width: 180 },
    { field: 'processed_by', headerName: 'Processed By (A6-N)', width: 150 },
    { field: 'reconciled', headerName: 'Reconciled (A6-O)', width: 120 },
    { field: 'notes', headerName: 'Notes (A6-P)', width: 300 },
  ];

  return (
    <div style={{ height: 600, width: '100%', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2 style={{ marginBottom: '15px' }}>CompanyA: Incoming Payment Details - Zenith Financial Corp. - Detailed View</h2>
      <p style={{ marginBottom: '10px' }}>
        This table displays detailed information about incoming payment transactions for Zenith Financial Corp.
        Each row represents a unique payment, with columns providing key details such as amount, currency, status, and more.
        Clicking the ID will take you to the detailed payment view.
      </p>
      <DataGrid
        rows={A1_rows}
        columns={A6_columns}
        getRowId={(row) => row.id}
        loading={A2_loading}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50, 100]}
        checkboxSelection
        disableSelectionOnClick
        style={{ backgroundColor: '#f9f9f9' }}
      />
      <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#777' }}>
        Last Updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

const CompanyB_IncomingPaymentDetailList = () => { // Company B: NovaTech Solutions
    const [B1_rows, setB1_rows] = useState<IncomingPaymentDetail[]>([]);
    const [B2_loading, setB2_loading] = useState<boolean>(true);

    useEffect(() => {
        const B3_fetchIncomingPaymentDetails = async () => {
            try {
                const B4_response = await listIncomingPaymentDetails({});
                setB1_rows(B4_response || []);
            } catch (B5_error) {
                console.error('CompanyB: Failed to fetch incoming payment details:', B5_error);
                setB1_rows([]);
            } finally {
                setB2_loading(false);
            }
        };
        B3_fetchIncomingPaymentDetails();
    }, []);

    const B6_columns: GridColDef[] = [
        { field: 'id', headerName: 'ID (B6-A)', width: 200, renderCell: (params: GridRenderCellParams) => <a href={`/incoming_payments/${params.row.id}`}> {params.value} </a> },
        { field: 'amount', headerName: 'Amount (B6-B)', width: 150 },
        { field: 'currency', headerName: 'Currency (B6-C)', width: 100 },
        { field: 'status', headerName: 'Status (B6-D)', width: 120 },
        { field: 'direction', headerName: 'Direction (B6-E)', width: 120 },
        { field: 'as_of_date', headerName: 'As of Date (B6-F)', width: 150 },
        { field: 'payment_method', headerName: 'Payment Method (B6-G)', width: 150 },
        { field: 'transaction_id', headerName: 'Transaction ID (B6-H)', width: 200 },
        { field: 'sender_name', headerName: 'Sender Name (B6-I)', width: 150 },
        { field: 'receiver_name', headerName: 'Receiver Name (B6-J)', width: 150 },
        { field: 'description', headerName: 'Description (B6-K)', width: 200 },
        { field: 'created_at', headerName: 'Created At (B6-L)', width: 180 },
        { field: 'updated_at', headerName: 'Updated At (B6-M)', width: 180 },
        { field: 'processed_by', headerName: 'Processed By (B6-N)', width: 150 },
        { field: 'reconciled', headerName: 'Reconciled (B6-O)', width: 120 },
        { field: 'notes', headerName: 'Notes (B6-P)', width: 300 },
    ];

    return (
        <div style={{ height: 600, width: '100%', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2 style={{ marginBottom: '15px' }}>CompanyB: Incoming Payment Details - NovaTech Solutions - Detailed View</h2>
            <p style={{ marginBottom: '10px' }}>
                This table displays detailed information about incoming payment transactions for NovaTech Solutions.
                Each row represents a unique payment, with columns providing key details such as amount, currency, status, and more.
                Clicking the ID will take you to the detailed payment view.
            </p>
            <DataGrid
                rows={B1_rows}
                columns={B6_columns}
                getRowId={(row) => row.id}
                loading={B2_loading}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                checkboxSelection
                disableSelectionOnClick
                style={{ backgroundColor: '#f9f9f9' }}
            />
            <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#777' }}>
                Last Updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
};

const CompanyC_IncomingPaymentDetailList = () => { // Company C: Global Dynamics Inc.
    const [C1_rows, setC1_rows] = useState<IncomingPaymentDetail[]>([]);
    const [C2_loading, setC2_loading] = useState<boolean>(true);

    useEffect(() => {
        const C3_fetchIncomingPaymentDetails = async () => {
            try {
                const C4_response = await listIncomingPaymentDetails({});
                setC1_rows(C4_response || []);
            } catch (C5_error) {
                console.error('CompanyC: Failed to fetch incoming payment details:', C5_error);
                setC1_rows([]);
            } finally {
                setC2_loading(false);
            }
        };
        C3_fetchIncomingPaymentDetails();
    }, []);

    const C6_columns: GridColDef[] = [
        { field: 'id', headerName: 'ID (C6-A)', width: 200, renderCell: (params: GridRenderCellParams) => <a href={`/incoming_payments/${params.row.id}`}> {params.value} </a> },
        { field: 'amount', headerName: 'Amount (C6-B)', width: 150 },
        { field: 'currency', headerName: 'Currency (C6-C)', width: 100 },
        { field: 'status', headerName: 'Status (C6-D)', width: 120 },
        { field: 'direction', headerName: 'Direction (C6-E)', width: 120 },
        { field: 'as_of_date', headerName: 'As of Date (C6-F)', width: 150 },
        { field: 'payment_method', headerName: 'Payment Method (C6-G)', width: 150 },
        { field: 'transaction_id', headerName: 'Transaction ID (C6-H)', width: 200 },
        { field: 'sender_name', headerName: 'Sender Name (C6-I)', width: 150 },
        { field: 'receiver_name', headerName: 'Receiver Name (C6-J)', width: 150 },
        { field: 'description', headerName: 'Description (C6-K)', width: 200 },
        { field: 'created_at', headerName: 'Created At (C6-L)', width: 180 },
        { field: 'updated_at', headerName: 'Updated At (C6-M)', width: 180 },
        { field: 'processed_by', headerName: 'Processed By (C6-N)', width: 150 },
        { field: 'reconciled', headerName: 'Reconciled (C6-O)', width: 120 },
        { field: 'notes', headerName: 'Notes (C6-P)', width: 300 },
    ];

    return (
        <div style={{ height: 600, width: '100%', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2 style={{ marginBottom: '15px' }}>CompanyC: Incoming Payment Details - Global Dynamics Inc. - Detailed View</h2>
            <p style={{ marginBottom: '10px' }}>
                This table displays detailed information about incoming payment transactions for Global Dynamics Inc.
                Each row represents a unique payment, with columns providing key details such as amount, currency, status, and more.
                Clicking the ID will take you to the detailed payment view.
            </p>
            <DataGrid
                rows={C1_rows}
                columns={C6_columns}
                getRowId={(row) => row.id}
                loading={C2_loading}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                checkboxSelection
                disableSelectionOnClick
                style={{ backgroundColor: '#f9f9f9' }}
            />
            <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#777' }}>
                Last Updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
};

const CompanyD_IncomingPaymentDetailList = () => { // Company D: Stellar Innovations
    const [D1_rows, setD1_rows] = useState<IncomingPaymentDetail[]>([]);
    const [D2_loading, setD2_loading] = useState<boolean>(true);

    useEffect(() => {
        const D3_fetchIncomingPaymentDetails = async () => {
            try {
                const D4_response = await listIncomingPaymentDetails({});
                setD1_rows(D4_response || []);
            } catch (D5_error) {
                console.error('CompanyD: Failed to fetch incoming payment details:', D5_error);
                setD1_rows([]);
            } finally {
                setD2_loading(false);
            }
        };
        D3_fetchIncomingPaymentDetails();
    }, []);

    const D6_columns: GridColDef[] = [
        { field: 'id', headerName: 'ID (D6-A)', width: 200, renderCell: (params: GridRenderCellParams) => <a href={`/incoming_payments/${params.row.id}`}> {params.value} </a> },
        { field: 'amount', headerName: 'Amount (D6-B)', width: 150 },
        { field: 'currency', headerName: 'Currency (D6-C)', width: 100 },
        { field: 'status', headerName: 'Status (D6-D)', width: 120 },
        { field: 'direction', headerName: 'Direction (D6-E)', width: 120 },
        { field: 'as_of_date', headerName: 'As of Date (D6-F)', width: 150 },
        { field: 'payment_method', headerName: 'Payment Method (D6-G)', width: 150 },
        { field: 'transaction_id', headerName: 'Transaction ID (D6-H)', width: 200 },
        { field: 'sender_name', headerName: 'Sender Name (D6-I)', width: 150 },
        { field: 'receiver_name', headerName: 'Receiver Name (D6-J)', width: 150 },
        { field: 'description', headerName: 'Description (D6-K)', width: 200 },
        { field: 'created_at', headerName: 'Created At (D6-L)', width: 180 },
        { field: 'updated_at', headerName: 'Updated At (D6-M)', width: 180 },
        { field: 'processed_by', headerName: 'Processed By (D6-N)', width: 150 },
        { field: 'reconciled', headerName: 'Reconciled (D6-O)', width: 120 },
        { field: 'notes', headerName: 'Notes (D6-P)', width: 300 },
    ];

    return (
        <div style={{ height: 600, width: '100%', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2 style={{ marginBottom: '15px' }}>CompanyD: Incoming Payment Details - Stellar Innovations - Detailed View</h2>
            <p style={{ marginBottom: '10px' }}>
                This table displays detailed information about incoming payment transactions for Stellar Innovations.
                Each row represents a unique payment, with columns providing key details such as amount, currency, status, and more.
                Clicking the ID will take you to the detailed payment view.
            </p>
            <DataGrid
                rows={D1_rows}
                columns={D6_columns}
                getRowId={(row) => row.id}
                loading={D2_loading}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                checkboxSelection
                disableSelectionOnClick
                style={{ backgroundColor: '#f9f9f9' }}
            />
            <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#777' }}>
                Last Updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
};

const CompanyE_IncomingPaymentDetailList = () => { // Company E: Quantum Leap Corp.
    const [E1_rows, setE1_rows] = useState<IncomingPaymentDetail[]>([]);
    const [E2_loading, setE2_loading] = useState<boolean>(true);

    useEffect(() => {
        const E3_fetchIncomingPaymentDetails = async () => {
            try {
                const E4_response = await listIncomingPaymentDetails({});
                setE1_rows(E4_response || []);
            } catch (E5_error) {
                console.error('CompanyE: Failed to fetch incoming payment details:', E5_error);
                setE1_rows([]);
            } finally {
                setE2_loading(false);
            }
        };
        E3_fetchIncomingPaymentDetails();
    }, []);

    const E6_columns: GridColDef[] = [
        { field: 'id', headerName: 'ID (E6-A)', width: 200, renderCell: (params: GridRenderCellParams) => <a href={`/incoming_payments/${params.row.id}`}> {params.value} </a> },
        { field: 'amount', headerName: 'Amount (E6-B)', width: 150 },
        { field: 'currency', headerName: 'Currency (E6-C)', width: 100 },
        { field: 'status', headerName: 'Status (E6-D)', width: 120 },
        { field: 'direction', headerName: 'Direction (E6-E)', width: 120 },
        { field: 'as_of_date', headerName: 'As of Date (E6-F)', width: 150 },
        { field: 'payment_method', headerName: 'Payment Method (E6-G)', width: 150 },
        { field: 'transaction_id', headerName: 'Transaction ID (E6-H)', width: 200 },
        { field: 'sender_name', headerName: 'Sender Name (E6-I)', width: 150 },
        { field: 'receiver_name', headerName: 'Receiver Name (E6-J)', width: 150 },
        { field: 'description', headerName: 'Description (E6-K)', width: 200 },
        { field: 'created_at', headerName: 'Created At (E6-L)', width: 180 },
        { field: 'updated_at', headerName: 'Updated At (E6-M)', width: 180 },
        { field: 'processed_by', headerName: 'Processed By (E6-N)', width: 150 },
        { field: 'reconciled', headerName: 'Reconciled (E6-O)', width: 120 },
        { field: 'notes', headerName: 'Notes (E6-P)', width: 300 },
    ];

    return (
        <div style={{ height: 600, width: '100%', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2 style={{ marginBottom: '15px' }}>CompanyE: Incoming Payment Details - Quantum Leap Corp. - Detailed View</h2>
            <p style={{ marginBottom: '10px' }}>
                This table displays detailed information about incoming payment transactions for Quantum Leap Corp.
                Each row represents a unique payment, with columns providing key details such as amount, currency, status, and more.
                Clicking the ID will take you to the detailed payment view.
            </p>
            <DataGrid
                rows={E1_rows}
                columns={E6_columns}
                getRowId={(row) => row.id}
                loading={E2_loading}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                checkboxSelection
                disableSelectionOnClick
                style={{ backgroundColor: '#f9f9f9' }}
            />
            <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#777' }}>
                Last Updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
};

const CompanyF_IncomingPaymentDetailList = () => { // Company F: Apex Systems
    const [F1_rows, setF1_rows] = useState<IncomingPaymentDetail[]>([]);
    const [F2_loading, setF2_loading] = useState<boolean>(true);

    useEffect(() => {
        const F3_fetchIncomingPaymentDetails = async () => {
            try {
                const F4_response = await listIncomingPaymentDetails({});
                setF1_rows(F4_response || []);
            } catch (F5_error) {
                console.error('CompanyF: Failed to fetch incoming payment details:', F5_error);
                setF1_rows([]);
            } finally {
                setF2_loading(false);
            }
        };
        F3_fetchIncomingPaymentDetails();
    }, []);

    const F6_columns: GridColDef[] = [
        { field: 'id', headerName: 'ID (F6-A)', width: 200, renderCell: (params: GridRenderCellParams) => <a href={`/incoming_payments/${params.row.id}`}> {params.value} </a> },
        { field: 'amount', headerName: 'Amount (F6-B)', width: 150 },
        { field: 'currency', headerName: 'Currency (F6-C)', width: 100 },
        { field: 'status', headerName: 'Status (F6-D)', width: 120 },
        { field: 'direction', headerName: 'Direction (F6-E)', width: 120 },
        { field: 'as_of_date', headerName: 'As of Date (F6-F)', width: 150 },
        { field: 'payment_method', headerName: 'Payment Method (F6-G)', width: 150 },
        { field: 'transaction_id', headerName: 'Transaction ID (F6-H)', width: 200 },
        { field: 'sender_name', headerName: 'Sender Name (F6-I)', width: 150 },
        { field: 'receiver_name', headerName: 'Receiver Name (F6-J)', width: 150 },
        { field: 'description', headerName: 'Description (F6-K)', width: 200 },
        { field: 'created_at', headerName: 'Created At (F6-L)', width: 180 },
        { field: 'updated_at', headerName: 'Updated At (F6-M)', width: 180 },
        { field: 'processed_by', headerName: 'Processed By (F6-N)', width: 150 },
        { field: 'reconciled', headerName: 'Reconciled (F6-O)', width: 120 },
        { field: 'notes', headerName: 'Notes (F6-P)', width: 300 },
    ];

    return (
        <div style={{ height: 600, width: '100%', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2 style={{ marginBottom: '15px' }}>CompanyF: Incoming Payment Details - Apex Systems - Detailed View</h2>
            <p style={{ marginBottom: '10px' }}>
                This table displays detailed information about incoming payment transactions for Apex Systems.
                Each row represents a unique payment, with columns providing key details such as amount, currency, status, and more.
                Clicking the ID will take you to the detailed payment view.
            </p>
            <DataGrid
                rows={F1_rows}
                columns={F6_columns}
                getRowId={(row) => row.id}
                loading={F2_loading}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                checkboxSelection
                disableSelectionOnClick
                style={{ backgroundColor: '#f9f9f9' }}
            />
            <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#777' }}>
                Last Updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
};

const CompanyG_IncomingPaymentDetailList = () => { // Company G: Innovate Solutions
    const [G1_rows, setG1_rows] = useState<IncomingPaymentDetail[]>([]);
    const [G2_loading, setG2_loading] = useState<boolean>(true);

    useEffect(() => {
        const G3_fetchIncomingPaymentDetails = async () => {
            try {
                const G4_response = await listIncomingPaymentDetails({});
                setG1_rows(G4_response || []);
            } catch (G5_error) {
                console.error('CompanyG: Failed to fetch incoming payment details:', G5_error);
                setG1_rows([]);
            } finally {
                setG2_loading(false);
            }
        };
        G3_fetchIncomingPaymentDetails();
    }, []);

    const G6_columns: GridColDef[] = [
        { field: 'id', headerName: 'ID (G6-A)', width: 200, renderCell: (params: GridRenderCellParams) => <a href={`/incoming_payments/${params.row.id}`}> {params.value} </a> },
        { field: 'amount', headerName: 'Amount (G6-B)', width: 150 },
        { field: 'currency', headerName: 'Currency (G6-C)', width: 100 },
        { field: 'status', headerName: 'Status (G6-D)', width: 120 },
        { field: 'direction', headerName: 'Direction (G6-E)', width: 120 },
        { field: 'as_of_date', headerName: 'As of Date (G6-F)', width: 150 },
        { field: 'payment_method', headerName: 'Payment Method (G6-G)', width: 150 },
        { field: 'transaction_id', headerName: 'Transaction ID (G6-H)', width: 200 },
        { field: 'sender_name', headerName: 'Sender Name (G6-I)', width: 150 },
        { field: 'receiver_name', headerName: 'Receiver Name (G6-J)', width: 150 },
        { field: 'description', headerName: 'Description (G6-K)', width: 200 },
        { field: 'created_at', headerName: 'Created At (G6-L)', width: 180 },
        { field: 'updated_at', headerName: 'Updated At (G6-M)', width: 180 },
        { field: 'processed_by', headerName: 'Processed By (G6-N)', width: 150 },
        { field: 'reconciled', headerName: 'Reconciled (G6-O)', width: 120 },
        { field: 'notes', headerName: 'Notes (G6-P)', width: 300 },
    ];

    return (
        <div style={{ height: 600, width: '100%', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2 style={{ marginBottom: '15px' }}>CompanyG: Incoming Payment Details - Innovate Solutions - Detailed View</h2>
            <p style={{ marginBottom: '10px' }}>
                This table displays detailed information about incoming payment transactions for Innovate Solutions.
                Each row represents a unique payment, with columns providing key details such as amount, currency, status, and more.
                Clicking the ID will take you to the detailed payment view.
            </p>
            <DataGrid
                rows={G1_rows}
                columns={G6_columns}
                getRowId={(row) => row.id}
                loading={G2_loading}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                checkboxSelection
                disableSelectionOnClick
                style={{ backgroundColor: '#f9f9f9' }}
            />
            <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#777' }}>
                Last Updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
};

const CompanyH_IncomingPaymentDetailList = () => { // Company H: Nexus Technologies
    const [H1_rows, setH1_rows] = useState<IncomingPaymentDetail[]>([]);
    const [H2_loading, setH2_loading] = useState<boolean>(true);

    useEffect(() => {
        const H3_fetchIncomingPaymentDetails = async () => {
            try {
                const H4_response = await listIncomingPaymentDetails({});
                setH1_rows(H4_response || []);
            } catch (H5_error) {
                console.error('CompanyH: Failed to fetch incoming payment details:', H5_error);
                setH1_rows([]);
            } finally {
                setH2_loading(false);
            }
        };
        H3_fetchIncomingPaymentDetails();
    }, []);

    const H6_columns: GridColDef[] = [
        { field: 'id', headerName: 'ID (H6-A)', width: 200, renderCell: (params: GridRenderCellParams) => <a href={`/incoming_payments/${params.row.id}`}> {params.value} </a> },
        { field: 'amount', headerName: 'Amount (H6-B)', width: 150 },
        { field: 'currency', headerName: 'Currency (H6-C)', width: 100 },
        { field: 'status', headerName: 'Status (H6-D)', width: 120 },
        { field: 'direction', headerName: 'Direction (H6-E)', width: 120 },
        { field: 'as_of_date', headerName: 'As of Date (H6-F)', width: 150 },
        { field: 'payment_method', headerName: 'Payment Method (H6-G)', width: 150 },
        { field: 'transaction_id', headerName: 'Transaction ID (H6-H)', width: 200 },
        { field: 'sender_name', headerName: 'Sender Name (H6-I)', width: 150 },
        { field: 'receiver_name', headerName: 'Receiver Name (H6-J)', width: 150 },
        { field: 'description', headerName: 'Description (H6-K)', width: 200 },
        { field: 'created_at', headerName: 'Created At (H6-L)', width: 180 },
        { field: 'updated_at', headerName: 'Updated At (H6-M)', width: 180 },
        { field: 'processed_by', headerName: 'Processed By (H6-N)', width: 150 },
        { field: 'reconciled', headerName: 'Reconciled (H6-O)', width: 120 },
        { field: 'notes', headerName: 'Notes (H6-P)', width: 300 },
    ];

    return (
        <div style={{ height: 600, width: '100%', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2 style={{ marginBottom: '15px' }}>CompanyH: Incoming Payment Details - Nexus Technologies - Detailed View</h2>
            <p style={{ marginBottom: '10px' }}>
                This table displays detailed information about incoming payment transactions for Nexus Technologies.
                Each row represents a unique payment, with columns providing key details such as amount, currency, status, and more.
                Clicking the ID will take you to the detailed payment view.
            </p>
            <DataGrid
                rows={H1_rows}
                columns={H6_columns}
                getRowId={(row) => row.id}
                loading={H2_loading}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                checkboxSelection
                disableSelectionOnClick
                style={{ backgroundColor: '#f9f9f9' }}
            />
            <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#777' }}>
                Last Updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
};

const CompanyI_IncomingPaymentDetailList = () => { // Company I: Vector Dynamics
    const [I1_rows, setI1_rows] = useState<IncomingPaymentDetail[]>([]);
    const [I2_loading, setI2_loading] = useState<boolean>(true);

    useEffect(() => {
        const I3_fetchIncomingPaymentDetails = async () => {
            try {
                const I4_response = await listIncomingPaymentDetails({});
                setI1_rows(I4_response || []);
            } catch (I5_error) {
                console.error('CompanyI: Failed to fetch incoming payment details:', I5_error);
                setI1_rows([]);
            } finally {
                setI2_loading(false);
            }
        };
        I3_fetchIncomingPaymentDetails();
    }, []);

    const I6_columns: GridColDef[] = [
        { field: 'id', headerName: 'ID (I6-A)', width: 200, renderCell: (params: GridRenderCellParams) => <a href={`/incoming_payments/${params.row.id}`}> {params.value} </a> },
        { field: 'amount', headerName: 'Amount (I6-B)', width: 150 },
        { field: 'currency', headerName: 'Currency (I6-C)', width: 100 },
        { field: 'status', headerName: 'Status (I6-D)', width: 120 },
        { field: 'direction', headerName: 'Direction (I6-E)', width: 120 },
        { field: 'as_of_date', headerName: 'As of Date (I6-F)', width: 150 },
        { field: 'payment_method', headerName: 'Payment Method (I6-G)', width: 150 },
        { field: 'transaction_id', headerName: 'Transaction ID (I6-H)', width: 200 },
        { field: 'sender_name', headerName: 'Sender Name (I6-I)', width: 150 },
        { field: 'receiver_name', headerName: 'Receiver Name (I6-J)', width: 150 },
        { field: 'description', headerName: 'Description (I6-K)', width: 200 },
        { field: 'created_at', headerName: 'Created At (I6-L)', width: 180 },
        { field: 'updated_at', headerName: 'Updated At (I6-M)', width: 180 },
        { field: 'processed_by', headerName: 'Processed By (I6-N)', width: 150 },
        { field: 'reconciled', headerName: 'Reconciled (I6-O)', width: 120 },
        { field: 'notes', headerName: 'Notes (I6-P)', width: 300 },
    ];

    return (
        <div style={{ height: 600, width: '100%', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2 style={{ marginBottom: '15px' }}>CompanyI: Incoming Payment Details - Vector Dynamics - Detailed View</h2>
            <p style={{ marginBottom: '10px' }}>
                This table displays detailed information about incoming payment transactions for Vector Dynamics.
                Each row represents a unique payment, with columns providing key details such as amount, currency, status, and more.
                Clicking the ID will take you to the detailed payment view.
            </p>
            <DataGrid
                rows={I1_rows}
                columns={I6_columns}
                getRowId={(row) => row.id}
                loading={I2_loading}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                checkboxSelection
                disableSelectionOnClick
                style={{ backgroundColor: '#f9f9f9' }}
            />
            <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#777' }}>
                Last Updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
};

const CompanyJ_IncomingPaymentDetailList = () => { // Company J: Horizon Enterprises
    const [J1_rows, setJ1_rows] = useState<IncomingPaymentDetail[]>([]);
    const [J2_loading, setJ2_loading] = useState<boolean>(true);

    useEffect(() => {
        const J3_fetchIncomingPaymentDetails = async () => {
            try {
                const J4_response = await listIncomingPaymentDetails({});
                setJ1_rows(J4_response || []);
            } catch (J5_error) {
                console.error('CompanyJ: Failed to fetch incoming payment details:', J5_error);
                setJ1_rows([]);
            } finally {
                setJ2_loading(false);
            }
        };
        J3_fetchIncomingPaymentDetails();
    }, []);

    const J6_columns: GridColDef[] = [
        { field: 'id', headerName: 'ID (J6-A)', width: 200, renderCell: (params: GridRenderCellParams) => <a href={`/incoming_payments/${params.row.id}`}> {params.value} </a> },
        { field: 'amount', headerName: 'Amount (J6-B)', width: 150 },
        { field: 'currency', headerName: 'Currency (J6-C)', width: 100 },
        { field: 'status', headerName: 'Status (J6-D)', width: 120 },
        { field: 'direction', headerName: 'Direction (J6-E)', width: 120 },
        { field: 'as_of_date', headerName: 'As of Date (J6-F)', width: 150 },
        { field: 'payment_method', headerName: 'Payment Method (J6-G)', width: 150 },
        { field: 'transaction_id', headerName: 'Transaction ID (J6-H)', width: 200 },
        { field: 'sender_name', headerName: 'Sender Name (J6-I)', width: 150 },
        { field: 'receiver_name', headerName: 'Receiver Name (J6-J)', width: 150 },
        { field: 'description', headerName: 'Description (J6-K)', width: 200 },
        { field: 'created_at', headerName: 'Created At (J6-L)', width: 180 },
        { field: 'updated_at', headerName: 'Updated At (J6-M)', width: 180 },
        { field: 'processed_by', headerName: 'Processed By (J6-N)', width: 150 },
        { field: 'reconciled', headerName: 'Reconciled (J6-O)', width: 120 },
        { field: 'notes', headerName: 'Notes (J6-P)', width: 300 },
    ];

    return (
        <div style={{ height: 600, width: '100%', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2 style={{ marginBottom: '15px' }}>CompanyJ: Incoming Payment Details - Horizon Enterprises - Detailed View</h2>
            <p style={{ marginBottom: '10px' }}>
                This table displays detailed information about incoming payment transactions for Horizon Enterprises.
                Each row represents a unique payment, with columns providing key details such as amount, currency, status, and more.
                Clicking the ID will take you to the detailed payment view.
            </p>
            <DataGrid
                rows={J1_rows}
                columns={J6_columns}
                getRowId={(row) => row.id}
                loading={J2_loading}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                checkboxSelection
                disableSelectionOnClick
                style={{ backgroundColor: '#f9f9f9' }}
            />
            <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#777' }}>
                Last Updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
};

const CompanyK_IncomingPaymentDetailList = () => { // Company K: Atlas Financial Group
    const [K1_rows, setK1_rows] = useState<IncomingPaymentDetail[]>([]);
    const [K2_loading, setK2_loading] = useState<boolean>(true);

    useEffect(() => {
        const K3_fetchIncomingPaymentDetails = async () => {
            try {
                const K4_response = await listIncomingPaymentDetails({});
                setK1_rows(K4_response || []);
            } catch (K5_error) {
                console.error('CompanyK: Failed to fetch incoming payment details:', K5_error);
                setK1_rows([]);
            } finally {
                setK2_loading(false);
            }
        };
        K3_fetchIncomingPaymentDetails();
    }, []);

    const K6_columns: GridColDef[] = [
        { field: 'id', headerName: 'ID (K6-A)', width: 200, renderCell: (params: GridRenderCellParams) => <a href={`/incoming_payments/${params.row.id}`}> {params.value} </a> },
        { field: 'amount', headerName: 'Amount (K6-B)', width: 150 },
        { field: 'currency', headerName: 'Currency (K6-C)', width: 100 },
        { field: 'status', headerName: 'Status (K6-D)', width: 120 },
        { field: 'direction', headerName: 'Direction (K6-E)', width: 120 },
        { field: 'as_of_date', headerName: 'As of Date (K6-F)', width: 150 },
        { field: 'payment_method', headerName: 'Payment Method (K6-G)', width: 150 },
        { field: 'transaction_id', headerName: 'Transaction ID (K6-H)', width: 200 },
        { field: 'sender_name', headerName: 'Sender Name (K6-I)', width: 150 },
        { field: 'receiver_name', headerName: 'Receiver Name (K6-J)', width: 150 },
        { field: 'description', headerName: 'Description (K6-K)', width: 200 },
        { field: 'created_at', headerName: 'Created At (K6-L)', width: 180 },
        { field: 'updated_at', headerName: 'Updated At (K6-M)', width: 180 },
        { field: 'processed_by', headerName: 'Processed By (K6-N)', width: 150 },
        { field: 'reconciled', headerName: 'Reconciled (K6-O)', width: 120 },
        { field: 'notes', headerName: 'Notes (K6-P)', width: 300 },
    ];

    return (
        <div style={{ height: 600, width: '100%', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2 style={{ marginBottom: '15px' }}>CompanyK: Incoming Payment Details - Atlas Financial Group - Detailed View</h2>
            <p style={{ marginBottom: '10px' }}>
                This table displays detailed information about incoming payment transactions for Atlas Financial Group.
                Each row represents a unique payment, with columns providing key details such as amount, currency, status, and more.
                Clicking the ID will take you to the detailed payment view.
            </p>
            <DataGrid
                rows={K1_rows}
                columns={K6_columns}
                getRowId={(row) => row.id}
                loading={K2_loading}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                checkboxSelection
                disableSelectionOnClick
                style={{ backgroundColor: '#f9f9f9' }}
            />
            <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#777' }}>
                Last Updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
};

const CompanyL_IncomingPaymentDetailList = () => { // Company L: Meridian Dynamics
    const [L1_rows, setL1_rows] = useState<IncomingPaymentDetail[]>([]);
    const [L2_loading, setL2_loading] = useState<boolean>(true);

    useEffect(() => {
        const L3_fetchIncomingPaymentDetails = async () => {
            try {
                const L4_response = await listIncomingPaymentDetails({});
                setL1_rows(L4_response || []);
            } catch (L5_error) {
                console.error('CompanyL: Failed to fetch incoming payment details:', L5_error);
                setL1_rows([]);
            } finally {
                setL2_loading(false);
            }
        };
        L3_fetchIncomingPaymentDetails();
    }, []);

    const L6_columns: GridColDef[] = [
        { field: 'id', headerName: 'ID (L6-A)', width: 200, renderCell: (params: GridRenderCellParams) => <a href={`/incoming_payments/${params.row.id}`}> {params.value} </a> },
        { field: 'amount', headerName: 'Amount (L6-B)', width: 150 },
        { field: 'currency', headerName: 'Currency (L6-C)', width: 100 },
        { field: 'status', headerName: 'Status (L6-D)', width: 120 },
        { field: 'direction', headerName: 'Direction (L6-E)', width: 120 },
        { field: 'as_of_date', headerName: 'As of Date (L6-F)', width: 150 },
        { field: 'payment_method', headerName: 'Payment Method (L6-G)', width: 150 },
        { field: 'transaction_id', headerName: 'Transaction ID (L6-H)', width: 200 },
        { field: 'sender_name', headerName: 'Sender Name (L6-I)', width: 150 },
        { field: 'receiver_name', headerName: 'Receiver Name (L6-J)', width: 150 },
        { field: 'description', headerName: 'Description (L6-K)', width: 200 },
        { field: 'created_at', headerName: 'Created At (L6-L)', width: 180 },
        { field: 'updated_at', headerName: 'Updated At (L6-M)', width: 180 },
        { field: 'processed_by', headerName: 'Processed By (L6-N)', width: 150 },
        { field: 'reconciled', headerName: 'Reconciled (L6-O)', width: 120 },
        { field: 'notes', headerName: 'Notes (L6-P)', width: 300 },
    ];

    return (
        <div style={{ height: 600, width: '100%', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2 style={{ marginBottom: '15px' }}>CompanyL: Incoming Payment Details - Meridian Dynamics - Detailed View</h2>
            <p style={{ marginBottom: '10px' }}>
                This table displays detailed information about incoming payment transactions for Meridian Dynamics.
                Each row represents a unique payment, with columns providing key details such as amount, currency, status, and more.
                Clicking the ID will take you to the detailed payment view.
            </p>
            <DataGrid
                rows={L1_rows}
                columns={L6_columns}
                getRowId={(row) => row.id}
                loading={L2_loading}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                checkboxSelection
                disableSelectionOnClick
                style={{ backgroundColor: '#f9f9f9' }}
            />
            <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#777' }}>
                Last Updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
};

const CompanyM_IncomingPaymentDetailList = () => { // Company M: Phoenix Innovations
    const [M1_rows, setM1_rows] = useState<IncomingPaymentDetail[]>([]);
    const [M2_loading, setM2_loading] = useState<boolean>(true);

    useEffect(() => {
        const M3_fetchIncomingPaymentDetails = async () => {
            try {
                const M4_response = await listIncomingPaymentDetails({});
                setM1_rows(M4_response || []);
            } catch (M5_error) {
                console.error('CompanyM: Failed to fetch incoming payment details:', M5_error);
                setM1_rows([]);
            } finally {
                setM2_loading(false);
            }
        };
        M3_fetchIncomingPaymentDetails();
    }, []);

    const M6_columns: GridColDef[] = [
        { field: 'id', headerName: 'ID (M6-A)', width: 200, renderCell: (params: GridRenderCellParams) => <a href={`/incoming_payments/${params.row.id}`}> {params.value} </a> },
        { field: 'amount', headerName: 'Amount (M6-B)', width: 150 },
        { field: 'currency', headerName: 'Currency (M6-C)', width: 100 },
        { field: 'status', headerName: 'Status (M6-D)', width: 120 },
        { field: 'direction', headerName: 'Direction (M6-E)', width: 120 },
        { field: 'as_of_date', headerName: 'As of Date (M6-F)', width: 150 },
        { field: 'payment_method', headerName: 'Payment Method (M6-G)', width: 150 },
        { field: 'transaction_id', headerName: 'Transaction ID (M6-H)', width: 200 },
        { field: 'sender_name', headerName: 'Sender Name (M6-I)', width: 150 },
        { field: 'receiver_name', headerName: 'Receiver Name (M6-J)', width: 150 },
        { field: 'description', headerName: 'Description (M6-K)', width: 200 },
        { field: 'created_at', headerName: 'Created At (M6-L)', width: 180 },
        { field: 'updated_at', headerName: 'Updated At (M6-M)', width: 180 },
        { field: 'processed_by', headerName: 'Processed By (M6-N)', width: 150 },
        { field: 'reconciled', headerName: 'Reconciled (M6-O)', width: 120 },
        { field: 'notes', headerName: 'Notes (M6-P)', width: 300 },
    ];

    return (
        <div style={{ height: 600, width: '100%', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2 style={{ marginBottom: '15px' }}>CompanyM: Incoming Payment Details - Phoenix Innovations - Detailed View</h2>
            <p style={{ marginBottom: '10px' }}>
                This table displays detailed information about incoming payment transactions for Phoenix Innovations.
                Each row represents a unique payment, with columns providing key details such as amount, currency, status, and more.
                Clicking the ID will take you to the detailed payment view.
            </p>
            <DataGrid
                rows={M1_rows}
                columns={M6_columns}
                getRowId={(row) => row.id}
                loading={M2_loading}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                checkboxSelection
                disableSelectionOnClick
                style={{ backgroundColor: '#f9f9f9' }}
            />
            <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#777' }}>
                Last Updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
};

const CompanyN_IncomingPaymentDetailList = () => { // Company N: Summit Strategies
    const [N1_rows, setN1_rows] = useState<IncomingPaymentDetail[]>([]);
    const [N2_loading, setN2_loading] = useState<boolean>(true);

    useEffect(() => {
        const N3_fetchIncomingPaymentDetails = async () => {
            try {
                const N4_response = await listIncomingPaymentDetails({});
                setN1_rows(N4_response || []);
            } catch (N5_error) {
                console.error('CompanyN: Failed to fetch incoming payment details:', N5_error);
                setN1_rows([]);
            } finally {
                setN2_loading(false);
            }
        };
        N3_fetchIncomingPaymentDetails();
    }, []);

    const N6_columns: GridColDef[] = [
        { field: 'id', headerName: 'ID (N6-A)', width: 200, renderCell: (params: GridRenderCellParams) => <a href={`/incoming_payments/${params.row.id}`}> {params.value} </a> },
        { field: 'amount', headerName: 'Amount (N6-B)', width: 150 },
        { field: 'currency', headerName: 'Currency (N6-C)', width: 100 },
        { field: 'status', headerName: 'Status (N6-D)', width: 120 },
        { field: 'direction', headerName: 'Direction (N6-E)', width: 120 },
        { field: 'as_of_date', headerName: 'As of Date (N6-F)', width: 150 },
        { field: 'payment_method', headerName: 'Payment Method (N6-G)', width: 150 },
        { field: 'transaction_id', headerName: 'Transaction ID (N6-H)', width: 200 },
        { field: 'sender_name', headerName: 'Sender Name (N6-I)', width: 150 },
        { field: 'receiver_name', headerName: 'Receiver Name (N6-J)', width: 150 },
        { field: 'description', headerName: 'Description (N6-K)', width: 200 },
        { field: 'created_at', headerName: 'Created At (N6-L)', width: 180 },
        { field: 'updated_at', headerName: 'Updated At (N6-M)', width: 180 },
        { field: 'processed_by', headerName: 'Processed By (N6-N)', width: 150 },
        { field: 'reconciled', headerName: 'Reconciled (N6-O)', width: 120 },
        { field: 'notes', headerName: 'Notes (N6-P)', width: 300 },
    ];

    return (
        <div style={{ height: 600, width: '100%', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2 style={{ marginBottom: '15px' }}>CompanyN: Incoming Payment Details - Summit Strategies - Detailed View</h2>
            <p style={{ marginBottom: '10px' }}>
                This table displays detailed information about incoming payment transactions for Summit Strategies.
                Each row represents a unique payment, with columns providing key details such as amount, currency, status, and more.
                Clicking the ID will take you to the detailed payment view.
            </p>
            <DataGrid
                rows={N1_rows}
                columns={N6_columns}
                getRowId={(row) => row.id}
                loading={N2_loading}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                checkboxSelection
                disableSelectionOnClick
                style={{ backgroundColor: '#f9f9f9' }}
            />
            <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#777' }}>
                Last Updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
};

const CompanyO_IncomingPaymentDetailList = () => { // Company O: Vanguard Financial
    const [O1_rows, setO1_rows] = useState<IncomingPaymentDetail[]>([]);
    const [O2_loading, setO2_loading] = useState<boolean>(true);

    useEffect(() => {
        const O3_fetchIncomingPaymentDetails = async () => {
            try {
                const O4_response = await listIncomingPaymentDetails({});
                setO1_rows(O4_response || []);
            } catch (O5_error) {
                console.error('CompanyO: Failed to fetch incoming payment details:', O5_error);
                setO1_rows([]);
            } finally {
                setO2_loading(false);
            }
        };
        O3_fetchIncomingPaymentDetails();
    }, []);

    const O6_columns: GridColDef[] = [
        { field: 'id', headerName: 'ID (O6-A)', width: 200, renderCell: (params: GridRenderCellParams) => <a href={`/incoming_payments/${params.row.id}`}> {params.value} </a> },
        { field: 'amount', headerName: 'Amount (O6-B)', width: 150 },
        { field: 'currency', headerName: 'Currency (O6-C)', width: 100 },
        { field: 'status', headerName: 'Status (O6-D)', width: 120 },
        { field: 'direction', headerName: 'Direction (O6-E)', width: 120 },
        { field: 'as_of_date', headerName: 'As of Date (O6-F)', width: 150 },
        { field: 'payment_method', headerName: 'Payment Method (O6-G)', width: 150 },
        { field: 'transaction_id', headerName: 'Transaction ID (O6-H)', width: 200 },
        { field: 'sender_name', headerName: 'Sender Name (O6-I)', width: 150 },
        { field: 'receiver_name', headerName: 'Receiver Name (O6-J)', width: 150 },
        { field: 'description', headerName: 'Description (O6-K)', width: 200 },
        { field: 'created_at', headerName: 'Created At (O6-L)', width: 180 },
        { field: 'updated_at', headerName: 'Updated At (O6-M)', width: 180 },
        { field: 'processed_by', headerName: 'Processed By (O6-N)', width: 150 },
        { field: 'reconciled', headerName: 'Reconciled (O6-O)', width: 120 },
        { field: 'notes', headerName: 'Notes (O6-P)', width: 300 },
    ];

    return (
        <div style={{ height: 600, width: '100%', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2 style={{ marginBottom: '15px' }}>CompanyO: Incoming Payment Details - Vanguard Financial - Detailed View</h2>
            <p style={{ marginBottom: '10px' }}>
                This table displays detailed information about incoming payment transactions for Vanguard Financial.
                Each row represents a unique payment, with columns providing key details such as amount, currency, status, and more.
                Clicking the ID will take you to the detailed payment view.
            </p>
            <DataGrid
                rows={O1_rows}
                columns={O6_columns}
                getRowId={(row) => row.id}
                loading={O2_loading}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                checkboxSelection
                disableSelectionOnClick
                style={{ backgroundColor: '#f9f9f9' }}
            />
            <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#777' }}>
                Last Updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
};

const CompanyP_IncomingPaymentDetailList = () => { // Company P: Oracle Financial Services
    const [P1_rows, setP1_rows] = useState<IncomingPaymentDetail[]>([]);
    const [P2_loading, setP2_loading] = useState<boolean>(true);

    useEffect(() => {
        const P3_fetchIncomingPaymentDetails = async () => {
            try {
                const P4_response = await listIncomingPaymentDetails({});
                setP1_rows(P4_response || []);
            } catch (P5_error) {
                console.error('CompanyP: Failed to fetch incoming payment details:', P5_error);
                setP1_rows([]);
            } finally {
                setP2_loading(false);
            }
        };
        P3_fetchIncomingPaymentDetails();
    }, []);

    const P6_columns: GridColDef[] = [
        { field: 'id', headerName: 'ID (P6-A)', width: 200, renderCell: (params: GridRenderCellParams) => <a href={`/incoming_payments/${params.row.id}`}> {params.value} </a> },
        { field: 'amount', headerName: 'Amount (P6-B)', width: 150 },
        { field: 'currency', headerName: 'Currency (P6-C)', width: 100 },
        { field: 'status', headerName: 'Status (P6-D)', width: 120 },
        { field: 'direction', headerName: 'Direction (P6-E)', width: 120 },
        { field: 'as_of_date', headerName: 'As of Date (P6-F)', width: 150 },
        { field: 'payment_method', headerName: 'Payment Method (P6-G)', width: 150 },
        { field: 'transaction_id', headerName: 'Transaction ID (P6-H)', width: 200 },
        { field: 'sender_name', headerName: 'Sender Name (P6-I)', width: 150 },
        { field: 'receiver_name', headerName: 'Receiver Name (P6-J)', width: 150 },
        { field: 'description', headerName: 'Description (P6-K)', width: 200 },
        { field: 'created_at', headerName: 'Created At (P6-L)', width: 180 },
        { field: 'updated_at', headerName: 'Updated At (P6-M)', width: 180 },
        { field: 'processed_by', headerName: 'Processed By (P6-N)', width: 150 },
        { field: 'reconciled', headerName: 'Reconciled (P6-O)', width: 120 },
        { field: 'notes', headerName: 'Notes (P6-P)', width: 300 },
    ];

    return (
        <div style={{ height: 600, width: '100%', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2 style={{ marginBottom: '15px' }}>CompanyP: Incoming Payment Details - Oracle Financial Services - Detailed View</h2>
            <p style={{ marginBottom: '10px' }}>
                This table displays detailed information about incoming payment transactions for Oracle Financial Services.
                Each row represents a unique payment, with columns providing key details such as amount, currency, status, and more.
                Clicking the ID will take you to the detailed payment view.
            </p>
            <DataGrid
                rows={P1_rows}
                columns={P6_columns}
                getRowId={(row) => row.id}
                loading={P2_loading}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                checkboxSelection
                disableSelectionOnClick
                style={{ backgroundColor: '#f9f9f9' }}
            />
            <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#777' }}>
                Last Updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
};

const CompanyQ_IncomingPaymentDetailList = () => { // Company Q: Quantum Dynamics
    const [Q1_rows, setQ1_rows] = useState<IncomingPaymentDetail[]>([]);
    const [Q2_loading, setQ2_loading] = useState<boolean>(true);

    useEffect(() => {
        const Q3_fetchIncomingPaymentDetails = async () => {
            try {
                const Q4_response = await listIncomingPaymentDetails({});
                setQ1_rows(Q4_response || []);
            } catch (Q5_error) {
                console.error('CompanyQ: Failed to fetch incoming payment details:', Q5_error);
                setQ1_rows([]);
            } finally {
                setQ2_loading(false);
            }
        };
        Q3_fetchIncomingPaymentDetails();
    }, []);

    const Q6_columns: GridColDef[] = [
        { field: 'id', headerName: 'ID (Q6-A)', width: 200, renderCell: (params: GridRenderCellParams) => <a href={`/incoming_payments/${params.row.id}`}> {params.value} </a> },
        { field: 'amount', headerName: 'Amount (Q6-B)', width: 150 },
        { field: 'currency', headerName: 'Currency (Q6-C)', width: 100 },
        { field: 'status', headerName: 'Status (Q6-D)', width: 120 },
        { field: 'direction', headerName: 'Direction (Q6-E)', width: 120 },
        { field: 'as_of_date', headerName: 'As of Date (Q6-F)', width: 150 },
        { field: 'payment_method', headerName: 'Payment Method (Q6-G)', width: 150 },
        { field: 'transaction_id', headerName: 'Transaction ID (Q6-H)', width: 200 },
        { field: 'sender_name', headerName: 'Sender Name (Q6-I)', width: 150 },
        { field: 'receiver_name', headerName: 'Receiver Name (Q6-J)', width: 150 },
        { field: 'description', headerName: 'Description (Q6-K)', width: 200 },
        { field: 'created_at', headerName: 'Created At (Q6-L)', width: 180 },
        { field: 'updated_at', headerName: 'Updated At (Q6-M)', width: 180 },
        { field: 'processed_by', headerName: 'Processed By (Q6-N)', width: 150 },
        { field: 'reconciled', headerName: 'Reconciled (Q6-O)', width: 120 },
        { field: 'notes', headerName: 'Notes (Q6-P)', width: 300 },
    ];

    return (
        <div style={{ height: 600, width: '100%', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2 style={{ marginBottom: '15px' }}>CompanyQ: Incoming Payment Details - Quantum Dynamics - Detailed View</h2>
            <p style={{ marginBottom: '10px' }}>
                This table displays detailed information about incoming payment transactions for Quantum Dynamics.
                Each row represents a unique payment, with columns providing key details such as amount, currency, status, and more.
                Clicking the ID will take you to the detailed payment view.
            </p>
            <DataGrid
                rows={Q1_rows}
                columns={Q6_columns}
                getRowId={(row) => row.id}
                loading={Q2_loading}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                checkboxSelection
                disableSelectionOnClick
                style={{ backgroundColor: '#f9f9f9' }}
            />
            <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#777' }}>
                Last Updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
};

const CompanyR_IncomingPaymentDetailList = () => { // Company R: Apex Innovations
    const [R1_rows, setR1_rows] = useState<IncomingPaymentDetail[]>([]);
    const [R2_loading, setR2_loading] = useState<boolean>(true);

    useEffect(() => {
        const R3_fetchIncomingPaymentDetails = async () => {
            try {
                const R4_response = await listIncomingPaymentDetails({});
                setR1_rows(R4_response || []);
            } catch (R5_error) {
                console.error('CompanyR: Failed to fetch incoming payment details:', R5_error);
                setR1_rows([]);
            } finally {
                setR2_loading(false);
            }
        };
        R3_fetchIncomingPaymentDetails();
    }, []);

    const R6_columns: GridColDef[] = [
        { field: 'id', headerName: 'ID (R6-A)', width: 200, renderCell: (params: GridRenderCellParams) => <a href={`/incoming_payments/${params.row.id}`}> {params.value} </a> },
        { field: 'amount', headerName: 'Amount (R6-B)', width: 150 },
        { field: 'currency', headerName: 'Currency (R6-C)', width: 100 },
        { field: 'status', headerName: 'Status (R6-D)', width: 120 },
        { field: 'direction', headerName: 'Direction (R6-E)', width: 120 },
        { field: 'as_of_date', headerName: 'As of Date (R6-F)', width: 150 },
        { field: 'payment_method', headerName: 'Payment Method (R6-G)', width: 150 },
        { field: 'transaction_id', headerName: 'Transaction ID (R6-H)', width: 200 },
        { field: 'sender_name', headerName: 'Sender Name (R6-I)', width: 150 },
        { field: 'receiver_name', headerName: 'Receiver Name (R6-J)', width: 150 },
        { field: 'description', headerName: 'Description (R6-K)', width: 200 },
        { field: 'created_at', headerName: 'Created At (R6-L)', width: 180 },
        { field: 'updated_at', headerName: 'Updated At (R6-M)', width: 180 },
        { field: 'processed_by', headerName: 'Processed By (R6-N)', width: 150 },
        { field: 'reconciled', headerName: 'Reconciled (R6-O)', width: 120 },
        { field: 'notes', headerName: 'Notes (R6-P)', width: 300 },
    ];

    return (
        <div style={{ height: 600, width: '100%', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2 style={{ marginBottom: '15px' }}>CompanyR: Incoming Payment Details - Apex Innovations - Detailed View</h2>
            <p style={{ marginBottom: '10px' }}>
                This table displays detailed information about incoming payment transactions for Apex Innovations.
                Each row represents a unique payment, with columns providing key details such as amount, currency, status, and more.
                Clicking the ID will take you to the detailed payment view.
            </p>
            <DataGrid
                rows={R1_rows}
                columns={R6_columns}
                getRowId={(row) => row.id}
                loading={R2_loading}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                checkboxSelection
                disableSelectionOnClick
                style={{ backgroundColor: '#f9f9f9' }}
            />
            <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#777' }}>
                Last Updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
};

const CompanyS_IncomingPaymentDetailList = () => { // Company S: Zenith Corp.
    const [S1_rows, setS1_rows] = useState<IncomingPaymentDetail[]>([]);
    const [S2_loading, setS2_loading] = useState<boolean>(true);

    useEffect(() => {
        const S3_fetchIncomingPaymentDetails = async () => {
            try {
                const S4_response = await listIncomingPaymentDetails({});
                setS1_rows(S4_response || []);
            } catch (S5_error) {
                console.error('CompanyS: Failed to fetch incoming payment details:', S5_error);
                setS1_rows([]);
            } finally {
                setS2_loading(false);
            }
        };
        S3_fetchIncomingPaymentDetails();
    }, []);

    const S6_columns: GridColDef[] = [
        { field: 'id', headerName: 'ID (S6-A)', width: 200, renderCell: (params: GridRenderCellParams) => <a href={`/incoming_payments/${params.row.id}`}> {params.value} </a> },
        { field: 'amount', headerName: 'Amount (S6-B)', width: 150 },
        { field: 'currency', headerName: 'Currency (S6-C)', width: 100 },
        { field: 'status', headerName: 'Status (S6-D)', width: 120 },
        { field: 'direction', headerName: 'Direction (S6-E)', width: 120 },
        { field: 'as_of_date', headerName: 'As of Date (S6-F)', width: 150 },
        { field: 'payment_method', headerName: 'Payment Method (S6-G)', width: 150 },
        { field: 'transaction_id', headerName: 'Transaction ID (S6-H)', width: 200 },
        { field: 'sender_name', headerName: 'Sender Name (S6-I)', width: 150 },
        { field: 'receiver_name', headerName: 'Receiver Name (S6-J)', width: 150 },
        { field: 'description', headerName: 'Description (S6-K)', width: 200 },
        { field: 'created_at', headerName: 'Created At (S6-L)', width: 180 },
        { field: 'updated_at', headerName: 'Updated At (S6-M)', width: 180 },
        { field: 'processed_by', headerName: 'Processed By (S6-N)', width: 150 },
        { field: 'reconciled', headerName: 'Reconciled (S6-O)', width: 120 },
        { field: 'notes', headerName: 'Notes (S6-P)', width: 300 },
    ];

    return (
        <div style={{ height: 600, width: '100%', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2 style={{ marginBottom: '15px' }}>CompanyS: Incoming Payment Details - Zenith Corp. - Detailed View</h2>
            <p style={{ marginBottom: '10px' }}>
                This table displays detailed information about incoming payment transactions for Zenith Corp.
                Each row represents a unique payment, with columns providing key details such as amount, currency, status, and more.
                Clicking the ID will take you to the detailed payment view.
            </p>
            <DataGrid
                rows={S1_rows}
                columns={S6_columns}
                getRowId={(row) => row.id}
                loading={S2_loading}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                checkboxSelection
                disableSelectionOnClick
                style={{ backgroundColor: '#f9f9f9' }}
            />
            <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#777' }}>
                Last Updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
};

const CompanyT_IncomingPaymentDetailList = () => { // Company T: Nova Financial Group
    const [T1_rows, setT1_rows] = useState<IncomingPaymentDetail[]>([]);
    const [T2_loading, setT2_loading] = useState<boolean>(true);

    useEffect(() => {
        const T3_fetchIncomingPaymentDetails = async () => {
            try {
                const T4_response = await listIncomingPaymentDetails({});
                setT1_rows(T4_response || []);
            } catch (T5_error) {
                console.error('CompanyT: Failed to fetch incoming payment details:', T5_error);
                setT1_rows([]);
            } finally {
                setT2_loading(false);
            }
        };
        T3_fetchIncomingPaymentDetails();
    }, []);

    const T6_columns: GridColDef[] = [
        { field: 'id', headerName: 'ID (T6-A)', width: 200, renderCell: (params: GridRenderCellParams) => <a href={`/incoming_payments/${params.row.id}`}> {params.value} </a> },
        { field: 'amount', headerName: 'Amount (T6-B)', width: 150 },
        { field: 'currency', headerName: 'Currency (T6-C)', width: 100 },
        { field: 'status', headerName: 'Status (T6-D)', width: 120 },
        { field: 'direction', headerName: 'Direction (T6-E)', width: 120 },
        { field: 'as_of_date', headerName: 'As of Date (T6-F)', width: 150 },
        { field: 'payment_method', headerName: 'Payment Method (T6-G)', width: 150 },
        { field: 'transaction_id', headerName: 'Transaction ID (T6-H)', width: 200 },
        { field: 'sender_name', headerName: 'Sender Name (T6-I)', width: 150 },
        { field: 'receiver_name', headerName: 'Receiver Name (T6-J)', width: 150 },
        { field: 'description', headerName: 'Description (T6-K)', width: 200 },
        { field: 'created_at', headerName: 'Created At (T6-L)', width: 180 },
        { field: 'updated_at', headerName: 'Updated At (T6-M)', width: 180 },
        { field: 'processed_by', headerName: 'Processed By (T6-N)', width: 150 },
        { field: 'reconciled', headerName: 'Reconciled (T6-O)', width: 120 },
        { field: 'notes', headerName: 'Notes (T6-P)', width: 300 },
    ];

    return (
        <div style={{ height: 600, width: '100%', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2 style={{ marginBottom: '15px' }}>CompanyT: Incoming Payment Details - Nova Financial Group - Detailed View</h2>
            <p style={{ marginBottom: '10px' }}>
                This table displays detailed information about incoming payment transactions for Nova Financial Group.
                Each row represents a unique payment, with columns providing key details such as amount, currency, status, and more.
                Clicking the ID will take you to the detailed payment view.
            </p>
            <DataGrid
                rows={T1_rows}
                columns={T6_columns}
                getRowId={(row) => row.id}
                loading={T2_loading}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                checkboxSelection
                disableSelectionOnClick
                style={{ backgroundColor: '#f9f9f9' }}
            />
            <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#777' }}>
                Last Updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
};

export {
  CompanyA_IncomingPaymentDetailList,
  CompanyB_IncomingPaymentDetailList,
  CompanyC_IncomingPaymentDetailList,
  CompanyD_IncomingPaymentDetailList,
  CompanyE_IncomingPaymentDetailList,
  CompanyF_IncomingPaymentDetailList,
  CompanyG_IncomingPaymentDetailList,
  CompanyH_IncomingPaymentDetailList,
  CompanyI_IncomingPaymentDetailList,
  CompanyJ_IncomingPaymentDetailList,
  CompanyK_IncomingPaymentDetailList,
  CompanyL_IncomingPaymentDetailList,
  CompanyM_IncomingPaymentDetailList,
  CompanyN_IncomingPaymentDetailList,
  CompanyO_IncomingPaymentDetailList,
  CompanyP_IncomingPaymentDetailList,
  CompanyQ_IncomingPaymentDetailList,
  CompanyR_IncomingPaymentDetailList,
  CompanyS_IncomingPaymentDetailList,
  CompanyT_IncomingPaymentDetailList,
};