import React, { useContext, useEffect, useState } from 'react';
import {
    Search,
    ChevronDown,
    Pencil,
    Trash2,   // ⬅️ NEW
} from 'lucide-react';
import { toast } from 'react-toastify';
import moment from 'moment';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { ContextData } from '../../DataProvider';
import { useSelector } from 'react-redux';
import { IoEyeOutline } from 'react-icons/io5';
import Countdown from 'react-countdown';
import { BsChevronDoubleLeft, BsChevronDoubleRight } from 'react-icons/bs';
import EditLocalOrderModal from './EditLocalOrderModal';
import Swal from 'sweetalert2';

const OrderTable = () => {
    const axiosProtect = useAxiosProtect();
    const { user, currentUser } = useContext(ContextData);
    const refetch = useSelector((state) => state.refetch.refetch);

    const [searchOption, setSearchOption] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [sortValue, setSortValue] = useState('Date');

    const [localOrder, setLocalOrder] = useState([]);
    const [orderCount, setOrderCount] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [editing, setEditing] = useState(null);

    const sortValues = [
        'Date',
        'Expense',
        'Amount',
        'Category',
        'Status',
        'Note',
        'User',
        'Action',
    ];

    // Fetch list
    useEffect(() => {
        const fetchLocalOrder = async () => {
            try {
                const { data } = await axiosProtect.get('/getLocalOrder', {
                    params: {
                        userEmail: user?.email,
                        page: currentPage,
                        size: itemsPerPage,
                        search: searchOption,
                    },
                });
                setLocalOrder(data?.orders || []);
                setOrderCount(data?.count || 0);
            } catch (error) {
                toast.error(error?.response?.data?.message || 'Failed to load orders');
            }
        };
        if (user?.email) fetchLocalOrder();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetch, currentPage, itemsPerPage, searchOption, axiosProtect, user?.email]);

    const handleViewOrder = (id) => {
        window.open(`/recentOrders/${id}`, '_blank');
    };

    // NEW: delete handler
    const handleDeleteOrder = async (order) => {
        const canDelete = currentUser?.role === 'Admin' || currentUser?.role === 'Developer';
        if (!canDelete) return;

        const blocked =
            order.isLocked ||
            ['Completed', 'Delivered'].includes(String(order.orderStatus));
        if (blocked) {
            toast.warn('This order is locked or finalized and cannot be deleted.');
            return;
        }

        const result = await Swal.fire({
            title: 'Delete this order?',
            html: `
      <div style="text-align:left">
        <div><b>Order:</b> ${order.orderName || '—'}</div>
        <div><b>Client ID:</b> ${order.clientID || '—'}</div>
      </div>
      <div style="margin-top:8px;color:#a00">This action cannot be undone.</div>
    `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            focusCancel: true,
        });

        if (!result.isConfirmed) return;

        try {
            await axiosProtect.delete(`/orders/${order._id}`, {
                params: { userEmail: user?.email },
            });

            setLocalOrder((prev) => prev.filter((o) => o._id !== order._id));
            setOrderCount((c) => Math.max(0, c - 1));

            await Swal.fire({
                title: 'Deleted',
                text: 'The order has been deleted.',
                icon: 'success',
                timer: 1400,
                showConfirmButton: false,
            });
        } catch (err) {
            Swal.fire({
                title: 'Delete failed',
                text: err?.response?.data?.message || 'Failed to delete order',
                icon: 'error',
            });
        }
    };


    // Pagination helpers
    const numberOfPages = Math.ceil(orderCount / itemsPerPage);

    const renderPageNumbers = () => {
        const pages = [];
        const totalPages = numberOfPages;
        const maxPagesToShow = 5;
        const half = Math.floor(maxPagesToShow / 2);

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= half) {
            for (let i = 1; i <= maxPagesToShow; i++) pages.push(i);
            pages.push('...', totalPages);
        } else if (currentPage > totalPages - half) {
            pages.push(1, '...');
            for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1, '...');
            for (let i = currentPage - half; i <= currentPage + half; i++) pages.push(i);
            pages.push('...', totalPages);
        }
        return pages;
    };

    const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const handleNextPage = () => currentPage < numberOfPages && setCurrentPage(currentPage + 1);
    const handleItemsPerPage = (e) => {
        setItemsPerPage(parseInt(e.target.value, 10));
        setCurrentPage(1);
    };

    return (
        <div className="w-full bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col gap-6 mb-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Order List</h2>
                </div>

                <div className="flex justify-between items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
                        <input
                            type="text"
                            placeholder="Search order..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6E3FF3] focus:border-transparent"
                            value={searchOption}
                            onChange={(e) => {
                                setSearchOption(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            <span className="text-sm text-gray-600">{sortValue}</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        {isOpen && (
                            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-100 rounded-lg shadow-lg z-10">
                                {sortValues.map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => {
                                            setSortValue(item);
                                            setIsOpen(false);
                                        }}
                                        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left first:rounded-t-lg last:rounded-b-lg"
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto mt-5">
                <table className="table table-zebra">
                    <thead className="bg-[#6E3FF3] text-white">
                        <tr>
                            <th className="w-[12%]">Date</th>
                            <th>Client ID</th>
                            <th>Order Name</th>
                            <th>Order QTY</th>
                            {(currentUser?.role === 'Admin' ||
                                currentUser?.role === 'HR-ADMIN' ||
                                currentUser?.role === 'Developer') && <th>Order Price</th>}
                            <th>Deadline</th>
                            <th>Status</th>
                            <th>User</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {localOrder?.length ? (
                            localOrder.map((order) => {
                                const canAdmin =
                                    currentUser?.role === 'Admin' || currentUser?.role === 'Developer';
                                const canSeePrice =
                                    canAdmin || currentUser?.role === 'HR-ADMIN';

                                const blocked =
                                    order.isLocked ||
                                    ['Completed', 'Delivered'].includes(String(order.orderStatus));

                                return (
                                    <tr key={order._id}>
                                        <td>{order?.date ? moment(order.date).format('DD-MMM-YYYY') : '—'}</td>
                                        <td>{order.clientID}</td>
                                        <td>{order.orderName}</td>
                                        <td>
                                            {Number(order.orderQTY || 0).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>
                                        {canSeePrice && (
                                            <td>
                                                {Number(order.orderPrice || 0).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </td>
                                        )}
                                        <td>
                                            {order?.orderDeadLine ? (
                                                <Countdown
                                                    date={moment(order.orderDeadLine, 'DD-MMM-YYYY HH:mm:ss').valueOf()}
                                                    renderer={({ days, hours, minutes, seconds }) => (
                                                        <span>
                                                            {String(days).padStart(2, '0')}d{' '}
                                                            {String(hours).padStart(2, '0')}h{' '}
                                                            {String(minutes).padStart(2, '0')}m{' '}
                                                            {String(seconds).padStart(2, '0')}s
                                                        </span>
                                                    )}
                                                />
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                        <td>{order.orderStatus}</td>
                                        <td>{order.userName}</td>
                                        <td className="w-[10%]">
                                            <div className="flex items-center gap-2 justify-center">
                                                {/* View */}
                                                <IoEyeOutline
                                                    className="text-xl cursor-pointer hover:text-[#6E3FF3]"
                                                    onClick={() => handleViewOrder(order?._id)}
                                                    title="View"
                                                />

                                                {/* Edit (Admin/Developer; disabled when locked/completed/delivered) */}
                                                {canAdmin && (
                                                    <button
                                                        className="btn btn-sm btn-ghost"
                                                        title={
                                                            blocked
                                                                ? 'Locked / finalized (extend deadline to edit)'
                                                                : 'Edit order'
                                                        }
                                                        onClick={() => {
                                                            if (blocked) return;
                                                            setEditing(order);
                                                        }}
                                                        disabled={blocked}
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                )}

                                                {/* Delete (Admin/Developer; disabled when locked/completed/delivered) */}
                                                {canAdmin && (
                                                    <button
                                                        className="btn btn-sm btn-ghost text-red-600"
                                                        title={blocked ? 'Locked / finalized – cannot delete' : 'Delete order'}
                                                        onClick={() => !blocked && handleDeleteOrder(order)}
                                                        disabled={blocked}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>

                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="9" className="text-center">
                                    No order found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {editing && (
                    <EditLocalOrderModal
                        open={Boolean(editing)}
                        order={editing}
                        onClose={() => setEditing(null)}
                        onUpdated={() => setEditing(null)} // refetch toggled inside modal
                    />
                )}
            </div>

            {/* Footer / Pagination */}
            <div className="text-center">
                {orderCount > 10 && (
                    <div className="mt-5 flex justify-between items-center">
                        <div>
                            <p>
                                Showing {(currentPage - 1) * itemsPerPage + 1} -
                                {Math.min(currentPage * itemsPerPage, orderCount)} of {orderCount} entries
                            </p>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={handlePrevPage}
                                className={`py-2 px-2 bg-[#6E3FF3] text-white rounded-md ${currentPage !== 1 ? 'hover:bg-yellow-600 cursor-pointer' : ''
                                    }`}
                                disabled={currentPage === 1}
                                title="Previous"
                            >
                                <BsChevronDoubleLeft />
                            </button>

                            {renderPageNumbers().map((page, idx) => (
                                <button
                                    key={`${page}-${idx}`}
                                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                                    className={`py-1 px-3 bg-[#6E3FF3] text-white rounded-md hover:bg-yellow-600 cursor-pointer ${currentPage === page ? '!bg-yellow-600' : ''
                                        }`}
                                    disabled={typeof page !== 'number'}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={handleNextPage}
                                className={`py-2 px-2 bg-[#6E3FF3] text-white rounded-md ${currentPage !== numberOfPages ? 'hover:bg-yellow-600 cursor-pointer' : ''
                                    }`}
                                disabled={currentPage === numberOfPages}
                                title="Next"
                            >
                                <BsChevronDoubleRight />
                            </button>

                            <select
                                value={itemsPerPage}
                                onChange={handleItemsPerPage}
                                className="select select-sm py-1 px-1 rounded-md bg-[#6E3FF3] text-white outline-none hover:bg-yellow-600"
                                title="Rows per page"
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderTable;
