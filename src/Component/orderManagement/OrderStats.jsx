import OrderStatsCard from './OrderStatsCard';
import { Package2 } from 'lucide-react';

export default function OrderStats() {
    return (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <OrderStatsCard
                percent={'-10.5'}
                totalAmount={'24000'}
                type={'Completed Orders'}
                icon={Package2}
            />
            <OrderStatsCard
                percent={'10.5'}
                totalAmount={'24000'}
                type={'Active Orders'}
                icon={Package2}
            />
            <OrderStatsCard
                percent={'10.5'}
                totalAmount={'24000'}
                type={'Pending Orders'}
                icon={Package2}
            />
            <OrderStatsCard
                percent={'10.5'}
                totalAmount={'24000'}
                type={'Cancel Orders'}
                icon={Package2}
            />
        </section>
    );
}
