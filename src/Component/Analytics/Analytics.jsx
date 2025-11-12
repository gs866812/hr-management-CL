import { useContext, useMemo } from 'react';
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
import YearlySummary from './YearlySummary';

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

export default function Analytics() {
    const { monthlyProfit } = useContext(ContextData);

    // Use only current year
    const currentYear = new Date().getFullYear().toString();

    // ✅ Build chart data directly from monthlyProfit
    const analyticsData = useMemo(() => {
        const base = MONTHS.map((m) => ({
            month: m,
            expense: 0,
            earnings: 0,
            profit: 0,
        }));

        if (Array.isArray(monthlyProfit)) {
            for (const row of monthlyProfit) {
                const y = String(row?.year ?? currentYear);
                if (y !== currentYear) continue;

                const idx = monthIndex[String(row?.month || '').toLowerCase()];
                if (idx == null) continue;

                const expense = Number(row?.expense || 0);
                const earnings = Number(row?.earnings || 0);
                const profit = Number(row?.profit || earnings - expense);

                base[idx].expense += expense;
                base[idx].earnings += earnings;
                base[idx].profit += profit;
            }
        }

        // Round and return
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

    // ===== Render =====
    return (
        <div className="w-full p-4">
            <YearlySummary />

            <h2 className="text-xl font-bold mb-6 mt-5">
                Monthly Financial Analytics
            </h2>

            <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
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

            {/* ✅ Table based on monthlyProfit */}
            <section>
                <div className="overflow-x-auto">
                    <table className="table table-zebra">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Earning</th>
                                <th>Expense</th>
                                <th>Profit</th>
                                <th>Shared Profit</th>
                                <th>Remaining Profit</th>
                                <th>Year</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlyProfit?.length ? (
                                monthlyProfit.map((info, i) => (
                                    <tr key={i}>
                                        <td>{info.month}</td>
                                        <td>{formatNumber(info.earnings)}</td>
                                        <td>{formatNumber(info.expense)}</td>
                                        <td>{formatNumber(info.profit)}</td>
                                        <td>
                                            {formatNumber(
                                                (info.shared || []).reduce(
                                                    (t, s) =>
                                                        t + (s.amount || 0),
                                                    0
                                                )
                                            )}
                                        </td>
                                        <td>{formatNumber(info.remaining)}</td>
                                        <td>{info.year}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center">
                                        No record found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
