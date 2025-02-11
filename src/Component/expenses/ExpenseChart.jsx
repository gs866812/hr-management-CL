import React, { useState } from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';
import { ChevronDown } from 'lucide-react';

const data = [
    { name: 'Jan', expenses: 32000 },
    { name: 'Feb', expenses: 28000 },
    { name: 'Mar', expenses: 42000 },
    { name: 'Apr', expenses: 35000 },
    { name: 'May', expenses: 39000 },
    { name: 'Jun', expenses: 45000 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                <p className="text-gray-600 font-medium mb-1">{label}</p>
                <p className="text-lg font-bold text-[#6E3FF3]">
                    ${payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

const ExpenseChart = () => {
    const [timePeriod, setTimePeriod] = useState('Month');
    const [isOpen, setIsOpen] = useState(false);

    const periods = ['Day', 'Month', 'Year'];

    return (
        <div className="bg-white col-span-3 rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-gray-800 text-lg font-semibold">
                        Expenses Overview
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                        Monthly expense analysis
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full bg-[#6E3FF3]" />
                        <span className="text-gray-600">Current Year</span>
                    </div>

                    {/* Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6E3FF3]"
                        >
                            {timePeriod}
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        {isOpen && (
                            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-100 rounded-lg shadow-lg z-10">
                                {periods.map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => {
                                            setTimePeriod(period);
                                            setIsOpen(false);
                                        }}
                                        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left first:rounded-t-lg last:rounded-b-lg"
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={220}>
                <BarChart
                    data={data}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f0f0f0"
                    />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#666666' }}
                    />
                    <YAxis
                        domain={[0, 50000]}
                        ticks={[0, 10000, 20000, 30000, 40000, 50000]}
                        tickFormatter={(value) => `${value / 1000}k`}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#666666' }}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'rgba(110, 63, 243, 0.1)' }}
                    />
                    <Bar
                        dataKey="expenses"
                        fill="#6E3FF3"
                        name="Expenses"
                        radius={[10, 10, 0, 0]}
                        barSize={40}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ExpenseChart;
