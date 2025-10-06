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
    const axiosProtect = useAxiosProtect();

    const [localOrder, setLocalOrder] = useState({});
    const [isRunning, setIsRunning] = useState(false);
    const [deadline, setDeadline] = useState(null);

    const [totalSeconds, setTotalSeconds] = useState(0);
    const savedTotalSeconds = useRef(0);

    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    const { orderId } = useParams();

    const status = localOrder?.orderStatus;
    const isLocked = !!localOrder?.isLocked;
    const isCanceled = status === 'Cancel';

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

    useEffect(() => {
        const fetchSingleOrder = async () => {
            try {
                const response = await axiosProtect.get(`/getSingleOrder/${orderId}`, {
                    params: {
                        userEmail: user?.email,
                    },
                });
                setLocalOrder(response.data);

                // Reconstruct running time
                if (response.data?.completeTime && response.data?.lastUpdated) {
                    const savedSeconds = parseInt(response.data.completeTime) || 0;
                    const lastUpdated = parseInt(response.data.lastUpdated) || 0; // seconds
                    const currentTime = Math.floor(Date.now() / 1000);
                    const elapsedTime = currentTime - lastUpdated;
                    setTotalSeconds(savedSeconds + (elapsedTime > 0 ? elapsedTime : 0));
                } else {
                    setTotalSeconds(parseInt(response.data?.completeTime) || 0);
                }
            } catch (error) {
                toast.error(`Error fetching data: ${error.message}`);
            }
        };
        fetchSingleOrder();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetch, orderId]);

    // Start timer when allowed
    useEffect(() => {
        let intervalId;
        if (isRunning) {
            intervalId = setInterval(() => {
                setTotalSeconds((prevSeconds) => prevSeconds + 1);
            }, 1000);
        }
        return () => clearInterval(intervalId);
    }, [isRunning]);

    useEffect(() => {
        if (!isRunning) {
            setTotalSeconds((prevSeconds) => prevSeconds + (savedTotalSeconds.current || 0));
            savedTotalSeconds.current = 0;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ************************************************************************************************
    // Convert seconds to d/h/m/s
    const formatTime = (seconds) => {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
    };
    // ************************************************************************************************

    const handleReadyToQC = () => {
        if (isLocked || isCanceled) return;
        const changeOrderToQC = async () => {
            try {
                const response = await axiosSecure.put(`/orderStatusQC/${orderId}`);
                if (response.data.modifiedCount > 0) {
                    setIsRunning(false);
                    dispatch(setRefetch(!refetch));
                    Swal.fire({ title: 'Order Ready to QC!', showConfirmButton: false, icon: 'success', timer: 1000 });
                }
            } catch (error) {
                toast.error(`Error: ${error.message}`);
            }
        };
        changeOrderToQC();
    };

    const handleReadyToUpload = () => {
        if (isLocked || isCanceled) return;
        const changeOrderToReadyToUpload = async () => {
            try {
                const response = await axiosSecure.put(`/orderStatusReadyToUpload/${orderId}`);
                if (response.data.modifiedCount > 0) {
                    setIsRunning(false);
                    dispatch(setRefetch(!refetch));
                    Swal.fire({ title: 'Order is Ready to upload', showConfirmButton: false, icon: 'success', timer: 1000 });
                }
            } catch (error) {
                toast.error(`Error: ${error.message}`);
            }
        };
        changeOrderToReadyToUpload();
    };

    const handleDelivered = () => {
        if (isLocked || isCanceled) return;
        const changeOrderDelivered = async () => {
            try {
                const response = await axiosSecure.put(`/orderStatusDelivered/${orderId}`);
                if (response.data.modifiedCount > 0) {
                    setIsRunning(false);
                    dispatch(setRefetch(!refetch));
                    Swal.fire({ title: 'Order has been delivered', showConfirmButton: false, icon: 'success', timer: 1000 });
                }
            } catch (error) {
                toast.error(`Error: ${error.message}`);
            }
        };
        changeOrderDelivered();
    };

    const handleComplete = () => {
        if (isLocked || isCanceled) return;
        const changeOrderComplete = async () => {
            try {
                const response = await axiosSecure.put(`/orderStatusComplete/${orderId}`);
                if (response.data.modifiedCount > 0) {
                    setIsRunning(false);
                    dispatch(setRefetch(!refetch));
                    Swal.fire({ title: 'Order marked as Completed', showConfirmButton: false, icon: 'success', timer: 1000 });
                }
            } catch (error) {
                toast.error(`Error: ${error.message}`);
            }
        };
        changeOrderComplete();
    };

    const modifyOrder = () => {
        if (isLocked || isCanceled) return;
        const changeOrderModify = async () => {
            try {
                const response = await axiosSecure.put(`/modifyOrderToInitial/${orderId}`);
                if (response.data.modifiedCount > 0) {
                    setIsRunning(false);
                    dispatch(setRefetch(!refetch));
                    Swal.fire({ title: 'Order has been modified', showConfirmButton: false, icon: 'success', timer: 1000 });
                }
            } catch (error) {
                toast.error(`Error: ${error.message}`);
            }
        };
        changeOrderModify();
    };

    const handleStart = () => {
        if (isLocked || isCanceled) return;
        Swal.fire({
            title: 'Are you sure?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#6E3FF3',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes'
        }).then((result) => {
            if (result.isConfirmed) {
                const changeOrderStatus = async () => {
                    try {
                        const response = await axiosSecure.put(`/orderStatusChange/${orderId}`, {
                            params: { userEmail: user?.email },
                        });
                        if (response.data.modifiedCount > 0) {
                            setIsRunning(true);
                            dispatch(setRefetch(!refetch));
                            Swal.fire({ title: 'Order Started!', showConfirmButton: false, icon: 'success', timer: 1000 });
                        }
                    } catch (error) {
                        toast.error(`Error: ${error.message}`);
                    }
                };
                changeOrderStatus();
            }
        });
    };

    const handleHold = () => {
        if (isLocked || isCanceled) return;
        const changeOrderToHold = async () => {
            try {
                const response = await axiosSecure.put(`/orderStatusHold/${orderId}`, {
                    completeTime: totalSeconds,
                    lastUpdated: Math.floor(Date.now() / 1000),
                });
                if (response.data.modifiedCount > 0) {
                    setIsRunning(false);
                    dispatch(setRefetch(!refetch));
                    Swal.fire({ title: 'Order Hold!', showConfirmButton: false, icon: 'success', timer: 1000 });
                }
            } catch (error) {
                toast.error(`Error: ${error.message}`);
            }
        };
        changeOrderToHold();
    };

    const handleDeadlineExtend = async (e) => {
        e.preventDefault();
        const deadlineMoment = moment(deadline.date).tz(deadline.timezoneName);
        const newDeadline = deadlineMoment.format('DD-MMM-YYYY HH:mm:ss');
        try {
            const response = await axiosSecure.put(`/extendDeadline/${orderId}`, { newDeadline });
            if (response.data.modifiedCount > 0) {
                setIsRunning(false);
                dispatch(setRefetch(!refetch));
                toast.success('Deadline extended successfully');
            }
        } catch (error) {
            toast.error(`Error: ${error.message}`);
        }
    };

    // NEW: Cancel / Re-store
    const handleCancelToggle = async () => {
        if (!isCanceled) {
            // Cancel flow
            const result = await Swal.fire({
                title: 'Cancel this order?',
                text: 'This will disable all other actions until restored.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#6E3FF3',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, cancel'
            });
            if (!result.isConfirmed) return;

            try {
                const response = await axiosSecure.put(`/orderStatusCancel/${orderId}`);
                if (response.data.modifiedCount > 0) {
                    setIsRunning(false);
                    dispatch(setRefetch(!refetch));
                    Swal.fire({ title: 'Order canceled', showConfirmButton: false, icon: 'success', timer: 900 });
                }
            } catch (error) {
                toast.error(`Error: ${error.message}`);
            }
        } else {
            // Restore flow
            const result = await Swal.fire({
                title: 'Restore this order?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#6E3FF3',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, restore'
            });
            if (!result.isConfirmed) return;

            try {
                const response = await axiosSecure.put(`/orderStatusRestore/${orderId}`);
                if (response.data.modifiedCount > 0) {
                    dispatch(setRefetch(!refetch));
                    Swal.fire({ title: 'Order restored to Pending', showConfirmButton: false, icon: 'success', timer: 900 });
                }
            } catch (error) {
                toast.error(`Error: ${error.message}`);
            }
        }
    };

    const canSeeAdminControls = localOrder && (currentUser?.role === 'Admin' || currentUser?.role === 'Developer');

    return (
        <>
            {localOrder ? (
                <div className='w-full gap-5 flex h-[89vh] overflow-y-auto custom-scrollbar'>

                    {/* Left: order details */}
                    <div className='w-[70%] overflow-y-auto custom-scrollbar'>
                        <section className='shadow-md rounded-md p-4'>
                            <h2 className='font-semibold text-xl'>Order details</h2>
                            <h2 className=''>Order Name: {localOrder?.orderName}</h2>
                            <h2 className='mt-2'>
                                Services:{' '}
                                {localOrder?.needServices?.map((service, index) => (
                                    <span key={index} className='mr-1 font-semibold bg-gray-300 rounded-sm p-1 text-sm'>
                                        {service}
                                    </span>
                                ))}
                            </h2>
                            <p className='bg-gray-300 rounded-md p-2 mt-5'>{localOrder?.orderInstructions}</p>

                            <div className='text-sm mt-5 flex justify-between'>
                                {localOrder?.colorCode && <p>Color change to: {localOrder?.colorCode}</p>}
                                {localOrder?.imageResize && <p>Image resize to: {localOrder?.imageResize}</p>}
                            </div>
                            <h2 className='mt-2'>Return file format: <span>{localOrder?.returnFormat}</span></h2>
                        </section>
                    </div>

                    {/* Right: workflow */}
                    <div className='w-[30%] border-r'>
                        <section className='shadow-md rounded-md p-4'>

                            {/* Top-right: Cancel / Restore */}
                            <div className="flex items-center justify-end mb-3">
                                <button
                                    onClick={handleCancelToggle}
                                    className={`text-white py-1 px-3 rounded-md ${isCanceled ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                                >
                                    {isCanceled ? 'Re-store' : 'Cancel'}
                                </button>
                            </div>

                            {/* NEW: Delivered and Complete */}
                            <div className="flex items-center gap-2 mb-3">
                                <button
                                    className={`text-white py-1 px-3 rounded-md ${(!isLocked && !isCanceled && status === 'Ready to Upload') ? 'bg-[#6E3FF3] cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
                                    disabled={isLocked || isCanceled || status !== 'Ready to Upload'}
                                    onClick={handleDelivered}
                                >
                                    Delivered
                                </button>

                                <button
                                    className={`text-white py-1 px-3 rounded-md ${(!isLocked && !isCanceled && status === 'Delivered') ? 'bg-[#6E3FF3] cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
                                    disabled={isLocked || isCanceled || status !== 'Delivered'}
                                    onClick={handleComplete}
                                >
                                    Complete
                                </button>
                            </div>

                            <h2 className='font-semibold text-xl'>Time left to deliver</h2>

                            {(localOrder && canSeeAdminControls) && (
                                <Countdown
                                    date={moment(localOrder.orderDeadLine).valueOf()}
                                    renderer={({ days, hours, minutes, seconds, completed }) => {
                                        if (completed || isLocked || isCanceled) {
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

                            <div>
                                {localOrder?.orderDeadLine && (
                                    <Countdown
                                        date={moment(localOrder.orderDeadLine).valueOf()}
                                        renderer={({ days, hours, minutes, seconds }) => (
                                            <section className='flex gap-3 mt-3'>
                                                <div className={`flex flex-col items-center p-1 rounded-md bg-[#6E3FF3] text-white ${days === '00' ? 'bg-red-400' : ''}`}>
                                                    <h2 className='font-bold border-b'>{String(days).padStart(2, '0')}</h2>
                                                    <h2>Day's</h2>
                                                </div>
                                                <div className={`flex flex-col items-center p-1 rounded-md bg-[#6E3FF3] text-white ${days === '00' && hours === '00' ? 'bg-red-400' : ''}`}>
                                                    <h2 className='font-bold border-b'>{String(hours).padStart(2, '0')}</h2>
                                                    <h2>Hours</h2>
                                                </div>
                                                <div className={`flex flex-col items-center p-1 rounded-md bg-[#6E3FF3] text-white ${days === '00' && hours === '00' && minutes === '00' ? 'bg-red-400' : ''}`}>
                                                    <h2 className='font-bold border-b'>{String(minutes).padStart(2, '0')}</h2>
                                                    <h2>Minutes</h2>
                                                </div>
                                                <div className={`flex flex-col items-center p-1 rounded-md bg-[#6E3FF3] text-white ${days === '00' && hours === '00' && minutes === '00' && seconds === '00' ? 'bg-red-400' : ''}`}>
                                                    <h2 className='font-bold border-b'>{String(seconds).padStart(2, '0')}</h2>
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
                                Client ID:{' '}
                                <span className="font-semibold">
                                    {currentUser?.role === 'Admin' || currentUser?.role === 'HR-ADMIN' || currentUser?.role === 'Developer'
                                        ? localOrder?.clientID
                                        : '*****'}
                                </span>
                            </h2>

                            <h2>Order Name: <span className='font-semibold'>{localOrder?.orderName}</span></h2>
                            <h2>Order QTY: <span className='font-semibold'>{localOrder?.orderQTY}</span></h2>
                            <h2>
                                Order Status:{' '}
                                <span className={`
                  ${status === 'Pending' ? 'text-yellow-400' : ''}
                  ${status === 'Hold' ? 'text-red-500' : ''}
                  ${status === 'In-progress' ? 'text-green-500' : ''}
                  ${status === 'Ready to QC' ? 'text-indigo-500' : ''}
                  ${status === 'Ready to Upload' ? 'text-indigo-700' : ''}
                  ${status === 'Delivered' ? 'text-blue-600' : ''}
                  ${status === 'Completed' ? 'text-emerald-600' : ''}
                  ${status === 'Cancel' ? 'text-gray-500' : ''}
                `}>
                                    {status}{isLocked ? ' (Locked)' : ''}
                                </span>
                            </h2>
                            <h2>Completion time: <span className='font-semibold border px-1 rounded-md'>{formatTime(totalSeconds)}</span></h2>
                        </section>

                        {/* ------------------------------------------------------------------------ */}
                        {localOrder && (
                            <Countdown
                                date={moment(localOrder.orderDeadLine).valueOf()}
                                renderer={({ days, hours, minutes, seconds }) => (
                                    <section className={`shadow-md rounded-md p-4 mt-5 border ${days === '00' && hours === '00' && minutes === '00' && seconds === '00' ? 'hidden' : ''}`}>
                                        <div className={`flex items-center gap-2 ${status === 'Delivered' ? 'hidden' : ''}`}>
                                            <button
                                                className={`text-white py-1 px-3 rounded-md ${(!isLocked && !isCanceled && (status === 'Pending' || status === 'Hold'))
                                                    ? 'bg-[#6E3FF3] cursor-pointer'
                                                    : 'bg-gray-400 cursor-not-allowed'
                                                    }`}
                                                onClick={handleStart}
                                                disabled={isLocked || isCanceled || (status !== 'Pending' && status !== 'Hold')}
                                            >
                                                Start the order
                                            </button>
                                            <button
                                                className={`text-white py-1 px-3 rounded-md ${(!isLocked && !isCanceled && status !== 'Hold' && status !== 'Pending' && status !== 'Delivered' && status !== 'Reviewing')
                                                    ? 'bg-[#6E3FF3] cursor-pointer'
                                                    : 'bg-gray-400 cursor-not-allowed'
                                                    }`}
                                                onClick={handleHold}
                                                disabled={isLocked || isCanceled || status === 'Hold' || status === 'Pending'}
                                            >
                                                Hold
                                            </button>
                                        </div>

                                        <div className={`${status === 'Delivered' ? 'hidden' : 'mt-3'}`}>
                                            {status !== 'Ready to QC' ? (
                                                <button
                                                    id='readyToQC'
                                                    onClick={handleReadyToQC}
                                                    className={`text-white py-1 px-3 rounded-md ${(!isLocked && !isCanceled && status === 'In-progress')
                                                        ? 'bg-[#6E3FF3] cursor-pointer'
                                                        : 'bg-gray-400 cursor-not-allowed'
                                                        }`}
                                                    disabled={isLocked || isCanceled || status !== 'In-progress'}
                                                >
                                                    Ready to QC
                                                </button>
                                            ) : (
                                                <button
                                                    id='readyToUpload'
                                                    onClick={handleReadyToUpload}
                                                    className={`text-white py-1 px-3 rounded-md ${(!isLocked && !isCanceled && status === 'Ready to QC')
                                                        ? 'bg-[#6E3FF3] cursor-pointer'
                                                        : 'bg-gray-400 cursor-not-allowed'
                                                        }`}
                                                    disabled={isLocked || isCanceled || status !== 'Ready to QC'}
                                                >
                                                    Ready to upload
                                                </button>
                                            )}
                                        </div>

                                        {status === 'Delivered' ? (
                                            <div>
                                                <button
                                                    id='modify'
                                                    onClick={modifyOrder}
                                                    className={`text-white py-1 px-3 rounded-md ${(!isLocked && !isCanceled && status === 'Delivered')
                                                        ? 'bg-[#6E3FF3] cursor-pointer'
                                                        : 'bg-gray-400 cursor-not-allowed'
                                                        }`}
                                                    disabled={isLocked || isCanceled || status !== 'Delivered'}
                                                >
                                                    Request to modify
                                                </button>
                                            </div>
                                        ) : null}
                                    </section>
                                )}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <h2>No order found</h2>
            )}
        </>
    );
};

export default ViewLocalOrder;
