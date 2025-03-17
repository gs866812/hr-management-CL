import React, { useContext, useEffect, useState } from 'react';
import AddHrBalanceModal from './AddHrBalanceModal';
import { ContextData } from '../../DataProvider';
import { useDispatch, useSelector } from 'react-redux';
import { IoMdAdd } from 'react-icons/io';
import { IoReturnDownBackOutline } from "react-icons/io5";
import moment from 'moment';

const HrDashboard = () => {
    const { user, userName, hrBalance, hrTransactions, hrExpense } = useContext(ContextData);

    const [todaysHrReceived, setTodaysHrReceived] = useState(0);
    const [todaysCosting, setTodaysCosting] = useState(0);
    
    

    // ************************************************************************************************
    useEffect(() => {
        if(hrExpense) {
            const todaysCostingDate = hrExpense.filter(expense => moment(expense.expenseDate).format("YYYY-MM-DD") === moment(new Date()).format("YYYY-MM-DD") && expense.userName === "HR_ADMIN");

            const todaysCostingValue = todaysCostingDate.reduce((acc, expense) => acc + expense.expenseAmount , 0)

            setTodaysCosting(todaysCostingValue);
        }
    }, [hrExpense]);
    // ************************************************************************************************
    useEffect(() => {
        if (hrTransactions) {
            const costingInValue = hrTransactions.filter((tran) => moment(tran.date).format("YYYY-MM-DD") === moment(new Date()).format("YYYY-MM-DD") && tran.type === "In");

            const totalInCosting = costingInValue.reduce((acc, total) => acc + total.value, 0);


            const costingReturnValue = hrTransactions.filter((tran) => moment(tran.date).format("YYYY-MM-DD") === moment(new Date()).format("YYYY-MM-DD") && tran.type === "Out");

            const totalReturnCosting = costingReturnValue.reduce((acc, total) => acc + total.value, 0);

            setTodaysHrReceived(totalInCosting - totalReturnCosting);


        }
    }, [hrTransactions]);

    // ************************************************************************************************

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

            <section className='flex gap-2'>

                <div className='w-1/4 rounded-md py-4 flex flex-col items-center shadow-md space-y-1.5'>
                    <h2 className='text-xl'>Current Balance</h2>
                    <p>
                        {
                            hrBalance &&
                            parseFloat(hrBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        }
                    </p>
                </div>
                <div className='w-1/4 rounded-md py-4 flex flex-col items-center shadow-md space-y-1.5'>
                    <h2 className='text-xl'>Received Today</h2>
                    <p>
                        {
                            todaysHrReceived &&
                            parseFloat(todaysHrReceived).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        }
                    </p>
                </div>
                <div className='w-1/4 rounded-md py-4 flex flex-col items-center shadow-md space-y-1.5'>
                    <h2 className='text-xl'>Today's Cost</h2>
                    <p>
                        {
                            todaysCosting &&
                            parseFloat(todaysCosting).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        }
                    </p>
                </div>
                <div className='w-1/4 rounded-md py-4 flex flex-col items-center shadow-md space-y-1.5'>
                    <h2 className='text-xl'>Total Cost</h2>
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