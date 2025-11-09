import React, { useContext, useEffect, useState, useCallback } from 'react';
import { IoMdAdd } from 'react-icons/io';
import AddMainBalanceModal from './AddMainBalanceModal';
import { ContextData } from '../../DataProvider';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
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

const AdminDashboard = () => {
    const {
        user,
        searchOption,
        unpaidAmount = 0,
        sharedProfit = 0,
    } = useContext(ContextData);
    const axiosProtect = useAxiosProtect();
    const refetch = useSelector((state) => state.refetch.refetch);

    const [expenseList, setExpenseList] = useState([]);
    const [earnings, setEarnings] = useState([]);
    const [analyticsData, setAnalyticsData] = useState([]);
    const [yearlyTotals, setYearlyTotals] = useState({
        expense: 0,
        earnings: 0,
        profit: 0,
    });
    const [loanBalance, setLoanBalance] = useState(0);

    const COLORS = ['#FF8042', '#8884d8', '#82ca9d'];

    // Format number safely
    const formatNumber = (num) => {
        const n = Number(num || 0);
        return n.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    // fetch expense list
    useEffect(() => {
        const fetchExpenseData = async () => {
            try {
                const response = await axiosProtect.get('/getExpense', {
                    params: {
                        userEmail: user?.email,
                        search: searchOption,
                    },
                });
                setExpenseList(response.data?.allExpense ?? []);
            } catch (error) {
                console.error('Error fetching expense data:', error);
                toast.error('Error fetching expense data');
            }
        };
        if (user?.email) fetchExpenseData();
    }, [refetch, searchOption, axiosProtect, user?.email]);

    // fetch earnings
    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const response = await axiosProtect.get('/getEarnings', {
                    params: { userEmail: user?.email },
                });
                setEarnings(response.data?.totalRev ?? []);
            } catch (error) {
                console.error('Error fetching earnings data:', error);
                toast.error('Error fetching earnings data');
            }
        };
        if (user?.email) fetchEarnings();
    }, [refetch, user?.email, axiosProtect]);

    // fetch loan balance (external endpoint using VITE_BASE_URL)
    useEffect(() => {
        const fetchLoanBalance = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_BASE_URL}/loans/get-loan-balance`
                );
                const result = await res.json();
                if (result?.success && result?.data) {
                    setLoanBalance(Number(result.data.total || 0));
                } else {
                    setLoanBalance(0);
                }
            } catch (err) {
                console.error('Error fetching loan balance:', err);
                setLoanBalance(0);
            }
        };
        fetchLoanBalance();
    }, []);

    // process chart data
    const processDataForCharts = useCallback(() => {
        const months = [
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

        const monthlyData = months.map((m) => ({
            month: m,
            expense: 0,
            earnings: 0,
            profit: 0,
        }));

        // expenses
        if (Array.isArray(expenseList) && expenseList.length) {
            expenseList.forEach((expense) => {
                try {
                    // support different field names but using expense.expenseDate
                    const dateVal =
                        expense.expenseDate ||
                        expense.date ||
                        expense.createdAt;
                    const expenseDate = new Date(dateVal);
                    const monthIndex = expenseDate.getMonth();
                    if (
                        !isNaN(monthIndex) &&
                        monthIndex >= 0 &&
                        monthIndex <= 11
                    ) {
                        monthlyData[monthIndex].expense += Number(
                            expense.expenseAmount || 0
                        );
                    } else {
                        console.warn('Invalid expense date:', expense);
                    }
                } catch (err) {
                    console.error('Error processing expense:', expense, err);
                }
            });
        }

        // earnings
        if (Array.isArray(earnings) && earnings.length) {
            earnings.forEach((earning) => {
                try {
                    // prefer earning.month if available (string like "January")
                    let monthIndex = -1;
                    if (earning.month) {
                        monthIndex = months.indexOf(String(earning.month));
                    }
                    if (monthIndex === -1 && earning.date) {
                        const parts = String(earning.date).split('-'); // expect YYYY-MM-DD
                        if (parts.length >= 2) {
                            const mNum = parseInt(parts[1], 10) - 1;
                            if (!Number.isNaN(mNum) && mNum >= 0 && mNum <= 11)
                                monthIndex = mNum;
                        }
                    }
                    // fallback: try createdAt
                    if (monthIndex === -1 && earning.createdAt) {
                        const d = new Date(earning.createdAt);
                        const mNum = d.getMonth();
                        if (!Number.isNaN(mNum)) monthIndex = mNum;
                    }

                    if (monthIndex !== -1) {
                        monthlyData[monthIndex].earnings += Number(
                            earning.convertedBdt || earning.amount || 0
                        );
                    } else {
                        console.warn(
                            'Unable to determine month for earning:',
                            earning
                        );
                    }
                } catch (err) {
                    console.error('Error processing earning:', earning, err);
                }
            });
        }

        // finalize values & compute profit
        monthlyData.forEach((d) => {
            d.expense = Number(parseFloat(d.expense || 0).toFixed(2));
            d.earnings = Number(parseFloat(d.earnings || 0).toFixed(2));
            d.profit = Number(parseFloat(d.earnings - d.expense).toFixed(2));
        });

        const totals = {
            expense: parseFloat(
                monthlyData.reduce((s, x) => s + x.expense, 0).toFixed(2)
            ),
            earnings: parseFloat(
                monthlyData.reduce((s, x) => s + x.earnings, 0).toFixed(2)
            ),
            profit: 0,
        };
        totals.profit = parseFloat(
            (totals.earnings - totals.expense).toFixed(2)
        );

        setAnalyticsData(monthlyData);
        setYearlyTotals(totals);
    }, [expenseList, earnings]);

    // run processing when data changes
    useEffect(() => {
        if (
            (expenseList && expenseList.length) ||
            (earnings && earnings.length)
        ) {
            processDataForCharts();
        } else {
            // if both empty, still reset analytics
            setAnalyticsData([]);
            setYearlyTotals({ expense: 0, earnings: 0, profit: 0 });
        }
    }, [expenseList, earnings, processDataForCharts]);

    const renderBarLabel = (props) => {
        const { x, y, width, value } = props;
        return (
            <g>
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
            </g>
        );
    };

    const renderProfitLabel = (props) => {
        const { x, y, value } = props;
        return (
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
                    fill="#006400"
                    textAnchor="middle"
                    fontWeight="bold"
                    fontSize="11"
                >
                    {formatNumber(value)}
                </text>
            </g>
        );
    };

    const finalAmount =
        yearlyTotals.profit +
        Number(loanBalance || 0) -
        Number(sharedProfit || 0) -
        Number(unpaidAmount || 0);

    const handleAddBalance = () => {
        const el = document.getElementById('addMainBalance');
        if (el && typeof el.showModal === 'function') {
            el.showModal();
        } else {
            // fallback: maybe you use another modal system
            console.warn(
                'AddMainBalance modal element not found or showModal not available.'
            );
        }
    };

    return (
        <div>
            <section className="flex justify-end space-x-4">
                <button
                    onClick={handleAddBalance}
                    className="border-l border-r border-b rounded-b-xl px-2 cursor-pointer bg-[#6E3FF3] text-white py-1"
                >
                    <span className="flex items-center gap-1">
                        <IoMdAdd />
                        Add balance
                    </span>
                </button>
            </section>

            <div className="p-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    📅 Yearly Summary
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Revenue */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 shadow-sm hover:shadow-md transition-all">
                        <h4 className="text-lg font-semibold text-purple-800 mb-1">
                            💼 Revenue
                        </h4>
                        <p className="text-3xl font-bold text-purple-700">
                            {formatNumber(yearlyTotals.earnings)}{' '}
                            <span className="text-sm">BDT</span>
                        </p>
                    </div>

                    {/* Expense */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200 shadow-sm hover:shadow-md transition-all">
                        <h4 className="text-lg font-semibold text-orange-800 mb-1">
                            💸 Expense
                        </h4>
                        <p className="text-3xl font-bold text-orange-700">
                            {formatNumber(yearlyTotals.expense)}{' '}
                            <span className="text-sm">BDT</span>
                        </p>
                    </div>

                    {/* Profit */}
                    <div
                        className={`rounded-xl p-5 shadow-sm border transition-all hover:shadow-md ${
                            yearlyTotals.profit >= 0
                                ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                                : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                        }`}
                    >
                        <h4
                            className={`text-lg font-semibold mb-1 ${
                                yearlyTotals.profit >= 0
                                    ? 'text-green-800'
                                    : 'text-red-800'
                            }`}
                        >
                            📈 Profit
                        </h4>
                        <p
                            className={`text-3xl font-bold ${
                                yearlyTotals.profit >= 0
                                    ? 'text-green-700'
                                    : 'text-red-700'
                            }`}
                        >
                            {formatNumber(yearlyTotals.profit)}{' '}
                            <span className="text-sm">BDT</span>
                        </p>
                    </div>

                    {/* Unpaid */}
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 border border-yellow-200 hover:shadow-md transition-all">
                        <h4 className="text-lg font-semibold text-yellow-800 mb-1">
                            🧾 Unpaid
                        </h4>
                        <p className="text-3xl font-bold text-yellow-700">
                            {formatNumber(unpaidAmount)}{' '}
                            <span className="text-sm">BDT</span>
                        </p>
                    </div>

                    {/* Shared */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200 hover:shadow-md transition-all">
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
                        className={`rounded-xl p-5 shadow-sm border transition-all hover:shadow-md ${
                            finalAmount >= 0
                                ? 'bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200'
                                : 'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200'
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
                            ({formatNumber(yearlyTotals.profit)} +{' '}
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

            <div className="card bg-base-100 shadow-xl m-4 border border-black/10">
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
                                    formatter={(value) =>
                                        `${formatNumber(value)} BDT`
                                    }
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--b1))',
                                        border: '1px solid hsl(var(--bc) / 0.2)',
                                        borderRadius: '0.5rem',
                                    }}
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
                                        fill: '#ffffff',
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
