'use client';
import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

export default function DebitPage() {
    const [transactions, setTransactions] = useState([]);
    const [form, setForm] = useState({
        name: '',
        phone: '',
        address: '',
        amount: '',
        type: 'borrow',
        date: format(new Date(), 'yyyy-MM-dd'),
    });
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totals, setTotals] = useState({
        totalBorrow: 0,
        totalReturn: 0,
        netBalance: 0,
        overallBorrow: 0,
        overallReturn: 0,
        overallNetBalance: 0,
    });

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    // 🔄 Fetch loans with debouncing for search
    const fetchLoans = async () => {
        try {
            setFetching(true);

            const queryParams = new URLSearchParams({
                search: search.trim(),
                page: String(page),
                limit: String(perPage),
            });

            if (filterDate) {
                queryParams.append('date', filterDate);
            }

            const res = await fetch(
                `${BASE_URL}/loans/get-loans?${queryParams}`
            );
            const data = await res.json();

            if (!res.ok)
                throw new Error(data.message || 'Failed to fetch loans');

            const items = data.data?.loans || [];
            const filteredStats = data.data?.filteredStats || {};
            const overallStats = data.data?.overallStats || {};
            const pagination = data.data?.pagination || {};

            setTransactions(items);
            setTotalPages(pagination.totalPages || 1);
            setTotalRecords(pagination.total || 0);

            // Set both filtered and overall totals
            setTotals({
                totalBorrow: filteredStats.totalBorrowed || 0,
                totalReturn: filteredStats.totalReturned || 0,
                netBalance: filteredStats.netBalance || 0,
                overallBorrow: overallStats.overallBorrowed || 0,
                overallReturn: overallStats.overallReturned || 0,
                overallNetBalance: overallStats.overallNetBalance || 0,
            });
        } catch (err) {
            toast.error(`❌ ${err.message}`);
        } finally {
            setFetching(false);
        }
    };

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1); // Reset to first page when search/filter changes
            fetchLoans();
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [search, filterDate]);

    // Fetch when page or perPage changes
    useEffect(() => {
        fetchLoans();
    }, [page, perPage]);

    // 🧾 Form handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!form.name.trim() || !form.phone.trim() || !form.amount) {
            toast.error('❌ Please fill in all required fields');
            return;
        }

        if (parseFloat(form.amount) <= 0) {
            toast.error('❌ Amount must be greater than 0');
            return;
        }

        setLoading(true);
        try {
            const url = editId
                ? `${BASE_URL}/loans/update-loan/${editId}`
                : `${BASE_URL}/loans/new-loan`;
            const method = editId ? 'PUT' : 'POST';

            const payload = {
                ...form,
                amount: parseFloat(form.amount),
                date: new Date(form.date).toISOString(),
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to save loan');

            toast.success(
                editId ? '✏️ Updated successfully' : '✅ Added successfully'
            );
            closeModal();
            resetForm();
            fetchLoans(); // Refresh the list
        } catch (err) {
            toast.error(`❌ ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            name: '',
            phone: '',
            address: '',
            amount: '',
            type: 'borrow',
            date: format(new Date(), 'yyyy-MM-dd'),
        });
        setEditId(null);
    };

    const openModal = () => document.getElementById('add_modal').showModal();
    const closeModal = () => {
        document.getElementById('add_modal').close();
        resetForm();
    };

    const handleEdit = (tx) => {
        setEditId(tx._id);
        setForm({
            name: tx.name || '',
            phone: tx.phone || '',
            address: tx.address || '',
            amount: tx.amount || '',
            type: tx.type || 'borrow',
            date: tx.date
                ? format(new Date(tx.date), 'yyyy-MM-dd')
                : format(new Date(), 'yyyy-MM-dd'),
        });
        openModal();
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This transaction will be permanently deleted!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#9333ea',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) return;

        try {
            Swal.fire({
                title: 'Deleting...',
                text: 'Please wait while we delete the record.',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const res = await fetch(`${BASE_URL}/loans/delete-loan/${id}`, {
                method: 'DELETE',
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Delete failed');

            await Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'The transaction has been successfully deleted.',
                timer: 1500,
                showConfirmButton: false,
            });

            fetchLoans();
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Failed!',
                text: err.message || 'Something went wrong while deleting.',
            });
        }
    };

    const clearFilters = () => {
        setSearch('');
        setFilterDate('');
        setPage(1);
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, page - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        // Adjust start if we're near the end
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        if (start > 1) {
            pages.push(1);
            if (start > 2) pages.push('...');
        }

        for (let i = start; i <= end; i++) pages.push(i);

        if (end < totalPages) {
            if (end < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }

        return (
            <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                    Showing {(page - 1) * perPage + 1} to{' '}
                    {Math.min(page * perPage, totalRecords)} of {totalRecords}{' '}
                    entries
                </div>
                <div className="join">
                    <button
                        className="join-item btn"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        «
                    </button>

                    {pages.map((p, i) =>
                        p === '...' ? (
                            <button
                                key={i}
                                className="join-item btn btn-disabled"
                            >
                                ...
                            </button>
                        ) : (
                            <button
                                key={i}
                                className={`join-item btn ${
                                    page === p
                                        ? 'bg-violet-600 text-white hover:bg-violet-700'
                                        : ''
                                }`}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </button>
                        )
                    )}

                    <button
                        className="join-item btn"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        »
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 min-h-screen bg-base-200 space-y-6">
            {/* --- Summary --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat bg-white !border rounded-lg">
                    <div className="stat-title text-gray-500 font-semibold">
                        Total Borrowed
                    </div>
                    <div className="stat-value text-violet-600 text-2xl">
                        ৳ {totals.overallBorrow.toLocaleString()}
                    </div>
                    <div className="stat-desc text-sm">All time</div>
                </div>

                <div className="stat bg-white !border rounded-lg">
                    <div className="stat-title text-gray-500 font-semibold">
                        Total Returned
                    </div>
                    <div className="stat-value text-green-600 text-2xl">
                        ৳ {totals.overallReturn.toLocaleString()}
                    </div>
                    <div className="stat-desc text-sm">All time</div>
                </div>

                <div className="stat bg-white border rounded-lg">
                    <div className="stat-title text-gray-500 font-semibold">
                        Net Balance
                    </div>
                    <div
                        className={`stat-value text-2xl ${
                            totals.overallNetBalance >= 0
                                ? 'text-rose-600'
                                : 'text-green-600'
                        }`}
                    >
                        ৳ {totals.overallNetBalance.toLocaleString()}
                    </div>
                    <div className="stat-desc text-sm">All time</div>
                </div>

                {/* Filtered Results Summary */}
                {(search || filterDate) && (
                    <div className="stat bg-violet-50 border border-violet-200 rounded-lg">
                        <div className="stat-title text-violet-600 font-semibold">
                            Filtered Results
                        </div>
                        <div className="stat-value text-violet-700 text-xl">
                            ৳ {totals.netBalance.toLocaleString()}
                        </div>
                        <div className="stat-desc text-violet-600 text-sm">
                            {search && `Search: "${search}"`}{' '}
                            {filterDate && `Date: ${filterDate}`}
                        </div>
                    </div>
                )}
            </div>

            {/* --- Header --- */}
            <div className="flex justify-between items-center flex-wrap gap-3">
                <h1 className="text-2xl font-bold text-violet-600">
                    💰 Loan Transactions
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                    <input
                        type="text"
                        placeholder="Search name, phone, or type"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input input-bordered w-64"
                    />
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="input input-bordered w-auto"
                    />
                    {(search || filterDate) && (
                        <button
                            onClick={clearFilters}
                            className="btn btn-outline"
                        >
                            Clear
                        </button>
                    )}
                    <select
                        className="select select-bordered w-[140px]"
                        value={perPage}
                        onChange={(e) => {
                            setPerPage(Number(e.target.value));
                            setPage(1);
                        }}
                    >
                        {[10, 20, 50, 100].map((num) => (
                            <option key={num} value={num}>
                                {num} / page
                            </option>
                        ))}
                    </select>
                    <button
                        className="btn bg-violet-600 hover:bg-violet-700 text-white"
                        onClick={openModal}
                    >
                        <FaPlus /> Add
                    </button>
                </div>
            </div>

            {/* --- Table --- */}
            <div className="overflow-x-auto bg-white">
                <table className="table w-full text-sm">
                    <thead className="bg-violet-600 text-white">
                        <tr>
                            <th className="!border">#</th>
                            <th className="!border">Name</th>
                            <th className="!border">Phone</th>
                            <th className="!border">Amount</th>
                            <th className="!border">Type</th>
                            <th className="!border">Date</th>
                            <th className="text-center !border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fetching ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8">
                                    <span className="loading loading-spinner text-violet-600"></span>{' '}
                                    Loading...
                                </td>
                            </tr>
                        ) : transactions.length > 0 ? (
                            transactions.map((tx, index) => (
                                <tr
                                    key={tx._id || index}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="text-center">
                                        {(page - 1) * perPage + index + 1}
                                    </td>
                                    <td className="font-medium">{tx.name}</td>
                                    <td>{tx.phone}</td>
                                    <td className="text-right pr-4 font-semibold">
                                        ৳ {tx.amount?.toFixed(2)}
                                    </td>
                                    <td className="text-center">
                                        <span
                                            className={`badge font-semibold ${
                                                tx.type === 'borrow'
                                                    ? 'badge-success text-white'
                                                    : 'badge-error text-white'
                                            }`}
                                        >
                                            {tx.type === 'borrow'
                                                ? 'Borrowed'
                                                : 'Returned'}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        {tx.date && !isNaN(new Date(tx.date))
                                            ? format(
                                                  new Date(tx.date),
                                                  'MMM dd, yyyy'
                                              )
                                            : '—'}
                                    </td>
                                    <td className="text-center">
                                        <div className="flex justify-center gap-1">
                                            <button
                                                className="btn btn-xs btn-outline btn-primary"
                                                onClick={() => handleEdit(tx)}
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="btn btn-xs btn-outline btn-error"
                                                onClick={() =>
                                                    handleDelete(tx._id)
                                                }
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="text-center py-8 text-gray-500"
                                >
                                    {search || filterDate
                                        ? 'No transactions match your filters 😴'
                                        : 'No transactions found. Add your first transaction!'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- Pagination --- */}
            {renderPagination()}

            {/* --- Modal --- */}
            <dialog id="add_modal" className="modal">
                <div className="modal-box bg-base-100 max-w-md relative">
                    <button
                        className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
                        onClick={closeModal}
                    >
                        <IoClose size={24} />
                    </button>

                    <h3 className="font-bold text-lg text-violet-600 mb-4">
                        {editId
                            ? '✏️ Edit Transaction'
                            : '➕ Add New Transaction'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="label">
                                <span className="label-text">Name *</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Enter name"
                                className="input input-bordered w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text">Phone *</span>
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                                className="input input-bordered w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text">Address</span>
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                placeholder="Enter address (optional)"
                                className="input input-bordered w-full"
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text">Amount *</span>
                            </label>
                            <input
                                type="number"
                                name="amount"
                                value={form.amount}
                                onChange={handleChange}
                                placeholder="Enter amount"
                                className="input input-bordered w-full"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text">Type *</span>
                            </label>
                            <select
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                className="select select-bordered w-full"
                            >
                                <option value="borrow">
                                    Borrow (Money received)
                                </option>
                                <option value="return">
                                    Return (Money given back)
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text">Date *</span>
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                                className="input input-bordered w-full"
                                required
                            />
                        </div>

                        <div className="modal-action">
                            <button
                                type="submit"
                                className={`btn bg-violet-600 hover:bg-violet-700 text-white ${
                                    loading ? 'loading' : ''
                                }`}
                                disabled={loading}
                            >
                                {loading
                                    ? 'Saving...'
                                    : editId
                                    ? 'Update'
                                    : 'Save'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={closeModal}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
}
