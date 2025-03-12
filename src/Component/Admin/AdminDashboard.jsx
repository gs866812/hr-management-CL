import React from 'react';
import { IoMdAdd } from 'react-icons/io';

const AdminDashboard = () => {

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
        </div>
    );
};

export default AdminDashboard;