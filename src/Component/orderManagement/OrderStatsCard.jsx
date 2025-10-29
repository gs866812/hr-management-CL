import React from 'react';

export default function OrderStatsCard({ totalAmount, type, icon }) {
    return (
        <section className="max-w-md w-full">
            <div className="bg-white rounded-xl border-2 border-violet-600 p-6 transition-shadow duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-transparent opacity-40 rounded-full -mr-16 -mt-16" />

                <div className="space-y-6 relative">
                    <div className="flex items-center gap-4">
                        <div className="bg-violet-600 p-3 rounded-2xl shadow-sm">
                            {React.createElement(icon, {
                                className: 'text-white size-6',
                            })}
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-gray-800">
                                {totalAmount}
                            </h3>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t-2 border-violet-200">
                        <div className="space-y-1">
                            <h3 className="text-gray-600 font-medium">
                                {type}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
