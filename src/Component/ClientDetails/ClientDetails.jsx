import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';

export default function ClientDetails() {
    const { id } = useParams();

    const [client, setClient] = useState(null);
    const [payments, setPayments] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 🔍 Debounce search input to prevent excessive requests
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(handler);
    }, [search]);

    // 🔁 Fetch client details
    const fetchClient = useCallback(async () => {
        setLoading(true);
        setError('');

        const controller = new AbortController();
        const signal = controller.signal;

        try {
            const res = await fetch(
                `${
                    import.meta.env.VITE_BASE_URL
                }/clientDetails/${id}?page=${page}&limit=${limit}&search=${debouncedSearch}`,
                { signal }
            );

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            if (data.success) {
                setClient(data.client);
                setPayments(data.payments);
                setTotalPages(data.pagination.totalPages || 1);
            } else {
                throw new Error(data.message || 'Unknown error');
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('❌ Failed to fetch client details:', err);
                setError('Failed to load client details. Please try again.');
            }
        } finally {
            setLoading(false);
        }

        return () => controller.abort();
    }, [id, page, limit, debouncedSearch]);

    useEffect(() => {
        fetchClient();
    }, [fetchClient]);

    // 🧹 Render states
    if (loading)
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <span className="loading loading-ring loading-lg text-primary"></span>
            </div>
        );

    if (error)
        return (
            <div className="text-center text-red-500 py-10 font-medium">
                ⚠️ {error}
            </div>
        );

    if (!client)
        return (
            <div className="text-center text-gray-600 py-10 text-lg">
                ❌ Client not found
            </div>
        );

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            {/* 🧾 Client Info Card */}
            <div className="bg-gradient-to-br from-[#6E3FF3] to-[#4B2CCC] text-white rounded-2xl p-6 shadow-lg mb-8">
                <h1 className="text-3xl font-bold mb-2 tracking-wide">
                    Client ID: {client.clientID}
                </h1>
                <p className="opacity-90">
                    🌍 Country: {client.country || 'N/A'}
                </p>
                <p className="opacity-90 mt-1">
                    💳 Total Payments:{' '}
                    <span className="font-semibold text-white">
                        {client.paymentHistory?.length || 0}
                    </span>
                </p>
            </div>

            {/* 🔍 Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
                <input
                    type="text"
                    placeholder="🔍 Search payments..."
                    value={search}
                    onChange={(e) => {
                        setPage(1);
                        setSearch(e.target.value);
                    }}
                    className="input input-bordered !border w-full sm:w-1/3 rounded-xl focus:ring-2 focus:ring-[#6E3FF3]"
                />

                <select
                    value={limit}
                    onChange={(e) => {
                        setPage(1);
                        setLimit(Number(e.target.value));
                    }}
                    className="select !border w-[200px] rounded-xl"
                >
                    {[5, 10, 20, 50].map((n) => (
                        <option key={n} value={n}>
                            {n} / page
                        </option>
                    ))}
                </select>
            </div>

            {/* 💰 Payment Table */}
            <div className="overflow-x-auto bg-white border border-gray-100">
                <table className="table w-full border-collapse">
                    <thead className="bg-[#6E3FF3] text-white text-sm uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Project</th>
                            <th className="px-4 py-3">Amount (BDT)</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Month</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="text-center py-8 text-gray-500"
                                >
                                    No payments found.
                                </td>
                            </tr>
                        ) : (
                            payments.map((p, i) => (
                                <tr
                                    key={p._id || i}
                                    className="hover:bg-violet-50 transition-colors"
                                >
                                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                        {p.date || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-800 font-medium">
                                        {p.projectName || '-'}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-violet-700">
                                        {p.convertedBdt?.toLocaleString() || 0}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                p.status === 'Paid'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {p.status || 'Unpaid'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {p.month}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 📄 Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="btn btn-sm bg-gray-200 border-none hover:bg-gray-300 disabled:opacity-50"
                    >
                        ⬅ Prev
                    </button>

                    <span className="text-gray-700 font-medium">
                        Page{' '}
                        <span className="text-[#6E3FF3] font-bold">{page}</span>{' '}
                        of {totalPages}
                    </span>

                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="btn btn-sm bg-gray-200 border-none hover:bg-gray-300 disabled:opacity-50"
                    >
                        Next ➡
                    </button>
                </div>
            )}
        </div>
    );
}
