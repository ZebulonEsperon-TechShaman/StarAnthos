import { PlatformState, UserAccount, Transaction } from '../types';

// --- MOCK DATA FOR DEVELOPMENT FALLBACK ---

// This mock data is used ONLY when the live API endpoints are unavailable.
const mockAccounts: UserAccount[] = [
    { accountId: 'acc-checking-001', accountName: 'Checking Account', accountNumber: '****-****-****-1111', balance: 25430.50 },
    { accountId: 'acc-savings-002', accountName: 'Savings Account', accountNumber: '****-****-****-2222', balance: 110250.00 },
];

let mockTransactions: { [key: string]: Transaction[] } = {
    'acc-checking-001': [
        { transactionId: 'tx-1', date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], description: 'Online Store Purchase', amount: -150.25, type: 'DEBIT', balanceAfter: 25430.50 },
        { transactionId: 'tx-2', date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], description: 'Salary Deposit', amount: 5000.00, type: 'CREDIT', balanceAfter: 25580.75 },
        { transactionId: 'tx-3', date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], description: 'Restaurant', amount: -85.00, type: 'DEBIT', balanceAfter: 20580.75 },
        { transactionId: 'tx-4', date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], description: 'ATM Withdrawal', amount: -200.00, type: 'DEBIT', balanceAfter: 20665.75 },
    ],
    'acc-savings-002': [
        { transactionId: 'tx-5', date: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0], description: 'Interest Payment', amount: 150.00, type: 'CREDIT', balanceAfter: 110250.00 },
        { transactionId: 'tx-6', date: new Date(Date.now() - 23 * 86400000).toISOString().split('T')[0], description: 'Transfer from Checking', amount: 1000.00, type: 'CREDIT', balanceAfter: 110100.00 },
    ],
};

const mockPlatformState: PlatformState = {
    clusters: [
        { name: 'gcp-cluster-1', location: 'GCP', status: 'ONLINE' },
        { name: 'onprem-cluster-2', location: 'On-Prem', status: 'ONLINE' },
    ],
    services: [
        { name: 'frontend', status: 'HEALTHY', cluster: 'gcp-cluster-1', latency: 55, errorRate: 0.1 },
        { name: 'userservice', status: 'HEALTHY', cluster: 'gcp-cluster-1', latency: 110, errorRate: 0.2 },
        { name: 'accountservice', status: 'DEGRADED', cluster: 'onprem-cluster-2', latency: 450, errorRate: 2.5 },
        { name: 'transactionservice', status: 'HEALTHY', cluster: 'onprem-cluster-2', latency: 200, errorRate: 0.5 },
        { name: 'balancereader', status: 'HEALTHY', cluster: 'gcp-cluster-1', latency: 80, errorRate: 0.15 },
        { name: 'ledgerwriter', status: 'HEALTHY', cluster: 'onprem-cluster-2', latency: 150, errorRate: 0.3 },
        { name: 'contacts', status: 'HEALTHY', cluster: 'gcp-cluster-1', latency: 60, errorRate: 0.05 },
    ],
    databases: [
        { name: 'users-db', type: 'Primary', status: 'ONLINE', cluster: 'gcp-cluster-1', activeConnections: 150 },
        { name: 'accounts-db', type: 'Primary', status: 'RECONFIGURING', cluster: 'onprem-cluster-2', activeConnections: 250 },
        { name: 'ledger-db', type: 'Primary', status: 'ONLINE', cluster: 'onprem-cluster-2', activeConnections: 400 },
    ],
    businessMetrics: {
        totalBalance: mockAccounts.reduce((sum, acc) => sum + acc.balance, 0),
        transactionsPerSecond: 125,
        failedTransactions: 8,
    },
};

// --- API Service Functions ---

/**
 * Fetches the live platform state from the backend.
 * Falls back to mock data if the API call fails.
 */
export const fetchPlatformState = async (): Promise<PlatformState> => {
    try {
        const response = await fetch('/api/v1/platform/state');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.warn('Live API fetch failed for platform state. Falling back to mock data.', error);
        // Simulate network delay for a realistic loading experience
        await new Promise(res => setTimeout(res, 500));
        // Make mock data slightly dynamic
        mockPlatformState.businessMetrics.transactionsPerSecond = Math.floor(100 + Math.random() * 50);
        mockPlatformState.businessMetrics.failedTransactions = Math.floor(Math.random() * 10);
        const accountService = mockPlatformState.services.find(s => s.name === 'accountservice');
        if (accountService) {
            accountService.latency = 300 + Math.random() * 300;
        }
        return JSON.parse(JSON.stringify(mockPlatformState)); // Return a deep copy
    }
};

/**
 * Fetches the user's bank accounts from the backend.
 * Falls back to mock data if the API call fails.
 */
export const fetchUserAccounts = async (): Promise<UserAccount[]> => {
    try {
        const response = await fetch('/api/v1/user/accounts');
        if (!response.ok) {
            throw new Error('Failed to fetch user accounts.');
        }
        return await response.json();
    } catch (error) {
        console.warn('Live API fetch failed for user accounts. Falling back to mock data.', error);
        await new Promise(res => setTimeout(res, 300));
        return JSON.parse(JSON.stringify(mockAccounts)); // Return a deep copy
    }
};

/**
 * Fetches the transaction history for a specific account from the backend.
 * Falls back to mock data if the API call fails.
 */
export const fetchTransactionsForAccount = async (accountId: string): Promise<Transaction[]> => {
    try {
        const response = await fetch(`/api/v1/accounts/${accountId}/transactions`);
        if (!response.ok) {
            throw new Error(`Failed to fetch transactions for account ${accountId}.`);
        }
        return await response.json();
    } catch (error) {
        console.warn(`Live API fetch failed for transactions of account ${accountId}. Falling back to mock data.`, error);
        await new Promise(res => setTimeout(res, 400));
        return mockTransactions[accountId] || [];
    }
};

/**
 * Submits a deposit request to the backend.
 * Falls back to simulating the deposit on mock data if the API call fails.
 */
export const submitDeposit = async (accountId: string, amount: number): Promise<UserAccount> => {
    try {
        const response = await fetch(`/api/v1/accounts/${accountId}/deposit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Deposit failed due to a server error.' }));
            throw new Error(errorData.message || 'Deposit failed. Please try again later.');
        }
        return await response.json();
    } catch (error) {
        console.warn(`Live API call for deposit failed. Simulating on mock data for account ${accountId}.`, error);
        await new Promise(res => setTimeout(res, 600));

        const account = mockAccounts.find(acc => acc.accountId === accountId);
        if (!account) {
             throw new Error("Account not found in mock data.");
        }

        // Simulate failure if a relevant service is unhealthy in the mock state
        const relevantService = mockPlatformState.services.find(s => s.name === 'transactionservice' || s.name === 'accountservice');
        if (relevantService?.status === 'UNHEALTHY') {
             throw new Error("Deposit failed: The transaction service is currently unavailable.");
        }
        
        account.balance += amount;
        
        // Add a new transaction to the mock history
        const newTransaction: Transaction = {
            transactionId: `tx-mock-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            description: 'Mock Deposit',
            amount: amount,
            type: 'CREDIT',
            balanceAfter: account.balance,
        };
        
        if (mockTransactions[accountId]) {
            mockTransactions[accountId].unshift(newTransaction);
        } else {
            mockTransactions[accountId] = [newTransaction];
        }
        
        return JSON.parse(JSON.stringify(account)); // Return updated account as a deep copy
    }
};