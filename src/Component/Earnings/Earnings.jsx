import React, { useContext, useEffect, useMemo, useState } from 'react';
import { FaPlus, FaRegEdit } from 'react-icons/fa';
import { CiEdit } from 'react-icons/ci';
import EarningsModal from './EarningsModal';
import EditEarnings from './EditEarnings';
import useAxiosProtect from '../../utils/useAxiosProtect';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { ContextData } from '../../DataProvider';
import moment from 'moment';
import { BsChevronDoubleLeft, BsChevronDoubleRight } from 'react-icons/bs';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { setRefetch } from '../../redux/refetchSlice';
import { useDispatch, useSelector } from 'react-redux';

const number = (v) => (typeof v === 'number' ? v : Number(v || 0));
const fmt2 = (v) =>
    number(v).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
const safe = (v, fallback = '—') => (v === 0 || v ? v : fallback);

// Normalize one earning row coming from various sources (addEarnings, withdraw modal, legacy)
const normalizeEarning = (row) => {
    if (!row || typeof row !== 'object') return null;

    const dateRaw = row.date || row.createdAt || row.created_at;
    // Stored via backend as 'DD-MM-YYYY' (Asia/Dhaka); fallback to ISO if needed
    const date =
        typeof dateRaw === 'string'
            ? dateRaw
            : dateRaw
            ? moment(dateRaw).format('DD-MM-YYYY')
            : '—';

    // Month may be lowercase (august). Keep as given but make a Nice label.
    const monthRaw = row.month || row.Month;
    const month =
        typeof monthRaw === 'string'
            ? monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1)
            : safe(monthRaw);

    const clientID = row.clientId || row.clientID || row.client_id || '—';

    const imageQty = number(row.imageQty || row.imageQTY || row.qty || 0);

    // USD + rate + charge
    const totalUsd = number(
        row.totalUsd || row.totalUSD || row.totalDollar || row.total || 0
    );
    const convertRate = number(row.convertRate || row.rate || 0);
    const charge = number(row.charge || 0);

    // Computed/Stored BDT
    const convertedBdt = number(
        row.convertedBdt || row.totalBdt || row.bdtAmount || 0
    );
    const status = row.status || 'Unpaid';

    return {
        _id: row._id,
        date,
        month,
        clientID,
        imageQty,
        totalUsd,
        convertRate,
        charge,
        convertedBdt,
        status,
        __raw: row,
    };
};

