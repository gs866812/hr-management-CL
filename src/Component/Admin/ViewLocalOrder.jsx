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
import DatePicker from 'react-datepicker';

const ViewLocalOrder = () => {
    const { user, currentUser } = useContext(ContextData);


    const axiosSecure = useAxiosSecure();

    const [localOrder, setLocalOrder] = useState({});
    const [isRunning, setIsRunning] = useState(false);
    const [deadline, setDeadline] = useState(null);


    // const [totalSeconds, setTotalSeconds] = useState(0);
    const [totalSeconds, setTotalSeconds] = useState(parseInt(localOrder?.lastUpdated) || 0);
    // const savedTotalSeconds = useRef(parseInt(parseInt(localOrder?.lastUpdated) || 0) || 0); // Store initial saved value
    const savedTotalSeconds = useRef(parseInt(localOrder?.lastUpdated) || 0); // Store initial saved value
    // const intervalRef = useRef(null);


    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    const { orderId } = useParams();


    // ************************************************************************************************
    const handleDeadlineChange = (date) => {
        const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const deadlineWithTimezone = {
            date: date.toISOString(),
            timezoneName,
        };
        setDeadline(deadlineWithTimezone);
    };

    const getSelectedDate = () => (deadline ? new Date(deadline.date) : null);
    const filterPastTimes = (time) => moment(time).isSameOrAfter(moment());
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
    }, [refetch, totalSeconds]);
    // ************************************************************************************************
    // Start timer when allowed
    useEffect(() => {
        let intervalId;

        if (isRunning) {
            intervalId = setInterval(() => {
                setTotalSeconds((prevSeconds) => prevSeconds + 1);
            }, 1000);
        }

        return () => clearInterval(intervalId); // Clean up interval on unmount or isRunning change
    }, [isRunning]);

    useEffect(() => {
        // Only add saved seconds ONCE when component mounts AND timer is not running.
        // This ensures it's added only when starting or on reload if the timer was off.
        if (!isRunning) {
            setTotalSeconds(prevSeconds => prevSeconds + savedTotalSeconds.current);
            savedTotalSeconds.current = 0; // Prevent adding it again
        }
    }, []);


    // ************************************************************************************************
    // Convert seconds to days, hours, minutes, seconds
    const formatTime = (seconds) => {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
    };
    // ************************************************************************************************
    const handleReadyToQC = () => {
        const changeOrderToQC = async () => {
            try {
                const response = await axiosSecure.put(`/orderStatusQC/${orderId}`);

                if (response.data.modifiedCount > 0) {
                    setIsRunning(false);
                    dispatch(setRefetch(!refetch));
                    Swal.fire({
                        title: "Order Ready to QC!",
                        showConfirmButton: false,
                        icon: "success",
                        timer: 1000
                    });
                }
            } catch (error) {
                toast.error(`Error fetching data: ${error.message}`);
            }
        }
        changeOrderToQC();
    };
    // ************************************************************************************************
    const handleReadyToUpload = () => {
        const changeOrderDelivered = async () => {
            try {
                const response = await axiosSecure.put(`/orderStatusDelivered/${orderId}`);

                if (response.data.modifiedCount > 0) {
                    setIsRunning(false);
                    dispatch(setRefetch(!refetch));
                    Swal.fire({
                        title: "Order has been delivered",
                        showConfirmButton: false,
                        icon: "success",
                        timer: 1000
                    });
                }
            } catch (error) {
                toast.error(`Error fetching data: ${error.message}`);
            }
        }
        changeOrderDelivered();
    };
    // ************************************************************************************************
    const modifyOrder = () => {
        const changeOrderModify = async () => {
            try {
                const response = await axiosSecure.put(`/modifyOrderToInitial/${orderId}`);

                if (response.data.modifiedCount > 0) {
                    setIsRunning(false);
                    dispatch(setRefetch(!refetch));
                    Swal.fire({
                        title: "Order has been modified",
                        showConfirmButton: false,
                        icon: "success",
                        timer: 1000
                    });
                }
            } catch (error) {
                toast.error(`Error fetching data: ${error.message}`);
            }
        }
        changeOrderModify();
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
                            setIsRunning(true);
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

            try {
                const response = await axiosSecure.put(`/orderStatusHold/${orderId}`, {
                    completeTime: totalSeconds,
                    lastUpdated: Math.floor(Date.now() / 1000),
                });

                if (response.data.modifiedCount > 0) {
                    setIsRunning(false);
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
    const handleDeadlineExtend = async (e) => {
        e.preventDefault();
        const deadlineMoment = moment(deadline.date).tz(deadline.timezoneName);
        const newDeadline = deadlineMoment.format('DD-MMM-YYYY HH:mm:ss');
        try {
            const response = await axiosSecure.put(`/extendDeadline/${orderId}`, {newDeadline});

            if (response.data.modifiedCount > 0) {
                // Update the order with the new deadline
                dispatch(setRefetch(!refetch));
                toast.success('Deadline extended successfully');
            }
        } catch (error) {
            toast.error(`Error fetching data: ${error.message}`);
        }
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
                                <h2 className='font-semibold text-xl'> Order details </h2>
                                <h2 className=''>Order Name: {localOrder?.orderName}</h2>
                                <h2 className='mt-2'>Services: {
                                    localOrder?.needServices?.map((service, index) => <span key={index} className='mr-1 font-semibold bg-gray-300 rounded-sm p-1 text-sm'>{service}</span>)
                                }</h2>
                                <p className='bg-gray-300 rounded-md p-2 mt-5'>{localOrder?.orderInstructions}</p>

                                <div className='text-sm mt-5 flex justify-between'>
                                    {
                                        localOrder?.colorCode &&
                                        <p>Color change to: {localOrder?.colorCode}</p>
                                    }
                                    {
                                        localOrder?.imageResize &&
                                        <p>Image resize to: {localOrder?.imageResize}</p>
                                    }

                                </div>
                                <h2 className='mt-2'>Return file format: <span>{localOrder?.returnFormat}</span></h2>
                            </section>

                        </div>

                        {/**************** order info right side **********************/}
                        <div className='w-[30%] border-r'>
                            <section className='shadow-md rounded-md p-4'>
                                <h2 className='font-semibold text-xl'>Time left to deliver</h2>

                                {/*  */}
                                {(localOrder && (currentUser?.role === 'Admin' || currentUser?.role === 'Developer')) && (
                                    <Countdown
                                        date={moment(localOrder.orderDeadLine).valueOf()}
                                        renderer={({ days, hours, minutes, seconds, completed }) => {
                                            if (completed) {
                                                return (
                                                    <form onSubmit={handleDeadlineExtend} className="flex">
                                                        <DatePicker
                                                            selected={getSelectedDate()}
                                                            onChange={handleDeadlineChange}
                                                            showTimeSelect
                                                            dateFormat="dd.MM.yyyy hh:mm aa"
                                                            filterTime={filterPastTimes}
                                                            className="!border !border-gray-300 p-2 rounded-l-md w-full"
                                                            minDate={new Date()}
                                                            placeholderText="Extend deadline"
                                                            required
                                                        />
                                                        <button
                                                            type="submit"
                                                            className="!border !border-gray-300 p-2 bg-[#6E3FF3] text-white rounded-r-md cursor-pointer"
                                                        >
                                                            Extend
                                                        </button>
                                                    </form>
                                                );
                                            } else {
                                                return null;
                                            }
                                        }}
                                    />
                                )}

                                {/*  */}

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
                                <p className='text-sm mt-2'>Order place on: {localOrder?.date}</p>
                            </section>
                            {/* ------------------------------------------------------------------------ */}
                            <section className='shadow-md rounded-md p-4 mt-5 space-y-2'>
                                <h2>
                                    Client ID:{" "}
                                    <span className="font-semibold">
                                        {currentUser?.role === 'Admin' || currentUser?.role === 'HR-ADMIN' || currentUser?.role === 'Developer'
                                            ? localOrder?.clientID
                                            : '*****'}
                                    </span>
                                </h2>

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
                            {localOrder && (
                                <Countdown
                                    date={moment(localOrder.orderDeadLine).valueOf()} // Convert to timestamp
                                    renderer={({ days, hours, minutes, seconds }) => (
                                        // Countdown time of deadline-------------------------------
                                        <section className={`shadow-md rounded-md p-4 mt-5 border ${days == '00' && hours == '00' && minutes == '00' && seconds == '00' ? 'hidden' : ''}`}>
                                            <div className={`flex items-center gap-2 ${localOrder?.orderStatus === "Delivered" ? "hidden" : ""}`}>
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
                                                    className={`text-white py-1 px-3 rounded-md ${localOrder?.orderStatus == "Hold" || localOrder?.orderStatus == "Pending" || localOrder?.orderStatus == "Delivered" || localOrder?.orderStatus == "Reviewing"
                                                        ? "bg-gray-400 cursor-not-allowed"
                                                        : "bg-[#6E3FF3] cursor-pointer"
                                                        }`}
                                                    onClick={handleHold}
                                                    disabled={localOrder?.orderStatus == "Hold" || localOrder?.orderStatus == "Pending"}
                                                >
                                                    Hold
                                                </button>
                                            </div>

                                            <div className={`mt-3 ${localOrder?.orderStatus === "Delivered" ? "hidden" : ""}`}>
                                                {
                                                    localOrder && localOrder?.orderStatus !== "Ready to QC" ?
                                                        <button id='readyToQC' onClick={handleReadyToQC}
                                                            className={`text-white py-1 px-3 rounded-md ${localOrder?.orderStatus !== "In-progress"
                                                                ? "bg-gray-400 cursor-not-allowed"
                                                                : "bg-[#6E3FF3] cursor-pointer"
                                                                }`}>Ready to QC
                                                        </button>
                                                        :
                                                        <button id='readyToUpload' onClick={handleReadyToUpload}
                                                            className={`text-white py-1 px-3 rounded-md ${localOrder?.orderStatus !== "Ready to QC"
                                                                ? "bg-gray-400 cursor-not-allowed"
                                                                : "bg-[#6E3FF3] cursor-pointer"
                                                                }`}>Ready to upload
                                                        </button>

                                                }


                                            </div>
                                            {localOrder && localOrder?.orderStatus === "Delivered" ?
                                                <div className=''>
                                                    <button id='modify' onClick={modifyOrder}
                                                        className={`text-white py-1 px-3 rounded-md ${localOrder?.orderStatus === "Delivered"
                                                            ? "bg-[#6E3FF3] cursor-pointer"
                                                            :
                                                            "bg-gray-400 cursor-not-allowed"
                                                            }`}>Request to modify
                                                    </button>
                                                </div>
                                                :
                                                null

                                            }


                                        </section>
                                    )}
                                />
                            )}
                        </div>
                    </div>
                    :
                    <h2>No order found</h2>
            }
        </>
    );
};

export default ViewLocalOrder;