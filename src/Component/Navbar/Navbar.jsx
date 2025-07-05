import React, { useContext, useState } from 'react';
import { BsCurrencyDollar } from 'react-icons/bs';
import { CiInboxIn } from 'react-icons/ci';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { FaSackDollar } from "react-icons/fa6";
import { IoAnalyticsSharp, IoSettingsOutline } from 'react-icons/io5';
import { LuCalendarClock, LuUsers } from 'react-icons/lu';
import { MdOutlineDashboard } from 'react-icons/md';
import { PiClipboardText } from 'react-icons/pi';
import { RiCurrencyLine, RiUser2Fill } from 'react-icons/ri';
import { Link, useLocation } from 'react-router-dom';
import { ContextData } from '../../DataProvider';

const Navbar = () => {
    const { currentUser } = useContext(ContextData);

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
            {(currentUser?.role === 'Developer' || currentUser?.role === 'Admin' || currentUser?.role === 'HR-ADMIN' || currentUser?.role === 'teamLeader') && (
                <Link
                    to="/employeeList"
                    className={`mb-[1px] font-semibold p-2 rounded-md flex gap-2 items-center justify-start ${location.pathname === '/employee'
                        ? 'bg-[#6E3FF3] text-white'
                        : 'hover:bg-[#6E3FF3] hover:text-white'
                        }`
                    }
                >
                    <LuUsers />
                    <span>Employee</span>
                </Link>
            )}


            {/* ********************************************************* */}

            {/* <Link
                to="/expense"
                className={`mb-[1px] font-semibold p-2 rounded-md flex gap-2 items-center justify-start ${location.pathname === '/expense'
                        ? 'bg-[#6E3FF3] text-white'
                        : 'hover:bg-[#6E3FF3] hover:text-white'
                    } ${currentUser?.role === 'Developer'? '': 'hidden'}` }
            >
                <RiCurrencyLine />
                <span>Expense</span>
            </Link> */}
            {(currentUser?.role === 'Developer' || currentUser?.role === 'Admin' || currentUser?.role === 'HR-ADMIN') && (
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
            )}



            {/* ********************************************************* order management section*/}
            {/* currently hidden below section */}
            <section
                className={`hidden ${isOpenOrderManagement ? 'bg-gray-100' : ''
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
                to="/orders"
                className={`mb-[1px] font-semibold p-2 rounded-md flex gap-2 items-center justify-start ${location.pathname === '/order-management'
                    ? 'bg-[#6E3FF3] text-white'
                    : 'hover:bg-[#6E3FF3] hover:text-white'
                    }`}
            >
                <CiInboxIn />
                <span>Order Management</span>
            </Link>
            {/*************************************************************/}
            {(currentUser?.role === 'Developer' || currentUser?.role === 'Admin' || currentUser?.role === 'HR-ADMIN') && (
                <Link
                    to="/earnings"
                    className={`mb-[1px] font-semibold p-2 rounded-md flex gap-2 items-center justify-start
                    ${location.pathname === '/earnings'
                            ? 'bg-[#6E3FF3] text-white'
                            : 'hover:bg-[#6E3FF3] hover:text-white'
                        } `}
                >
                    <BsCurrencyDollar />
                    <span>Earnings</span>
                </Link>
            )}

            {/*************************************************************/}
            {(currentUser?.role === 'Developer' || currentUser?.role === 'Admin' || currentUser?.role === 'HR-ADMIN') && (
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
            )}

            {/*************************************************************/}
            {(currentUser?.role === 'Developer' || currentUser?.role === 'Admin') && (
                <Link
                    to="/profit-share"
                    className={`mb-[1px] font-semibold p-2 rounded-md flex gap-2 items-center justify-start ${location.pathname === '/profit-share'
                        ? 'bg-[#6E3FF3] text-white'
                        : 'hover:bg-[#6E3FF3] hover:text-white'
                        }`}
                >
                    <FaSackDollar />
                    <span>Profit Share</span>
                </Link>
            )}
            {/* ********************************************************* */}
            {(currentUser?.role === 'Developer' || currentUser?.role === 'Admin') && (
                <Link
                    to="/analytics"
                    className={`mb-[1px] font-semibold p-2 rounded-md flex gap-2 items-center justify-start ${location.pathname === '/analytics'
                        ? 'bg-[#6E3FF3] text-white'
                        : 'hover:bg-[#6E3FF3] hover:text-white'
                        }`}
                >
                    <IoAnalyticsSharp />
                    <span>Analytics</span>
                </Link>
            )}
            {/* ********************************************************* */}
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
