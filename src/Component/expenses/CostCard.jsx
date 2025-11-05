import { TrendingDown, TrendingUp } from 'lucide-react';

export default function CostCard({ total, percent, title }) {
    const isPositive = Number(percent) >= 0;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-green-50 to-transparent opacity-40 rounded-full -mr-16 -mt-16" />

            <div className="space-y-4 relative">
                <div className="flex items-center gap-2">
                    <h3 className="text-gray-600 font-medium">{title}</h3>
                </div>

                <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-gray-800">
                        ৳ {total}
                    </h3>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            This Month’s Expense
                        </span>
                        <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                                isPositive
                                    ? 'bg-green-50 text-green-600'
                                    : 'bg-red-50 text-red-600'
                            }`}
                        >
                            {isPositive ? (
                                <TrendingUp className="size-3" />
                            ) : (
                                <TrendingDown className="size-3" />
                            )}
                            <span className="text-xs font-medium">
                                {percent}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
