import React from 'react';

export default function OrderStatsCard({ totalAmount, type, icon, percent }) {
    return (
        <section className="max-w-md w-full">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-transparent opacity-40 rounded-full -mr-16 -mt-16" />

                <div className="space-y-6 relative">
                    <div className="flex items-center gap-4">
                        <div className="bg-black p-3 rounded-2xl shadow-sm">
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

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="space-y-1">
                            <h3 className="text-gray-600 font-medium">
                                {type}
                            </h3>
                        </div>
                        {Number(percent) >= 0 ? (
                            <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                                <span className="block w-2 h-2 rounded-full bg-green-500" />
                                <p className="text-green-600 text-sm font-semibold">
                                    {percent}%
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full">
                                <span className="block w-2 h-2 rounded-full bg-red-500" />
                                <p className="text-red-600 text-sm font-semibold">
                                    {percent}%
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
