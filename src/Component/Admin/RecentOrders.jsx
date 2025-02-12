import React, { useContext, useEffect, useState } from 'react';
import AssignOrderModal from '../Modal/AssignOrderModal';
import { Link } from 'react-router-dom';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { ContextData } from '../../DataProvider';
import { useSelector } from 'react-redux';
import moment from 'moment';
import Countdown from 'react-countdown';

const RecentOrders = () => {
    const { user, userName } = useContext(ContextData);
    const refetch = useSelector((state) => state.refetch.refetch);

    const [searchOrder, setSearchOrder] = useState('');
    const [localOrder, setLocalOrder] = useState([]);


    // ****************************************************************************************
    const axiosProtect = useAxiosProtect();

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
    const calculateDeadlineTimestamp = (orderDeadline) => { // Calculate timestamp
        if (!orderDeadline || !orderDeadline.date || !orderDeadline.timezoneName) return null;
    
        const deadlineMoment = moment.utc(orderDeadline.date);
        const gmt6Deadline = deadlineMoment.clone().tz(orderDeadline.timezoneName);
    
        return gmt6Deadline.valueOf(); // Get timestamp in milliseconds
      };

 
    // ****************************************************************************************
    return (
        <div>
            {/******************************************************************************************************/}
            <div>
                <div className='flex items-center justify-between'>
                    <h2 className='text-2xl'>Recent order list:</h2>
                    <div className="flex gap-2">
                        <label className="flex gap-1 items-center py-1 px-3 border rounded-md border-gray-500">
                            <input
                                type="text"
                                name="search"
                                placeholder="Search"
                                onChange={(e) => setSearchOrder(e.target.value)}
                                className=" hover:outline-none outline-none border-none"
                                size="13"
                            />
                        </label>

                        <Link to="/createLocalOrder" className="bg-[#6E3FF3] text-white px-2 rounded-md py-1 cursor-pointer">
                            Assign an order
                        </Link>
                    </div>
                </div>
                {/**************************************************************************************************/}
                <div className="overflow-x-auto mt-5">
                    <table className="table table-zebra">
                        {/* head */}
                        <thead>
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
                                        const deadlineTimestamp = calculateDeadlineTimestamp(order?.orderDeadline);
                                        return (
                                            <tr key={index}>
                                                
                                                <td>{order.clientID}</td>
                                                <td>{order.orderName}</td>
                                                <td>{order.orderQTY}</td>
                                                <td>{order.orderPrice}</td>
                                                <td>{<Countdown date={deadlineTimestamp + 10000} />}</td>
                                                <td>{order.orderStatus}</td>
                                                <td>{order.userName}</td>
                                                <td className='w-[5%]'>
                                                    <div className='flex justify-center'>
                                                        Edit
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
            </div>
            {/******************************************************************************************************/}
            <AssignOrderModal />
            {/******************************************************************************************************/}
        </div>
    );
};

export default RecentOrders;