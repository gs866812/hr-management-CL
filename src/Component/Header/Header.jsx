import React, { useContext } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5';
import { TbMessageDots } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { ContextData } from '../../DataProvider';
import logo from '/main_logo.png';


const Header = () => {
    const { logOut, user, employee } = useContext(ContextData);
    const axiosProtect = useAxiosProtect();
    // ************************************************************
    const navigate = useNavigate();
    const navigateHome = () => {
        navigate('/');
    };


    // ************************************************************
    const handleLogout = async () => {
        logOut();
    };
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
                        <div className='absolute w-2 h-2 rounded-full bg-green-600 right-0 top-0'></div>
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