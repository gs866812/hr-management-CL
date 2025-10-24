import React, { useContext, useEffect, useState } from 'react';
import { FaPlus, FaRegEdit } from 'react-icons/fa';
import { CiEdit } from 'react-icons/ci';
import EarningsModal from './EarningsModal';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { ContextData } from '../../DataProvider';
import moment from 'moment';
import { BsChevronDoubleLeft, BsChevronDoubleRight } from 'react-icons/bs';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { setRefetch } from '../../redux/refetchSlice';
import { useDispatch, useSelector } from 'react-redux';

const Earnings = () => {
    const { user } = useContext(ContextData);
    const axiosProtect = useAxiosProtect();

    const [searchEarnings, setSearchEarnings] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [earnings, setEarnings] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalSummary, setTotalSummary] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const axiosSecure = useAxiosSecure();
    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const res = await axiosProtect.get('/getEarnings', {
                    params: {
                        userEmail: user?.email,
                        page: currentPage,
                        size: itemsPerPage,
                        search: searchEarnings,
                        month: selectedMonth,
                    },
                });

                setEarnings(res.data.result || []);
                setTotalCount(res.data.count || 0);
                setTotalSummary(res.data.totalSummary || {});
            } catch (err) {
                toast.error('Failed to fetch earnings');
            }
        };

        fetchEarnings();
    }, [
        user?.email,
        currentPage,
        itemsPerPage,
        searchEarnings,
        selectedMonth,
        refetch,
    ]);

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const totalPages = Math.ceil(totalCount / itemsPerPage);
        const max = 5;
        const half = Math.floor(max / 2);

        if (totalPages <= max) {
            for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else {
            if (currentPage <= half) {
                for (let i = 1; i <= max; i++) pageNumbers.push(i);
                pageNumbers.push('...', totalPages);
            } else if (currentPage > totalPages - half) {
                pageNumbers.push(1, '...');
                for (let i = totalPages - max + 1; i <= totalPages; i++)
                    pageNumbers.push(i);
            } else {
                pageNumbers.push(1, '...');
                for (let i = currentPage - half; i <= currentPage + half; i++)
                    pageNumbers.push(i);
                pageNumbers.push('...', totalPages);
            }
        }

        return pageNumbers;
    };

    // Dynamic status update handler
    const handleStatusUpdate = (item) => {
        const currentStatus = item.status;
        const newStatus = currentStatus === 'Paid' ? 'Unpaid' : 'Paid';

        Swal.fire({
            title: 'Are you sure?',
            text: `You want to change status from "${currentStatus}" to "${newStatus}"? Amount: ${item?.convertedBdt}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: `Yes, mark as ${newStatus}!`,
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const fullDate = item?.date;
                    const parsedDate = moment(fullDate, 'DD.MM.YYYY');

                    const res = await axiosSecure.put(
                        `/changeEarningStatus/${item._id}`,
                        {
                            amount: item?.convertedBdt,
                            year: parsedDate.format('YYYY'),
                            month: item?.month,
                            newStatus: newStatus,
                        }
                    );

                    if (res.data.success) {
                        dispatch(setRefetch(!refetch));
                        Swal.fire({
                            title: 'Updated!',
                            text: `Successfully changed status to "${newStatus}".`,
                            icon: 'success',
                        });
                    } else {
                        Swal.fire({
                            title: 'Update Failed!',
                            text:
                                res.data.message || 'Failed to update status.',
                            icon: 'error',
                        });
                    }
                } catch (error) {
                    console.error('❌ Status update failed:', error);
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to update the earning status.',
                        icon: 'error',
                    });
                }
            }
        });
    };

    // Get status badge style
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
            <section className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                    Earnings List{' '}
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
                                .showModal()
                        }
                    >
                        <FaPlus className="inline mr-2" /> Add new earnings
                    </button>
                </div>
            </section>

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
                                earnings.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.date}</td>
                                        <td>{item.month}</td>
                                        <td>{item.clientId}</td>
                                        <td>
                                            {item.imageQty.toLocaleString(
                                                undefined,
                                                { minimumFractionDigits: 2 }
                                            )}
                                        </td>
                                        <td>
                                            {item.totalUsd.toLocaleString(
                                                undefined,
                                                { minimumFractionDigits: 2 }
                                            )}
                                        </td>
                                        <td>
                                            {item.convertRate.toLocaleString(
                                                undefined,
                                                { minimumFractionDigits: 2 }
                                            )}
                                        </td>
                                        <td>
                                            {item.convertedBdt.toLocaleString(
                                                undefined,
                                                { minimumFractionDigits: 2 }
                                            )}
                                        </td>
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
                                                        handleStatusUpdate(item)
                                                    }
                                                    className="cursor-pointer hover:text-blue-500 ml-1"
                                                    title={`Change to ${
                                                        item.status === 'Paid'
                                                            ? 'Unpaid'
                                                            : 'Paid'
                                                    }`}
                                                    size={18}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <FaRegEdit
                                                className="cursor-pointer hover:text-red-500"
                                                title="Restricted"
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
                            {earnings.length > 0 && (
                                <tr className="bg-gray-100 font-semibold">
                                    <td colSpan="3" className="text-right">
                                        Total:
                                    </td>
                                    <td>{totalSummary.totalImageQty}</td>
                                    <td>
                                        {totalSummary.totalUsd?.toLocaleString(
                                            undefined,
                                            { minimumFractionDigits: 2 }
                                        )}
                                    </td>
                                    <td>
                                        {totalSummary.avgRate?.toLocaleString(
                                            undefined,
                                            { minimumFractionDigits: 2 }
                                        )}
                                    </td>
                                    <td>
                                        {totalSummary.totalBdt?.toLocaleString(
                                            undefined,
                                            { minimumFractionDigits: 2 }
                                        )}
                                    </td>
                                    <td colSpan="2"></td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Pagination */}
            {totalCount > itemsPerPage && (
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
                                key={i}
                                onClick={() =>
                                    typeof page === 'number' &&
                                    setCurrentPage(page)
                                }
                                className={`px-3 py-1 rounded ${
                                    currentPage === page
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-[#6E3FF3] text-white'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() =>
                                setCurrentPage((p) =>
                                    Math.min(
                                        p + 1,
                                        Math.ceil(totalCount / itemsPerPage)
                                    )
                                )
                            }
                            disabled={
                                currentPage ===
                                Math.ceil(totalCount / itemsPerPage)
                            }
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

            <EarningsModal />
        </div>
    );
};

export default Earnings;
