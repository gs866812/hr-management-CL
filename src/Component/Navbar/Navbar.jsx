import React, { useState } from 'react';
import { CiInboxIn } from 'react-icons/ci';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { FaClockRotateLeft } from 'react-icons/fa6';
import { IoIosCreate } from 'react-icons/io';
import { IoSettingsOutline } from 'react-icons/io5';
import { LuCalendarClock, LuUsers } from 'react-icons/lu';
import { MdOutlineDashboard } from 'react-icons/md';
import { PiClipboardText } from 'react-icons/pi';
import { RiCurrencyLine, RiUser2Fill } from 'react-icons/ri';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const [isOpenGeneral, setIsOpenGeneral] = useState(false);
    const [isOpenOrder, setIsOpenOrder] = useState(false);
    const [isOpenOrderManagement, setIsOpenOrderManagement] = useState(false);

    const location = useLocation();
    // ************************************************************************************************
    const toggleDropdownGeneral = () => {
        setIsOpenGeneral(!isOpenGeneral);
    };
    const toggleDropdownOrder = () => {
        setIsOpenOrder(!isOpenOrder);
    };
    const toggleDropdownOrderManagement = () => {
        setIsOpenOrderManagement(!isOpenOrderManagement);
    };
    // ************************************************************************************************

    return (
        <div className="flex flex-col mb-[1px]">
            {/* ********************************************************* */}
            <Link
                to="/"
                className={`mb-[1px] font-semibold p-2 rounded-md flex gap-2 items-center justify-start ${location.pathname === '/'
                        ? 'bg-[#6E3FF3] text-white'
                        : 'hover:bg-[#6E3FF3] hover:text-white'
                    }`}
            >
                <MdOutlineDashboard />
                <span>Dashboard</span>
            </Link>
            {/* **********************************************************/}
            <Link
                to="/notice-Board"
                className={`mb-[1px] font-semibold p-2 rounded-md flex gap-2 items-center justify-start ${location.pathname === '/noticeBoard'
                        ? 'bg-[#6E3FF3] text-white'
                        : 'hover:bg-[#6E3FF3] hover:text-white'
                    }`}
            >
                <PiClipboardText />
                <span>Notice Board</span>
            </Link>
            {/* ************************************************* ********************/}
            <Link
                to="/employee"
                className={`mb-[1px] font-semibold p-2 rounded-md flex gap-2 items-center justify-start ${location.pathname === '/employee'
                        ? 'bg-[#6E3FF3] text-white'
                        : 'hover:bg-[#6E3FF3] hover:text-white'
                    }`}
            >
                <LuUsers />
                <span>Employee</span>
            </Link>

            {/* ********************************************************* */}

            <Link
                to="/expense"
                className={`mb-[1px] font-semibold p-2 rounded-md flex gap-2 items-center justify-start ${location.pathname === '/expense'
                        ? 'bg-[#6E3FF3] text-white'
                        : 'hover:bg-[#6E3FF3] hover:text-white'
                    }`}
            >
                <RiCurrencyLine />
                <span>Expense</span>
            </Link>

            

            {/* ********************************************************* order management section*/}

            <section
                className={`${isOpenOrderManagement ? 'bg-gray-100' : ''
                    } rounded-md mb-[1px]`}
            >
                <div
                    className={`flex items-center justify-between cursor-pointer p-2 w-full gap-2 hover:bg-gray-100 mb-[1px] rounded-md ${isOpenOrderManagement ? 'hover:bg-gray-100' : ''
                        }`}
                    onClick={toggleDropdownOrderManagement}
                >
                    <div className="flex items-center gap-2">
                        {/* <FcElectricity className="text-xl" /> */}
                        <span>Orders</span>
                    </div>
                    <span>
                        {isOpenOrderManagement ? (
                            <FaAngleUp />
                        ) : (
                            <FaAngleDown />
                        )}
                    </span>
                </div>

                {isOpenOrderManagement && (
                    <div className="rounded-md p-2 bg-gray-100">
                        {/* ************************************************* */}
                        <Link
                            to="/orders"
                            className={`mb-[1px] font-semibold p-2 rounded-md flex gap-2 items-center justify-start ${location.pathname === '/order-management'
                                    ? 'bg-[#6E3FF3] text-white'
                                    : 'hover:bg-[#6E3FF3] hover:text-white'
                                }`}
                        >
                            <CiInboxIn />
                            <span>Order Management</span>
                        </Link>
                        {/* ************************************************* */}
                                               
                    </div>
                )}
            </section>
            {/*************************************************************/}
            <Link
                to="/clients"
                className={`mb-[1px] font-semibold p-2 rounded-md flex gap-2 items-center justify-start ${location.pathname === '/clients'
                        ? 'bg-[#6E3FF3] text-white'
                        : 'hover:bg-[#6E3FF3] hover:text-white'
                    }`}
            >
                <RiUser2Fill />
                <span>Clients</span>
            </Link>
            {/*************************************************************/}
            <Link
                to="/settings"
                className={`mb-[1px] font-semibold p-2 rounded-md flex gap-2 items-center justify-start ${location.pathname === '/settings'
                        ? 'bg-[#6E3FF3] text-white'
                        : 'hover:bg-[#6E3FF3] hover:text-white'
                    }`}
            >
                <IoSettingsOutline />
                <span>Setting</span>
            </Link>
            {/* ********************************************************* */}
            <Link
                to="/leave"
                className={`mb-[1px] font-semibold p-2 rounded-md flex gap-2 items-center justify-start ${location.pathname === '/leave'
                        ? 'bg-[#6E3FF3] text-white'
                        : 'hover:bg-[#6E3FF3] hover:text-white'
                    }`}
            >
                <LuCalendarClock />
                <span>Leave</span>
            </Link>
            {/* ********************************************************* */}
        </div>
    );
};

export default Navbar;
