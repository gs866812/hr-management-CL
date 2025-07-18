import React, { useContext } from 'react';
import { IoMdAdd } from 'react-icons/io';
import AddMainBalanceModal from './AddMainBalanceModal';
import { ContextData } from '../../DataProvider';

const AdminDashboard = () => {
    const { user, userName, currentUser, mainBalance, unpaidAmount, totalExpense, sharedProfit  } = useContext(ContextData);

    // ****************************************************************
    const handleAddBalance = () => {
        document.getElementById('addMainBalance').showModal();
    };
    // ****************************************************************
    return (
        <div>
            <section className='flex justify-end space-x-4'>
                <button onClick={handleAddBalance}
                    className='border-l border-r border-b rounded-b-xl px-2 cursor-pointer bg-[#6E3FF3] text-white py-1'>
                    <span className='flex items-center gap-1'>
                        <IoMdAdd />
                        Add balance
                    </span>
                </button>
            </section>

            <section className='flex justify-center space-x-2'>
                <div className='w-1/6 rounded-md py-4 flex flex-col items-center shadow-md space-y-1.5 border !border-yellow-300 bg-yellow-400 font-semibold'>
                    <h2 className='text-xl'>Total Revenue</h2>
                    <p>
                        {
                            mainBalance &&
                            parseFloat(mainBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        }
                    </p>
                </div>
                <div className='w-1/6 rounded-md py-4 flex flex-col items-center shadow-md space-y-1.5 border !border-blue-300 bg-blue-400 font-semibold'>
                    <h2 className='text-xl'>Total Expense</h2>
                    <p>
                        {
                            totalExpense &&
                            parseFloat(totalExpense).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        }
                    </p>
                </div>
                <div className='w-1/6 rounded-md py-4 flex flex-col items-center shadow-md space-y-1.5 border !border-red-300 bg-red-400  font-semibold'>
                    <h2 className='text-xl'>Un-paid</h2>
                    <p>
                        {
                            unpaidAmount &&
                            parseFloat(unpaidAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        }
                    </p>
                </div>
                <div className='w-1/6 rounded-md py-4 flex flex-col items-center shadow-md space-y-1.5 border !border-red-300 bg-purple-500  font-semibold'>
                    <h2 className='text-xl'>Shared Amount</h2>
                    <p>
                        {
                            sharedProfit &&
                            parseFloat(sharedProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        }
                    </p>
                </div>

                <div className='w-1/6 rounded-md py-4 flex flex-col items-center shadow-md space-y-1.5 border !border-green-500  bg-green-500 font-semibold'>
                    <h2 className='text-xl'>Current Balance</h2>
                    <p>
                        {
                            unpaidAmount &&
                            parseFloat(mainBalance - unpaidAmount - totalExpense).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        }
                    </p>
                </div>
            </section>

            {/* ******************************************** */}
            <AddMainBalanceModal />
            {/* ******************************************** */}
        </div>
    );
};

export default AdminDashboard;