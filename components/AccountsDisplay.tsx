import React, { useState } from 'react';
import { UserAccount, Transaction } from '../types';
import { Landmark, Wallet, PlusCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import TransactionsDisplay from './TransactionsDisplay';

interface AccountsDisplayProps {
    accounts: UserAccount[];
    selectedAccount: UserAccount | null;
    transactions: Transaction[];
    isLoading: boolean;
    onSelectAccount: (accountId: string) => void;
    onDeposit: (accountId: string, amount: number) => Promise<{success: boolean, message: string}>;
}

const SkeletonLoader: React.FC = () => (
    <div className="animate-pulse space-y-6">
        <div className="h-8 w-1/2 bg-gray-700 rounded"></div>
        <div className="space-y-4">
            <div className="h-20 bg-gray-700/50 rounded-lg"></div>
            <div className="h-20 bg-gray-700/50 rounded-lg"></div>
        </div>
        <div className="h-8 w-1/3 bg-gray-700 rounded mt-6"></div>
        <div className="h-40 bg-gray-700/50 rounded-lg"></div>
    </div>
);


const DepositForm: React.FC<{ account: UserAccount, onDeposit: AccountsDisplayProps['onDeposit'] }> = ({ account, onDeposit }) => {
    const [amount, setAmount] = useState('');
    const [isDepositing, setIsDepositing] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        const depositAmount = parseFloat(amount);
        if (isNaN(depositAmount) || depositAmount <= 0) {
            setFeedback({ type: 'error', message: 'Please enter a valid positive amount.' });
            return;
        }
        
        setIsDepositing(true);
        setFeedback(null);
        
        const result = await onDeposit(account.accountId, depositAmount);
        
        if(result.success) {
            setFeedback({ type: 'success', message: result.message });
            setAmount('');
        } else {
            setFeedback({ type: 'error', message: result.message });
        }
        
        setIsDepositing(false);
        setTimeout(() => setFeedback(null), 5000);
    };

    return (
        <div className="mt-4 bg-gray-900/50 p-4 rounded-lg">
            <form onSubmit={handleDeposit} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex-grow w-full">
                    <label htmlFor="deposit-amount" className="sr-only">Deposit Amount</label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-400">$</span>
                        </div>
                        <input
                            type="number"
                            id="deposit-amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Amount"
                            className="w-full bg-gray-700 border-gray-600 rounded-md py-2 pl-7 pr-12 focus:ring-cyan-500 focus:border-cyan-500"
                            min="0.01"
                            step="0.01"
                            disabled={isDepositing}
                        />
                    </div>
                </div>
                <button 
                    type="submit"
                    className="w-full sm:w-auto flex justify-center items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-cyan-800 disabled:cursor-not-allowed"
                    disabled={isDepositing}
                >
                    <PlusCircle size={18} />
                    {isDepositing ? 'Depositing...' : 'Deposit Funds'}
                </button>
            </form>
            {feedback && (
                <div className={`mt-3 p-2 rounded-md text-sm flex items-center gap-2 ${feedback.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                    {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    {feedback.message}
                </div>
            )}
        </div>
    );
};

const AccountsDisplay: React.FC<AccountsDisplayProps> = ({ accounts, selectedAccount, transactions, isLoading, onSelectAccount, onDeposit }) => {

    if (isLoading) {
        return <SkeletonLoader />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-200 flex items-center mb-4"><Landmark className="w-6 h-6 mr-3 text-cyan-400" /> Your Accounts</h3>
                <div className="space-y-3">
                    {accounts.map(account => (
                        <button 
                            key={account.accountId} 
                            onClick={() => onSelectAccount(account.accountId)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedAccount?.accountId === account.accountId ? 'bg-gray-700/80 border-cyan-500' : 'bg-gray-800/50 border-transparent hover:border-gray-600'}`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-100">{account.accountName}</p>
                                    <p className="text-sm text-gray-400 font-mono">{account.accountNumber}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400">Balance</p>
                                    <p className="text-xl font-mono font-semibold text-green-400">
                                        ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {selectedAccount && (
                <div>
                    <div className="border-t border-gray-700 pt-6">
                         <h3 className="text-xl font-bold text-gray-200 flex items-center mb-4"><Wallet className="w-6 h-6 mr-3 text-cyan-400" /> Account Details</h3>
                         <DepositForm account={selectedAccount} onDeposit={onDeposit} />
                    </div>

                    <div className="border-t border-gray-700 pt-6 mt-6">
                         <TransactionsDisplay transactions={transactions} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountsDisplay;
