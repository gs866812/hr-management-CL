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
    const { logOut, user, currentUser } = useContext(ContextData);
    const axiosProtect = useAxiosProtect();
    // ************************************************************
    const navigate = useNavigate(); // Next.js router for navigation


    // ************************************************************
    const handleLogout = async () => {
        logOut();
    };
    // ************************************************************
    return (
        <div className='mx-auto'>
            <div className='lg:px-8 flex justify-between items-center'>
                <div>
                    {/**********main-logo*****************/}
                    <Link to='/'><img src={logo} alt="Webbriks.com" className='w-[10%]' /></Link>
                </div>

                <div className='flex justify-center items-center gap-3 py-2 w-[300px]'>

                    {/*************************message and notifications start*******************************/}

                    <span><TbMessageDots className='text-2xl' /></span>
                    <div className='relative'>
                        <div className='absolute w-2 h-2 rounded-full bg-green-600 right-0 top-0'></div>
                        <IoNotificationsOutline className='text-2xl' />
                    </div>
                    {/*************************message and notifications end*******************************/}



                    {/*/*****************************user start******************************/}
                    <div className='border-l border-gray-400 pl-2'>
                        <button 
                        className='hover:text-red-500 px-2 py-[2px] rounded-md cursor-pointer'
                        onClick={handleLogout}>
                            Log-out
                        </button>
                    </div>

                    {/*/*****************************user end******************************/}
                </div>
            </div>
        </div>
    );
};

export default Header;