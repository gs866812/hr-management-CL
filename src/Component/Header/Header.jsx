import React, { useContext } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5';
import { TbMessageDots } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { ContextData } from '../../DataProvider';
import logo from '../../../public/main_logo.png';


const Header = () => {
    const { logOut} = useContext(ContextData);
    const axiosProtect = useAxiosProtect();
    // ************************************************************
    const navigate = useNavigate(); // Next.js router for navigation


    // ************************************************************
    const handleLogout = async () => {
        logOut();
    };
    // ************************************************************
    return (
        <div className='mx-auto '>
            <div className='lg:px-8 flex justify-between items-center border'>
                <div>
                    {/**********main-logo*****************/}
                    <Link to='/'><img src={logo} alt="Webbriks.com" className='w-[10%]'/></Link>
                </div>

                <div className='flex justify-center items-center gap-3 py-2'>

                    {/*************************message and notifications start*******************************/}

                    <span><TbMessageDots className='text-2xl' /></span>
                    <div className='relative'>
                        <div className='absolute w-2 h-2 rounded-full bg-green-600 right-0 top-0'></div>
                        <IoNotificationsOutline className='text-2xl' />
                    </div>
                    {/*************************message and notifications end*******************************/}



                    {/*/*****************************user start******************************/}
                    <div className='flex justify-center items-center gap-2'>
                        <div className='w-10 h-10'>
                            <img
                                className='rounded-full border'
                                alt="Tailwind CSS Navbar component"
                                src="https://iili.io/2BqJhuf.png" />
                        </div>
                        <div>
                            <h2 className='font-bold'>Name</h2>
                            <p className='text-gray-500 text-sm'>Designation</p>
                        </div>

                        <div className="dropdown dropdown-hover dropdown-end">
                            <div tabIndex={0} className=" m-1"><FaAngleDown /></div>
                            <ul tabIndex={0} className="dropdown-content menu z-[1] w-40 p-2 pt-5">
                                <li className='bg-red-500 text-white rounded-md hover:bg-red-700'><a onClick={handleLogout}>Log out</a></li>
                            </ul>
                        </div>
                    </div>
                    {/*/*****************************user end******************************/}
                </div>
            </div>
        </div>
    );
};

export default Header;