import React, { useContext, useEffect, useMemo, useState } from 'react';
import { IoMdAdd } from 'react-icons/io';
import AddMainBalanceModal from './AddMainBalanceModal';
import { ContextData } from '../../DataProvider';
import {
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Line,
    LabelList,
} from 'recharts';

const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const monthIndex = Object.fromEntries(
    MONTHS.map((m, i) => [m.toLowerCase(), i])
);

const formatNumber = (num) =>
    Number(num || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const AdminDashboard = () => {
    const {
        user,
        mainBalance,
        totalProfit,
        totalExpense,
        unpaidAmount = 0,
        sharedProfit = 0,
        monthlyProfit = [],
    } = useContext(ContextData);

    // ====== Build chart data from monthlyProfit only ======
    const currentYear = new Date().getFullYear().toString();

    const analyticsData = useMemo(() => {
        const base = MONTHS.map((m) => ({
            month: m,
            expense: 0,
            earnings: 0,
            profit: 0,
        }));

        if (Array.isArray(monthlyProfit)) {
            for (const row of monthlyProfit) {
                const year = String(row?.year ?? currentYear);
                if (year !== currentYear) continue;

                const idx = monthIndex[String(row?.month || '').toLowerCase()];
                if (idx == null) continue;

                const e = Number(row?.expense || 0);
                const earn = Number(row?.earnings || 0);
                const p = Number(row?.profit || earn - e);

                base[idx].expense += e;
                base[idx].earnings += earn;
                base[idx].profit += p;
            }
        }

        return base.map((d) => ({
            ...d,
            expense: +d.expense.toFixed(2),
            earnings: +d.earnings.toFixed(2),
            profit: +(d.earnings - d.expense).toFixed(2),
        }));
    }, [monthlyProfit, currentYear]);

    // ===== Label renderers =====
    const renderBarLabel = ({ x, y, width, value }) => (
        <text
            x={x + width / 2}
            y={y - 10}
            fill="#333"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
        >
            {formatNumber(value)}
        </text>
    );

    const renderProfitLabel = ({ x, y, value }) => (
        <g>
            <rect
                x={x - 25}
                y={y - 18}
                width="50"
                height="16"
                fill="#ecf0f1"
                rx="4"
                ry="4"
                opacity="0.8"
            />
            <text
                x={x}
                y={y - 10}
                fill={value >= 0 ? '#006400' : '#cc0000'}
                textAnchor="middle"
                fontWeight="bold"
                fontSize="11"
            >
                {formatNumber(value)}
            </text>
        </g>
    );

    // ===== Calculations =====
    const totalShared = (monthlyProfit || []).reduce(
        (sum, m) =>
            sum +
            (Array.isArray(m.shared)
                ? m.shared.reduce((s, i) => s + (i.amount || 0), 0)
                : 0),
        0
    );

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

    // ===== Modal =====
    const handleAddBalance = () => {
        const el = document.getElementById('addMainBalance');
        if (el && typeof el.showModal === 'function') el.showModal();
        else
            console.warn('Modal element not found or showModal not available.');
    };

    // ===== Render =====
    return (
        <div className="p-4">
            {/* ===== Header Button ===== */}
            <section className="flex justify-end mb-4">
                <button
                    onClick={handleAddBalance}
                    className="border-l border-r border-b rounded-b-xl px-3 py-1 bg-[#6E3FF3] text-white flex items-center gap-1"
                >
                    <IoMdAdd /> Add Balance
                </button>
            </section>

            {/* ===== Yearly Summary ===== */}
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                📅 Yearly Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {/* Main Balance */}
                <SummaryCard
                    title="💼 Revenue"
                    color="purple"
                    value={mainBalance}
                />
                <SummaryCard
                    title="💸 Expense"
                    color="orange"
                    value={totalExpense}
                />
                <SummaryCard
                    title="📈 Profit"
                    color={totalProfit >= 0 ? 'green' : 'red'}
                    value={totalProfit}
                />
                <SummaryCard
                    title="🧾 Unpaid"
                    color="yellow"
                    value={unpaidAmount}
                />
                <SummaryCard
                    title="🤝 Shared"
                    color="orange"
                    value={sharedProfit || totalShared}
                />
                <SummaryCard
                    title="💰 Final Amount"
                    color={finalAmount >= 0 ? 'violet' : 'rose'}
                    value={finalAmount}
                />
            </div>

            {/* ===== Chart ===== */}
            <div className="card bg-base-100 shadow-xl border border-black/10">
                <div className="card-body">
                    <h2 className="card-title text-xl font-bold mb-4">
                        Monthly Financial Analytics
                    </h2>

                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={analyticsData}
                                margin={{
                                    top: 40,
                                    right: 30,
                                    left: 20,
                                    bottom: 20,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                    formatter={(v) => `${formatNumber(v)} BDT`}
                                />
                                <Legend wrapperStyle={{ bottom: 0 }} />

                                <Bar
                                    dataKey="expense"
                                    fill="#FF8042"
                                    name="Expense"
                                >
                                    <LabelList
                                        dataKey="expense"
                                        position="top"
                                        content={renderBarLabel}
                                    />
                                </Bar>

                                <Bar
                                    dataKey="earnings"
                                    fill="#8884d8"
                                    name="Earnings"
                                >
                                    <LabelList
                                        dataKey="earnings"
                                        position="top"
                                        content={renderBarLabel}
                                    />
                                </Bar>

                                <Line
                                    type="monotone"
                                    dataKey="profit"
                                    stroke="#82ca9d"
                                    strokeWidth={3}
                                    name="Profit"
                                    dot={{
                                        stroke: '#82ca9d',
                                        strokeWidth: 2,
                                        r: 4,
                                        fill: '#fff',
                                    }}
                                >
                                    <LabelList
                                        dataKey="profit"
                                        position="top"
                                        content={renderProfitLabel}
                                    />
                                </Line>
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <AddMainBalanceModal />
        </div>
    );
};

export default AdminDashboard;

// ====== SummaryCard Component ======
const SummaryCard = ({ title, color, value }) => (
    <div
        className={`rounded-xl p-5 border shadow-sm hover:shadow-md transition-all bg-linear-to-br from-${color}-50 to-${color}-100 border-${color}-200`}
    >
        <h4 className={`text-lg font-semibold text-${color}-800 mb-1`}>
            {title}
        </h4>
        <p className={`text-3xl font-bold text-${color}-700`}>
            {formatNumber(value)} <span className="text-sm">BDT</span>
        </p>
    </div>
);
