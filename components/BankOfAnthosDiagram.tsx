import React from 'react';
import { PlatformState, BankOfAnthosService, ServiceStatus, BankOfAnthosDB, DBStatus } from '../types';
import { ArrowDown } from 'lucide-react';

interface BankOfAnthosDiagramProps {
    platformState: PlatformState | null;
}

const statusStyles: { [key in ServiceStatus | DBStatus]: { base: string; pulse: string } } = {
    HEALTHY: { base: 'border-green-500 bg-green-900/50', pulse: '' },
    ONLINE: { base: 'border-green-500 bg-green-900/50', pulse: '' },
    DEGRADED: { base: 'border-yellow-500 bg-yellow-900/50', pulse: 'animate-pulse' },
    RECONFIGURING: { base: 'border-yellow-500 bg-yellow-900/50', pulse: 'animate-pulse' },
    UNHEALTHY: { base: 'border-red-500 bg-red-900/50', pulse: 'animate-pulse' },
    OFFLINE: { base: 'border-red-500 bg-red-900/50', pulse: 'animate-pulse' },
};

const Node: React.FC<{ name: string; status: ServiceStatus | DBStatus; type: 'service' | 'db' }> = ({ name, status }) => {
    const style = statusStyles[status] || statusStyles.HEALTHY;
    const statusColor = status.includes('HEALTHY') || status.includes('ONLINE') ? 'text-green-400'
                      : status.includes('DEGRADED') || status.includes('RECONFIGURING') ? 'text-yellow-400'
                      : 'text-red-400';
    
    return (
        <div className={`text-center p-2 border-2 rounded-lg shadow-lg w-full ${style.base} ${style.pulse} transition-all duration-300`}>
            <p className="text-xs font-bold font-mono text-gray-200 truncate">{name}</p>
            <p className={`text-[10px] font-semibold ${statusColor}`}>{status}</p>
        </div>
    );
};

const BankOfAnthosDiagram: React.FC<BankOfAnthosDiagramProps> = ({ platformState }) => {
    if (!platformState) return null;

    const getService = (name: BankOfAnthosService) => platformState.services.find(s => s.name === name);
    const getDb = (name: BankOfAnthosDB) => platformState.databases.find(d => d.name === name);

    const frontend = getService('frontend');
    const userservice = getService('userservice');
    const accountservice = getService('accountservice');
    const transactionservice = getService('transactionservice');
    const balancereader = getService('balancereader');
    const ledgerwriter = getService('ledgerwriter');
    
    const usersDb = getDb('users-db');
    const accountsDb = getDb('accounts-db');
    const ledgerDb = getDb('ledger-db');
    
    const Connector = () => <div className="flex justify-center items-center h-6"><ArrowDown className="w-4 h-4 text-gray-500" /></div>;

    return (
        <div className="bg-gray-800/50 p-4 rounded-lg text-xs">
            <h4 className="font-semibold text-gray-300 mb-4 text-base">Service Architecture</h4>
            <div className="flex flex-col items-center">
                {/* Tier 1: Frontend */}
                <div className="w-1/2">
                  {frontend && <Node name={frontend.name} status={frontend.status} type="service" />}
                </div>
                <Connector />

                {/* Tier 2: Mid-tier services */}
                <div className="w-full grid grid-cols-3 gap-x-4 gap-y-2 items-start">
                    {/* User Service Column */}
                    <div className="flex flex-col items-center space-y-2">
                        {userservice && <Node name={userservice.name} status={userservice.status} type="service" />}
                        <Connector />
                        {usersDb && <Node name={usersDb.name} status={usersDb.status} type="db" />}
                    </div>
                    {/* Account Service Column */}
                    <div className="flex flex-col items-center space-y-2">
                         {accountservice && <Node name={accountservice.name} status={accountservice.status} type="service" />}
                         {balancereader && <Node name={balancereader.name} status={balancereader.status} type="service" />}
                         <Connector />
                         {accountsDb && <Node name={accountsDb.name} status={accountsDb.status} type="db" />}
                    </div>
                    {/* Transaction Service Column */}
                    <div className="flex flex-col items-center space-y-2">
                        {transactionservice && <Node name={transactionservice.name} status={transactionservice.status} type="service" />}
                        {ledgerwriter && <Node name={ledgerwriter.name} status={ledgerwriter.status} type="service" />}
                        <Connector />
                        {ledgerDb && <Node name={ledgerDb.name} status={ledgerDb.status} type="db" />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BankOfAnthosDiagram;
