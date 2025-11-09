import React, { useContext, useEffect, useState } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5';
import { TbMessageDots } from 'react-icons/tb';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Links, useNavigate } from 'react-router-dom';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { ContextData } from '../../DataProvider';
import logo from '/main_logo.png';
import { toast } from 'react-toastify';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { setRefetch } from '../../redux/refetchSlice';


const Header = () => {
    const { logOut, user, employee, currentUser } = useContext(ContextData);
    const axiosProtect = useAxiosProtect();
    const axiosSecure = useAxiosSecure();
    // ************************************************************
    const [notification, setNotification] = useState([]);
    const [employeeNotification, setEmployeeNotification] = useState([]);

    // ************************************************************

    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    // *************************************************************
    const navigate = useNavigate();
    const navigateHome = () => {
        navigate('/');
    };


    // ************************************************************
    const handleLogout = async () => {
        logOut();
    };
    // ************************************************************
    useEffect(() => {
        const fetchAdminNotification = async () => {
            try {
                const response = await axiosProtect.get('/getAdminNotification', {
                    params: {
                        userEmail: user?.email,
                    },
                });
                setNotification(response.data);

            } catch (error) {
                toast.error('Error fetching data:', error.message);
            }
        };


        fetchAdminNotification();

    }, [user.email, refetch]);
    // **************************************************************
    useEffect(() => {
        const fetchEmployeeNotification = async () => {
            try {
                const response = await axiosProtect.get('/getEmployeeNotification', {
                    params: {
                        userEmail: user?.email,
                    },
                });
                setEmployeeNotification(response.data);

            } catch (error) {
                toast.error('Error fetching data:', error.message);
            }
        };


        fetchEmployeeNotification();

    }, [user.email, refetch]);
    // **************************************************************
    const handleMarkAsRead = async (id) => {
        try {
            const response = await axiosSecure.put(`/markAsRead/${id}`);
            if (response.data.modifiedCount > 0) {
                dispatch(setRefetch(!refetch));
            }
        } catch (error) {
            toast.error('Error marking notification as read:', error);
        }
    };
    // **************************************************************
    const handleEmployeeNotificationMarkAsRead = async (id) => {
        try {
            const response = await axiosSecure.put(`/employeeNotificationMarkAsRead/${id}`);
            if (response.data.modifiedCount > 0) {
                dispatch(setRefetch(!refetch));
            }
        } catch (error) {
            toast.error('Error marking notification as read:', error);
        }
    };
    // **************************************************************

    return (
        <div className='mx-auto'>
            <div className='lg:px-8 flex justify-between items-center'>
                {/**********main-logo*****************/}
                <img src={logo} alt="WEBBRIKS" className='w-[10%] cursor-pointer' onClick={navigateHome} />
                <section className='flex justify-end items-center gap-3 py-2 w-[300px]'>

                    {/*************************message and notifications start*******************************/}

                    <span><TbMessageDots className='text-2xl' /></span>
                    <div className='relative'>
                        {
                            currentUser?.role === 'Admin' || currentUser?.role === 'Developer' || currentUser?.role === 'HR-ADMIN' ?
                                <div className="dropdown dropdown-end">
                                    {/* <div tabIndex={0} role="button" className="btn m-1">Click ⬇️</div> */}
                                    <div tabIndex={0} className='absolute -right-1 -top-1 text-[10px] font-semibold bg-green-500 text-white rounded-full w-[15px] h-[15px] flex items-center justify-center cursor-default'>
                                        {/* {notification.length > 0 ? notification.length : 0} */}
                                        {notification.filter(item => !item.isRead).length > 0 ? notification.filter(item => !item.isRead).length : 0}
                                    </div>
                                    <IoNotificationsOutline tabIndex={0} role="button" className='text-2xl' />
                                    <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                                        {
                                            notification.length > 0 ?
                                                notification.map((item, index) => (
                                                    <li key={index}>
                                                        <Link to={item.link} className='flex items-center gap-2 hover:bg-gray-100 p-2 rounded-md' onClick={() => handleMarkAsRead(item._id)}>
                                                            <span className={`text-[12px] ${item.isRead ? '' : 'font-bold'}`}>{item.notification}</span>
                                                        </Link>
                                                    </li>
                                                ))
                                                :
                                                <li className='text-center'>No Notifications</li>
                                        }
                                    </ul>
                                </div>
                                :
                                <div className="dropdown dropdown-end">
                                    {/*Employee notification */}
                                    <div tabIndex={0} className='absolute -right-1 -top-1 text-[10px] font-semibold bg-green-500 text-white rounded-full w-[15px] h-[15px] flex items-center justify-center cursor-default'>
                                        {employeeNotification.filter(item => !item.isRead).length > 0 ? employeeNotification.filter(item => !item.isRead).length : 0}
                                    </div>
                                    <IoNotificationsOutline tabIndex={0} role="button" className='text-2xl' />
                                    <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                                        {
                                            employeeNotification.length > 0 ?
                                                employeeNotification.map((item, index) => (
                                                    <li key={index}>
                                                        <Link to={item.link} className='flex items-center gap-2 hover:bg-gray-100 p-2 rounded-md' onClick={() => handleEmployeeNotificationMarkAsRead(item._id)}>
                                                            <span className={`text-[12px] ${item.isRead ? '' : 'font-bold'}`}>{item.notification}</span>
                                                        </Link>
                                                    </li>
                                                ))
                                                :
                                                <li className='text-center'>No Notifications</li>
                                        }
                                    </ul>
                                </div>

                        }


                        {/* {
                            currentUser?.role === 'Admin' || currentUser?.role === 'Developer' || currentUser?.role === 'HR-ADMIN' ?
                                <div className='absolute -right-1 -top-1 text-[10px] font-semibold bg-green-500 text-white rounded-full w-[15px] h-[15px] flex items-center justify-center cursor-default'>
                                    {notification.length > 0 ? notification.length : 0}
                                </div>
                                :
                                <div className='absolute -right-1 -top-1 text-[10px] font-semibold bg-green-500 text-white rounded-full w-[15px] h-[15px] flex items-center justify-center'>
                                    0
                                </div>
                        } */}
                        {/* <IoNotificationsOutline className='text-2xl' /> */}
                    </div>
                    {/*************************message and notifications end*******************************/}



                    {/*/*****************************user start******************************/}

                    <div className="flex gap-2">
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                <div className="w-8 rounded-full">
                                    <img
                                        alt={employee?.fullName}
                                        src={employee?.photo} />
                                </div>
                            </div>
                            <ul
                                tabIndex={0}
                                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                                <li>
                                    <a href='/profile' className="justify-between">
                                        Profile
                                    </a>
                                </li>
                                <li><a>Settings</a></li>
                                <li><a onClick={handleLogout}>Logout</a></li>
                            </ul>
                        </div>
                    </div>
                    {/*/*****************************user end******************************/}
                </section>
            </div>
        </div>
    );
};

export default Header;