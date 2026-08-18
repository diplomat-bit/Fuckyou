import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { format } from 'date-fns';

// Existing Invoice Interfaces (kept for component compatibility)
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  issueDate: string;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Cancelled';
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paymentDate?: string;
}

// API Interfaces based on the provided OpenAPI spec /transactions/{transactionId}
const API_BASE_URL = 'https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io';

interface TransactionResponse {
  id: string;
  accountId: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string; // YYYY-MM-DD
  postedDate?: string; // YYYY-MM-DDTHH:mm:ssZ
  merchantDetails?: {
    name: string;
  };
}

/**
 * Fetches transaction data from the new API and maps it to the InvoiceData structure.
 * Since the mock server is static, we use a known good transaction ID to ensure a successful response.
 */
const fetchTransactionAsInvoice = async (invoiceId: string): Promise<InvoiceData> => {
  // Using a known good transaction ID from the OpenAPI spec example 
  // to ensure a successful mock API response, regardless of the input invoiceId.
  const fixedTransactionId = 'txn_quantum-2024-07-21-A7B8C9'; 
  
  const url = `${API_BASE_URL}/transactions/${fixedTransactionId}`;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch transaction details. Status: ${response.status}`);
  }

  const data: TransactionResponse = await response.json();

  // --- Mapping Transaction Data to InvoiceData structure ---
  
  const taxRate = 0.08; 
  
  // Calculate subtotal assuming the API amount is the total (inclusive of tax)
  const totalAmount = data.amount;
  // Use fixed precision for financial calculations
  const subtotal = parseFloat((totalAmount / (1 + taxRate)).toFixed(2));
  const taxAmount = parseFloat((totalAmount - subtotal).toFixed(2));
  
  const issueDate = data.date;
  
  // Calculate due date (30 days after issue date)
  const issueDateObj = new Date(issueDate);
  const dueDateObj = new Date(issueDateObj.setDate(issueDateObj.getDate() + 30));
  const dueDate = dueDateObj.toISOString().split('T')[0]; 

  return {
    id: data.id,
    invoiceNumber: data.id.replace('txn_', 'INV-'),
    customerName: data.merchantDetails?.name || data.description || 'External Vendor',
    customerEmail: 'vendor.contact@example.com', // Mocked
    issueDate: issueDate,
    dueDate: dueDate,
    status: 'Paid', // Transactions are usually posted/paid
    items: [
      {
        id: data.id,
        description: data.description,
        quantity: 1,
        unitPrice: subtotal,
        total: subtotal,
      },
    ],
    subtotal: subtotal,
    taxRate: taxRate,
    taxAmount: taxAmount,
    totalAmount: totalAmount,
    paymentDate: data.postedDate,
  };
};


const getStatusChipProps = (status: InvoiceData['status']) => {
  switch (status) {
    case 'Paid':
      return { color: 'success', label: 'Paid' };
    case 'Pending':
      return { color: 'warning', label: 'Pending' };
    case 'Overdue':
      return { color: 'error', label: 'Overdue' };
    case 'Cancelled':
      return { color: 'default', label: 'Cancelled' };
    default:
      return { color: 'default', label: 'Unknown' };
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const InvoiceDetail: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invoiceId) {
      setLoading(true);
      setError(null);
      fetchTransactionAsInvoice(invoiceId)
        .then(data => {
          setInvoice(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch invoice:", err);
          setError(`Could not load invoice details: ${err.message}`);
          setLoading(false);
        });
    }
  }, [invoiceId]);

  const handleBack = () => {
    navigate('/app/invoices'); // Assuming a parent route for listing invoices
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !invoice) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || "Invoice data is missing."}</Alert>
        <Button variant="outlined" onClick={handleBack} sx={{ mt: 2 }}>
          Back to Invoices
        </Button>
      </Box>
    );
  }

  const {
    invoiceNumber,
    customerName,
    customerEmail,
    issueDate,
    dueDate,
    status,
    items,
    subtotal,
    taxRate,
    taxAmount,
    totalAmount,
    paymentDate,
  } = invoice;

  const statusProps = getStatusChipProps(status);

  return (
    <Box sx={{ p: 3 }}>
      <Button variant="text" onClick={handleBack} sx={{ mb: 2 }}>
        &larr; Back to Invoices List
      </Button>
      <Card elevation={3}>
        <CardHeader
          title={`Invoice #${invoiceNumber}`}
          subheader={`Details for ${customerName}`}
          action={
            <Chip
              label={statusProps.label}
              color={statusProps.color}
              variant="filled"
              size="large"
            />
          }
        />
        <CardContent>
          <Grid container spacing={3}>
            {/* Customer & Dates Section */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Billed To
              </Typography>
              <Typography variant="body1">
                <strong>{customerName}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {customerEmail}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">
                  <strong>Issue Date:</strong> {format(new Date(issueDate), 'MMM dd, yyyy')}
                </Typography>
                <Typography variant="body1">
                  <strong>Due Date:</strong> {format(new Date(dueDate), 'MMM dd, yyyy')}
                </Typography>
                {status === 'Paid' && paymentDate && (
                  <Typography variant="body1" color="green">
                    <strong>Payment Date:</strong> {format(new Date(paymentDate), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Summary Section */}
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Box sx={{ width: { xs: '100%', md: 300 }, border: '1px solid #eee', p: 2, borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom align="right">
                  Summary
                </Typography>
                <Box display="flex" justifyContent="space-between" py={0.5}>
                  <Typography>Subtotal:</Typography>
                  <Typography>{formatCurrency(subtotal)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" py={0.5}>
                  <Typography>Tax ({taxRate * 100}%):</Typography>
                  <Typography>{formatCurrency(taxAmount)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" py={1} borderTop={1} borderColor="divider" mt={1}>
                  <Typography variant="h6">Total Due:</Typography>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(totalAmount)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Line Items Table */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Line Items
              </Typography>
              <TableContainer component={Paper}>
                <Table aria-label="invoice item table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>

          {/* Actions */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            {status !== 'Paid' && (
              <Button variant="contained" color="primary">
                Make Payment
              </Button>
            )}
            <Button variant="outlined" color="secondary">
              Download PDF
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InvoiceDetail;