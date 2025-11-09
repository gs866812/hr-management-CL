import React, { useContext, useEffect, useState } from 'react';
import AssignOrderModal from '../Modal/AssignOrderModal';
import { IoEyeOutline } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { ContextData } from '../../DataProvider';
import { useSelector } from 'react-redux';
import moment from 'moment';
import Countdown from 'react-countdown';
import { toast } from 'react-toastify';


const RecentOrders = () => {
    const { user, userName } = useContext(ContextData);
    const refetch = useSelector((state) => state.refetch.refetch);

    const [searchOrder, setSearchOrder] = useState('');
    const [localOrder, setLocalOrder] = useState([]);
    const [viewOrder, setViewOrder] = useState('');

    const navigate = useNavigate();




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
    const handleViewOrder = (id) => {
        // navigate(`${id}`);
        window.open(`/recentOrders/${id}`, "_blank"); 
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
                                                    <IoEyeOutline className='text-xl cursor-pointer' onClick={() => handleViewOrder(order?._id)}/>
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