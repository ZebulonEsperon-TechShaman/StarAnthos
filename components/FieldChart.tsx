
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FieldChartProps {
    title: string;
    data: number[];
    color: string;
}

const FieldChart: React.FC<FieldChartProps> = ({ title, data, color }) => {
    const chartData = data.map((value, index) => ({
        index,
        value,
    }));

    const yDomain = [-0.5, 0.5];

    return (
        <div className="bg-gray-900/50 p-2 rounded-lg flex-grow flex flex-col">
            <h4 className="text-sm font-semibold text-gray-300 ml-4 mb-1">{title}</h4>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                        <XAxis dataKey="index" stroke="#a0aec0" fontSize={10} tick={{ fill: '#a0aec0' }} />
                        <YAxis stroke="#a0aec0" fontSize={10} domain={yDomain} tick={{ fill: '#a0aec0' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1a202c',
                                border: '1px solid #4a5568',
                                color: '#e2e8f0'
                            }}
                            labelStyle={{ color: '#a0aec0' }}
                        />
                        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default FieldChart;
