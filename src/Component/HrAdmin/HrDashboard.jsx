import React, { useContext, useEffect, useState } from 'react';
import AddHrBalanceModal from './AddHrBalanceModal';
import { ContextData } from '../../DataProvider';
import { useDispatch, useSelector } from 'react-redux';
import { IoMdAdd } from 'react-icons/io';
import { IoReturnDownBackOutline } from "react-icons/io5";

const HrDashboard = () => {
    const { user, userName, hrBalance } = useContext(ContextData);

    


    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);


    // ************************************************************************************************

    const handleAddHrBalance = () => {
        document.getElementById('addHrBalance').showModal();
    };
    // ************************************************************************************************

    const handleReturnHrBalance = () => {
        document.getElementById('returnHrBalance').showModal();
    };
    return (
        <>
            <section className='flex justify-end gap-1'>
                <button onClick={handleAddHrBalance}
                    className='border-l border-r border-b rounded-b-xl px-2 cursor-pointer bg-[#6E3FF3] text-white py-1'>
                    <span className='flex items-center gap-1'>
                        <IoMdAdd />
                        Add balance
                    </span>
                </button>
                <button onClick={handleReturnHrBalance}
                    className='border-l border-r border-b rounded-b-xl px-2 cursor-pointer bg-red-500 text-white py-1'>
                    <span className='flex items-center gap-1'>
                    <IoReturnDownBackOutline />
                        Return balance
                    </span>
                </button>
            </section>

            <section className='flex justify-between space-x-4'>
                <div className='w-1/4 rounded-md py-4 flex flex-col items-center shadow-md space-y-1.5'>
                    <h2 className='text-xl'>Balance</h2>
                    <p>
                        {
                            hrBalance &&
                            parseFloat(hrBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        }
                    </p>
                </div>
            </section>

            <section className='mt-5'>
                <div>
                    <h2 className='text-xl'>Recent transaction</h2>
                </div>
                <div>

                </div>
            </section>
            {/* ******************************************** */}
            <AddHrBalanceModal />
            {/* ******************************************** */}
        </>
    );
};

export default HrDashboard;