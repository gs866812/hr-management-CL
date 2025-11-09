import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import useAxiosProtect from '../../utils/useAxiosProtect';

const fmt2 = (n) =>
    Number(n || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export default function ClientDetails() {
    const { id } = useParams(); // clientID from route
    const axiosProtect = useAxiosProtect();

    // -------- Client info (header) --------
    const [client, setClient] = useState(null);
    const [loadingClient, setLoadingClient] = useState(true);
    const [errorClient, setErrorClient] = useState('');

    // -------- Tabs --------
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'earnings'

    // -------- ORDERS state --------
    const [orders, setOrders] = useState([]);
    const [ordersSearch, setOrdersSearch] = useState('');
    const [ordersDebounced, setOrdersDebounced] = useState('');
    const [ordersPage, setOrdersPage] = useState(1);
    const [ordersSize, setOrdersSize] = useState(10);
    const [ordersCount, setOrdersCount] = useState(0);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState('');

    // Debounce orders search
    useEffect(() => {
        const t = setTimeout(() => setOrdersDebounced(ordersSearch), 400);
        return () => clearTimeout(t);
    }, [ordersSearch]);

    // -------- EARNINGS state --------
    const [earnings, setEarnings] = useState([]);
    const [earningsSearch, setEarningsSearch] = useState('');
    const [earningsDebounced, setEarningsDebounced] = useState('');
    const [earningsPage, setEarningsPage] = useState(1);
    const [earningsSize, setEarningsSize] = useState(10);
    const [earningsCount, setEarningsCount] = useState(0);
    const [earningsLoading, setEarningsLoading] = useState(true);
    const [earningsError, setEarningsError] = useState('');

    // Debounce earnings search
    useEffect(() => {
        const t = setTimeout(() => setEarningsDebounced(earningsSearch), 400);
        return () => clearTimeout(t);
    }, [earningsSearch]);

    // -------- Fetch client header --------
    const fetchClient = useCallback(async () => {
        try {
            setLoadingClient(true);
            setErrorClient('');
            // protected call
            const { data } = await axiosProtect.get(`/clientDetails/${id}`);
            setClient(data?.client || { clientID: id });
        } catch (e) {
            setErrorClient(
                e?.response?.status === 401
                    ? 'Unauthorized. Please sign in again.'
                    : 'Failed to load client info.'
            );
            setClient({ clientID: id });
        } finally {
            setLoadingClient(false);
        }
    }, [id, axiosProtect]);

    useEffect(() => {
        fetchClient();
    }, [fetchClient]);

    // -------- Fetch orders (protected) --------
    const fetchOrders = useCallback(async () => {
        if (!id) return;
        try {
            setOrdersLoading(true);
            setOrdersError('');

            const params = {
                clientId: id,
                page: String(ordersPage),
                size: String(ordersSize),
            };
            if (ordersDebounced) params.search = ordersDebounced;

            const { data } = await axiosProtect.get('/getClientOrders', {
                params,
            });

            // Expected: { success, result:[], count, page, size, totalPages }
            setOrders(data?.result || []);
            setOrdersCount(data?.count || 0);
        } catch (e) {
            setOrdersError(
                e?.response?.status === 401
                    ? 'Unauthorized. Please sign in again.'
                    : 'Failed to load orders.'
            );
            setOrders([]);
            setOrdersCount(0);
        } finally {
            setOrdersLoading(false);
        }
    }, [id, ordersPage, ordersSize, ordersDebounced, axiosProtect]);

    useEffect(() => {
        if (activeTab === 'orders') fetchOrders();
    }, [activeTab, fetchOrders]);

    // -------- Fetch earnings (protected) --------
    const fetchEarnings = useCallback(async () => {
        if (!id) return;
        try {
            setEarningsLoading(true);
            setEarningsError('');

            const params = {
                clientId: id, // backend should filter by clientId
                page: String(earningsPage),
                size: String(earningsSize),
            };
            if (earningsDebounced) params.search = earningsDebounced;

            const { data } = await axiosProtect.get('/getClientEarnings', {
                params,
            });

            // Expected: { result:[], count }  (or { items:[], count })
            setEarnings(data?.result || data?.items || []);
            setEarningsCount(data?.count || 0);
        } catch (e) {
            setEarningsError(
                e?.response?.status === 401
                    ? 'Unauthorized. Please sign in again.'
                    : 'Failed to load earnings.'
            );
            setEarnings([]);
            setEarningsCount(0);
        } finally {
            setEarningsLoading(false);
        }
    }, [id, earningsPage, earningsSize, earningsDebounced, axiosProtect]);

    useEffect(() => {
        if (activeTab === 'earnings') fetchEarnings();
    }, [activeTab, fetchEarnings]);

    // -------- Pagination helpers --------
    const ordersTotalPages = useMemo(
        () => Math.max(1, Math.ceil(ordersCount / ordersSize)),
        [ordersCount, ordersSize]
    );
    const earningsTotalPages = useMemo(
        () => Math.max(1, Math.ceil(earningsCount / earningsSize)),
        [earningsCount, earningsSize]
    );

    // -------- Header renderer --------
    const renderHeader = () => {
        if (loadingClient) {
            return (
                <div className="bg-gradient-to-br from-[#6E3FF3] to-[#4B2CCC] text-white rounded-2xl p-6 shadow-lg mb-8">
                    <div className="animate-pulse h-6 w-40 bg-white/30 rounded mb-3" />
                    <div className="animate-pulse h-4 w-64 bg-white/25 rounded mb-2" />
                    <div className="animate-pulse h-4 w-52 bg-white/25 rounded" />
                </div>
            );
        }
        if (errorClient) {
            return (
                <div className="bg-red-50 text-red-700 rounded-xl p-4 border border-red-200 mb-6">
                    {errorClient}
                </div>
            );
        }
        return (
            <div className="bg-gradient-to-br from-[#6E3FF3] to-[#4B2CCC] text-white rounded-2xl p-6 shadow-lg mb-8">
                <h1 className="text-3xl font-bold mb-2 tracking-wide">
                    Client ID: {client?.clientID || id}
                </h1>
                <p className="opacity-90">
                    🌍 Country: {client?.country || 'N/A'}
                </p>
            </div>
        );
    };

    console.log(orders)

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            {renderHeader()}

            {/* TABS */}
            <div
                role="tablist"
                className="flex items-center justify-center gap-2 p-1 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 w-fit mx-auto"
            >
                <button
                    role="tab"
                    onClick={() => setActiveTab('orders')}
                    className={`px-6 py-2.5 font-semibold rounded-lg transition-all duration-300 text-sm sm:text-base
      ${
          activeTab === 'orders'
              ? 'bg-[#4B2CCC] text-white shadow-md scale-105'
              : 'text-gray-600 hover:text-[#4B2CCC] hover:bg-[#edeaff]'
      }`}
                >
                    Orders
                </button>

                <button
                    role="tab"
                    onClick={() => setActiveTab('earnings')}
                    className={`px-6 py-2.5 font-semibold rounded-lg transition-all duration-300 text-sm sm:text-base
      ${
          activeTab === 'earnings'
              ? 'bg-[#4B2CCC] text-white shadow-md scale-105'
              : 'text-gray-600 hover:text-[#4B2CCC] hover:bg-[#edeaff]'
      }`}
                >
                    Earnings
                </button>
            </div>

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
                <div className="mt-6 space-y-4">
                    {/* Search + page size */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                        <input
                            type="text"
                            placeholder="🔍 Search orders (name, status, country, clientID)..."
                            value={ordersSearch}
                            onChange={(e) => {
                                setOrdersPage(1);
                                setOrdersSearch(e.target.value);
                            }}
                            className="input !border-2 !border-primary w-full sm:w-1/2 rounded-xl focus:ring-2 focus:ring-[#6E3FF3]"
                        />
                        <select
                            value={ordersSize}
                            onChange={(e) => {
                                setOrdersPage(1);
                                setOrdersSize(Number(e.target.value));
                            }}
                            className="select !border w-[180px] rounded-xl"
                        >
                            {[5, 10, 20, 50, 100].map((n) => (
                                <option key={n} value={n}>
                                    {n} / page
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="overflow-x-auto bg-white border border-gray-100">
                        <table className="table w-full border-collapse">
                            <thead className="bg-[#6E3FF3] text-white text-sm uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Order Name
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Qty
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        USD
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Deadline
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Return Format
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Services
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {ordersLoading ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="py-10 text-center"
                                        >
                                            <span className="loading loading-ring loading-lg text-primary" />
                                        </td>
                                    </tr>
                                ) : ordersError ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="py-8 text-center text-red-600"
                                        >
                                            {ordersError}
                                        </td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="py-8 text-center text-gray-500"
                                        >
                                            No orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((o, i) => (
                                        <tr
                                            key={o._id || i}
                                            className="hover:bg-violet-50 transition-colors duration-200"
                                        >
                                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                                {o.date || '—'}
                                            </td>

                                            <td className="px-4 py-3 text-gray-800 font-semibold">
                                                {o.orderName || '—'}
                                            </td>

                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        String(
                                                            o.orderStatus
                                                        ).toLowerCase() ===
                                                        'delivered'
                                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                                                    }`}
                                                >
                                                    {o.orderStatus || '—'}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-right text-gray-800">
                                                {o.orderQTY || 0}
                                            </td>

                                            <td className="px-4 py-3 text-right font-medium text-violet-700">
                                                $
                                                {Number(
                                                    o.orderPrice || 0
                                                ).toFixed(2)}
                                            </td>

                                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                                {o.orderDeadLine || '—'}
                                            </td>

                                            <td className="px-4 py-3 text-gray-800 font-medium">
                                                {o.returnFormat || '—'}
                                            </td>

                                            <td className="px-4 py-3 text-gray-600">
                                                {Array.isArray(
                                                    o.needServices
                                                ) && o.needServices.length > 0
                                                    ? o.needServices.join(', ')
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {ordersTotalPages > 1 && (
                        <div className="flex justify-center items-center gap-4">
                            <button
                                disabled={ordersPage <= 1}
                                onClick={() => setOrdersPage((p) => p - 1)}
                                className="btn btn-sm bg-gray-200 border-none hover:bg-gray-300 disabled:opacity-50"
                            >
                                ⬅ Prev
                            </button>
                            <span className="text-gray-700 font-medium">
                                Page{' '}
                                <span className="text-[#6E3FF3] font-bold">
                                    {ordersPage}
                                </span>{' '}
                                of {ordersTotalPages}
                            </span>
                            <button
                                disabled={ordersPage >= ordersTotalPages}
                                onClick={() => setOrdersPage((p) => p + 1)}
                                className="btn btn-sm bg-gray-200 border-none hover:bg-gray-300 disabled:opacity-50"
                            >
                                Next ➡
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* EARNINGS TAB */}
            {activeTab === 'earnings' && (
                <div className="mt-6 space-y-4">
                    {/* Search + page size */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                        <input
                            type="text"
                            placeholder="🔍 Search earnings (month, status, date)..."
                            value={earningsSearch}
                            onChange={(e) => {
                                setEarningsPage(1);
                                setEarningsSearch(e.target.value);
                            }}
                            className="input !border-2 !border-primary w-full sm:w-1/2 rounded-xl focus:ring-2 focus:ring-[#6E3FF3]"
                        />
                        <select
                            value={earningsSize}
                            onChange={(e) => {
                                setEarningsPage(1);
                                setEarningsSize(Number(e.target.value));
                            }}
                            className="select !border w-[180px] rounded-xl"
                        >
                            {[5, 10, 20, 50, 100].map((n) => (
                                <option key={n} value={n}>
                                    {n} / page
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="overflow-x-auto bg-white border border-gray-100">
                        <table className="table w-full border-collapse">
                            <thead className="bg-[#6E3FF3] text-white text-sm uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Month</th>
                                    <th className="px-4 py-3">Client ID</th>
                                    <th className="px-4 py-3">Image QTY</th>
                                    <th className="px-4 py-3">Total USD</th>
                                    <th className="px-4 py-3">Rate</th>
                                    <th className="px-4 py-3">BDT</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {earningsLoading ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="py-10 text-center"
                                        >
                                            <span className="loading loading-ring loading-lg text-primary" />
                                        </td>
                                    </tr>
                                ) : earningsError ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="py-8 text-center text-red-600"
                                        >
                                            {earningsError}
                                        </td>
                                    </tr>
                                ) : earnings.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="py-8 text-center text-gray-500"
                                        >
                                            No earnings found.
                                        </td>
                                    </tr>
                                ) : (
                                    earnings.map((p, i) => (
                                        <tr
                                            key={p._id || i}
                                            className="hover:bg-violet-50"
                                        >
                                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                                {p.date || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {p.month || '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {p.clientId || p.clientID || id}
                                            </td>
                                            <td className="px-4 py-3">
                                                {fmt2(p.imageQty)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {fmt2(
                                                    p.totalUsd || p.totalDollar
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {fmt2(p.convertRate || p.rate)}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-violet-700">
                                                {fmt2(
                                                    p.convertedBdt ||
                                                        p.totalBdt ||
                                                        p.bdtAmount
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        String(
                                                            p.status || 'Unpaid'
                                                        ) === 'Paid'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}
                                                >
                                                    {p.status || 'Unpaid'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {earningsTotalPages > 1 && (
                        <div className="flex justify-center items-center gap-4">
                            <button
                                disabled={earningsPage <= 1}
                                onClick={() => setEarningsPage((p) => p - 1)}
                                className="btn btn-sm bg-gray-200 border-none hover:bg-gray-300 disabled:opacity-50"
                            >
                                ⬅ Prev
                            </button>
                            <span className="text-gray-700 font-medium">
                                Page{' '}
                                <span className="text-[#6E3FF3] font-bold">
                                    {earningsPage}
                                </span>{' '}
                                of {earningsTotalPages}
                            </span>
                            <button
                                disabled={earningsPage >= earningsTotalPages}
                                onClick={() => setEarningsPage((p) => p + 1)}
                                className="btn btn-sm bg-gray-200 border-none hover:bg-gray-300 disabled:opacity-50"
                            >
                                Next ➡
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
