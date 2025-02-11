import { TrendingUp } from 'lucide-react';
import ExpenseChart from './ExpenseChart';
import ExpenseStatsCard from './ExpenseStatsCard';
import CostCard from './CostCard';

export default function ExpenseStats() {
    return (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            <ExpenseStatsCard
                percent={'-10.5'}
                totalAmount={'24000'}
                type={'Daily'}
            />
            <ExpenseStatsCard
                percent={'10.5'}
                totalAmount={'24000'}
                type={'Monthly'}
            />
            <ExpenseStatsCard
                percent={'-10.5'}
                totalAmount={'24000'}
                type={'Yearly'}
            />

            <ExpenseChart />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 col-span-3">
                <CostCard percent={'-10'} title={'Salary'} total={24000} />
                <CostCard
                    percent={'10'}
                    title={'Maintenance Cost'}
                    total={24000}
                />
                <CostCard percent={'10'} title={'Office Cost'} total={24000} />
                <CostCard percent={'-10'} title={'Extra Cost'} total={24000} />
            </div>
        </section>
    );
}
