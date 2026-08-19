import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, Typography, Grid, CircularProgress, Alert, Card, CardContent, Tabs, Tab, Button, Menu, MenuItem } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

// Mock Data Structure Interfaces (assuming minimal CAMT processing)
interface CashPosition {
    accountId: string;
    accountName: string;
    currency: string;
    openingBalance: number;
    closingBalance: number;
    availableBalance: number;
    date: string; // ISO Date String
}

interface TransactionEntry {
    id: string;
    bookingDate: string; // ISO Date String
    valueDate: string; // ISO Date String
    amount: number;
    currency: string;
    status: 'BOOK' | 'PDNG';
    type: string;
    description: string;
    relatedParty: string;
}

interface Statement {
    id: string;
    accountId: string;
    creationDateTime: string;
    entries: TransactionEntry[];
    openingBalance: number;
    closingBalance: number;
    currency: string;
}

// --- Mock API/Data Fetching Hooks ---

const useFetchCashPositions = (): { data: CashPosition[] | null, loading: boolean, error: string | null, refetch: () => void } => {
    const [data, setData] = useState<CashPosition[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(() => {
        setLoading(true);
        setError(null);

        // Simulate network delay and data retrieval from CAMT source
        setTimeout(() => {
            const mockData: CashPosition[] = [
                {
                    accountId: 'ACCT-001-USD',
                    accountName: 'Operating Account USD',
                    currency: 'USD',
                    openingBalance: 1500000.75,
                    closingBalance: 1550000.75,
                    availableBalance: 1540000.00,
                    date: format(new Date(), 'yyyy-MM-dd'),
                },
                {
                    accountId: 'ACCT-002-EUR',
                    accountName: 'Receivables EUR',
                    currency: 'EUR',
                    openingBalance: 50000.00,
                    closingBalance: 49800.00,
                    availableBalance: 49800.00,
                    date: format(new Date(), 'yyyy-MM-dd'),
                },
                {
                    accountId: 'ACCT-003-GBP',
                    accountName: 'Payroll GBP',
                    currency: 'GBP',
                    openingBalance: 200000.50,
                    closingBalance: 200000.50,
                    availableBalance: 195000.00,
                    date: format(new Date(), 'yyyy-MM-dd'),
                },
            ];
            setData(mockData);
            setLoading(false);
        }, 800);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

const useFetchStatements = (accountId: string | null): { data: Statement[] | null, loading: boolean, error: string | null, refetch: () => void } => {
    const [data, setData] = useState<Statement[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(() => {
        if (!accountId) {
            setData(null);
            return;
        }

        setLoading(true);
        setError(null);

        // Simulate fetching statement data for the selected account
        setTimeout(() => {
            if (accountId === 'ACCT-001-USD') {
                const mockStatement: Statement = {
                    id: 'STMT-20230101-USD',
                    accountId: accountId,
                    creationDateTime: new Date().toISOString(),
                    currency: 'USD',
                    openingBalance: 1500000.75,
                    closingBalance: 1550000.75,
                    entries: [
                        { id: 'T001', bookingDate: '2023-10-26', valueDate: '2023-10-26', amount: 50000.00, currency: 'USD', status: 'BOOK', type: 'CRDT', description: 'Incoming Wire Transfer (INV-901)', relatedParty: 'Supplier Inc.' },
                        { id: 'T002', bookingDate: '2023-10-26', valueDate: '2023-10-26', amount: -500.00, currency: 'USD', status: 'BOOK', type: 'CHRG', description: 'Wire Transfer Fee', relatedParty: 'Bank ABC' },
                        { id: 'T003', bookingDate: '2023-10-26', valueDate: '2023-10-26', amount: 2500.00, currency: 'USD', status: 'PDNG', type: 'CRDT', description: 'ACH Deposit Pending', relatedParty: 'Client XYZ' },
                        { id: 'T004', bookingDate: '2023-10-26', valueDate: '2023-10-26', amount: -20000.00, currency: 'USD', status: 'BOOK', type: 'DBIT', description: 'Payroll Batch 1', relatedParty: 'Employee Services' },
                    ],
                };
                setData([mockStatement]);
            } else {
                setData([]);
            }
            setLoading(false);
        }, 800);
    }, [accountId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

// --- Components ---

const BalanceCard: React.FC<{ title: string, amount: number, currency: string, isLoading: boolean }> = ({ title, amount, currency, isLoading }) => (
    <Card elevation={3} sx={{ height: '100%' }}>
        <CardContent>
            <Typography variant="subtitle1" color="textSecondary">{title}</Typography>
            {isLoading ? (
                <CircularProgress size={20} sx={{ mt: 1 }} />
            ) : (
                <Typography variant="h4" component="div" sx={{ mt: 1, fontWeight: 'bold' }}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount)}
                </Typography>
            )}
        </CardContent>
    </Card>
);

const CashPositionSummary: React.FC<{ positions: CashPosition[], loading: boolean }> = ({ positions, loading }) => {
    const totalCash = useMemo(() => {
        // In a real application, you would need complex FX conversions here.
        // For this example, we calculate total USD only.
        return positions
            .filter(p => p.currency === 'USD')
            .reduce((sum, p) => sum + p.availableBalance, 0);
    }, [positions]);

    const usdPosition = positions.find(p => p.currency === 'USD');

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid xs={12} md={4}>
                <BalanceCard
                    title="Total Available Cash (USD Equivalent)"
                    amount={totalCash}
                    currency="USD"
                    isLoading={loading}
                />
            </Grid>
            <Grid xs={12} md={4}>
                <BalanceCard
                    title="USD Closing Book Balance"
                    amount={usdPosition?.closingBalance || 0}
                    currency="USD"
                    isLoading={loading}
                />
            </Grid>
            <Grid xs={12} md={4}>
                <BalanceCard
                    title="USD Available Balance"
                    amount={usdPosition?.availableBalance || 0}
                    currency="USD"
                    isLoading={loading}
                />
            </Grid>
        </Grid>
    );
};

const StatementsDetail: React.FC<{ statements: Statement[] | null, loading: boolean }> = ({ statements, loading }) => {
    if (loading) {
        return <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>;
    }
    if (!statements || statements.length === 0) {
        return <Alert severity="info">No statement data available for the selected account.</Alert>;
    }

    const statement = statements[0]; // Assuming we display the most recent one

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Statement Details ({statement.currency})</Typography>
            <Grid container spacing={2} mb={3}>
                <Grid xs={6} md={3}>
                    <Typography variant="body2">Statement Date:</Typography>
                    <Typography fontWeight="bold">{format(parseISO(statement.creationDateTime), 'PPP')}</Typography>
                </Grid>
                <Grid xs={6} md={3}>
                    <Typography variant="body2">Opening Balance:</Typography>
                    <Typography fontWeight="bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: statement.currency }).format(statement.openingBalance)}</Typography>
                </Grid>
                <Grid xs={6} md={3}>
                    <Typography variant="body2">Closing Balance:</Typography>
                    <Typography fontWeight="bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: statement.currency }).format(statement.closingBalance)}</Typography>
                </Grid>
            </Grid>

            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Transaction Entries</Typography>
            <Paper sx={{ overflowX: 'auto' }}>
                <Box minWidth={800}>
                    <Grid container sx={{ borderBottom: '1px solid #ccc', py: 1, px: 2, fontWeight: 'bold' }}>
                        <Grid xs={1}>ID</Grid>
                        <Grid xs={1.5}>Booking Date</Grid>
                        <Grid xs={1.5}>Value Date</Grid>
                        <Grid xs={1}>Status</Grid>
                        <Grid xs={1.5} sx={{ textAlign: 'right' }}>Amount</Grid>
                        <Grid xs={2}>Related Party</Grid>
                        <Grid xs={3.5}>Description</Grid>
                    </Grid>
                    {statement.entries.map((entry) => (
                        <Grid container key={entry.id} sx={{ py: 1, px: 2, borderBottom: '1px dotted #eee' }}>
                            <Grid xs={1} sx={{ fontSize: '0.8rem' }}>{entry.id}</Grid>
                            <Grid xs={1.5} sx={{ fontSize: '0.8rem' }}>{format(parseISO(entry.bookingDate), 'MMM d, yy')}</Grid>
                            <Grid xs={1.5} sx={{ fontSize: '0.8rem' }}>{format(parseISO(entry.valueDate), 'MMM d, yy')}</Grid>
                            <Grid xs={1} sx={{ fontSize: '0.8rem', color: entry.status === 'PDNG' ? 'warning.main' : 'success.main' }}>{entry.status}</Grid>
                            <Grid xs={1.5} sx={{ textAlign: 'right', fontWeight: 'bold', color: entry.amount < 0 ? 'error.main' : 'success.main', fontSize: '0.9rem' }}>
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: entry.currency, minimumFractionDigits: 2 }).format(entry.amount)}
                            </Grid>
                            <Grid xs={2} sx={{ fontSize: '0.8rem' }}>{entry.relatedParty}</Grid>
                            <Grid xs={3.5} sx={{ fontSize: '0.8rem' }}>{entry.description}</Grid>
                        </Grid>
                    ))}
                </Box>
            </Paper>
        </Box>
    );
};

const AccountList: React.FC<{
    positions: CashPosition[];
    selectedAccount: string | null;
    onSelectAccount: (accountId: string) => void;
}> = ({ positions, selectedAccount, onSelectAccount }) => {
    return (
        <Paper elevation={3} sx={{ p: 2, height: '100%', minHeight: 400 }}>
            <Typography variant="h6" gutterBottom>Bank Accounts</Typography>
            <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
                {positions.map(position => (
                    <Box
                        key={position.accountId}
                        onClick={() => onSelectAccount(position.accountId)}
                        sx={{
                            p: 1.5,
                            mb: 1,
                            borderRadius: 1,
                            cursor: 'pointer',
                            backgroundColor: selectedAccount === position.accountId ? 'primary.light' : 'transparent',
                            '&:hover': {
                                backgroundColor: selectedAccount === position.accountId ? 'primary.main' : 'grey.100',
                                color: selectedAccount === position.accountId ? 'white' : 'inherit',
                            }
                        }}
                    >
                        <Typography variant="body1" fontWeight="medium">{position.accountName}</Typography>
                        <Typography variant="caption" display="block">
                            {position.accountId} - {position.currency}
                        </Typography>
                        <Typography variant="body2" color={selectedAccount === position.accountId ? 'inherit' : 'textSecondary'}>
                            Available: {new Intl.NumberFormat('en-US', { style: 'currency', currency: position.currency }).format(position.availableBalance)}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};

const ModernTreasuryView: React.FC = () => {
    const { data: positions, loading: positionsLoading, error: positionsError, refetch: refetchPositions } = useFetchCashPositions();
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [currentTab, setCurrentTab] = useState(0);

    // Automatically select the first account upon loading
    useEffect(() => {
        if (positions && positions.length > 0 && !selectedAccount) {
            setSelectedAccount(positions[0].accountId);
        }
    }, [positions, selectedAccount]);

    const { data: statements, loading: statementsLoading, error: statementsError, refetch: refetchStatements } = useFetchStatements(selectedAccount);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    const handleRefresh = () => {
        refetchPositions();
        if (selectedAccount) {
            refetchStatements();
        }
    };

    // Filter menu logic (Mocked for simplicity)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openFilter = Boolean(anchorEl);
    const handleClickFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleCloseFilter = () => {
        setAnchorEl(null);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'light' }}>
                Treasury Dashboard
            </Typography>

            <Box display="flex" justifyContent="space-between" mb={3}>
                <Typography variant="subtitle2" color="textSecondary">
                    Data sourced directly from CAMT files
                </Typography>
                <Box>
                    <Button
                        variant="outlined"
                        onClick={handleClickFilter}
                        startIcon={<FilterListIcon />}
                        sx={{ mr: 1 }}
                    >
                        Filter
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={openFilter}
                        onClose={handleCloseFilter}
                    >
                        <MenuItem onClick={handleCloseFilter}>Filter by Date Range</MenuItem>
                        <MenuItem onClick={handleCloseFilter}>Filter by Currency</MenuItem>
                    </Menu>

                    <Button
                        variant="contained"
                        onClick={handleRefresh}
                        startIcon={positionsLoading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
                        disabled={positionsLoading}
                    >
                        {positionsLoading ? 'Refreshing...' : 'Refresh Data'}
                    </Button>
                </Box>
            </Box>

            {positionsError && <Alert severity="error" sx={{ mb: 3 }}>Error fetching positions: {positionsError}</Alert>}

            <CashPositionSummary positions={positions || []} loading={positionsLoading} />

            <Grid container spacing={3}>
                <Grid xs={12} md={4}>
                    {positionsLoading ? (
                        <Paper elevation={3} sx={{ p: 2, height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <CircularProgress />
                        </Paper>
                    ) : (
                        <AccountList
                            positions={positions || []}
                            selectedAccount={selectedAccount}
                            onSelectAccount={setSelectedAccount}
                        />
                    )}
                </Grid>

                <Grid xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 3, minHeight: 400 }}>
                        <Typography variant="h5" gutterBottom>
                            {selectedAccount ? positions?.find(p => p.accountId === selectedAccount)?.accountName : 'Select an Account'}
                        </Typography>

                        <Tabs value={currentTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tab label="Consolidated Statement" />
                            <Tab label="Pending Transactions" />
                            <Tab label="CAMT Raw Data" disabled />
                        </Tabs>

                        <Box sx={{ pt: 2 }}>
                            {currentTab === 0 && (
                                <StatementsDetail statements={statements} loading={statementsLoading} />
                            )}
                            {currentTab === 1 && (
                                <Alert severity="warning">Pending Transactions view is under development. Filter: {statements?.[0]?.entries.filter(e => e.status === 'PDNG').length || 0} pending entries.</Alert>
                            )}
                            {currentTab === 2 && (
                                <Alert severity="info">Raw CAMT XML Viewer Coming Soon.</Alert>
                            )}
                            {statementsError && <Alert severity="error" sx={{ mt: 2 }}>Error fetching statement: {statementsError}</Alert>}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ModernTreasuryView;

// --- CONSOLIDATED FROM: ModernTreasuryView (3).tsx ---

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, Typography, Grid, CircularProgress, Alert, Card, CardContent, Tabs, Tab, Button, Menu, MenuItem } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

// Mock Data Structure Interfaces (assuming minimal CAMT processing)
interface CashPosition {
    accountId: string;
    accountName: string;
    currency: string;
    openingBalance: number;
    closingBalance: number;
    availableBalance: number;
    date: string; // ISO Date String
}

interface TransactionEntry {
    id: string;
    bookingDate: string; // ISO Date String
    valueDate: string; // ISO Date String
    amount: number;
    currency: string;
    status: 'BOOK' | 'PDNG';
    type: string;
    description: string;
    relatedParty: string;
}

interface Statement {
    id: string;
    accountId: string;
    creationDateTime: string;
    entries: TransactionEntry[];
    openingBalance: number;
    closingBalance: number;
    currency: string;
}

// --- Mock API/Data Fetching Hooks ---

const useFetchCashPositions = (): { data: CashPosition[] | null, loading: boolean, error: string | null, refetch: () => void } => {
    const [data, setData] = useState<CashPosition[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(() => {
        setLoading(true);
        setError(null);

        // Simulate network delay and data retrieval from CAMT source
        setTimeout(() => {
            const mockData: CashPosition[] = [
                {
                    accountId: 'ACCT-001-USD',
                    accountName: 'Operating Account USD',
                    currency: 'USD',
                    openingBalance: 1500000.75,
                    closingBalance: 1550000.75,
                    availableBalance: 1540000.00,
                    date: format(new Date(), 'yyyy-MM-dd'),
                },
                {
                    accountId: 'ACCT-002-EUR',
                    accountName: 'Receivables EUR',
                    currency: 'EUR',
                    openingBalance: 50000.00,
                    closingBalance: 49800.00,
                    availableBalance: 49800.00,
                    date: format(new Date(), 'yyyy-MM-dd'),
                },
                {
                    accountId: 'ACCT-003-GBP',
                    accountName: 'Payroll GBP',
                    currency: 'GBP',
                    openingBalance: 200000.50,
                    closingBalance: 200000.50,
                    availableBalance: 195000.00,
                    date: format(new Date(), 'yyyy-MM-dd'),
                },
            ];
            setData(mockData);
            setLoading(false);
        }, 800);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

const useFetchStatements = (accountId: string | null): { data: Statement[] | null, loading: boolean, error: string | null, refetch: () => void } => {
    const [data, setData] = useState<Statement[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(() => {
        if (!accountId) {
            setData(null);
            return;
        }

        setLoading(true);
        setError(null);

        // Simulate fetching statement data for the selected account
        setTimeout(() => {
            if (accountId === 'ACCT-001-USD') {
                const mockStatement: Statement = {
                    id: 'STMT-20230101-USD',
                    accountId: accountId,
                    creationDateTime: new Date().toISOString(),
                    currency: 'USD',
                    openingBalance: 1500000.75,
                    closingBalance: 1550000.75,
                    entries: [
                        { id: 'T001', bookingDate: '2023-10-26', valueDate: '2023-10-26', amount: 50000.00, currency: 'USD', status: 'BOOK', type: 'CRDT', description: 'Incoming Wire Transfer (INV-901)', relatedParty: 'Supplier Inc.' },
                        { id: 'T002', bookingDate: '2023-10-26', valueDate: '2023-10-26', amount: -500.00, currency: 'USD', status: 'BOOK', type: 'CHRG', description: 'Wire Transfer Fee', relatedParty: 'Bank ABC' },
                        { id: 'T003', bookingDate: '2023-10-26', valueDate: '2023-10-26', amount: 2500.00, currency: 'USD', status: 'PDNG', type: 'CRDT', description: 'ACH Deposit Pending', relatedParty: 'Client XYZ' },
                        { id: 'T004', bookingDate: '2023-10-26', valueDate: '2023-10-26', amount: -20000.00, currency: 'USD', status: 'BOOK', type: 'DBIT', description: 'Payroll Batch 1', relatedParty: 'Employee Services' },
                    ],
                };
                setData([mockStatement]);
            } else {
                setData([]);
            }
            setLoading(false);
        }, 800);
    }, [accountId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

// --- Components ---

const BalanceCard: React.FC<{ title: string, amount: number, currency: string, isLoading: boolean }> = ({ title, amount, currency, isLoading }) => (
    <Card elevation={3} sx={{ height: '100%' }}>
        <CardContent>
            <Typography variant="subtitle1" color="textSecondary">{title}</Typography>
            {isLoading ? (
                <CircularProgress size={20} sx={{ mt: 1 }} />
            ) : (
                <Typography variant="h4" component="div" sx={{ mt: 1, fontWeight: 'bold' }}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount)}
                </Typography>
            )}
        </CardContent>
    </Card>
);

const CashPositionSummary: React.FC<{ positions: CashPosition[], loading: boolean }> = ({ positions, loading }) => {
    const totalCash = useMemo(() => {
        // In a real application, you would need complex FX conversions here.
        // For this example, we calculate total USD only.
        return positions
            .filter(p => p.currency === 'USD')
            .reduce((sum, p) => sum + p.availableBalance, 0);
    }, [positions]);

    const usdPosition = positions.find(p => p.currency === 'USD');

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid xs={12} md={4}>
                <BalanceCard
                    title="Total Available Cash (USD Equivalent)"
                    amount={totalCash}
                    currency="USD"
                    isLoading={loading}
                />
            </Grid>
            <Grid xs={12} md={4}>
                <BalanceCard
                    title="USD Closing Book Balance"
                    amount={usdPosition?.closingBalance || 0}
                    currency="USD"
                    isLoading={loading}
                />
            </Grid>
            <Grid xs={12} md={4}>
                <BalanceCard
                    title="USD Available Balance"
                    amount={usdPosition?.availableBalance || 0}
                    currency="USD"
                    isLoading={loading}
                />
            </Grid>
        </Grid>
    );
};

const StatementsDetail: React.FC<{ statements: Statement[] | null, loading: boolean }> = ({ statements, loading }) => {
    if (loading) {
        return <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>;
    }
    if (!statements || statements.length === 0) {
        return <Alert severity="info">No statement data available for the selected account.</Alert>;
    }

    const statement = statements[0]; // Assuming we display the most recent one

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Statement Details ({statement.currency})</Typography>
            <Grid container spacing={2} mb={3}>
                <Grid xs={6} md={3}>
                    <Typography variant="body2">Statement Date:</Typography>
                    <Typography fontWeight="bold">{format(parseISO(statement.creationDateTime), 'PPP')}</Typography>
                </Grid>
                <Grid xs={6} md={3}>
                    <Typography variant="body2">Opening Balance:</Typography>
                    <Typography fontWeight="bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: statement.currency }).format(statement.openingBalance)}</Typography>
                </Grid>
                <Grid xs={6} md={3}>
                    <Typography variant="body2">Closing Balance:</Typography>
                    <Typography fontWeight="bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: statement.currency }).format(statement.closingBalance)}</Typography>
                </Grid>
            </Grid>

            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Transaction Entries</Typography>
            <Paper sx={{ overflowX: 'auto' }}>
                <Box minWidth={800}>
                    <Grid container sx={{ borderBottom: '1px solid #ccc', py: 1, px: 2, fontWeight: 'bold' }}>
                        <Grid xs={1}>ID</Grid>
                        <Grid xs={1.5}>Booking Date</Grid>
                        <Grid xs={1.5}>Value Date</Grid>
                        <Grid xs={1}>Status</Grid>
                        <Grid xs={1.5} sx={{ textAlign: 'right' }}>Amount</Grid>
                        <Grid xs={2}>Related Party</Grid>
                        <Grid xs={3.5}>Description</Grid>
                    </Grid>
                    {statement.entries.map((entry) => (
                        <Grid container key={entry.id} sx={{ py: 1, px: 2, borderBottom: '1px dotted #eee' }}>
                            <Grid xs={1} sx={{ fontSize: '0.8rem' }}>{entry.id}</Grid>
                            <Grid xs={1.5} sx={{ fontSize: '0.8rem' }}>{format(parseISO(entry.bookingDate), 'MMM d, yy')}</Grid>
                            <Grid xs={1.5} sx={{ fontSize: '0.8rem' }}>{format(parseISO(entry.valueDate), 'MMM d, yy')}</Grid>
                            <Grid xs={1} sx={{ fontSize: '0.8rem', color: entry.status === 'PDNG' ? 'warning.main' : 'success.main' }}>{entry.status}</Grid>
                            <Grid xs={1.5} sx={{ textAlign: 'right', fontWeight: 'bold', color: entry.amount < 0 ? 'error.main' : 'success.main', fontSize: '0.9rem' }}>
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: entry.currency, minimumFractionDigits: 2 }).format(entry.amount)}
                            </Grid>
                            <Grid xs={2} sx={{ fontSize: '0.8rem' }}>{entry.relatedParty}</Grid>
                            <Grid xs={3.5} sx={{ fontSize: '0.8rem' }}>{entry.description}</Grid>
                        </Grid>
                    ))}
                </Box>
            </Paper>
        </Box>
    );
};

const AccountList: React.FC<{
    positions: CashPosition[];
    selectedAccount: string | null;
    onSelectAccount: (accountId: string) => void;
}> = ({ positions, selectedAccount, onSelectAccount }) => {
    return (
        <Paper elevation={3} sx={{ p: 2, height: '100%', minHeight: 400 }}>
            <Typography variant="h6" gutterBottom>Bank Accounts</Typography>
            <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
                {positions.map(position => (
                    <Box
                        key={position.accountId}
                        onClick={() => onSelectAccount(position.accountId)}
                        sx={{
                            p: 1.5,
                            mb: 1,
                            borderRadius: 1,
                            cursor: 'pointer',
                            backgroundColor: selectedAccount === position.accountId ? 'primary.light' : 'transparent',
                            '&:hover': {
                                backgroundColor: selectedAccount === position.accountId ? 'primary.main' : 'grey.100',
                                color: selectedAccount === position.accountId ? 'white' : 'inherit',
                            }
                        }}
                    >
                        <Typography variant="body1" fontWeight="medium">{position.accountName}</Typography>
                        <Typography variant="caption" display="block">
                            {position.accountId} - {position.currency}
                        </Typography>
                        <Typography variant="body2" color={selectedAccount === position.accountId ? 'inherit' : 'textSecondary'}>
                            Available: {new Intl.NumberFormat('en-US', { style: 'currency', currency: position.currency }).format(position.availableBalance)}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};

const ModernTreasuryView: React.FC = () => {
    const { data: positions, loading: positionsLoading, error: positionsError, refetch: refetchPositions } = useFetchCashPositions();
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [currentTab, setCurrentTab] = useState(0);

    // Automatically select the first account upon loading
    useEffect(() => {
        if (positions && positions.length > 0 && !selectedAccount) {
            setSelectedAccount(positions[0].accountId);
        }
    }, [positions, selectedAccount]);

    const { data: statements, loading: statementsLoading, error: statementsError, refetch: refetchStatements } = useFetchStatements(selectedAccount);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    const handleRefresh = () => {
        refetchPositions();
        if (selectedAccount) {
            refetchStatements();
        }
    };

    // Filter menu logic (Mocked for simplicity)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openFilter = Boolean(anchorEl);
    const handleClickFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleCloseFilter = () => {
        setAnchorEl(null);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'light' }}>
                Treasury Dashboard
            </Typography>

            <Box display="flex" justifyContent="space-between" mb={3}>
                <Typography variant="subtitle2" color="textSecondary">
                    Data sourced directly from CAMT files
                </Typography>
                <Box>
                    <Button
                        variant="outlined"
                        onClick={handleClickFilter}
                        startIcon={<FilterListIcon />}
                        sx={{ mr: 1 }}
                    >
                        Filter
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={openFilter}
                        onClose={handleCloseFilter}
                    >
                        <MenuItem onClick={handleCloseFilter}>Filter by Date Range</MenuItem>
                        <MenuItem onClick={handleCloseFilter}>Filter by Currency</MenuItem>
                    </Menu>

                    <Button
                        variant="contained"
                        onClick={handleRefresh}
                        startIcon={positionsLoading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
                        disabled={positionsLoading}
                    >
                        {positionsLoading ? 'Refreshing...' : 'Refresh Data'}
                    </Button>
                </Box>
            </Box>

            {positionsError && <Alert severity="error" sx={{ mb: 3 }}>Error fetching positions: {positionsError}</Alert>}

            <CashPositionSummary positions={positions || []} loading={positionsLoading} />

            <Grid container spacing={3}>
                <Grid xs={12} md={4}>
                    {positionsLoading ? (
                        <Paper elevation={3} sx={{ p: 2, height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <CircularProgress />
                        </Paper>
                    ) : (
                        <AccountList
                            positions={positions || []}
                            selectedAccount={selectedAccount}
                            onSelectAccount={setSelectedAccount}
                        />
                    )}
                </Grid>

                <Grid xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 3, minHeight: 400 }}>
                        <Typography variant="h5" gutterBottom>
                            {selectedAccount ? positions?.find(p => p.accountId === selectedAccount)?.accountName : 'Select an Account'}
                        </Typography>

                        <Tabs value={currentTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tab label="Consolidated Statement" />
                            <Tab label="Pending Transactions" />
                            <Tab label="CAMT Raw Data" disabled />
                        </Tabs>

                        <Box sx={{ pt: 2 }}>
                            {currentTab === 0 && (
                                <StatementsDetail statements={statements} loading={statementsLoading} />
                            )}
                            {currentTab === 1 && (
                                <Alert severity="warning">Pending Transactions view is under development. Filter: {statements?.[0]?.entries.filter(e => e.status === 'PDNG').length || 0} pending entries.</Alert>
                            )}
                            {currentTab === 2 && (
                                <Alert severity="info">Raw CAMT XML Viewer Coming Soon.</Alert>
                            )}
                            {statementsError && <Alert severity="error" sx={{ mt: 2 }}>Error fetching statement: {statementsError}</Alert>}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ModernTreasuryView;

// --- CONSOLIDATED FROM: ModernTreasuryView (1).tsx ---

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, Typography, Grid, CircularProgress, Alert, Card, CardContent, Tabs, Tab, Button, Menu, MenuItem } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

// Mock Data Structure Interfaces (assuming minimal CAMT processing)
interface CashPosition {
    accountId: string;
    accountName: string;
    currency: string;
    openingBalance: number;
    closingBalance: number;
    availableBalance: number;
    date: string; // ISO Date String
}

interface TransactionEntry {
    id: string;
    bookingDate: string; // ISO Date String
    valueDate: string; // ISO Date String
    amount: number;
    currency: string;
    status: 'BOOK' | 'PDNG';
    type: string;
    description: string;
    relatedParty: string;
}

interface Statement {
    id: string;
    accountId: string;
    creationDateTime: string;
    entries: TransactionEntry[];
    openingBalance: number;
    closingBalance: number;
    currency: string;
}

// --- Mock API/Data Fetching Hooks ---

const useFetchCashPositions = (): { data: CashPosition[] | null, loading: boolean, error: string | null, refetch: () => void } => {
    const [data, setData] = useState<CashPosition[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(() => {
        setLoading(true);
        setError(null);

        // Simulate network delay and data retrieval from CAMT source
        setTimeout(() => {
            const mockData: CashPosition[] = [
                {
                    accountId: 'ACCT-001-USD',
                    accountName: 'Operating Account USD',
                    currency: 'USD',
                    openingBalance: 1500000.75,
                    closingBalance: 1550000.75,
                    availableBalance: 1540000.00,
                    date: format(new Date(), 'yyyy-MM-dd'),
                },
                {
                    accountId: 'ACCT-002-EUR',
                    accountName: 'Receivables EUR',
                    currency: 'EUR',
                    openingBalance: 50000.00,
                    closingBalance: 49800.00,
                    availableBalance: 49800.00,
                    date: format(new Date(), 'yyyy-MM-dd'),
                },
                {
                    accountId: 'ACCT-003-GBP',
                    accountName: 'Payroll GBP',
                    currency: 'GBP',
                    openingBalance: 200000.50,
                    closingBalance: 200000.50,
                    availableBalance: 195000.00,
                    date: format(new Date(), 'yyyy-MM-dd'),
                },
            ];
            setData(mockData);
            setLoading(false);
        }, 800);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

const useFetchStatements = (accountId: string | null): { data: Statement[] | null, loading: boolean, error: string | null, refetch: () => void } => {
    const [data, setData] = useState<Statement[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(() => {
        if (!accountId) {
            setData(null);
            return;
        }

        setLoading(true);
        setError(null);

        // Simulate fetching statement data for the selected account
        setTimeout(() => {
            if (accountId === 'ACCT-001-USD') {
                const mockStatement: Statement = {
                    id: 'STMT-20230101-USD',
                    accountId: accountId,
                    creationDateTime: new Date().toISOString(),
                    currency: 'USD',
                    openingBalance: 1500000.75,
                    closingBalance: 1550000.75,
                    entries: [
                        { id: 'T001', bookingDate: '2023-10-26', valueDate: '2023-10-26', amount: 50000.00, currency: 'USD', status: 'BOOK', type: 'CRDT', description: 'Incoming Wire Transfer (INV-901)', relatedParty: 'Supplier Inc.' },
                        { id: 'T002', bookingDate: '2023-10-26', valueDate: '2023-10-26', amount: -500.00, currency: 'USD', status: 'BOOK', type: 'CHRG', description: 'Wire Transfer Fee', relatedParty: 'Bank ABC' },
                        { id: 'T003', bookingDate: '2023-10-26', valueDate: '2023-10-26', amount: 2500.00, currency: 'USD', status: 'PDNG', type: 'CRDT', description: 'ACH Deposit Pending', relatedParty: 'Client XYZ' },
                        { id: 'T004', bookingDate: '2023-10-26', valueDate: '2023-10-26', amount: -20000.00, currency: 'USD', status: 'BOOK', type: 'DBIT', description: 'Payroll Batch 1', relatedParty: 'Employee Services' },
                    ],
                };
                setData([mockStatement]);
            } else {
                setData([]);
            }
            setLoading(false);
        }, 800);
    }, [accountId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

// --- Components ---

const BalanceCard: React.FC<{ title: string, amount: number, currency: string, isLoading: boolean }> = ({ title, amount, currency, isLoading }) => (
    <Card elevation={3} sx={{ height: '100%' }}>
        <CardContent>
            <Typography variant="subtitle1" color="textSecondary">{title}</Typography>
            {isLoading ? (
                <CircularProgress size={20} sx={{ mt: 1 }} />
            ) : (
                <Typography variant="h4" component="div" sx={{ mt: 1, fontWeight: 'bold' }}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount)}
                </Typography>
            )}
        </CardContent>
    </Card>
);

const CashPositionSummary: React.FC<{ positions: CashPosition[], loading: boolean }> = ({ positions, loading }) => {
    const totalCash = useMemo(() => {
        // In a real application, you would need complex FX conversions here.
        // For this example, we calculate total USD only.
        return positions
            .filter(p => p.currency === 'USD')
            .reduce((sum, p) => sum + p.availableBalance, 0);
    }, [positions]);

    const usdPosition = positions.find(p => p.currency === 'USD');

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid xs={12} md={4}>
                <BalanceCard
                    title="Total Available Cash (USD Equivalent)"
                    amount={totalCash}
                    currency="USD"
                    isLoading={loading}
                />
            </Grid>
            <Grid xs={12} md={4}>
                <BalanceCard
                    title="USD Closing Book Balance"
                    amount={usdPosition?.closingBalance || 0}
                    currency="USD"
                    isLoading={loading}
                />
            </Grid>
            <Grid xs={12} md={4}>
                <BalanceCard
                    title="USD Available Balance"
                    amount={usdPosition?.availableBalance || 0}
                    currency="USD"
                    isLoading={loading}
                />
            </Grid>
        </Grid>
    );
};

const StatementsDetail: React.FC<{ statements: Statement[] | null, loading: boolean }> = ({ statements, loading }) => {
    if (loading) {
        return <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>;
    }
    if (!statements || statements.length === 0) {
        return <Alert severity="info">No statement data available for the selected account.</Alert>;
    }

    const statement = statements[0]; // Assuming we display the most recent one

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Statement Details ({statement.currency})</Typography>
            <Grid container spacing={2} mb={3}>
                <Grid xs={6} md={3}>
                    <Typography variant="body2">Statement Date:</Typography>
                    <Typography fontWeight="bold">{format(parseISO(statement.creationDateTime), 'PPP')}</Typography>
                </Grid>
                <Grid xs={6} md={3}>
                    <Typography variant="body2">Opening Balance:</Typography>
                    <Typography fontWeight="bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: statement.currency }).format(statement.openingBalance)}</Typography>
                </Grid>
                <Grid xs={6} md={3}>
                    <Typography variant="body2">Closing Balance:</Typography>
                    <Typography fontWeight="bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: statement.currency }).format(statement.closingBalance)}</Typography>
                </Grid>
            </Grid>

            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Transaction Entries</Typography>
            <Paper sx={{ overflowX: 'auto' }}>
                <Box minWidth={800}>
                    <Grid container sx={{ borderBottom: '1px solid #ccc', py: 1, px: 2, fontWeight: 'bold' }}>
                        <Grid xs={1}>ID</Grid>
                        <Grid xs={1.5}>Booking Date</Grid>
                        <Grid xs={1.5}>Value Date</Grid>
                        <Grid xs={1}>Status</Grid>
                        <Grid xs={1.5} sx={{ textAlign: 'right' }}>Amount</Grid>
                        <Grid xs={2}>Related Party</Grid>
                        <Grid xs={3.5}>Description</Grid>
                    </Grid>
                    {statement.entries.map((entry) => (
                        <Grid container key={entry.id} sx={{ py: 1, px: 2, borderBottom: '1px dotted #eee' }}>
                            <Grid xs={1} sx={{ fontSize: '0.8rem' }}>{entry.id}</Grid>
                            <Grid xs={1.5} sx={{ fontSize: '0.8rem' }}>{format(parseISO(entry.bookingDate), 'MMM d, yy')}</Grid>
                            <Grid xs={1.5} sx={{ fontSize: '0.8rem' }}>{format(parseISO(entry.valueDate), 'MMM d, yy')}</Grid>
                            <Grid xs={1} sx={{ fontSize: '0.8rem', color: entry.status === 'PDNG' ? 'warning.main' : 'success.main' }}>{entry.status}</Grid>
                            <Grid xs={1.5} sx={{ textAlign: 'right', fontWeight: 'bold', color: entry.amount < 0 ? 'error.main' : 'success.main', fontSize: '0.9rem' }}>
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: entry.currency, minimumFractionDigits: 2 }).format(entry.amount)}
                            </Grid>
                            <Grid xs={2} sx={{ fontSize: '0.8rem' }}>{entry.relatedParty}</Grid>
                            <Grid xs={3.5} sx={{ fontSize: '0.8rem' }}>{entry.description}</Grid>
                        </Grid>
                    ))}
                </Box>
            </Paper>
        </Box>
    );
};

const AccountList: React.FC<{
    positions: CashPosition[];
    selectedAccount: string | null;
    onSelectAccount: (accountId: string) => void;
}> = ({ positions, selectedAccount, onSelectAccount }) => {
    return (
        <Paper elevation={3} sx={{ p: 2, height: '100%', minHeight: 400 }}>
            <Typography variant="h6" gutterBottom>Bank Accounts</Typography>
            <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
                {positions.map(position => (
                    <Box
                        key={position.accountId}
                        onClick={() => onSelectAccount(position.accountId)}
                        sx={{
                            p: 1.5,
                            mb: 1,
                            borderRadius: 1,
                            cursor: 'pointer',
                            backgroundColor: selectedAccount === position.accountId ? 'primary.light' : 'transparent',
                            '&:hover': {
                                backgroundColor: selectedAccount === position.accountId ? 'primary.main' : 'grey.100',
                                color: selectedAccount === position.accountId ? 'white' : 'inherit',
                            }
                        }}
                    >
                        <Typography variant="body1" fontWeight="medium">{position.accountName}</Typography>
                        <Typography variant="caption" display="block">
                            {position.accountId} - {position.currency}
                        </Typography>
                        <Typography variant="body2" color={selectedAccount === position.accountId ? 'inherit' : 'textSecondary'}>
                            Available: {new Intl.NumberFormat('en-US', { style: 'currency', currency: position.currency }).format(position.availableBalance)}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};

const ModernTreasuryView: React.FC = () => {
    const { data: positions, loading: positionsLoading, error: positionsError, refetch: refetchPositions } = useFetchCashPositions();
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [currentTab, setCurrentTab] = useState(0);

    // Automatically select the first account upon loading
    useEffect(() => {
        if (positions && positions.length > 0 && !selectedAccount) {
            setSelectedAccount(positions[0].accountId);
        }
    }, [positions, selectedAccount]);

    const { data: statements, loading: statementsLoading, error: statementsError, refetch: refetchStatements } = useFetchStatements(selectedAccount);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    const handleRefresh = () => {
        refetchPositions();
        if (selectedAccount) {
            refetchStatements();
        }
    };

    // Filter menu logic (Mocked for simplicity)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openFilter = Boolean(anchorEl);
    const handleClickFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleCloseFilter = () => {
        setAnchorEl(null);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'light' }}>
                Treasury Dashboard
            </Typography>

            <Box display="flex" justifyContent="space-between" mb={3}>
                <Typography variant="subtitle2" color="textSecondary">
                    Data sourced directly from CAMT files
                </Typography>
                <Box>
                    <Button
                        variant="outlined"
                        onClick={handleClickFilter}
                        startIcon={<FilterListIcon />}
                        sx={{ mr: 1 }}
                    >
                        Filter
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={openFilter}
                        onClose={handleCloseFilter}
                    >
                        <MenuItem onClick={handleCloseFilter}>Filter by Date Range</MenuItem>
                        <MenuItem onClick={handleCloseFilter}>Filter by Currency</MenuItem>
                    </Menu>

                    <Button
                        variant="contained"
                        onClick={handleRefresh}
                        startIcon={positionsLoading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
                        disabled={positionsLoading}
                    >
                        {positionsLoading ? 'Refreshing...' : 'Refresh Data'}
                    </Button>
                </Box>
            </Box>

            {positionsError && <Alert severity="error" sx={{ mb: 3 }}>Error fetching positions: {positionsError}</Alert>}

            <CashPositionSummary positions={positions || []} loading={positionsLoading} />

            <Grid container spacing={3}>
                <Grid xs={12} md={4}>
                    {positionsLoading ? (
                        <Paper elevation={3} sx={{ p: 2, height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <CircularProgress />
                        </Paper>
                    ) : (
                        <AccountList
                            positions={positions || []}
                            selectedAccount={selectedAccount}
                            onSelectAccount={setSelectedAccount}
                        />
                    )}
                </Grid>

                <Grid xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 3, minHeight: 400 }}>
                        <Typography variant="h5" gutterBottom>
                            {selectedAccount ? positions?.find(p => p.accountId === selectedAccount)?.accountName : 'Select an Account'}
                        </Typography>

                        <Tabs value={currentTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tab label="Consolidated Statement" />
                            <Tab label="Pending Transactions" />
                            <Tab label="CAMT Raw Data" disabled />
                        </Tabs>

                        <Box sx={{ pt: 2 }}>
                            {currentTab === 0 && (
                                <StatementsDetail statements={statements} loading={statementsLoading} />
                            )}
                            {currentTab === 1 && (
                                <Alert severity="warning">Pending Transactions view is under development. Filter: {statements?.[0]?.entries.filter(e => e.status === 'PDNG').length || 0} pending entries.</Alert>
                            )}
                            {currentTab === 2 && (
                                <Alert severity="info">Raw CAMT XML Viewer Coming Soon.</Alert>
                            )}
                            {statementsError && <Alert severity="error" sx={{ mt: 2 }}>Error fetching statement: {statementsError}</Alert>}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ModernTreasuryView;

// --- CONSOLIDATED FROM: ModernTreasuryView (2).tsx ---

// REFACTORING_NOTE: The original content of this file was a sprawling and insecure API key settings page.
// This page has been removed as it represents a critical security anti-pattern: API keys and secrets should never
// be managed or submitted through a client-side application.
//
// In its place, this file now contains a focused, production-ready component for the Treasury Automation MVP.
// This view serves as a dashboard for interacting with a treasury management system (like Modern Treasury),
// fetching data from a secure, authenticated backend API.
//
// This change aligns with the refactoring goals of:
// 1. Removing flawed components.
// 2. Focusing on a realistic MVP.
// 3. Establishing secure patterns for API integration and authentication.

import React, { useState, useEffect } from 'react';

// --- Type Definitions for Treasury Data ---
// REFACTORING_NOTE: Standardizing on TypeScript types for all API data models is crucial.
// These would typically be auto-generated from an OpenAPI/Swagger spec or shared from the backend.

interface InternalAccount {
  id: string;
  account_number: string;
  party_name: string;
  available_balance: {
    amount: number;
    currency: string;
  };
  connection: {
    vendor_name: string;
  };
}

interface PaymentOrder {
  id: string;
  type: 'ach' | 'wire' | 'rtp';
  amount: number;
  currency: string;
  direction: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed';
  counterparty_name: string;
  created_at: string;
}

// --- Mock API Service ---
// REFACTORING_NOTE: API calls should be centralized in a dedicated service layer.
// This mock simulates fetching data from a backend that has a secure connection
// to the Modern Treasury API. Using a library like React Query or SWR is recommended
// for handling data fetching, caching, and state management.

const mockApi = {
  getInternalAccounts: async (): Promise<InternalAccount[]> => {
    console.log('Fetching internal accounts...');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      {
        id: 'acc_1',
        account_number: '...7890',
        party_name: 'Core Business Checking',
        available_balance: { amount: 1250345, currency: 'USD' },
        connection: { vendor_name: 'J.P. Morgan Chase' },
      },
      {
        id: 'acc_2',
        account_number: '...1234',
        party_name: 'Venture Debt Account',
        available_balance: { amount: 5000000, currency: 'USD' },
        connection: { vendor_name: 'Silicon Valley Bank' },
      },
    ];
  },
  getPaymentOrders: async (): Promise<PaymentOrder[]> => {
    console.log('Fetching payment orders...');
    await new Promise(resolve => setTimeout(resolve, 1200));
    return [
      {
        id: 'po_1',
        type: 'ach',
        amount: 2500000, // $25,000.00
        currency: 'USD',
        direction: 'debit',
        status: 'completed',
        counterparty_name: 'Payroll Co.',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'po_2',
        type: 'wire',
        amount: 15000000, // $150,000.00
        currency: 'USD',
        direction: 'credit',
        status: 'pending',
        counterparty_name: 'Vendor Inc.',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'po_3',
        type: 'rtp',
        amount: 50000, // $500.00
        currency: 'USD',
        direction: 'debit',
        status: 'completed',
        counterparty_name: 'Office Supplies LLC',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'po_4',
        type: 'ach',
        amount: 780000, // $7,800.00
        currency: 'USD',
        direction: 'debit',
        status: 'failed',
        counterparty_name: 'Cloud Services Provider',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  },
};

// --- Helper Functions ---
const formatCurrency = (amountInCents: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amountInCents / 100);
};

// --- Main Component ---
// REFACTORING_NOTE: UI is built with standard elements for clarity. In a production app,
// this would use a standardized component library like MUI or a Tailwind-based system
// for consistency, accessibility, and faster development.

const ModernTreasuryView: React.FC = () => {
  const [accounts, setAccounts] = useState<InternalAccount[]>([]);
  const [paymentOrders, setPaymentOrders] = useState<PaymentOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [accountsData, paymentsData] = await Promise.all([
          mockApi.getInternalAccounts(),
          mockApi.getPaymentOrders(),
        ]);
        setAccounts(accountsData);
        setPaymentOrders(paymentsData);
      } catch (err) {
        setError('Failed to fetch treasury data. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusChipClass = (status: PaymentOrder['status']) => {
    switch (status) {
      case 'completed':
        return 'status-chip status-completed';
      case 'pending':
        return 'status-chip status-pending';
      case 'failed':
        return 'status-chip status-failed';
      default:
        return 'status-chip';
    }
  };

  if (isLoading) {
    return <div className="loading-spinner">Loading Treasury Dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="treasury-dashboard">
      <header className="dashboard-header">
        <h1>Treasury Dashboard</h1>
        <button className="primary-button">Create Payment</button>
      </header>
      
      <section className="dashboard-section">
        <h2>Internal Accounts</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Account</th>
                <th>Bank</th>
                <th>Account Number</th>
                <th>Available Balance</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.party_name}</td>
                  <td>{account.connection.vendor_name}</td>
                  <td>{account.account_number}</td>
                  <td className="currency">{formatCurrency(account.available_balance.amount, account.available_balance.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Recent Payment Orders</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Counterparty</th>
                <th>Amount</th>
                <th>Direction</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentOrders.map((po) => (
                <tr key={po.id}>
                  <td>{po.counterparty_name}</td>
                  <td className="currency">{formatCurrency(po.amount, po.currency)}</td>
                  <td>{po.direction}</td>
                  <td>{po.type.toUpperCase()}</td>
                  <td>
                    <span className={getStatusChipClass(po.status)}>{po.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      
      {/* REFACTORING_NOTE: Styles are included inline for portability of this component.
          In a real-world scenario, these would be moved to a dedicated CSS module,
          a global stylesheet, or handled by a styling library like TailwindCSS or Emotion. */}
      <style>{`
        .treasury-dashboard {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #333;
          padding: 24px;
          background-color: #f7f8fa;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .dashboard-header h1 {
          font-size: 28px;
          font-weight: 600;
          margin: 0;
        }
        .primary-button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .primary-button:hover {
          background-color: #0056b3;
        }
        .dashboard-section {
          background-color: #fff;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          margin-bottom: 32px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .dashboard-section h2 {
          font-size: 18px;
          margin: 0;
          padding: 16px;
          border-bottom: 1px solid #dee2e6;
          font-weight: 600;
        }
        .table-container {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #dee2e6;
          vertical-align: middle;
        }
        thead th {
          background-color: #f8f9fa;
          color: #6c757d;
          font-size: 12px;
          text-transform: uppercase;
          font-weight: 600;
        }
        tbody tr:last-child td {
          border-bottom: none;
        }
        tbody tr:hover {
          background-color: #f8f9fa;
        }
        .currency {
          font-family: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace;
          text-align: right;
        }
        .status-chip {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }
        .status-completed {
          background-color: #d1f7e0;
          color: #1a7a44;
        }
        .status-pending {
          background-color: #fff3cd;
          color: #856404;
        }
        .status-failed {
          background-color: #f8d7da;
          color: #721c24;
        }
        .loading-spinner, .error-message {
          padding: 40px;
          text-align: center;
          font-size: 18px;
          color: #6c757d;
        }
        .error-message {
          color: #721c24;
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
};

export default ModernTreasuryView;

// --- CONSOLIDATED FROM: ModernTreasuryView (2)_1.tsx ---

// REFACTORING_NOTE: The original content of this file was a sprawling and insecure API key settings page.
// This page has been removed as it represents a critical security anti-pattern: API keys and secrets should never
// be managed or submitted through a client-side application.
//
// In its place, this file now contains a focused, production-ready component for the Treasury Automation MVP.
// This view serves as a dashboard for interacting with a treasury management system (like Modern Treasury),
// fetching data from a secure, authenticated backend API.
//
// This change aligns with the refactoring goals of:
// 1. Removing flawed components.
// 2. Focusing on a realistic MVP.
// 3. Establishing secure patterns for API integration and authentication.

import React, { useState, useEffect } from 'react';

// --- Type Definitions for Treasury Data ---
// REFACTORING_NOTE: Standardizing on TypeScript types for all API data models is crucial.
// These would typically be auto-generated from an OpenAPI/Swagger spec or shared from the backend.

interface InternalAccount {
  id: string;
  account_number: string;
  party_name: string;
  available_balance: {
    amount: number;
    currency: string;
  };
  connection: {
    vendor_name: string;
  };
}

interface PaymentOrder {
  id: string;
  type: 'ach' | 'wire' | 'rtp';
  amount: number;
  currency: string;
  direction: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed';
  counterparty_name: string;
  created_at: string;
}

// --- Mock API Service ---
// REFACTORING_NOTE: API calls should be centralized in a dedicated service layer.
// This mock simulates fetching data from a backend that has a secure connection
// to the Modern Treasury API. Using a library like React Query or SWR is recommended
// for handling data fetching, caching, and state management.

const mockApi = {
  getInternalAccounts: async (): Promise<InternalAccount[]> => {
    console.log('Fetching internal accounts...');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      {
        id: 'acc_1',
        account_number: '...7890',
        party_name: 'Core Business Checking',
        available_balance: { amount: 1250345, currency: 'USD' },
        connection: { vendor_name: 'J.P. Morgan Chase' },
      },
      {
        id: 'acc_2',
        account_number: '...1234',
        party_name: 'Venture Debt Account',
        available_balance: { amount: 5000000, currency: 'USD' },
        connection: { vendor_name: 'Silicon Valley Bank' },
      },
    ];
  },
  getPaymentOrders: async (): Promise<PaymentOrder[]> => {
    console.log('Fetching payment orders...');
    await new Promise(resolve => setTimeout(resolve, 1200));
    return [
      {
        id: 'po_1',
        type: 'ach',
        amount: 2500000, // $25,000.00
        currency: 'USD',
        direction: 'debit',
        status: 'completed',
        counterparty_name: 'Payroll Co.',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'po_2',
        type: 'wire',
        amount: 15000000, // $150,000.00
        currency: 'USD',
        direction: 'credit',
        status: 'pending',
        counterparty_name: 'Vendor Inc.',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'po_3',
        type: 'rtp',
        amount: 50000, // $500.00
        currency: 'USD',
        direction: 'debit',
        status: 'completed',
        counterparty_name: 'Office Supplies LLC',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'po_4',
        type: 'ach',
        amount: 780000, // $7,800.00
        currency: 'USD',
        direction: 'debit',
        status: 'failed',
        counterparty_name: 'Cloud Services Provider',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  },
};

// --- Helper Functions ---
const formatCurrency = (amountInCents: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amountInCents / 100);
};

// --- Main Component ---
// REFACTORING_NOTE: UI is built with standard elements for clarity. In a production app,
// this would use a standardized component library like MUI or a Tailwind-based system
// for consistency, accessibility, and faster development.

const ModernTreasuryView: React.FC = () => {
  const [accounts, setAccounts] = useState<InternalAccount[]>([]);
  const [paymentOrders, setPaymentOrders] = useState<PaymentOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [accountsData, paymentsData] = await Promise.all([
          mockApi.getInternalAccounts(),
          mockApi.getPaymentOrders(),
        ]);
        setAccounts(accountsData);
        setPaymentOrders(paymentsData);
      } catch (err) {
        setError('Failed to fetch treasury data. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusChipClass = (status: PaymentOrder['status']) => {
    switch (status) {
      case 'completed':
        return 'status-chip status-completed';
      case 'pending':
        return 'status-chip status-pending';
      case 'failed':
        return 'status-chip status-failed';
      default:
        return 'status-chip';
    }
  };

  if (isLoading) {
    return <div className="loading-spinner">Loading Treasury Dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="treasury-dashboard">
      <header className="dashboard-header">
        <h1>Treasury Dashboard</h1>
        <button className="primary-button">Create Payment</button>
      </header>
      
      <section className="dashboard-section">
        <h2>Internal Accounts</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Account</th>
                <th>Bank</th>
                <th>Account Number</th>
                <th>Available Balance</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.party_name}</td>
                  <td>{account.connection.vendor_name}</td>
                  <td>{account.account_number}</td>
                  <td className="currency">{formatCurrency(account.available_balance.amount, account.available_balance.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Recent Payment Orders</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Counterparty</th>
                <th>Amount</th>
                <th>Direction</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentOrders.map((po) => (
                <tr key={po.id}>
                  <td>{po.counterparty_name}</td>
                  <td className="currency">{formatCurrency(po.amount, po.currency)}</td>
                  <td>{po.direction}</td>
                  <td>{po.type.toUpperCase()}</td>
                  <td>
                    <span className={getStatusChipClass(po.status)}>{po.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      
      {/* REFACTORING_NOTE: Styles are included inline for portability of this component.
          In a real-world scenario, these would be moved to a dedicated CSS module,
          a global stylesheet, or handled by a styling library like TailwindCSS or Emotion. */}
      <style>{`
        .treasury-dashboard {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #333;
          padding: 24px;
          background-color: #f7f8fa;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .dashboard-header h1 {
          font-size: 28px;
          font-weight: 600;
          margin: 0;
        }
        .primary-button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .primary-button:hover {
          background-color: #0056b3;
        }
        .dashboard-section {
          background-color: #fff;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          margin-bottom: 32px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .dashboard-section h2 {
          font-size: 18px;
          margin: 0;
          padding: 16px;
          border-bottom: 1px solid #dee2e6;
          font-weight: 600;
        }
        .table-container {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #dee2e6;
          vertical-align: middle;
        }
        thead th {
          background-color: #f8f9fa;
          color: #6c757d;
          font-size: 12px;
          text-transform: uppercase;
          font-weight: 600;
        }
        tbody tr:last-child td {
          border-bottom: none;
        }
        tbody tr:hover {
          background-color: #f8f9fa;
        }
        .currency {
          font-family: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace;
          text-align: right;
        }
        .status-chip {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }
        .status-completed {
          background-color: #d1f7e0;
          color: #1a7a44;
        }
        .status-pending {
          background-color: #fff3cd;
          color: #856404;
        }
        .status-failed {
          background-color: #f8d7da;
          color: #721c24;
        }
        .loading-spinner, .error-message {
          padding: 40px;
          text-align: center;
          font-size: 18px;
          color: #6c757d;
        }
        .error-message {
          color: #721c24;
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
};

export default ModernTreasuryView;

// --- CONSOLIDATED FROM: ModernTreasuryView (4).tsx ---

/*
This file has been completely reimplemented to serve as a Gemini API Playground.
It demonstrates various features of the Google Gemini API based on the provided documentation,
including content generation, system instructions, configuration, multimodal input, streaming, and chat.
*/
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Sparkles, Bot, User, Settings, Image as ImageIcon, Send, Loader2, CornerDownLeft, FileUp } from 'lucide-react';

// --- TYPE DEFINITIONS ---

type Role = 'user' | 'model';

interface ChatMessage {
  role: Role;
  text: string;
}

type DemoTab = 'generate' | 'chat' | 'multimodal';

// --- MOCK API SIMULATION ---

const mockResponses = {
  "How does AI work?": "Artificial intelligence (AI) is a broad field of computer science that deals with the creation of intelligent agents, which are systems that can reason, learn, and act autonomously. At its core, AI involves developing algorithms and statistical models that enable computers to perform tasks that typically require human intelligence, such as understanding natural language, recognizing patterns, and making decisions.",
  "Hello there": "Hello! I am a large language model, trained by Google. How can I help you today?",
  "I have 2 dogs in my house.": "That sounds lovely! Dogs can be wonderful companions.",
  "How many paws are in my house?": "Since you have 2 dogs, and each dog has 4 paws, there would be a total of 8 paws in your house!",
  "Tell me about this instrument": "This appears to be a pipe organ, a magnificent musical instrument that produces sound by driving pressurized air through pipes. It's often found in churches and concert halls and is known for its vast tonal range and complexity. The keyboard, pedals, and stops allow a musician to control a huge variety of sounds."
};

const streamResponse = async (text: string, callback: (chunk: string) => void) => {
  const words = text.split(' ');
  for (let i = 0; i < words.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 50));
    callback(words.slice(0, i + 1).join(' '));
  }
};

// --- UI SUB-COMPONENTS ---

const ConfigPanel: React.FC<{
  systemInstruction: string;
  setSystemInstruction: (val: string) => void;
  temperature: number;
  setTemperature: (val: number) => void;
  thinkingEnabled: boolean;
  setThinkingEnabled: (val: boolean) => void;
}> = ({ systemInstruction, setSystemInstruction, temperature, setTemperature, thinkingEnabled, setThinkingEnabled }) => (
  <Card className="bg-gray-800/50 border-gray-700">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg"><Settings className="w-5 h-5 text-cyan-400" />Configuration</CardTitle>
      <CardDescription>Guide the model's behavior and output.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-300">System Instruction</label>
        <Textarea
          placeholder="You are a cat. Your name is Neko."
          className="mt-2"
          value={systemInstruction}
          onChange={(e) => setSystemInstruction(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-300">Temperature: {temperature.toFixed(1)}</label>
        <Slider
          defaultValue={[temperature]}
          max={1}
          step={0.1}
          onValueChange={(value) => setTemperature(value[0])}
          className="mt-2"
        />
        <p className="text-xs text-gray-500 mt-1">Lower values for less random, more deterministic responses.</p>
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">Enable Thinking (2.5 Pro/Flash)</label>
        <Switch checked={thinkingEnabled} onCheckedChange={setThinkingEnabled} />
      </div>
    </CardContent>
  </Card>
);

const ResponseDisplay: React.FC<{ response: string; isLoading: boolean; title?: string }> = ({ response, isLoading, title = "Model Response" }) => (
  <Card className="h-full bg-gray-800/50 border-gray-700">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg"><Bot className="w-5 h-5 text-cyan-400" />{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Generating response...</span>
        </div>
      ) : (
        <p className="text-gray-200 whitespace-pre-wrap">{response || <span className="text-gray-500">The model's response will appear here.</span>}</p>
      )}
    </CardContent>
  </Card>
);

const ChatInterface: React.FC = () => {
  const [history, setHistory] = useState<ChatMessage[]>([
    { role: 'model', text: "Great to meet you. What would you like to know?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const newHistory: ChatMessage[] = [...history, { role: 'user', text: input }];
    setHistory(newHistory);
    setInput('');
    setIsLoading(true);

    const mockRes = mockResponses[input as keyof typeof mockResponses] || "I'm not sure how to respond to that, but I'm ready to help with other questions!";
    
    // Simulate streaming response
    let streamedText = '';
    await streamResponse(mockRes, (chunk) => {
      streamedText = chunk;
      setHistory([...newHistory, { role: 'model', text: streamedText + '...' }]);
    });

    setHistory([...newHistory, { role: 'model', text: mockRes }]);
    setIsLoading(false);
  };

  return (
    <Card className="h-full flex flex-col bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="w-5 h-5 text-cyan-400" />Multi-turn Chat</CardTitle>
        <CardDescription>Converse with the model, which remembers previous turns.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-4 pr-6">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-cyan-400" /></div>}
            <div className={`p-3 rounded-lg max-w-[80%] ${msg.role === 'model' ? 'bg-gray-700/50 text-gray-200' : 'bg-blue-600 text-white'}`}>
              {msg.text}
            </div>
            {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-gray-200" /></div>}
          </div>
        ))}
        {isLoading && (
           <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-cyan-400" /></div>
             <div className="p-3 rounded-lg bg-gray-700/50 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-gray-400">...</span>
             </div>
           </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="relative w-full">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
            className="pr-12"
          />
          <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={handleSendMessage} disabled={isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const MultimodalInterface: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleGenerate = async () => {
        if (!image) {
            alert("Please upload an image first.");
            return;
        }
        setIsLoading(true);
        setResponse('');
        const mockRes = mockResponses["Tell me about this instrument"];
        await streamResponse(mockRes, (chunk) => setResponse(chunk));
        setIsLoading(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><ImageIcon className="w-5 h-5 text-cyan-400" />Multimodal Input</CardTitle>
                    <CardDescription>Combine text and media files in your prompts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="aspect-video bg-gray-900/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700">
                        {image ? (
                            <img src={image} alt="upload preview" className="max-h-full max-w-full object-contain rounded-md" />
                        ) : (
                            <div className="text-center text-gray-500">
                                <FileUp className="w-10 h-10 mx-auto" />
                                <p>Upload an image to get started</p>
                            </div>
                        )}
                    </div>
                    <Input type="file" accept="image/*" onChange={handleImageUpload} />
                    <Textarea placeholder="e.g., Tell me about this instrument" value={prompt} onChange={e => setPrompt(e.target.value)} />
                </CardContent>
                <CardFooter>
                    <Button variant="premium" onClick={handleGenerate} disabled={isLoading || !image}>
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Generate Description
                    </Button>
                </CardFooter>
            </Card>
            <ResponseDisplay response={response} isLoading={isLoading} title="Image Analysis" />
        </div>
    );
};


// --- MAIN VIEW COMPONENT ---

const GeminiAPIDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DemoTab>('generate');
  
  // State for "Generate Content" tab
  const [prompt, setPrompt] = useState('How does AI work?');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);

  // State for Config
  const [systemInstruction, setSystemInstruction] = useState('');
  const [temperature, setTemperature] = useState(0.9);
  const [thinkingEnabled, setThinkingEnabled] = useState(true);

  const handleGenerateContent = useCallback(async () => {
    setIsLoading(true);
    setResponse('');
    
    let mockResKey = prompt as keyof typeof mockResponses;
    if (systemInstruction.toLowerCase().includes("cat")) {
        mockResKey = "Hello there"; // Use a different response for the cat persona
    }
    
    let mockRes = mockResponses[mockResKey] || "I'm sorry, I don't have a pre-canned response for that. But I am a powerful AI model!";
    
    if (systemInstruction.toLowerCase().includes("cat")) {
        mockRes = "Meow! I'm Neko, the cat. I prefer to talk about naps and chasing laser pointers. Purrrr."
    }

    if (isStreaming) {
      await streamResponse(mockRes, (chunk) => setResponse(chunk));
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResponse(mockRes);
    }
    
    setIsLoading(false);
  }, [prompt, isStreaming, systemInstruction]);

  const renderContent = () => {
    switch (activeTab) {
      case 'generate':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <ConfigPanel 
                systemInstruction={systemInstruction}
                setSystemInstruction={setSystemInstruction}
                temperature={temperature}
                setTemperature={setTemperature}
                thinkingEnabled={thinkingEnabled}
                setThinkingEnabled={setThinkingEnabled}
              />
            </div>
            <div className="lg:col-span-2 space-y-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><CornerDownLeft className="w-5 h-5 text-cyan-400" />Generate Content</CardTitle>
                  <CardDescription>Provide a prompt and see what the model generates.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter your prompt here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={5}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Switch id="streaming-mode" checked={isStreaming} onCheckedChange={setIsStreaming} />
                        <label htmlFor="streaming-mode" className="text-sm font-medium text-gray-300">Stream Response</label>
                    </div>
                    <Button variant="premium" onClick={handleGenerateContent} disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Generate
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <ResponseDisplay response={response} isLoading={isLoading} />
            </div>
          </div>
        );
      case 'chat':
        return <ChatInterface />;
      case 'multimodal':
        return <MultimodalInterface />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-white">Gemini API Playground</h1>
        <p className="text-gray-400 mt-1">Explore the capabilities of Google's Gemini models interactively.</p>
      </header>

      <div className="flex space-x-2 border-b border-gray-700">
        {(['generate', 'chat', 'multimodal'] as DemoTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-cyan-400 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default GeminiAPIDashboard;

// --- CONSOLIDATED FROM: ModernTreasuryView (4)_1.tsx ---

/*
This file has been completely reimplemented to serve as a Gemini API Playground.
It demonstrates various features of the Google Gemini API based on the provided documentation,
including content generation, system instructions, configuration, multimodal input, streaming, and chat.
*/
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Sparkles, Bot, User, Settings, Image as ImageIcon, Send, Loader2, CornerDownLeft, FileUp } from 'lucide-react';

// --- TYPE DEFINITIONS ---

type Role = 'user' | 'model';

interface ChatMessage {
  role: Role;
  text: string;
}

type DemoTab = 'generate' | 'chat' | 'multimodal';

// --- MOCK API SIMULATION ---

const mockResponses = {
  "How does AI work?": "Artificial intelligence (AI) is a broad field of computer science that deals with the creation of intelligent agents, which are systems that can reason, learn, and act autonomously. At its core, AI involves developing algorithms and statistical models that enable computers to perform tasks that typically require human intelligence, such as understanding natural language, recognizing patterns, and making decisions.",
  "Hello there": "Hello! I am a large language model, trained by Google. How can I help you today?",
  "I have 2 dogs in my house.": "That sounds lovely! Dogs can be wonderful companions.",
  "How many paws are in my house?": "Since you have 2 dogs, and each dog has 4 paws, there would be a total of 8 paws in your house!",
  "Tell me about this instrument": "This appears to be a pipe organ, a magnificent musical instrument that produces sound by driving pressurized air through pipes. It's often found in churches and concert halls and is known for its vast tonal range and complexity. The keyboard, pedals, and stops allow a musician to control a huge variety of sounds."
};

const streamResponse = async (text: string, callback: (chunk: string) => void) => {
  const words = text.split(' ');
  for (let i = 0; i < words.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 50));
    callback(words.slice(0, i + 1).join(' '));
  }
};

// --- UI SUB-COMPONENTS ---

const ConfigPanel: React.FC<{
  systemInstruction: string;
  setSystemInstruction: (val: string) => void;
  temperature: number;
  setTemperature: (val: number) => void;
  thinkingEnabled: boolean;
  setThinkingEnabled: (val: boolean) => void;
}> = ({ systemInstruction, setSystemInstruction, temperature, setTemperature, thinkingEnabled, setThinkingEnabled }) => (
  <Card className="bg-gray-800/50 border-gray-700">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg"><Settings className="w-5 h-5 text-cyan-400" />Configuration</CardTitle>
      <CardDescription>Guide the model's behavior and output.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-300">System Instruction</label>
        <Textarea
          placeholder="You are a cat. Your name is Neko."
          className="mt-2"
          value={systemInstruction}
          onChange={(e) => setSystemInstruction(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-300">Temperature: {temperature.toFixed(1)}</label>
        <Slider
          defaultValue={[temperature]}
          max={1}
          step={0.1}
          onValueChange={(value) => setTemperature(value[0])}
          className="mt-2"
        />
        <p className="text-xs text-gray-500 mt-1">Lower values for less random, more deterministic responses.</p>
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">Enable Thinking (2.5 Pro/Flash)</label>
        <Switch checked={thinkingEnabled} onCheckedChange={setThinkingEnabled} />
      </div>
    </CardContent>
  </Card>
);

const ResponseDisplay: React.FC<{ response: string; isLoading: boolean; title?: string }> = ({ response, isLoading, title = "Model Response" }) => (
  <Card className="h-full bg-gray-800/50 border-gray-700">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg"><Bot className="w-5 h-5 text-cyan-400" />{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Generating response...</span>
        </div>
      ) : (
        <p className="text-gray-200 whitespace-pre-wrap">{response || <span className="text-gray-500">The model's response will appear here.</span>}</p>
      )}
    </CardContent>
  </Card>
);

const ChatInterface: React.FC = () => {
  const [history, setHistory] = useState<ChatMessage[]>([
    { role: 'model', text: "Great to meet you. What would you like to know?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const newHistory: ChatMessage[] = [...history, { role: 'user', text: input }];
    setHistory(newHistory);
    setInput('');
    setIsLoading(true);

    const mockRes = mockResponses[input as keyof typeof mockResponses] || "I'm not sure how to respond to that, but I'm ready to help with other questions!";
    
    // Simulate streaming response
    let streamedText = '';
    await streamResponse(mockRes, (chunk) => {
      streamedText = chunk;
      setHistory([...newHistory, { role: 'model', text: streamedText + '...' }]);
    });

    setHistory([...newHistory, { role: 'model', text: mockRes }]);
    setIsLoading(false);
  };

  return (
    <Card className="h-full flex flex-col bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="w-5 h-5 text-cyan-400" />Multi-turn Chat</CardTitle>
        <CardDescription>Converse with the model, which remembers previous turns.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-4 pr-6">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-cyan-400" /></div>}
            <div className={`p-3 rounded-lg max-w-[80%] ${msg.role === 'model' ? 'bg-gray-700/50 text-gray-200' : 'bg-blue-600 text-white'}`}>
              {msg.text}
            </div>
            {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-gray-200" /></div>}
          </div>
        ))}
        {isLoading && (
           <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-cyan-400" /></div>
             <div className="p-3 rounded-lg bg-gray-700/50 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-gray-400">...</span>
             </div>
           </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="relative w-full">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
            className="pr-12"
          />
          <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={handleSendMessage} disabled={isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const MultimodalInterface: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleGenerate = async () => {
        if (!image) {
            alert("Please upload an image first.");
            return;
        }
        setIsLoading(true);
        setResponse('');
        const mockRes = mockResponses["Tell me about this instrument"];
        await streamResponse(mockRes, (chunk) => setResponse(chunk));
        setIsLoading(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><ImageIcon className="w-5 h-5 text-cyan-400" />Multimodal Input</CardTitle>
                    <CardDescription>Combine text and media files in your prompts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="aspect-video bg-gray-900/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700">
                        {image ? (
                            <img src={image} alt="upload preview" className="max-h-full max-w-full object-contain rounded-md" />
                        ) : (
                            <div className="text-center text-gray-500">
                                <FileUp className="w-10 h-10 mx-auto" />
                                <p>Upload an image to get started</p>
                            </div>
                        )}
                    </div>
                    <Input type="file" accept="image/*" onChange={handleImageUpload} />
                    <Textarea placeholder="e.g., Tell me about this instrument" value={prompt} onChange={e => setPrompt(e.target.value)} />
                </CardContent>
                <CardFooter>
                    <Button variant="premium" onClick={handleGenerate} disabled={isLoading || !image}>
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Generate Description
                    </Button>
                </CardFooter>
            </Card>
            <ResponseDisplay response={response} isLoading={isLoading} title="Image Analysis" />
        </div>
    );
};


// --- MAIN VIEW COMPONENT ---

const GeminiAPIDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DemoTab>('generate');
  
  // State for "Generate Content" tab
  const [prompt, setPrompt] = useState('How does AI work?');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);

  // State for Config
  const [systemInstruction, setSystemInstruction] = useState('');
  const [temperature, setTemperature] = useState(0.9);
  const [thinkingEnabled, setThinkingEnabled] = useState(true);

  const handleGenerateContent = useCallback(async () => {
    setIsLoading(true);
    setResponse('');
    
    let mockResKey = prompt as keyof typeof mockResponses;
    if (systemInstruction.toLowerCase().includes("cat")) {
        mockResKey = "Hello there"; // Use a different response for the cat persona
    }
    
    let mockRes = mockResponses[mockResKey] || "I'm sorry, I don't have a pre-canned response for that. But I am a powerful AI model!";
    
    if (systemInstruction.toLowerCase().includes("cat")) {
        mockRes = "Meow! I'm Neko, the cat. I prefer to talk about naps and chasing laser pointers. Purrrr."
    }

    if (isStreaming) {
      await streamResponse(mockRes, (chunk) => setResponse(chunk));
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResponse(mockRes);
    }
    
    setIsLoading(false);
  }, [prompt, isStreaming, systemInstruction]);

  const renderContent = () => {
    switch (activeTab) {
      case 'generate':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <ConfigPanel 
                systemInstruction={systemInstruction}
                setSystemInstruction={setSystemInstruction}
                temperature={temperature}
                setTemperature={setTemperature}
                thinkingEnabled={thinkingEnabled}
                setThinkingEnabled={setThinkingEnabled}
              />
            </div>
            <div className="lg:col-span-2 space-y-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><CornerDownLeft className="w-5 h-5 text-cyan-400" />Generate Content</CardTitle>
                  <CardDescription>Provide a prompt and see what the model generates.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter your prompt here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={5}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Switch id="streaming-mode" checked={isStreaming} onCheckedChange={setIsStreaming} />
                        <label htmlFor="streaming-mode" className="text-sm font-medium text-gray-300">Stream Response</label>
                    </div>
                    <Button variant="premium" onClick={handleGenerateContent} disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Generate
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <ResponseDisplay response={response} isLoading={isLoading} />
            </div>
          </div>
        );
      case 'chat':
        return <ChatInterface />;
      case 'multimodal':
        return <MultimodalInterface />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-white">Gemini API Playground</h1>
        <p className="text-gray-400 mt-1">Explore the capabilities of Google's Gemini models interactively.</p>
      </header>

      <div className="flex space-x-2 border-b border-gray-700">
        {(['generate', 'chat', 'multimodal'] as DemoTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-cyan-400 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default GeminiAPIDashboard;

// --- CONSOLIDATED FROM: ModernTreasuryView_1.tsx ---

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, Typography, Grid, CircularProgress, Alert, Card, CardContent, Tabs, Tab, Button, Menu, MenuItem } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

// Mock Data Structure Interfaces (assuming minimal CAMT processing)
interface CashPosition {
    accountId: string;
    accountName: string;
    currency: string;
    openingBalance: number;
    closingBalance: number;
    availableBalance: number;
    date: string; // ISO Date String
}

interface TransactionEntry {
    id: string;
    bookingDate: string; // ISO Date String
    valueDate: string; // ISO Date String
    amount: number;
    currency: string;
    status: 'BOOK' | 'PDNG';
    type: string;
    description: string;
    relatedParty: string;
}

interface Statement {
    id: string;
    accountId: string;
    creationDateTime: string;
    entries: TransactionEntry[];
    openingBalance: number;
    closingBalance: number;
    currency: string;
}

// --- Mock API/Data Fetching Hooks ---

const useFetchCashPositions = (): { data: CashPosition[] | null, loading: boolean, error: string | null, refetch: () => void } => {
    const [data, setData] = useState<CashPosition[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(() => {
        setLoading(true);
        setError(null);

        // Simulate network delay and data retrieval from CAMT source
        setTimeout(() => {
            const mockData: CashPosition[] = [
                {
                    accountId: 'ACCT-001-USD',
                    accountName: 'Operating Account USD',
                    currency: 'USD',
                    openingBalance: 1500000.75,
                    closingBalance: 1550000.75,
                    availableBalance: 1540000.00,
                    date: format(new Date(), 'yyyy-MM-dd'),
                },
                {
                    accountId: 'ACCT-002-EUR',
                    accountName: 'Receivables EUR',
                    currency: 'EUR',
                    openingBalance: 50000.00,
                    closingBalance: 49800.00,
                    availableBalance: 49800.00,
                    date: format(new Date(), 'yyyy-MM-dd'),
                },
                {
                    accountId: 'ACCT-003-GBP',
                    accountName: 'Payroll GBP',
                    currency: 'GBP',
                    openingBalance: 200000.50,
                    closingBalance: 200000.50,
                    availableBalance: 195000.00,
                    date: format(new Date(), 'yyyy-MM-dd'),
                },
            ];
            setData(mockData);
            setLoading(false);
        }, 800);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

const useFetchStatements = (accountId: string | null): { data: Statement[] | null, loading: boolean, error: string | null, refetch: () => void } => {
    const [data, setData] = useState<Statement[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(() => {
        if (!accountId) {
            setData(null);
            return;
        }

        setLoading(true);
        setError(null);

        // Simulate fetching statement data for the selected account
        setTimeout(() => {
            if (accountId === 'ACCT-001-USD') {
                const mockStatement: Statement = {
                    id: 'STMT-20230101-USD',
                    accountId: accountId,
                    creationDateTime: new Date().toISOString(),
                    currency: 'USD',
                    openingBalance: 1500000.75,
                    closingBalance: 1550000.75,
                    entries: [
                        { id: 'T001', bookingDate: '2023-10-26', valueDate: '2023-10-26', amount: 50000.00, currency: 'USD', status: 'BOOK', type: 'CRDT', description: 'Incoming Wire Transfer (INV-901)', relatedParty: 'Supplier Inc.' },
                        { id: 'T002', bookingDate: '2023-10-26', valueDate: '2023-10-26', amount: -500.00, currency: 'USD', status: 'BOOK', type: 'CHRG', description: 'Wire Transfer Fee', relatedParty: 'Bank ABC' },
                        { id: 'T003', bookingDate: '2023-10-26', valueDate: '2023-10-26', amount: 2500.00, currency: 'USD', status: 'PDNG', type: 'CRDT', description: 'ACH Deposit Pending', relatedParty: 'Client XYZ' },
                        { id: 'T004', bookingDate: '2023-10-26', valueDate: '2023-10-26', amount: -20000.00, currency: 'USD', status: 'BOOK', type: 'DBIT', description: 'Payroll Batch 1', relatedParty: 'Employee Services' },
                    ],
                };
                setData([mockStatement]);
            } else {
                setData([]);
            }
            setLoading(false);
        }, 800);
    }, [accountId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

// --- Components ---

const BalanceCard: React.FC<{ title: string, amount: number, currency: string, isLoading: boolean }> = ({ title, amount, currency, isLoading }) => (
    <Card elevation={3} sx={{ height: '100%' }}>
        <CardContent>
            <Typography variant="subtitle1" color="textSecondary">{title}</Typography>
            {isLoading ? (
                <CircularProgress size={20} sx={{ mt: 1 }} />
            ) : (
                <Typography variant="h4" component="div" sx={{ mt: 1, fontWeight: 'bold' }}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount)}
                </Typography>
            )}
        </CardContent>
    </Card>
);

const CashPositionSummary: React.FC<{ positions: CashPosition[], loading: boolean }> = ({ positions, loading }) => {
    const totalCash = useMemo(() => {
        // In a real application, you would need complex FX conversions here.
        // For this example, we calculate total USD only.
        return positions
            .filter(p => p.currency === 'USD')
            .reduce((sum, p) => sum + p.availableBalance, 0);
    }, [positions]);

    const usdPosition = positions.find(p => p.currency === 'USD');

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid xs={12} md={4}>
                <BalanceCard
                    title="Total Available Cash (USD Equivalent)"
                    amount={totalCash}
                    currency="USD"
                    isLoading={loading}
                />
            </Grid>
            <Grid xs={12} md={4}>
                <BalanceCard
                    title="USD Closing Book Balance"
                    amount={usdPosition?.closingBalance || 0}
                    currency="USD"
                    isLoading={loading}
                />
            </Grid>
            <Grid xs={12} md={4}>
                <BalanceCard
                    title="USD Available Balance"
                    amount={usdPosition?.availableBalance || 0}
                    currency="USD"
                    isLoading={loading}
                />
            </Grid>
        </Grid>
    );
};

const StatementsDetail: React.FC<{ statements: Statement[] | null, loading: boolean }> = ({ statements, loading }) => {
    if (loading) {
        return <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>;
    }
    if (!statements || statements.length === 0) {
        return <Alert severity="info">No statement data available for the selected account.</Alert>;
    }

    const statement = statements[0]; // Assuming we display the most recent one

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Statement Details ({statement.currency})</Typography>
            <Grid container spacing={2} mb={3}>
                <Grid xs={6} md={3}>
                    <Typography variant="body2">Statement Date:</Typography>
                    <Typography fontWeight="bold">{format(parseISO(statement.creationDateTime), 'PPP')}</Typography>
                </Grid>
                <Grid xs={6} md={3}>
                    <Typography variant="body2">Opening Balance:</Typography>
                    <Typography fontWeight="bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: statement.currency }).format(statement.openingBalance)}</Typography>
                </Grid>
                <Grid xs={6} md={3}>
                    <Typography variant="body2">Closing Balance:</Typography>
                    <Typography fontWeight="bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: statement.currency }).format(statement.closingBalance)}</Typography>
                </Grid>
            </Grid>

            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Transaction Entries</Typography>
            <Paper sx={{ overflowX: 'auto' }}>
                <Box minWidth={800}>
                    <Grid container sx={{ borderBottom: '1px solid #ccc', py: 1, px: 2, fontWeight: 'bold' }}>
                        <Grid xs={1}>ID</Grid>
                        <Grid xs={1.5}>Booking Date</Grid>
                        <Grid xs={1.5}>Value Date</Grid>
                        <Grid xs={1}>Status</Grid>
                        <Grid xs={1.5} sx={{ textAlign: 'right' }}>Amount</Grid>
                        <Grid xs={2}>Related Party</Grid>
                        <Grid xs={3.5}>Description</Grid>
                    </Grid>
                    {statement.entries.map((entry) => (
                        <Grid container key={entry.id} sx={{ py: 1, px: 2, borderBottom: '1px dotted #eee' }}>
                            <Grid xs={1} sx={{ fontSize: '0.8rem' }}>{entry.id}</Grid>
                            <Grid xs={1.5} sx={{ fontSize: '0.8rem' }}>{format(parseISO(entry.bookingDate), 'MMM d, yy')}</Grid>
                            <Grid xs={1.5} sx={{ fontSize: '0.8rem' }}>{format(parseISO(entry.valueDate), 'MMM d, yy')}</Grid>
                            <Grid xs={1} sx={{ fontSize: '0.8rem', color: entry.status === 'PDNG' ? 'warning.main' : 'success.main' }}>{entry.status}</Grid>
                            <Grid xs={1.5} sx={{ textAlign: 'right', fontWeight: 'bold', color: entry.amount < 0 ? 'error.main' : 'success.main', fontSize: '0.9rem' }}>
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: entry.currency, minimumFractionDigits: 2 }).format(entry.amount)}
                            </Grid>
                            <Grid xs={2} sx={{ fontSize: '0.8rem' }}>{entry.relatedParty}</Grid>
                            <Grid xs={3.5} sx={{ fontSize: '0.8rem' }}>{entry.description}</Grid>
                        </Grid>
                    ))}
                </Box>
            </Paper>
        </Box>
    );
};

const AccountList: React.FC<{
    positions: CashPosition[];
    selectedAccount: string | null;
    onSelectAccount: (accountId: string) => void;
}> = ({ positions, selectedAccount, onSelectAccount }) => {
    return (
        <Paper elevation={3} sx={{ p: 2, height: '100%', minHeight: 400 }}>
            <Typography variant="h6" gutterBottom>Bank Accounts</Typography>
            <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
                {positions.map(position => (
                    <Box
                        key={position.accountId}
                        onClick={() => onSelectAccount(position.accountId)}
                        sx={{
                            p: 1.5,
                            mb: 1,
                            borderRadius: 1,
                            cursor: 'pointer',
                            backgroundColor: selectedAccount === position.accountId ? 'primary.light' : 'transparent',
                            '&:hover': {
                                backgroundColor: selectedAccount === position.accountId ? 'primary.main' : 'grey.100',
                                color: selectedAccount === position.accountId ? 'white' : 'inherit',
                            }
                        }}
                    >
                        <Typography variant="body1" fontWeight="medium">{position.accountName}</Typography>
                        <Typography variant="caption" display="block">
                            {position.accountId} - {position.currency}
                        </Typography>
                        <Typography variant="body2" color={selectedAccount === position.accountId ? 'inherit' : 'textSecondary'}>
                            Available: {new Intl.NumberFormat('en-US', { style: 'currency', currency: position.currency }).format(position.availableBalance)}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};

const ModernTreasuryView: React.FC = () => {
    const { data: positions, loading: positionsLoading, error: positionsError, refetch: refetchPositions } = useFetchCashPositions();
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [currentTab, setCurrentTab] = useState(0);

    // Automatically select the first account upon loading
    useEffect(() => {
        if (positions && positions.length > 0 && !selectedAccount) {
            setSelectedAccount(positions[0].accountId);
        }
    }, [positions, selectedAccount]);

    const { data: statements, loading: statementsLoading, error: statementsError, refetch: refetchStatements } = useFetchStatements(selectedAccount);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    const handleRefresh = () => {
        refetchPositions();
        if (selectedAccount) {
            refetchStatements();
        }
    };

    // Filter menu logic (Mocked for simplicity)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openFilter = Boolean(anchorEl);
    const handleClickFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleCloseFilter = () => {
        setAnchorEl(null);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'light' }}>
                Treasury Dashboard
            </Typography>

            <Box display="flex" justifyContent="space-between" mb={3}>
                <Typography variant="subtitle2" color="textSecondary">
                    Data sourced directly from CAMT files
                </Typography>
                <Box>
                    <Button
                        variant="outlined"
                        onClick={handleClickFilter}
                        startIcon={<FilterListIcon />}
                        sx={{ mr: 1 }}
                    >
                        Filter
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={openFilter}
                        onClose={handleCloseFilter}
                    >
                        <MenuItem onClick={handleCloseFilter}>Filter by Date Range</MenuItem>
                        <MenuItem onClick={handleCloseFilter}>Filter by Currency</MenuItem>
                    </Menu>

                    <Button
                        variant="contained"
                        onClick={handleRefresh}
                        startIcon={positionsLoading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
                        disabled={positionsLoading}
                    >
                        {positionsLoading ? 'Refreshing...' : 'Refresh Data'}
                    </Button>
                </Box>
            </Box>

            {positionsError && <Alert severity="error" sx={{ mb: 3 }}>Error fetching positions: {positionsError}</Alert>}

            <CashPositionSummary positions={positions || []} loading={positionsLoading} />

            <Grid container spacing={3}>
                <Grid xs={12} md={4}>
                    {positionsLoading ? (
                        <Paper elevation={3} sx={{ p: 2, height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <CircularProgress />
                        </Paper>
                    ) : (
                        <AccountList
                            positions={positions || []}
                            selectedAccount={selectedAccount}
                            onSelectAccount={setSelectedAccount}
                        />
                    )}
                </Grid>

                <Grid xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 3, minHeight: 400 }}>
                        <Typography variant="h5" gutterBottom>
                            {selectedAccount ? positions?.find(p => p.accountId === selectedAccount)?.accountName : 'Select an Account'}
                        </Typography>

                        <Tabs value={currentTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tab label="Consolidated Statement" />
                            <Tab label="Pending Transactions" />
                            <Tab label="CAMT Raw Data" disabled />
                        </Tabs>

                        <Box sx={{ pt: 2 }}>
                            {currentTab === 0 && (
                                <StatementsDetail statements={statements} loading={statementsLoading} />
                            )}
                            {currentTab === 1 && (
                                <Alert severity="warning">Pending Transactions view is under development. Filter: {statements?.[0]?.entries.filter(e => e.status === 'PDNG').length || 0} pending entries.</Alert>
                            )}
                            {currentTab === 2 && (
                                <Alert severity="info">Raw CAMT XML Viewer Coming Soon.</Alert>
                            )}
                            {statementsError && <Alert severity="error" sx={{ mt: 2 }}>Error fetching statement: {statementsError}</Alert>}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ModernTreasuryView;