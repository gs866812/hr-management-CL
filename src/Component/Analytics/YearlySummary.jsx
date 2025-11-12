import { useContext, useEffect, useMemo, useState } from 'react';
import { ContextData } from '../../DataProvider';
import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Sector,
    Tooltip,
} from 'recharts';

const COLORS = ['#FF8042', '#8884d8', '#82ca9d'];

export default function YearlySummary() {
    const {
        unpaidAmount = 0,
        sharedProfit = 0,
        mainBalance = 0, // Revenue
        totalProfit = 0, // Profit
        totalExpense = 0, // Expense
    } = useContext(ContextData);

    const [loanBalance, setLoanBalance] = useState(0);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_BASE_URL}/loans/get-loan-balance`
                );
                const result = await res.json();
                setLoanBalance(
                    result?.success && result?.data?.total
                        ? Number(result.data.total)
                        : 0
                );
            } catch {
                setLoanBalance(0);
            }
        })();
    }, []);

    const finalAmount = useMemo(() => {
        const f =
            Number(totalProfit) +
            Number(loanBalance) -
            Number(sharedProfit) -
            Number(unpaidAmount);
        return isFinite(f) ? f : 0;
    }, [totalProfit, loanBalance, sharedProfit, unpaidAmount]);

    const formatNumber = (num) =>
        Number(num || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const pieData = useMemo(
        () => [
            { name: 'Expense', value: Math.max(0, Number(totalExpense)) },
            { name: 'Earnings', value: Math.max(0, Number(mainBalance)) },
            { name: 'Profit', value: Math.abs(Number(totalProfit)) },
        ],
        [totalExpense, mainBalance, totalProfit]
    );

    const [activeIndex, setActiveIndex] = useState(0);

    const renderActiveShape = (props) => {
        const RAD = Math.PI / 180;
        const {
            cx,
            cy,
            midAngle,
            innerRadius,
            outerRadius,
            startAngle,
            endAngle,
            fill,
            payload,
            percent,
            value,
        } = props;
        const sin = Math.sin(-RAD * midAngle);
        const cos = Math.cos(-RAD * midAngle);
        const sx = cx + (outerRadius + 10) * cos;
        const sy = cy + (outerRadius + 10) * sin;
        const mx = cx + (outerRadius + 30) * cos;
        const my = cy + (outerRadius + 30) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 22;
        const ey = my;
        const textAnchor = cos >= 0 ? 'start' : 'end';

        return (
            <g>
                <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
                    {payload.name}
                </text>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={outerRadius + 6}
                    outerRadius={outerRadius + 10}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
                <path
                    d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
                    stroke={fill}
                    fill="none"
                />
                <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
                <text
                    x={ex + (cos >= 0 ? 1 : -1) * 12}
                    y={ey}
                    textAnchor={textAnchor}
                    fill="#333"
                >
                    {`${formatNumber(value)} BDT`}
                </text>
                <text
                    x={ex + (cos >= 0 ? 1 : -1) * 12}
                    y={ey}
                    dy={18}
                    textAnchor={textAnchor}
                    fill="#999"
                >
                    {`(${(percent * 100).toFixed(2)}%)`}
                </text>
            </g>
        );
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="grid grid-cols-3 justify-between gap-6">
                {/* Left: Cards */}
                <div className="col-span-2">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        📅 Yearly Summary
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Revenue */}
                        <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 shadow-sm">
                            <h4 className="text-lg font-semibold text-purple-800 mb-1">
                                💼 Revenue
                            </h4>
                            <p className="text-3xl font-bold text-purple-700">
                                {formatNumber(mainBalance)}{' '}
                                <span className="text-sm">BDT</span>
                            </p>
                        </div>

                        {/* Expense */}
                        <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200 shadow-sm">
                            <h4 className="text-lg font-semibold text-orange-800 mb-1">
                                💸 Expense
                            </h4>
                            <p className="text-3xl font-bold text-orange-700">
                                {formatNumber(totalExpense)}{' '}
                                <span className="text-sm">BDT</span>
                            </p>
                        </div>

                        {/* Profit */}
                        <div
                            className={`rounded-xl p-5 shadow-sm border ${
                                totalProfit >= 0
                                    ? 'bg-linear-to-br from-green-50 to-green-100 border-green-200'
                                    : 'bg-linear-to-br from-red-50 to-red-100 border-red-200'
                            }`}
                        >
                            <h4
                                className={`text-lg font-semibold mb-1 ${
                                    totalProfit >= 0
                                        ? 'text-green-800'
                                        : 'text-red-800'
                                }`}
                            >
                                📈 Profit
                            </h4>
                            <p
                                className={`text-3xl font-bold ${
                                    totalProfit >= 0
                                        ? 'text-green-700'
                                        : 'text-red-700'
                                }`}
                            >
                                {formatNumber(totalProfit)}{' '}
                                <span className="text-sm">BDT</span>
                            </p>
                        </div>

                        {/* Unpaid */}
                        <div className="bg-linear-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 border border-yellow-200">
                            <h4 className="text-lg font-semibold text-yellow-800 mb-1">
                                🧾 Unpaid
                            </h4>
                            <p className="text-3xl font-bold text-yellow-700">
                                {formatNumber(unpaidAmount)}{' '}
                                <span className="text-sm">BDT</span>
                            </p>
                        </div>

                        {/* Shared */}
                        <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
                            <h4 className="text-lg font-semibold text-orange-800 mb-1">
                                🤝 Shared
                            </h4>
                            <p className="text-3xl font-bold text-orange-700">
                                {formatNumber(sharedProfit)}{' '}
                                <span className="text-sm">BDT</span>
                            </p>
                        </div>

                        {/* Final Amount */}
                        <div
                            className={`rounded-xl p-5 shadow-sm border ${
                                finalAmount >= 0
                                    ? 'bg-linear-to-br from-violet-50 to-violet-100 border-violet-200'
                                    : 'bg-linear-to-br from-rose-50 to-rose-100 border-rose-200'
                            }`}
                        >
                            <h4
                                className={`text-lg font-semibold mb-1 ${
                                    finalAmount >= 0
                                        ? 'text-violet-700'
                                        : 'text-rose-700'
                                }`}
                            >
                                💰 Final Amount
                            </h4>
                            <p className="text-sm text-gray-500 mb-1">
                                ({formatNumber(totalProfit)} +{' '}
                                {formatNumber(loanBalance)} -{' '}
                                {formatNumber(unpaidAmount)} -{' '}
                                {formatNumber(sharedProfit)}) =
                            </p>
                            <p
                                className={`text-3xl font-bold ${
                                    finalAmount >= 0
                                        ? 'text-violet-600'
                                        : 'text-rose-600'
                                }`}
                            >
                                {formatNumber(finalAmount)}{' '}
                                <span className="text-sm">BDT</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Pie */}
                <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-4 shadow-sm border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">
                        📊 Distribution
                    </h4>
                    <div className="w-full h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    onMouseEnter={(_, i) => setActiveIndex(i)}
                                    fill="#8884d8"
                                >
                                    {pieData.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={COLORS[i % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(v) => `${formatNumber(v)} BDT`}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
