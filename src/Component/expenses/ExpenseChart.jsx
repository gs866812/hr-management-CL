import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                <p className="text-gray-600 font-medium mb-1">{label}</p>
                <p className="text-lg font-bold text-[#6E3FF3]">
                    ৳{payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export default function ExpenseChart({ data = [] }) {
    // 🔹 Keep only the last 6 months of data
    const filteredData =
        data && data.length > 6
            ? data.slice(-6) // last 6 elements
            : data;

    // 🔹 Ensure we have fallback data if empty
    const chartData =
        filteredData && filteredData.length
            ? filteredData.map((item) => ({
                  name: item.name,
                  expenses: item.expenses,
              }))
            : [
                  { name: 'Jan', expenses: 0 },
                  { name: 'Feb', expenses: 0 },
                  { name: 'Mar', expenses: 0 },
                  { name: 'Apr', expenses: 0 },
                  { name: 'May', expenses: 0 },
                  { name: 'Jun', expenses: 0 },
              ];

    const maxY = Math.max(...chartData.map((d) => d.expenses), 0);
    const tickStep = Math.ceil(maxY / 5 / 1000) * 1000;

    return (
        <div className="bg-white col-span-3 rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-gray-800 text-lg font-semibold">
                        Last 6 Months Expenses
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                        Trend from the past 6 months
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-[#6E3FF3]" />
                    <span className="text-gray-600">Expenses</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f0f0f0"
                    />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#666' }}
                    />
                    <YAxis
                        domain={[0, maxY + tickStep]}
                        tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#666' }}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'rgba(110,63,243,0.1)' }}
                    />
                    <Bar
                        dataKey="expenses"
                        fill="#6E3FF3"
                        radius={[10, 10, 0, 0]}
                        barSize={40}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
