import React, { useContext, useEffect } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5';
import { TbMessageDots } from 'react-icons/tb';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { ContextData } from '../../DataProvider';
import logo from '/main_logo.png';


const Header = () => {
    const { logOut, user, employee, currentUser } = useContext(ContextData);
    const axiosProtect = useAxiosProtect();
    // ************************************************************
    const [notification, setNotification] = React.useState([]);

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
    // ************************************************************

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
                            currentUser.role === 'Admin' || currentUser.role === 'Developer' || currentUser.role === 'HR-ADMIN' ?
                                <div className='absolute -right-1 -top-1 text-[10px] font-semibold bg-green-500 text-white rounded-full w-[15px] h-[15px] flex items-center justify-center cursor-default'>
                                    {notification.length > 0 ? notification.length : 0}
                                </div>
                                :
                                <div className='absolute -right-1 -top-1 text-[10px] font-semibold bg-green-500 text-white rounded-full w-[15px] h-[15px] flex items-center justify-center'>
                                    0
                                </div>
                        }
                        <IoNotificationsOutline className='text-2xl' />
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