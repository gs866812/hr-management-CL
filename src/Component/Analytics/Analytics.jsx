import React, { useContext, useEffect, useState } from 'react';
import { ContextData } from '../../DataProvider';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import useAxiosProtect from '../../utils/useAxiosProtect';
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
    ReferenceLine,
    PieChart,
    Pie,
    Cell,
    Sector
} from 'recharts';

const Analytics = () => {
    const { user, searchOption } = useContext(ContextData);
    const axiosProtect = useAxiosProtect();
    const [expenseList, setExpenseList] = useState([]);
    const [earnings, setEarnings] = useState([]);
    const [analyticsData, setAnalyticsData] = useState([]);
    const [yearlyTotals, setYearlyTotals] = useState({
        expense: 0,
        earnings: 0,
        profit: 0
    });
    const [activeIndex, setActiveIndex] = useState(0);


    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    const COLORS = ['#FF8042', '#8884d8', '#82ca9d'];

    // **************************************************************************
    useEffect(() => {
        const fetchExpenseData = async () => {
            try {
                const response = await axiosProtect.get('/getExpense', {
                    params: {
                        userEmail: user?.email,
                        // Remove pagination to get all expenses for analytics
                        // page: currentPage,
                        // size: expenseItemsPerPage,
                        search: searchOption,
                    },
                });
                console.log("Expense data received:", response.data.expense);
                setExpenseList(response.data.allExpense);
            } catch (error) {
                toast.error('Error fetching data:', error.message);
            }
        };

        if (user?.email) {
            fetchExpenseData();
        }
    }, [refetch, searchOption, axiosProtect, user?.email]);

    // **************************************************************************
    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const response = await axiosProtect.get(`/getEarnings`, {
                    params: {
                        userEmail: user?.email,
                    },
                });
                console.log("Earnings data received:", response.data);
                setEarnings(response.data);
            } catch (error) {
                toast.error('Error fetching data:', error.message);
            }
        };

        if (user?.email) {
            fetchEarnings();
        }
    }, [refetch, user?.email, axiosProtect]);

    // **************************************************************************
    useEffect(() => {
        // Process data for charts when both expenses and earnings are available
        if (expenseList.length > 0 || earnings.length > 0) {
            processDataForCharts();
        }
    }, [expenseList, earnings]);

    // Format number to have 2 decimal places
    const formatNumber = (num) => {
        return Number(num).toFixed(2);
    };

    // Process data for the charts
    const processDataForCharts = () => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Initialize data structure for all months
        const monthlyData = months.map(month => ({
            month,
            expense: 0,
            earnings: 0,
            profit: 0,
        }));

        // Process expense data - Debug logging
        console.log("Processing expense data:", expenseList);

        if (expenseList && expenseList.length > 0) {
            expenseList.forEach(expense => {
                try {
                    const expenseDate = new Date(expense.expenseDate);
                    const monthIndex = expenseDate.getMonth();
                    if (isNaN(monthIndex)) {
                        console.error("Invalid date for expense:", expense);
                    } else {
                        monthlyData[monthIndex].expense += Number(expense.expenseAmount) || 0;
                        console.log(`Added expense ${expense.expenseAmount} to month ${months[monthIndex]}`);
                    }
                } catch (error) {
                    console.error("Error processing expense:", expense, error);
                }
            });
        }

        // Process earnings data
        console.log("Processing earnings data:", earnings);

        if (earnings && earnings.length > 0) {
            earnings.forEach(earning => {
                try {
                    const monthIndex = months.indexOf(earning.month);
                    if (monthIndex !== -1) {
                        monthlyData[monthIndex].earnings += Number(earning.convertedBdt) || 0;
                        console.log(`Added earnings ${earning.convertedBdt} to month ${earning.month}`);
                    } else {
                        // Handle case where month string doesn't match
                        // Try to extract month from date string if available
                        if (earning.date) {
                            const dateParts = earning.date.split('-');
                            if (dateParts.length >= 2) {
                                const monthNum = parseInt(dateParts[1]) - 1; // Month is 0-indexed in JS
                                if (monthNum >= 0 && monthNum <= 11) {
                                    monthlyData[monthNum].earnings += Number(earning.convertedBdt) || 0;
                                    console.log(`Added earnings ${earning.convertedBdt} to month ${months[monthNum]} (from date)`);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error processing earning:", earning, error);
                }
            });
        }

        // Calculate profit and round all numbers to 2 decimal places
        monthlyData.forEach(data => {
            data.expense = Number(parseFloat(data.expense).toFixed(2));
            data.earnings = Number(parseFloat(data.earnings).toFixed(2));
            data.profit = Number(parseFloat(data.earnings - data.expense).toFixed(2));
        });

        // Calculate yearly totals
        const totals = {
            expense: parseFloat(monthlyData.reduce((sum, data) => sum + data.expense, 0).toFixed(2)),
            earnings: parseFloat(monthlyData.reduce((sum, data) => sum + data.earnings, 0).toFixed(2)),
            profit: 0
        };

        totals.profit = parseFloat((totals.earnings - totals.expense).toFixed(2));

        setYearlyTotals(totals);
        console.log("Final analytics data:", monthlyData);
        console.log("Yearly totals:", totals);
        setAnalyticsData(monthlyData);
    };

    // Custom pie chart active shape
    const renderActiveShape = (props) => {
        const RADIAN = Math.PI / 180;
        const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
            fill, payload, percent, value } = props;
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
                <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>{payload.name}</text>
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
                <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
                <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
                <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${formatNumber(value)} BDT`}</text>
                <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                    {`(${(percent * 100).toFixed(2)}%)`}
                </text>
            </g>
        );
    };

    // Prepare yearly summary data for pie chart
    const prepareYearlySummaryData = () => {
        return [
            { name: 'Expense', value: Math.abs(yearlyTotals.expense) },
            { name: 'Earnings', value: yearlyTotals.earnings },
            { name: 'Profit', value: Math.abs(yearlyTotals.profit) }
        ];
    };

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    // **************************************************************************
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

    // **************************************************************************
    return (
        <div className="w-full p-4">

            <div className='bg-gray-100 rounded-md p-2 shadow'>
                <h3 className="text-xl font-bold mt-2">Yearly Summary</h3>
                <div className='flex items-center'>
                    <div className='w-1/2 flex gap-2'>
                        <div className="bg-white rounded-md p-4">
                            <h4 className="text-xl font-semibold text-purple-800 mb-2">Revenue</h4>
                            <p className="font-bold text-purple-600">{formatNumber(yearlyTotals.earnings)} BDT</p>
                        </div>
                        <div className="bg-white rounded-md p-4">
                            <h4 className="text-xl font-semibold text-orange-800 mb-2">Expense</h4>
                            <p className=" font-bold text-orange-600">{formatNumber(yearlyTotals.expense)} BDT</p>
                        </div>



                        <div className={`${yearlyTotals.profit >= 0 ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200'} rounded-lg p-4 shadow border`}>
                            <h4 className={`text-xl font-semibold mt-2 ${yearlyTotals.profit >= 0 ? 'text-green-800' : 'text-red-800'}`}>Profit</h4>
                            <p className={`font-bold ${yearlyTotals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatNumber(yearlyTotals.profit)} BDT</p>
                        </div>
                    </div>
                    <div className='w-1/2 h-52'>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    data={prepareYearlySummaryData()}
                                    cx="60%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={60}
                                    fill="#8884d8"
                                    dataKey="value"
                                    onMouseEnter={onPieEnter}
                                >
                                    {prepareYearlySummaryData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${formatNumber(value)} BDT`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>


            {/* Chart showing expense, earnings and profit */}
            <h2 className="text-xl font-bold mb-6 mt-5">Monthly Financial Analytics</h2>
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
                            <Tooltip formatter={(value) => `${formatNumber(value)} BDT`} />
                            <Legend wrapperStyle={{ bottom: 0 }} />

                            <Bar dataKey="expense" fill="#FF8042" name="Expense">
                                <LabelList dataKey="expense" position="top" content={renderBarLabel} />
                            </Bar>

                            <Bar dataKey="earnings" fill="#8884d8" name="Earnings">
                                <LabelList dataKey="earnings" position="top" content={renderBarLabel} />
                            </Bar>

                            <Line
                                type="monotone"
                                dataKey="profit"
                                stroke="#82ca9d"
                                strokeWidth={3}
                                name="Profit"
                                dot={{ stroke: '#82ca9d', strokeWidth: 2, r: 4, fill: '#ffffff' }}
                            >
                                <LabelList dataKey="profit" position="top" content={renderProfitLabel} />
                            </Line>
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>


        </div>
    );
};

export default Analytics;