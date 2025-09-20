export enum Role {
    USER = 'user',
    BOT = 'bot',
}

export interface Message {
    role: Role;
    content: string;
}

export interface Patterns {
    variance: number;
    mean_value: number;
    stability: number;
    dominant_freq_idx: number;
}

export interface Concept {
    id: string;
    magnitude: number;
}

export interface CoreFieldState {
    primary_field: number[];
    alpha: number;
    beta: number;
    gamma: number;
    control_gain: number;
    variance_threshold: number;
    time: number;
}

export interface CognitiveSystemState {
    creativity_field: number[];
    logic_field: number[];
    deduction_field: number[];
    patterns: Patterns;
    selected_concept: Concept;
}

export type ServiceStatus = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
export type DBStatus = 'ONLINE' | 'OFFLINE' | 'RECONFIGURING';

export interface AnthosCluster {
    name: string;
    location: 'GCP' | 'On-Prem' | 'AWS';
    status: 'ONLINE' | 'OFFLINE';
}

export type BankOfAnthosService = 
    | 'frontend' 
    | 'userservice' 
    | 'accountservice' 
    | 'transactionservice' 
    | 'balancereader' 
    | 'ledgerwriter' 
    | 'contacts';

export interface MonitoredService {
    name: BankOfAnthosService;
    status: ServiceStatus;
    cluster: string;
    latency: number; // in ms
    errorRate: number; // percentage
}

export type BankOfAnthosDB = 'users-db' | 'accounts-db' | 'ledger-db';

export interface DatabaseInstance {
    name: BankOfAnthosDB;
    type: 'Primary'; // Bank of Anthos uses primary dbs
    status: DBStatus;
    cluster: string;
    activeConnections: number;
}

export interface BusinessMetrics {
    totalBalance: number;
    transactionsPerSecond: number;
    failedTransactions: number;
}

export interface PlatformState {
    clusters: AnthosCluster[];
    services: MonitoredService[];
    databases: DatabaseInstance[];
    businessMetrics: BusinessMetrics;
}

export interface PhysicsState {
    totalKineticEnergy: number;
    instabilityForce: number;
    riskScore: number;
    simulationPrompt: string;
}

// --- New User Data Types ---

export interface UserAccount {
    accountId: string;
    accountName: string;
    accountNumber: string;
    balance: number;
}

export interface Transaction {
    transactionId: string;
    date: string;
    description: string;
    amount: number;
    type: 'DEBIT' | 'CREDIT';
    balanceAfter: number;
}

export interface UserData {
    accounts: UserAccount[];
    selectedAccount: UserAccount | null;
    transactions: Transaction[];
}
