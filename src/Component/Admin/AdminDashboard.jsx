import React, { useContext } from 'react';
import { IoMdAdd } from 'react-icons/io';
import AddMainBalanceModal from './AddMainBalanceModal';
import { ContextData } from '../../DataProvider';

const AdminDashboard = () => {
    const { user, userName, mainBalance } = useContext(ContextData);

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

            <section className='flex justify-between space-x-4'>
                <div className='w-1/4 rounded-md py-4 flex flex-col items-center shadow-md space-y-1.5'>
                    <h2 className='text-xl'>Balance</h2>
                    <p>
                        {
                            mainBalance &&
                            parseFloat(mainBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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