import React, { useContext, useEffect, useRef, useState } from 'react';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ContextData } from '../../DataProvider';
import Countdown from 'react-countdown';
import moment from 'moment';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { setRefetch } from '../../redux/refetchSlice';

const ViewLocalOrder = () => {
    const { user, userName } = useContext(ContextData);
    const axiosSecure = useAxiosSecure();

    const [localOrder, setLocalOrder] = useState({});
    const [totalSeconds, setTotalSeconds] = useState(0);
    const intervalRef = useRef(null);


    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    const { orderId } = useParams();

    // ************************************************************************************************
    const axiosProtect = useAxiosProtect();

    useEffect(() => {
        const fetchSingleOrder = async () => {
            try {
                const response = await axiosProtect.get(`/getSingleOrder/${orderId}`, {
                    params: {
                        userEmail: user?.email,
                    },
                });
                setLocalOrder(response.data);

                if (response.data.completeTime && response.data.lastUpdated) {
                    const savedSeconds = response.data.completeTime;
                    const lastUpdated = response.data.lastUpdated; // Timestamp from DB

                    // Calculate elapsed time since last update
                    const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
                    const elapsedTime = currentTime - lastUpdated;

                    setTotalSeconds(savedSeconds + elapsedTime); // Add elapsed time
                }
            } catch (error) {
                toast.error('Error fetching data:', error.message);
            }
        };
        fetchSingleOrder();
    }, [refetch]);
    // ************************************************************************************************
    // Start timer when allowed
    useEffect(() => {
        if (localOrder?.orderStatus !== "Pending" && localOrder.orderStatus !== "Hold") {
            intervalRef.current = setInterval(() => {
                setTotalSeconds((prev) => prev + 1);
            }, 1000);
        }

        return () => clearInterval(intervalRef.current);
    }, [localOrder.orderStatus]);
    // ************************************************************************************************
    // Convert seconds to days, hours, minutes, seconds
    const formatTime = (seconds) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${days}d ${hours}h ${minutes}m ${secs}s`;
    };
    // ************************************************************************************************

    const handleStart = () => {
        Swal.fire({
            title: "Are you sure?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#6E3FF3",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes"
        }).then((result) => {
            if (result.isConfirmed) {
                const changeOrderStatus = async () => {
                    try {
                        const response = await axiosSecure.put(`/orderStatusChange/${orderId}`, {
                            params: {
                                userEmail: user?.email,
                            },
                        });
                        if (response.data.modifiedCount > 0) {
                            dispatch(setRefetch(!refetch));
                            Swal.fire({
                                title: "Order Started!",
                                showConfirmButton: false,
                                icon: "success",
                                timer: 1000
                            });
                        }

                    } catch (error) {
                        toast.error('Error fetching data:', error.message);
                    }
                };
                changeOrderStatus();
            }
        });
    };
    // ************************************************************************************************
    const handleHold = () => {
        const changeOrderToHold = async () => {
            clearInterval(intervalRef.current);
            try {
                const response = await axiosSecure.put(`/orderStatusHold/${orderId}`, {
                    completeTime: totalSeconds,
                    lastUpdated: Math.floor(Date.now() / 1000),
                });

                if (response.data.modifiedCount > 0) {
                    dispatch(setRefetch(!refetch));
                    Swal.fire({
                        title: "Order Hold!",
                        showConfirmButton: false,
                        icon: "success",
                        timer: 1000
                    });
                }
            } catch (error) {
                toast.error(`Error fetching data: ${error.message}`);
            }
        };
        changeOrderToHold();
    };

    // ************************************************************************************************

    return (
        <>
            {
                localOrder ?
                    <div className='w-full gap-5 flex h-[89vh] overflow-y-auto custom-scrollbar'>

                        {/********************* * order details left side ************/}
                        <div className='w-[70%] overflow-y-auto custom-scrollbar'>
                            <section className='shadow-md rounded-md p-4'>
                                <h2 className='font-semibold'> Order details: </h2>
                                <h2 className=''>Order Name: {localOrder?.orderName}</h2>
                                <p className='bg-gray-300 rounded-md p-2 mt-5'>{`${localOrder?.orderInstructions}`}</p>
                            </section>

                        </div>

                        {/**************** order info right side **********************/}
                        <div className='w-[30%] border-r'>
                            <section className='shadow-md rounded-md p-4'>
                                <h2 className='font-semibold text-xl'>Time left to deliver</h2>
                                <div>
                                    {localOrder?.orderDeadLine && (
                                        <Countdown
                                            date={moment(localOrder.orderDeadLine).valueOf()} // Convert to timestamp
                                            renderer={({ days, hours, minutes, seconds }) => (
                                                // Countdown time of deadline-------------------------------
                                                <section className='flex gap-3 mt-3'>
                                                    <div className={`flex flex-col items-center p-1 rounded-md bg-[#6E3FF3] text-white ${days == '00' ? 'bg-red-400' : ''}`}>
                                                        <h2 className={`font-bold border-b`}>{String(days).padStart(2, "0")}</h2>
                                                        <h2>Day's</h2>
                                                    </div>
                                                    <div className={`flex flex-col items-center p-1 rounded-md bg-[#6E3FF3] text-white ${days == '00' && hours == '00' ? 'bg-red-400' : ''}`}>
                                                        <h2 className='font-bold border-b'> {String(hours).padStart(2, "0")}</h2>
                                                        <h2>Hours</h2>
                                                    </div>
                                                    <div className={`flex flex-col items-center p-1 rounded-md bg-[#6E3FF3] text-white ${days == '00' && hours == '00' && minutes == '00' ? 'bg-red-400' : ''}`}>
                                                        <h2 className='font-bold border-b'>{String(minutes).padStart(2, "0")}</h2>
                                                        <h2>Minutes</h2>
                                                    </div>
                                                    <div className={`flex flex-col items-center p-1 rounded-md bg-[#6E3FF3] text-white ${days == '00' && hours == '00' && minutes == '00' && seconds == '00' ? 'bg-red-400' : ''}`}>
                                                        <h2 className='font-bold border-b'> {String(seconds).padStart(2, "0")}</h2>
                                                        <h2>Seconds</h2>
                                                    </div>
                                                </section>
                                            )}
                                        />
                                    )}
                                </div>
                            </section>
                            {/* ------------------------------------------------------------------------ */}
                            <section className='shadow-md rounded-md p-4 mt-5 space-y-2'>
                                <h2>Client ID: <span className='font-semibold'>{localOrder?.clientID}</span></h2>
                                <h2>Order Name: <span className='font-semibold'>{localOrder?.orderName}</span></h2>
                                <h2>Order QTY: <span className='font-semibold'>{localOrder?.orderQTY}</span></h2>
                                <h2>
                                    Order Status: <span className={`
                                    ${localOrder?.orderStatus === "Pending" ? "text-yellow-400" : ""}
                                    ${localOrder?.orderStatus === "Hold" ? "text-red-500" : ""}
                                    ${localOrder?.orderStatus === "In-progress" ? "text-green-500" : ""}
                                `}>
                                        {localOrder?.orderStatus}
                                    </span>
                                </h2>
                                <h2>Completion time: <span className='font-semibold border px-1 rounded-md'>{formatTime(totalSeconds)}</span></h2>
                            </section>
                            {/* ------------------------------------------------------------------------ */}
                            <section className='shadow-md rounded-md p-4 mt-5 flex items-center gap-2'>
                                <button
                                    className={`text-white py-1 px-3 rounded-md ${localOrder?.orderStatus !== "Pending" && localOrder?.orderStatus !== "Hold"
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-[#6E3FF3] cursor-pointer"
                                        }`}
                                    onClick={handleStart}
                                    disabled={localOrder?.orderStatus !== "Pending" && localOrder?.orderStatus !== "Hold"}
                                >
                                    Start the order
                                </button>
                                <button
                                    className={`text-white py-1 px-3 rounded-md ${localOrder?.orderStatus == "Hold" || localOrder?.orderStatus == "Pending"
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-[#6E3FF3] cursor-pointer"
                                        }`}
                                    onClick={handleHold}
                                    disabled={localOrder?.orderStatus == "Hold" || localOrder?.orderStatus == "Pending"}
                                >
                                    Hold
                                </button>

                            </section>
                        </div>
                    </div>
                    :
                    <h2>No order found</h2>
            }
        </>
    );
};

export default ViewLocalOrder;