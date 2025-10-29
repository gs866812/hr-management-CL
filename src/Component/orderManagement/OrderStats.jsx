import React, { useEffect, useState, useContext } from 'react';
import OrderStatsCard from './OrderStatsCard';
import { Package2 } from 'lucide-react';
import { toast } from 'react-toastify';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { ContextData } from '../../DataProvider';

export default function OrderStats({ selectedMonth }) {
    const axiosProtect = useAxiosProtect();
    const { user } = useContext(ContextData);

    const [summary, setSummary] = useState({
        totalAmountAll: 0,
        totalAmountCurrentMonth: 0,
        totalAmountPreviousMonth: 0,
        totalAmountSelectedMonth: 0,
    });

    useEffect(() => {
        const fetchSummary = async () => {
            if (!user?.email) return;
            try {
                const { data } = await axiosProtect.get(
                    '/getLocalOrderSummary',
                    {
                        params: {
                            userEmail: user.email,
                            selectedMonth:
                                selectedMonth !== 'all'
                                    ? selectedMonth
                                    : undefined,
                        },
                    }
                );
                setSummary(data || {});
            } catch (err) {
                toast.error(
                    err?.response?.data?.message || 'Failed to load summary'
                );
            }
        };
        fetchSummary();
    }, [selectedMonth, user?.email, axiosProtect]);

    const formatCurrency = (num) =>
        Number(num || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <OrderStatsCard
                totalAmountCurrentMonth
                totalAmount={formatCurrency(summary.totalAmountCurrentMonth)}
                type={`Current Month USD`}
                icon={Package2}
            />
            <OrderStatsCard
                totalAmount={formatCurrency(summary.totalAmountPreviousMonth)}
                type={'Previous Month USD'}
                icon={Package2}
            />
            <OrderStatsCard
                totalAmount={formatCurrency(summary.totalAmountSelectedMonth)}
                type={'Selected Month USD'}
                icon={Package2}
            />
            <OrderStatsCard
                totalAmount={formatCurrency(summary.totalAmountAll)}
                type={'All-Time Total USD'}
                icon={Package2}
            />
        </section>
    );
}
