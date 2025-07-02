import React, { useContext, useEffect, useState } from 'react';
import {
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Edit2,
    SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'react-toastify';
import moment from 'moment';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { ContextData } from '../../DataProvider';
import { useSelector } from 'react-redux';
import { IoEyeOutline } from 'react-icons/io5';
import Countdown from 'react-countdown';
import { BsChevronDoubleLeft, BsChevronDoubleRight } from 'react-icons/bs';



const OrderTable = () => {
    const axiosProtect = useAxiosProtect();

    const { user, currentUser } = useContext(ContextData);
    const refetch = useSelector((state) => state.refetch.refetch);


    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [orderCount, setOrderCount] = useState(0);
    const [searchOption, setSearchOption] = useState('');

    const [isOpen, setIsOpen] = useState(false);


    const [sortValue, setSortValue] = useState('Date');
    const [localOrder, setLocalOrder] = useState([]);


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


    // ****************************************************************************************
    useEffect(() => {
        const fetchLocalOrder = async () => {
            try {
                const response = await axiosProtect.get('/getLocalOrder', {
                    params: {
                        userEmail: user?.email,
                        page: currentPage,
                        size: itemsPerPage,
                        search: searchOption,
                    },
                });
                setLocalOrder(response.data.orders);
                setOrderCount(response.data.count);
            } catch (error) {
                toast.error('Error fetching data:', error.message);
            }
        };
        fetchLocalOrder();
    }, [refetch, currentPage, itemsPerPage, searchOption, axiosProtect]);


    // ****************************************************************************************
    const handleViewOrder = (id) => {
        // navigate(`${id}`);
        window.open(`/recentOrders/${id}`, "_blank");
    };
    // ****************************************************************************************
    // *************************pagination****************************************************************************
    const totalItem = orderCount;
    const numberOfPages = Math.ceil(totalItem / itemsPerPage);

    // ----------------------------------------------------------------

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        const halfMaxPagesToShow = Math.floor(maxPagesToShow / 2);
        const totalPages = numberOfPages;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage <= halfMaxPagesToShow) {
                for (let i = 1; i <= maxPagesToShow; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push("...", totalPages);
            } else if (currentPage > totalPages - halfMaxPagesToShow) {
                pageNumbers.push(1, "...");
                for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                pageNumbers.push(1, "...");
                for (
                    let i = currentPage - halfMaxPagesToShow;
                    i <= currentPage + halfMaxPagesToShow;
                    i++
                ) {
                    pageNumbers.push(i);
                }
                pageNumbers.push("...", totalPages);
            }
        }

        return pageNumbers;
    };
    // ----------------------------------------------------------------
    const handleItemsPerPage = (e) => {
        const val = parseInt(e.target.value);
        setItemsPerPage(val);
        setCurrentPage(1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < numberOfPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePageClick = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="w-full bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col gap-6 mb-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Order List
                    </h2>
                </div>

                <div className="flex justify-between items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
                        <input
                            type="text"
                            placeholder="Search order..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6E3FF3] focus:border-transparent"
                            value={searchOption}
                            onChange={(e) => setSearchOption(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            <SlidersHorizontal className="size-4 text-gray-600" />
                            <span className="text-sm text-gray-600">
                                {sortValue}
                            </span>
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        {isOpen && (
                            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-100 rounded-lg shadow-lg z-10">
                                {sortValues.map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => {
                                            setSortValue(period);
                                            setIsOpen(false);
                                        }}
                                        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left first:rounded-t-lg last:rounded-b-lg"
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto mt-5">
                <table className="table table-zebra">
                    {/* head */}
                    <thead className='bg-[#6E3FF3] text-white'>
                        <tr>
                            <th>Client ID</th>
                            <th>Order Name</th>
                            <th>Order QTY</th>
                            {
                                currentUser?.role === 'Admin' || currentUser?.role === 'HR-ADMIN' ||
                                currentUser?.role === 'Developer' && <th> Order Price</th>
                            }
                        <th>Deadline</th>
                        <th>Status</th>
                        <th>User</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        localOrder.length > 0 ? (
                            localOrder.map((order, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{order.clientID}</td>
                                        <td>{order.orderName}</td>
                                        <td>{Number(order.orderQTY).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                                        {
                                            currentUser?.role === 'Admin' || currentUser?.role === 'HR-ADMIN' ||
                                            currentUser?.role === 'Developer'
                                            && <td>{Number(order.orderPrice).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                                        }
                                        <td>
                                            {order?.orderDeadLine && (
                                                <Countdown
                                                    date={moment(order.orderDeadLine).valueOf()} // Convert to timestamp
                                                    renderer={({ days, hours, minutes, seconds }) => (
                                                        <span>
                                                            {String(days).padStart(2, "0")} days{" "}
                                                            {String(hours).padStart(2, "0")} h{" "}
                                                            {String(minutes).padStart(2, "0")} min{" "}
                                                            {String(seconds).padStart(2, "0")} sec
                                                        </span>
                                                    )}
                                                />
                                            )}
                                        </td>


                                        <td>{order.orderStatus}</td>
                                        <td>{order.userName}</td>
                                        <td className='w-[5%]'>
                                            <div className='flex justify-center'>
                                                <IoEyeOutline className='text-xl cursor-pointer hover:text-[#6E3FF3]' onClick={() => handleViewOrder(order?._id)} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center">No order found</td>
                            </tr>
                        )
                    }
                </tbody>
            </table>
        </div>

            {/* <div className="flex items-center justify-between mt-6 py-4 border">
                <div className="text-sm text-gray-600">
                    Showing 1-10 of 50 entries
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <ChevronLeft className="size-4 text-gray-600" />
                    </button>
                    {[1, 2, 3, 4, 5].map((page) => (
                        <button
                            key={page}
                            className={`px-3 py-1 rounded-lg ${currentPage === page
                                ? 'bg-[#6E3FF3] text-white'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            onClick={() => setCurrentPage(page)}
                        >
                            {page}
                        </button>
                    ))}
                    <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <ChevronRight className="size-4 text-gray-600" />
                    </button>
                </div>
            </div> */}
    <div className="text-center">
        {/*********************************pagination***********************************************************/}
        {orderCount > 10 && (
            <div className="mt-5 flex justify-between items-center">
                <div>
                    <p> Showing {(currentPage * itemsPerPage) - itemsPerPage + 1} -
                        {currentPage * itemsPerPage > orderCount ? orderCount : currentPage * itemsPerPage} of {orderCount} entries
                    </p>
                </div>

                <div className='flex items-center justify-items-center gap-1'>
                    <button
                        onClick={handlePrevPage}
                        className={`py-2 px-2 bg-[#6E3FF3] text-white rounded-md  ${currentPage !== 1 ? 'hover:bg-yellow-600 cursor-pointer' : ''}`}
                        disabled={currentPage === 1}
                    >
                        <BsChevronDoubleLeft /> {/* prev button */}
                    </button>
                    {renderPageNumbers().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === "number" && handlePageClick(page)}
                            className={`py-1 px-3 bg-[#6E3FF3] text-white rounded-md hover:bg-yellow-600 cursor-pointer ${currentPage === page ? "!bg-yellow-600" : ""
                                }`}
                            disabled={typeof page !== "number"}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={handleNextPage}
                        className={`py-2 px-2 bg-[#6E3FF3] text-white rounded-md  ${currentPage !== numberOfPages ? 'hover:bg-yellow-600 cursor-pointer' : ''}`}
                        disabled={currentPage === numberOfPages}
                    >
                        <BsChevronDoubleRight />  {/* next button */}
                    </button>

                    <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPage}
                        name=""
                        id=""
                        className="select select-sm py-1 px-1 rounded-md bg-[#6E3FF3] text-white outline-none hover:bg-yellow-600"
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
        </div >
    );
};

export default OrderTable;
