
import React from 'react';
import { PlatformState, ServiceStatus, DBStatus } from '../types';
import { Server, ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, Cloud, HardDrive, Database, Zap, AlertCircle, BarChart, GitCommitHorizontal, DollarSign, Activity, XCircle } from 'lucide-react';

interface PlatformMonitorDisplayProps {
    platformState: PlatformState | null;
    isLoading: boolean;
    error: string | null;
}

const serviceStatusConfig = {
    HEALTHY: { Icon: ShieldCheck, color: 'text-green-400' },
    DEGRADED: { Icon: ShieldAlert, color: 'text-yellow-400' },
    UNHEALTHY: { Icon: ShieldX, color: 'text-red-400' },
};

const dbStatusConfig = {
    ONLINE: { Icon: ShieldCheck, color: 'text-green-400' },
    OFFLINE: { Icon: ShieldX, color: 'text-red-400' },
    RECONFIGURING: { Icon: ShieldAlert, color: 'text-yellow-400' },
};

const SkeletonLoader: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-6 w-3/4 bg-gray-700 rounded mb-3"></div>
        <div className="bg-gray-800/50 p-3 rounded-lg h-20"></div>
        <div className="h-6 w-1/2 bg-gray-700 rounded mb-3 mt-4"></div>
        <div className="bg-gray-800/50 p-3 rounded-lg h-24"></div>
        <div className="h-6 w-1/3 bg-gray-700 rounded mb-3 mt-4"></div>
        <div className="bg-gray-800/50 p-3 rounded-lg h-16"></div>
    </div>
);

const PlatformMonitorDisplay: React.FC<PlatformMonitorDisplayProps> = ({ platformState, isLoading, error }) => {
    if (isLoading && !platformState) {
        return <SkeletonLoader />;
    }

    if (error) {
        return (
            <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <div>
                    <h4 className="font-bold">Connection Error</h4>
                    <p className="text-xs mt-1">{error}</p>
                </div>
            </div>
        );
    }
    
    if (!platformState) {
        return null;
    }

    const { clusters, services, databases, businessMetrics } = platformState;

    return (
        <div className="space-y-5 text-sm">
             <div>
                <h4 className="font-semibold text-gray-300 mb-2 flex items-center"><DollarSign className="w-4 h-4 mr-2" />Business KPIs</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="bg-gray-800/50 p-2 rounded-lg text-center">
                        <p className="text-xs text-gray-400">Total Balance</p>
                        <p className="font-mono text-lg text-green-400">${businessMetrics.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                     <div className="bg-gray-800/50 p-2 rounded-lg text-center">
                        <p className="text-xs text-gray-400 flex items-center justify-center"><Activity className="w-3 h-3 mr-1"/>Transactions/sec</p>
                        <p className="font-mono text-lg text-cyan-300">{businessMetrics.transactionsPerSecond}</p>
                    </div>
                     <div className="bg-gray-800/50 p-2 rounded-lg text-center">
                        <p className="text-xs text-gray-400 flex items-center justify-center"><XCircle className="w-3 h-3 mr-1"/>Failed Transactions</p>
                        <p className={`font-mono text-lg ${businessMetrics.failedTransactions > 0 ? 'text-red-400 animate-pulse' : 'text-gray-300'}`}>{businessMetrics.failedTransactions}</p>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-gray-300 mb-2 flex items-center"><HardDrive className="w-4 h-4 mr-2" />Anthos Clusters</h4>
                <div className="grid grid-cols-2 gap-2">
                    {clusters.map(cluster => (
                        <div key={cluster.name} className="bg-gray-800/50 p-2 rounded-lg flex items-center space-x-2">
                             {cluster.location === 'GCP' ? <Cloud className="w-4 h-4 text-blue-400" /> : <Server className="w-4 h-4 text-purple-400" />}
                            <div>
                                <p className="font-mono text-xs text-gray-300">{cluster.name}</p>
                                <p className={`text-xs font-bold ${cluster.status === 'ONLINE' ? 'text-green-400' : 'text-red-400'}`}>{cluster.status}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-gray-300 mb-2 flex items-center"><Zap className="w-4 h-4 mr-2" />Microservices</h4>
                <div className="space-y-2">
                    {services.map(service => {
                        const { Icon, color } = serviceStatusConfig[service.status];
                        return (
                             <div key={service.name} className="bg-gray-800/50 p-2 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <Icon className={`w-5 h-5 ${color}`} />
                                        <span className="font-mono text-gray-300">{service.name}</span>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${color} ${serviceStatusConfig[service.status].color.replace('text','bg')}/20`}>{service.status}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 mt-2 text-xs text-gray-400 pl-7">
                                    <div className="flex items-center space-x-1" title="Average Latency"><BarChart className="w-3 h-3"/><span>{service.latency.toFixed(0)} ms</span></div>
                                    <div className="flex items-center space-x-1" title="Error Rate"><AlertCircle className="w-3 h-3"/><span>{service.errorRate.toFixed(2)}%</span></div>
                                </div>
                             </div>
                        );
                    })}
                </div>
            </div>
            
            <div>
                <h4 className="font-semibold text-gray-300 mb-2 flex items-center"><Database className="w-4 h-4 mr-2" />PostgreSQL Databases</h4>
                <div className="space-y-2">
                    {databases.map(db => {
                        const { Icon, color } = dbStatusConfig[db.status];
                        return (
                            <div key={db.name} className="bg-gray-800/50 p-2 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <Icon className={`w-5 h-5 ${color}`} />
                                        <div>
                                            <span className="font-mono text-gray-300">{db.name}</span>
                                            <span className="text-xs text-gray-500 ml-2">{db.type}</span>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${color} ${dbStatusConfig[db.status].color.replace('text','bg')}/20`}>{db.status}</span>
                                </div>
                                {/* FIX: Removed invalid code that checked for a 'Replica' database. The data model only supports 'Primary' databases and does not have a 'replicationLag' property. */}
                                <div className="grid grid-cols-2 gap-x-4 mt-2 text-xs text-gray-400 pl-7">
                                    <div className="flex items-center space-x-1" title="Active Connections"><GitCommitHorizontal className="w-3 h-3"/><span>{db.activeConnections}</span></div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

        </div>
    );
};

export default PlatformMonitorDisplay;