import React, { useState } from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { IoSettingsOutline } from 'react-icons/io5';
import { LuCalendarClock, LuUsers } from 'react-icons/lu';
import { MdOutlineDashboard } from 'react-icons/md';
import { PiClipboardText } from 'react-icons/pi';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {

    const location = useLocation();
    const [isOpenExpense, setIsOpenGeneral] = useState(false);

    const toggleDropdownGeneral = () => {
        setIsOpenGeneral(!isOpenExpense);
    };


    return (
        <div className='flex flex-col mb-[1px]'>
            {/* ********************************************************* */}
            <Link to='/' className={`mb-[1px] font-semibold p-2 rounded-md flex gap-2 items-center justify-start ${location === '/' ? 'bg-[#6E3FF3] text-white' : 'hover:bg-[#6E3FF3] hover:text-white'
                }`}>
                <MdOutlineDashboard />
                <span>Dashboard</span>
            </Link>
            {/* ********************************************************* */}

            <section className={`${isOpenExpense ? 'bg-gray-100' : ''} rounded-md mb-[1px]`}>
                <div
                    className={`flex items-center justify-between cursor-pointer p-2 w-full gap-2 hover:bg-gray-100 mb-[1px] rounded-md ${isOpenExpense ? 'hover:bg-gray-100' : ''}`}
                    onClick={toggleDropdownGeneral}
                >
                    <div className="flex items-center gap-2">
                        {/* <FcElectricity className="text-xl" /> */}
                        <span>General</span>
                    </div>
                    <span>{isOpenExpense ? <FaAngleUp /> : <FaAngleDown />}</span>
                </div>

                {isOpenExpense && (
                    <div className="rounded-md p-2 bg-gray-100">
                        {/* ************************************************* */}
                        <Link to='/noticeBoard' className={`mb-[1px] font-semibold p-2 rounded-md flex gap-2 items-center justify-start ${location === '/noticeBoard' ? 'bg-[#6E3FF3] text-white' : 'hover:bg-[#6E3FF3] hover:text-white'
                            }`}>
                            <PiClipboardText />
                            <span>Notice Board</span>
                        </Link>
                        {/* ************************************************* */}
                        <Link to='/employee' className={`mb-[1px] font-semibold p-2 rounded-md flex gap-2 items-center justify-start ${location === '/employee' ? 'bg-[#6E3FF3] text-white' : 'hover:bg-[#6E3FF3] hover:text-white'
                            }`}>
                            <LuUsers />
                            <span>Employee</span>
                        </Link>
                    </div>
                )}
            </section>
            {/* ********************************************************* */}

            <Link to='/expense' className={`mb-[1px] font-semibold p-2 rounded-md flex gap-2 items-center justify-start ${location === '/settings' ? 'bg-[#6E3FF3] text-white' : 'hover:bg-[#6E3FF3] hover:text-white'
                }`}>
                <IoSettingsOutline />
                <span>Expense</span>
            </Link>
            <Link to='/settings' className={`mb-[1px] font-semibold p-2 rounded-md flex gap-2 items-center justify-start ${location === '/settings' ? 'bg-[#6E3FF3] text-white' : 'hover:bg-[#6E3FF3] hover:text-white'
                }`}>
                <IoSettingsOutline />
                <span>Setting</span>
            </Link>
            {/* ********************************************************* */}
            <Link to='/leave' className={`mb-[1px] font-semibold p-2 rounded-md flex gap-2 items-center justify-start ${location === '/leave' ? 'bg-[#6E3FF3] text-white' : 'hover:bg-[#6E3FF3] hover:text-white'
                }`}>
                <LuCalendarClock />
                <span>Leave</span>
            </Link>
            {/* ********************************************************* */}


        </div>
    );
};

export default Navbar;