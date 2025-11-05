'use client';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import ExpenseChart from './ExpenseChart';
import ExpenseStatsCard from './ExpenseStatsCard';
import CostCard from './CostCard';
import useAxiosProtect from '../../utils/useAxiosProtect';

export default function ExpenseStats() {
    const axiosProtect = useAxiosProtect();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        dailyExpense: 0,
        monthlyExpense: 0,
        yearlyExpense: 0,
        monthlyChart: [],
        topCategories: [],
        topCategoriesByExpense: [],
    });

    useEffect(() => {
        const fetchExpenseStats = async () => {
            try {
                const { data } = await axiosProtect.get(
                    '/expenses/expense-summary'
                );
                console.log('Expense summary:', data);
                if (data.success) {
                    setStats({
                        dailyExpense: data.dailyExpense || 0,
                        monthlyExpense: data.monthlyExpense || 0,
                        yearlyExpense: data.yearlyExpense || 0,
                        monthlyChart: data.monthlyChart || [],
                        topCategories: data.topCategories || [],
                        topCategoriesByExpense:
                            data.topCategoriesByExpense || [],
                    });
                } else {
                    toast.warning('Failed to fetch expense summary');
                }
            } catch (error) {
                console.error('Expense summary fetch failed:', error);
                toast.error('Failed to load expense stats');
            } finally {
                setLoading(false);
            }
        };

        fetchExpenseStats();
    }, [axiosProtect]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500 animate-pulse">
                    Loading expense stats...
                </p>
            </div>
        );
    }

    // 🔹 Choose which categories to show
    const categoriesToShow =
        stats.topCategories.length >= 4
            ? stats.topCategories.slice(0, 4)
            : stats.topCategoriesByExpense.slice(0, 4);

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            {/* 🧾 Summary Cards */}
            <ExpenseStatsCard
                percent={'-5.2'}
                totalAmount={stats.dailyExpense.toLocaleString()}
                type={'Daily'}
            />
            <ExpenseStatsCard
                percent={'10.4'}
                totalAmount={stats.monthlyExpense.toLocaleString()}
                type={'Monthly'}
            />
            <ExpenseStatsCard
                percent={'6.1'}
                totalAmount={stats.yearlyExpense.toLocaleString()}
                type={'Yearly'}
            />

            {/* 📊 Monthly Chart */}
            <ExpenseChart data={stats.monthlyChart} />

            {/* 💸 Top 4 Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 col-span-3">
                {categoriesToShow && categoriesToShow.length > 0 ? (
                    categoriesToShow.map((cat, i) => (
                        <CostCard
                            key={i}
                            title={
                                cat.usedCount
                                    ? `${cat.category} (${cat.usedCount}x)`
                                    : cat.category
                            }
                            total={cat.amount.toLocaleString()}
                            percent={i % 2 === 0 ? '8.5' : '-6.3'}
                        />
                    ))
                ) : (
                    <p className="text-gray-500 col-span-2 text-center">
                        No category data available.
                    </p>
                )}
            </div>
        </section>
    );
}
