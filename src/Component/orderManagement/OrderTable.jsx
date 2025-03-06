import React, { useContext, useEffect, useState } from 'react';
import {
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Edit2,
    SlidersHorizontal,
} from 'lucide-react';

import moment from 'moment';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { ContextData } from '../../DataProvider';
import { useSelector } from 'react-redux';
import { IoEyeOutline } from 'react-icons/io5';
import Countdown from 'react-countdown';



const OrderTable = () => {
    const axiosProtect = useAxiosProtect();

    const { user, userName } = useContext(ContextData);
    const refetch = useSelector((state) => state.refetch.refetch);


    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
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

    const statusStyles = {
        Approved: 'bg-green-100 text-green-700',
        Pending: 'bg-yellow-100 text-yellow-700',
        Rejected: 'bg-red-100 text-red-700',
    };


    // ****************************************************************************************
    useEffect(() => {
        const fetchLocalOrder = async () => {
            try {
                const response = await axiosProtect.get('/getLocalOrder', {
                    params: {
                        userEmail: user?.email,
                    },
                });
                setLocalOrder(response.data);
            } catch (error) {
                toast.error('Error fetching data:', error.message);
            }
        };
        fetchLocalOrder();
    }, [refetch]);


    // ****************************************************************************************
    const handleViewOrder = (id) => {
        // navigate(`${id}`);
        window.open(`/recentOrders/${id}`, "_blank");
    };
    // ****************************************************************************************

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
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                            <th>Order Price</th>
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
                                            <td>{order.orderQTY}</td>
                                            <td>{order.orderPrice}</td>
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

            <div className="flex items-center justify-between mt-6 py-4">
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
            </div>
        </div>
    );
};

export default OrderTable;