const Earnings = () => {
    const { user } = useContext(ContextData);
    const axiosProtect = useAxiosProtect();
    const axiosSecure = useAxiosSecure();
    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    const [searchEarnings, setSearchEarnings] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [earnings, setEarnings] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalSummary, setTotalSummary] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedEarningId, setSelectedEarningId] = useState(null);

    // NEW: status change modal state
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [statusItem, setStatusItem] = useState(null);
    const [statusForm, setStatusForm] = useState({
        rateText: '',
        chargeText: '',
        totalUsdText: '',
        newStatus: '',
    });
    const [submittingStatus, setSubmittingStatus] = useState(false);

    // Fetch
    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const res = await axiosProtect.get('/getEarnings', {
                    params: {
                        userEmail: user?.email,
                        page: currentPage,
                        size: itemsPerPage,
                        search: searchEarnings,
                        month: selectedMonth, // pass "" for all
                    },
                });

                // Normalize rows
                const norm = (res.data?.result || [])
                    .map(normalizeEarning)
                    .filter(Boolean);
                setEarnings(norm);
                setTotalCount(res.data?.count || norm.length);

                // If backend does not give a summary, compute here
                const backendSummary = res.data?.totalSummary;
                if (backendSummary && typeof backendSummary === 'object') {
                    setTotalSummary({
                        totalImageQty: number(backendSummary.totalImageQty),
                        totalUsd: number(backendSummary.totalUsd),
                        avgRate: number(backendSummary.avgRate),
                        totalBdt: number(backendSummary.totalBdt),
                    });
                } else {
                    const totals = norm.reduce(
                        (acc, it) => {
                            acc.totalImageQty += number(it.imageQty);
                            acc.totalUsd += number(it.totalUsd);
                            acc.totalBdt += number(it.convertedBdt);
                            acc._rateSum += number(it.convertRate);
                            acc._rateCount += it.convertRate ? 1 : 0;
                            return acc;
                        },
                        {
                            totalImageQty: 0,
                            totalUsd: 0,
                            totalBdt: 0,
                            _rateSum: 0,
                            _rateCount: 0,
                        }
                    );
                    setTotalSummary({
                        totalImageQty: totals.totalImageQty,
                        totalUsd: totals.totalUsd,
                        totalBdt: totals.totalBdt,
                        avgRate: totals._rateCount
                            ? totals._rateSum / totals._rateCount
                            : 0,
                    });
                }
            } catch (err) {
                toast.error('Failed to fetch earnings');
            }
        };

        if (user?.email) fetchEarnings();
    }, [
        user?.email,
        currentPage,
        itemsPerPage,
        searchEarnings,
        selectedMonth,
        refetch,
        axiosProtect,
    ]);

    // Pagination helpers
    const totalPages = useMemo(
        () => Math.ceil((totalCount || 0) / itemsPerPage),
        [totalCount, itemsPerPage]
    );

    const renderPageNumbers = () => {
        const pages = [];
        const max = 5;
        const half = Math.floor(max / 2);

        if (totalPages <= max) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= half) {
            for (let i = 1; i <= max; i++) pages.push(i);
            pages.push('...', totalPages);
        } else if (currentPage > totalPages - half) {
            pages.push(1, '...');
            for (let i = totalPages - max + 1; i <= totalPages; i++)
                pages.push(i);
        } else {
            pages.push(1, '...');
            for (let i = currentPage - half; i <= currentPage + half; i++)
                pages.push(i);
            pages.push('...', totalPages);
        }
        return pages;
    };

    // ===== Status modal workflow =====
    const openStatusModal = (item) => {
        const currentStatus = item.status;
        const newStatus = currentStatus === 'Paid' ? 'Unpaid' : 'Paid';

        // Prefill with existing values if present; otherwise blank strings
        setStatusForm({
            rateText: item.convertRate ? String(item.convertRate) : '',
            chargeText: item.charge ? String(item.charge) : '',
            totalUsdText: item.totalUsd ? String(item.totalUsd) : '',
            newStatus,
        });
        setStatusItem(item);
        setStatusModalOpen(true);
        setTimeout(() => {
            document.getElementById('status-change-modal')?.showModal();
        }, 0);
    };

    const closeStatusModal = () => {
        setStatusModalOpen(false);
        setStatusItem(null);
        setSubmittingStatus(false);
        document.getElementById('status-change-modal')?.close();
    };

    const onStatusInput = (e) => {
        const { name, value } = e.target;
        setStatusForm((p) => ({ ...p, [name]: value }));
    };

    const statusRate = useMemo(
        () => number(statusForm.rateText || undefined),
        [statusForm.rateText]
    );
    const statusCharge = useMemo(
        () => number(statusForm.chargeText || 0),
        [statusForm.chargeText]
    );
    const statusTotalUsd = useMemo(
        () => number(statusForm.totalUsdText || undefined),
        [statusForm.totalUsdText]
    );

    // Preview: if we have USD and rate, use (USD - charge) * rate; otherwise show existing BDT
    const previewBdt = useMemo(() => {
        if (!statusModalOpen || !statusItem) return 0;
        if (
            Number.isFinite(statusTotalUsd) &&
            Number.isFinite(statusRate) &&
            statusRate > 0
        ) {
            const receivable =
                statusTotalUsd -
                (Number.isFinite(statusCharge) ? statusCharge : 0);
            return Math.max(0, receivable * statusRate);
        }
        return number(statusItem.convertedBdt); // fallback to existing
    }, [statusModalOpen, statusItem, statusTotalUsd, statusRate, statusCharge]);

    const submitStatusChange = async (e) => {
        e?.preventDefault?.();
        if (!statusItem) return;

        try {
            setSubmittingStatus(true);

            const parsedYear = moment(statusItem.date, 'DD-MM-YYYY').format(
                'YYYY'
            );

            const payload = {
                year: parsedYear,
                month: (statusItem?.month || '').toLowerCase(),
                newStatus: statusForm.newStatus, // "Paid" | "Unpaid"
            };

            // include edit fields if given
            if (statusForm.rateText) payload.rate = number(statusForm.rateText);
            if (statusForm.chargeText)
                payload.charge = number(statusForm.chargeText);
            if (statusForm.totalUsdText)
                payload.totalUsd = number(statusForm.totalUsdText);

            const res = await axiosSecure.put(
                `/changeEarningStatus/${statusItem._id}`,
                payload
            );

            if (res.data?.success) {
                dispatch(setRefetch(!refetch));
                toast.success(`Status changed to ${statusForm.newStatus}`);
                closeStatusModal();
            } else {
                toast.error(res.data?.message || 'Failed to update status');
            }
        } catch (err) {
            toast.error('Failed to update the earning status');
        } finally {
            setSubmittingStatus(false);
        }
    };

    // =================================

    const handleOpenEditModal = (id) => {
        setSelectedEarningId(id);
        document.getElementById('edit-earning-modal')?.showModal();
    };

    const getStatusBadge = (status) => {
        const baseClasses = 'px-2 py-1 rounded-full text-xs font-semibold';
        switch (status) {
            case 'Paid':
                return `${baseClasses} bg-green-100 text-green-800`;
            case 'Unpaid':
                return `${baseClasses} bg-red-100 text-red-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    return (
        <div className="mt-2 pb-2">
            {/* Header & Controls */}
            <section className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                    Earnings List
                </h2>
                <div className="flex gap-2 flex-wrap">
                    <input
                        className="border border-gray-300 rounded px-2 py-1"
                        type="text"
                        placeholder="Search client, month, status, date"
                        value={searchEarnings}
                        onChange={(e) => {
                            setSearchEarnings(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                    <select
                        className="border border-gray-300 rounded px-2 py-1"
                        value={selectedMonth}
                        onChange={(e) => {
                            setSelectedMonth(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">All Months</option>
                        {moment.months().map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                    <button
                        className="bg-[#6E3FF3] text-white px-4 py-2 rounded"
                        onClick={() =>
                            document
                                .getElementById('add-new-earnings-modal')
                                ?.showModal()
                        }
                    >
                        <FaPlus className="inline mr-2" /> Add new earnings
                    </button>
                </div>
            </section>

            {/* Table */}
            <section>
                <div className="overflow-x-auto mt-5">
                    <table className="table table-zebra w-full">
                        <thead className="bg-[#6E3FF3] text-white">
                            <tr>
                                <th>Date</th>
                                <th>Month</th>
                                <th>Client ID</th>
                                <th>Image QTY</th>
                                <th>Total USD</th>
                                <th>Converted Rate</th>
                                <th>BDT Balance</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {earnings.length > 0 ? (
                                earnings.map((item) => (
                                    <tr
                                        key={
                                            item._id ||
                                            `${item.clientID}-${item.date}`
                                        }
                                    >
                                        <td>{safe(item.date)}</td>
                                        <td>{safe(item.month)}</td>
                                        <td>{safe(item.clientID)}</td>
                                        <td>{fmt2(item.imageQty)}</td>
                                        <td>{fmt2(item.totalUsd)}</td>
                                        <td>{fmt2(item.convertRate)}</td>
                                        <td>{fmt2(item.convertedBdt)}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={getStatusBadge(
                                                        item.status
                                                    )}
                                                >
                                                    {item.status}
                                                </span>
                                                <CiEdit
                                                    onClick={() =>
                                                        openStatusModal(item)
                                                    }
                                                    className="cursor-pointer hover:text-blue-500 ml-1"
                                                    size={18}
                                                    title="Toggle Paid/Unpaid with amount edits"
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <FaRegEdit
                                                className="cursor-pointer hover:text-yellow-500"
                                                title="Edit earning"
                                                onClick={() =>
                                                    handleOpenEditModal(
                                                        item._id
                                                    )
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center">
                                        No records found
                                    </td>
                                </tr>
                            )}

                            {/* Totals row */}
                            {earnings.length > 0 && (
                                <tr className="bg-gray-100 font-semibold">
                                    <td colSpan="3" className="text-right">
                                        Total:
                                    </td>
                                    <td>{fmt2(totalSummary.totalImageQty)}</td>
                                    <td>{fmt2(totalSummary.totalUsd)}</td>
                                    <td>{fmt2(totalSummary.avgRate)}</td>
                                    <td>{fmt2(totalSummary.totalBdt)}</td>
                                    <td colSpan="2" />
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex justify-between items-center">
                    <p>
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                        {Math.min(currentPage * itemsPerPage, totalCount)} of{' '}
                        {totalCount}
                    </p>
                    <div className="flex gap-1 items-center">
                        <button
                            onClick={() =>
                                setCurrentPage((p) => Math.max(p - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className="bg-[#6E3FF3] text-white px-2 py-2 rounded"
                        >
                            <BsChevronDoubleLeft />
                        </button>
                        {renderPageNumbers().map((page, i) => (
                            <button
                                key={`${page}-${i}`}
                                onClick={() =>
                                    typeof page === 'number' &&
                                    setCurrentPage(page)
                                }
                                className={`px-3 py-1 rounded ${
                                    currentPage === page
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-[#6E3FF3] text-white'
                                }`}
                                disabled={typeof page !== 'number'}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() =>
                                setCurrentPage((p) =>
                                    Math.min(p + 1, totalPages)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className="bg-[#6E3FF3] text-white px-2 py-2 rounded"
                        >
                            <BsChevronDoubleRight />
                        </button>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="ml-2 border px-2 py-1 rounded"
                        >
                            {[10, 20, 50, 100].map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Add Earnings Modal (includes withdraw-as-earnings) */}
            <EarningsModal />

            {/* Edit Earnings Modal */}
            <dialog id="edit-earning-modal" className="modal">
                <div className="modal-box max-w-3xl">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 bg-[#6E3FF3] text-white hover:bg-red-500">
                            ✕
                        </button>
                    </form>
                    {selectedEarningId ? (
                        <EditEarnings id={selectedEarningId} />
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>
            </dialog>

            {/* ===== Status Change Modal ===== */}
            <dialog id="status-change-modal" className="modal">
                <div className="modal-box w-full max-w-lg border-2 !border-primary">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-error absolute right-2 top-2 text-white">
                            ✕
                        </button>
                    </form>

                    <form
                        onSubmit={submitStatusChange}
                        className="space-y-4 text-gray-700"
                    >
                        <h3 className="font-bold text-xl mb-2 text-center">
                            Update Status & Amount
                        </h3>

                        {statusItem && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="label">
                                            <span className="label-text font-medium">
                                                Current Status
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            value={statusItem.status}
                                            readOnly
                                            className="input input-bordered w-full bg-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">
                                            <span className="label-text font-medium">
                                                New Status
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            value={statusForm.newStatus}
                                            readOnly
                                            className="input input-bordered w-full bg-gray-100"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="label">
                                            <span className="label-text font-medium">
                                                Total USD
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="totalUsdText"
                                            value={statusForm.totalUsdText}
                                            onChange={onStatusInput}
                                            placeholder={
                                                statusItem.totalUsd
                                                    ? String(
                                                          statusItem.totalUsd
                                                      )
                                                    : 'e.g., 320.00'
                                            }
                                            className="input input-bordered w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">
                                            <span className="label-text font-medium">
                                                Charge ($)
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="chargeText"
                                            value={statusForm.chargeText}
                                            onChange={onStatusInput}
                                            placeholder={
                                                statusItem.charge
                                                    ? String(statusItem.charge)
                                                    : 'e.g., 5.00'
                                            }
                                            className="input input-bordered w-full"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="label">
                                            <span className="label-text font-medium">
                                                Convert Rate (৳)
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="rateText"
                                            value={statusForm.rateText}
                                            onChange={onStatusInput}
                                            placeholder={
                                                statusItem.convertRate
                                                    ? String(
                                                          statusItem.convertRate
                                                      )
                                                    : 'e.g., 120.00'
                                            }
                                            className="input input-bordered w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="label">
                                            <span className="label-text font-medium">
                                                Preview BDT
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            value={fmt2(previewBdt)}
                                            readOnly
                                            className="input input-bordered w-full bg-gray-100 font-semibold"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Uses (Total USD − Charge) × Rate
                                            when provided; otherwise shows
                                            existing.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={closeStatusModal}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submittingStatus}
                            >
                                {submittingStatus ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default Earnings;
