import React, { useState } from 'react';
import { CoreFieldState, CognitiveSystemState, PlatformState, PhysicsState, UserAccount, Transaction } from '../types';
import FieldChart from './FieldChart';
import { BrainCircuit, Server, User, Activity } from 'lucide-react';
import PlatformMonitorDisplay from './PlatformMonitorDisplay';
import PhysicsDisplay from './PhysicsDisplay';
import BankOfAnthosDiagram from './BankOfAnthosDiagram';
import AccountsDisplay from './AccountsDisplay';

interface MainDashboardProps {
    coreState: CoreFieldState;
    cognitiveState: CognitiveSystemState;
    platformState: PlatformState | null;
    isPlatformLoading: boolean;
    platformError: string | null;
    physicsState: PhysicsState | null;
    accounts: UserAccount[];
    selectedAccount: UserAccount | null;
    transactions: Transaction[];
    isUserDataLoading: boolean;
    onSelectAccount: (accountId: string) => void;
    onDeposit: (accountId: string, amount: number) => Promise<{success: boolean, message: string}>;
}

type View = 'health' | 'accounts';

const MetricCard: React.FC<{ title: string; value: string | number; color: string }> = ({ title, value, color }) => (
    <div className="bg-gray-800 p-3 rounded-lg flex-1 text-center shadow-md">
        <p className="text-sm text-gray-400">{title}</p>
        <p className={`text-xl font-bold ${color}`}>{typeof value === 'number' ? value.toFixed(4) : value}</p>
    </div>
);

const MainDashboard: React.FC<MainDashboardProps> = (props) => {
    const { coreState, cognitiveState, platformState, isPlatformLoading, platformError, physicsState } = props;
    const [activeView, setActiveView] = useState<View>('accounts');

    const TabButton: React.FC<{ view: View; label: string; icon: React.ReactNode }> = ({ view, label, icon }) => (
        <button
            onClick={() => setActiveView(view)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeView === view
                    ? 'bg-gray-800 text-cyan-300 border-b-2 border-cyan-300'
                    : 'text-gray-400 hover:bg-gray-800/50'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col h-full w-full bg-gray-900/50 rounded-lg overflow-hidden">
            <header className="p-4 border-b border-gray-700">
                 <h2 className="text-2xl font-bold text-cyan-300">Bank of Anthos Dashboard</h2>
            </header>
            
            <div className="flex-shrink-0 border-b border-gray-700 px-4">
                <nav className="flex space-x-2">
                    <TabButton view="accounts" label="Customer Accounts" icon={<User size={16} />} />
                    <TabButton view="health" label="Platform Health" icon={<Activity size={16} />} />
                </nav>
            </div>
            
            <div className="flex-grow p-4 overflow-y-auto bg-gray-800">
                {activeView === 'health' && (
                    <div className="space-y-4">
                        <div className="bg-gray-900/50 p-4 rounded-lg space-y-3">
                            <h3 className="font-bold text-lg text-gray-200 flex items-center"><BrainCircuit className="w-5 h-5 mr-2 text-purple-400" />AI Internal State</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <MetricCard title="Stability" value={cognitiveState.patterns.stability} color="text-green-400" />
                                <MetricCard title="System Flux" value={cognitiveState.patterns.variance} color="text-yellow-400" />
                                <MetricCard title="System Baseline" value={cognitiveState.patterns.mean_value} color="text-blue-400" />
                                <MetricCard title="Cycles" value={coreState.time.toFixed(2)} color="text-gray-300" />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Current Directive:</span>
                                <span className="font-mono bg-purple-900/50 text-purple-300 px-2 py-1 rounded">{cognitiveState.selected_concept.id}</span>
                            </div>
                        </div>

                        <PhysicsDisplay physicsState={physicsState} />

                        <div className="bg-gray-900/50 p-4 rounded-lg space-y-4">
                             <h3 className="font-bold text-lg text-gray-200 flex items-center"><Server className="w-5 h-5 mr-2 text-teal-400" />Anthos Platform Overview</h3>
                             {!isPlatformLoading && !platformError && platformState && <BankOfAnthosDiagram platformState={platformState} />}
                             <PlatformMonitorDisplay 
                                platformState={platformState}
                                isLoading={isPlatformLoading}
                                error={platformError}
                             />
                        </div>
                        
                        <div className="flex-grow flex flex-col space-y-2 min-h-[300px]">
                            <FieldChart title="Primary Operational Field" data={coreState.primary_field} color="#22d3ee" />
                            <FieldChart title="Decision Field" data={cognitiveState.deduction_field} color="#c084fc" />
                        </div>
                    </div>
                )}
                {activeView === 'accounts' && (
                   <AccountsDisplay 
                     accounts={props.accounts}
                     selectedAccount={props.selectedAccount}
                     transactions={props.transactions}
                     isLoading={props.isUserDataLoading}
                     onSelectAccount={props.onSelectAccount}
                     onDeposit={props.onDeposit}
                   />
                )}
            </div>
        </div>
    );
};

export default MainDashboard;
