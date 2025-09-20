import React from 'react';
import { Transaction } from '../types';
import { ArrowDownLeft, ArrowUpRight, List } from 'lucide-react';

interface TransactionsDisplayProps {
    transactions: Transaction[];
}

const TransactionsDisplay: React.FC<TransactionsDisplayProps> = ({ transactions }) => {
    return (
        <div>
             <h4 className="text-lg font-bold text-gray-200 flex items-center mb-4"><List className="w-5 h-5 mr-3 text-cyan-400" /> Transaction History</h4>
             <div className="bg-gray-900/50 rounded-lg overflow-hidden">
                <div className="flow-root">
                    <ul role="list" className="divide-y divide-gray-700">
                        {transactions.length > 0 ? (
                            transactions.map(tx => (
                                <li key={tx.transactionId} className="p-4 hover:bg-gray-800/50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <span className={`flex items-center justify-center h-8 w-8 rounded-full ${tx.type === 'CREDIT' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                                {tx.type === 'CREDIT' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-200 truncate">{tx.description}</p>
                                            <p className="text-sm text-gray-400">{tx.date}</p>
                                        </div>
                                        <div className="text-right">
                                             <p className={`text-sm font-semibold font-mono ${tx.type === 'CREDIT' ? 'text-green-400' : 'text-red-400'}`}>
                                                {tx.type === 'CREDIT' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                             <p className="text-xs text-gray-500 font-mono">
                                                Bal: ${tx.balanceAfter.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="p-6 text-center text-gray-500">
                                No transactions found for this account.
                            </li>
                        )}
                    </ul>
                </div>
             </div>
        </div>
    );
};

export default TransactionsDisplay;
