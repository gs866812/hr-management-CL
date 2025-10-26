import { useContext, useEffect, useState } from 'react';
import { ContextData } from '../../DataProvider';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { useSelector } from 'react-redux';
import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Sector,
    Tooltip,
} from 'recharts';
import { toast } from 'react-toastify';

const YearlySummary = () => {
    const { user, searchOption, unpaidAmount, sharedProfit } =
        useContext(ContextData);
    const axiosProtect = useAxiosProtect();
    const [expenseList, setExpenseList] = useState([]);
    const [earnings, setEarnings] = useState([]);
    const [yearlyTotals, setYearlyTotals] = useState({
        expense: 0,
        earnings: 0,
        profit: 0,
    });
    const [activeIndex, setActiveIndex] = useState(0);
    const refetch = useSelector((state) => state.refetch.refetch);

    const COLORS = ['#FF8042', '#8884d8', '#82ca9d'];

    // ************************ FETCH EXPENSE DATA ************************
    useEffect(() => {
        const fetchExpenseData = async () => {
            try {
                const response = await axiosProtect.get('/getExpense', {
                    params: {
                        userEmail: user?.email,
                        search: searchOption,
                    },
                });
                setExpenseList(response.data.allExpense);
            } catch (error) {
                toast.error('Error fetching expense data');
            }
        };
        if (user?.email) fetchExpenseData();
    }, [refetch, searchOption, axiosProtect, user?.email]);

    // ************************ FETCH EARNINGS ************************
    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const response = await axiosProtect.get(`/getEarnings`, {
                    params: { userEmail: user?.email },
                });
                setEarnings(response.data.totalRev);
            } catch (error) {
                toast.error('Error fetching earnings data');
            }
        };
        if (user?.email) fetchEarnings();
    }, [refetch, user?.email, axiosProtect]);

    // ************************ FETCH LOAN BALANCE ************************
    const [loanBalance, setLoanBalance] = useState(0);
    useEffect(() => {
        const fetchLoanBalance = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_BASE_URL}/loans/get-loan-balance`
                );
                const result = await res.json();
                if (result.success && result.data) {
                    setLoanBalance(result.data.total || 0);
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

    // ************************ PROCESS YEARLY DATA ************************
    useEffect(() => {
        if (expenseList.length > 0 || earnings.length > 0) {
            processDataForCharts();
        }
    }, [expenseList, earnings]);

    const formatNumber = (num) => {
        return Number(num).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const processDataForCharts = () => {
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

        const monthlyData = months.map((month) => ({
            month,
            expense: 0,
            earnings: 0,
            profit: 0,
        }));

        // Expense processing
        expenseList.forEach((expense) => {
            try {
                const expenseDate = new Date(expense.expenseDate);
                const monthIndex = expenseDate.getMonth();
                if (!isNaN(monthIndex)) {
                    monthlyData[monthIndex].expense +=
                        Number(expense.expenseAmount) || 0;
                }
            } catch (error) {
                console.error('Error processing expense:', expense, error);
            }
        });

        // Earnings processing
        earnings.forEach((earning) => {
            try {
                const monthIndex = months.indexOf(earning.month);
                if (monthIndex !== -1) {
                    monthlyData[monthIndex].earnings +=
                        Number(earning.convertedBdt) || 0;
                } else if (earning.date) {
                    const parts = earning.date.split('-');
                    if (parts.length >= 2) {
                        const monthNum = parseInt(parts[1]) - 1;
                        if (monthNum >= 0 && monthNum <= 11) {
                            monthlyData[monthNum].earnings +=
                                Number(earning.convertedBdt) || 0;
                        }
                    }
                }
            } catch (error) {
                console.error('Error processing earning:', earning, error);
            }
        });

        // Calculate profit per month
        monthlyData.forEach((data) => {
            data.expense = parseFloat(data.expense.toFixed(2));
            data.earnings = parseFloat(data.earnings.toFixed(2));
            data.profit = parseFloat((data.earnings - data.expense).toFixed(2));
        });

        // Totals
        const totals = {
            expense: parseFloat(
                monthlyData.reduce((sum, d) => sum + d.expense, 0).toFixed(2)
            ),
            earnings: parseFloat(
                monthlyData.reduce((sum, d) => sum + d.earnings, 0).toFixed(2)
            ),
            profit: 0,
        };

        totals.profit = parseFloat(
            (totals.earnings - totals.expense).toFixed(2)
        );

        setYearlyTotals(totals);
    };

    // ************************ PIE CHART CONFIG ************************
    const renderActiveShape = (props) => {
        const RADIAN = Math.PI / 180;
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
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
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
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={outerRadius + 6}
                    outerRadius={outerRadius + 10}
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
                >{`${formatNumber(value)} BDT`}</text>
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

    const prepareYearlySummaryData = () => [
        { name: 'Expense', value: Math.abs(yearlyTotals.expense) },
        { name: 'Earnings', value: yearlyTotals.earnings },
        { name: 'Profit', value: Math.abs(yearlyTotals.profit) },
    ];

    const onPieEnter = (_, index) => setActiveIndex(index);

    // ************************ FINAL CALCULATION ************************
    const finalAmount =
        yearlyTotals.profit + loanBalance - sharedProfit - unpaidAmount;

    // ************************ RENDER UI ************************
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="grid grid-cols-3 justify-between gap-6">
                {/* Left: Yearly Summary Cards */}
                <div className="col-span-2">
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
                                {formatNumber(loanBalance)} - {unpaidAmount} -
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

                {/* Right: Pie Chart */}
                <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-4 shadow-sm border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">
                        📊 Distribution
                    </h4>
                    <div className="w-full h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    data={prepareYearlySummaryData()}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    onMouseEnter={onPieEnter}
                                >
                                    {prepareYearlySummaryData().map(
                                        (entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    COLORS[
                                                        index % COLORS.length
                                                    ]
                                                }
                                            />
                                        )
                                    )}
                                </Pie>
                                <Tooltip
                                    formatter={(value) =>
                                        `${formatNumber(value)} BDT`
                                    }
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YearlySummary;
