import React, { useContext, useEffect, useState } from 'react';
import { ContextData } from '../../DataProvider';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';

const Analytics = () => {
    const { user, currentPage, expenseItemsPerPage, searchOption } = useContext(ContextData);
    const axiosProtect = useAxiosProtect();

    const [expenseList, setExpenseList] = useState([]);
    const [earnings, setEarnings] = useState([]);
    const [chartData, setChartData] = useState([]);

    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    // Fetch expenses
    useEffect(() => {
        const fetchExpenseData = async () => {
            try {
                const response = await axiosProtect.get('/getExpense', {
                    params: {
                        userEmail: user?.email,
                        page: currentPage,
                        size: expenseItemsPerPage,
                        search: searchOption,
                    },
                });
                setExpenseList(response.data.expense);
            } catch (error) {
                toast.error('Error fetching expenses:', error.message);
            }
        };
        fetchExpenseData();
    }, [refetch, currentPage, expenseItemsPerPage, searchOption]);

    // Fetch earnings
    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const response = await axiosProtect.get(`/getEarnings`, {
                    params: {
                        userEmail: user?.email,
                    },
                });
                setEarnings(response.data);
            } catch (error) {
                toast.error('Error fetching earnings:', error.message);
            }
        };
        fetchEarnings();
    }, [refetch]);

    // Prepare chart data
    useEffect(() => {
        const monthlyData = {};

        // Process expenses
        expenseList.forEach(item => {
            const month = moment(item.expenseDate).format('MMMM'); // e.g., "March"
            if (!monthlyData[month]) monthlyData[month] = { month, expense: 0, earnings: 0 };
            monthlyData[month].expense += item.expenseAmount;
        });

        // Process earnings
        earnings.forEach(item => {
            const month = item.month;
            if (!monthlyData[month]) monthlyData[month] = { month, expense: 0, earnings: 0 };
            monthlyData[month].earnings += item.convertedBdt;
        });

        // Add profit
        const finalChartData = Object.values(monthlyData).map(item => ({
            ...item,
            profit: item.earnings - item.expense
        }));

        setChartData(finalChartData);
    }, [expenseList, earnings]);

    return (
        <div className='w-full h-[400px] mt-10'>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="earnings" fill="#4ade80" name="Earnings" />
                    <Bar dataKey="expense" fill="#f87171" name="Expenses" />
                    <Bar dataKey="profit" fill="#60a5fa" name="Profit" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Analytics;
