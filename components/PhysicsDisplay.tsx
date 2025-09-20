import React from 'react';
import { PhysicsState } from '../types';
import { Atom, TrendingUp, Wind, ShieldAlert } from 'lucide-react';

interface PhysicsDisplayProps {
    physicsState: PhysicsState | null;
}

const Metric: React.FC<{ icon: React.ReactNode; title: string; value: string; color: string, tooltip: string }> = ({ icon, title, value, color, tooltip }) => (
    <div className="bg-gray-800/60 p-3 rounded-lg flex items-center space-x-3 shadow-md" title={tooltip}>
        <div className={`p-2 rounded-full bg-gray-900 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
        </div>
    </div>
);


const PhysicsDisplay: React.FC<PhysicsDisplayProps> = ({ physicsState }) => {
    if (!physicsState) {
        return (
            <div className="bg-gray-900/50 p-4 rounded-lg animate-pulse">
                <div className="h-5 w-3/4 bg-gray-700 rounded mb-3"></div>
                <div className="h-4 w-full bg-gray-700 rounded"></div>
            </div>
        );
    }
    
    const { totalKineticEnergy, instabilityForce, riskScore, simulationPrompt } = physicsState;

    const getRiskColor = (score: number) => {
        if (score > 0.7) return 'text-red-400';
        if (score > 0.4) return 'text-yellow-400';
        return 'text-green-400';
    };

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg space-y-3">
            <h3 className="font-bold text-lg text-gray-200 flex items-center"><Atom className="w-5 h-5 mr-2 text-cyan-400" />System Dynamics Analysis</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Metric 
                    icon={<TrendingUp size={20} />} 
                    title="Kinetic Energy" 
                    value={totalKineticEnergy.toFixed(0)} 
                    color="text-yellow-400"
                    tooltip="Represents rate of change in latency. High energy means rapid fluctuations."
                />
                <Metric 
                    icon={<Wind size={20} />} 
                    title="Instability Force" 
                    value={instabilityForce.toFixed(2)} 
                    color="text-orange-400"
                    tooltip="Represents the magnitude of increasing error rates pushing the system towards instability."
                />
                <Metric 
                    icon={<ShieldAlert size={20} />} 
                    title="Risk Score" 
                    value={riskScore.toFixed(3)} 
                    color={getRiskColor(riskScore)}
                    tooltip="Overall system stability risk, from 0 (stable) to 1 (critical)."
                />
            </div>
             <div className="text-xs text-gray-400 pt-2">
                <p className="font-semibold text-gray-300">Simulation Summary:</p>
                <p>{simulationPrompt}</p>
            </div>
        </div>
    );
};

export default PhysicsDisplay;