import React, { useContext, useEffect, useState } from 'react';
import AddHrBalanceModal from './AddHrBalanceModal';
import { ContextData } from '../../DataProvider';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { useDispatch, useSelector } from 'react-redux';

const HrDashboard = () => {
    const { user, userName } = useContext(ContextData);

    const axiosProtect = useAxiosProtect();

    const [balance, setBalance] = useState(0);

    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    // ************************************************************************************************
    useEffect(() => {
        const fetchHrBalance = async () => {
            try {
                const response = await axiosProtect.get('/getHrBalance', {
                    params: {
                        userEmail: user?.email,
                    },
                });

                setBalance(response.data.balance);

            } catch (error) {
                toast.error('Error fetching data:', error.message);
            }
        };

        fetchHrBalance();
    }, [refetch]);
    // ************************************************************************************************

    const handleAddBalance = () => {
        document.getElementById('addBalance').showModal();
    };
    return (
        <>
            <section className='flex justify-end space-x-4'>
                <button onClick={handleAddBalance}
                    className='border-l border-r border-b rounded-b-xl px-2 cursor-pointer bg-[#6E3FF3] text-white py-1'>
                    Add balance
                </button>
            </section>

            <section className='flex justify-between space-x-4'>
                <div className='w-1/4 rounded-md py-4 flex flex-col items-center shadow-md space-y-1.5'>
                    <h2 className='text-xl'>Balance</h2>
                    <p>
                        {
                            balance &&
                            parseFloat(balance).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
                        }
                    </p>
                </div>
            </section>
            {/* ******************************************** */}
            <AddHrBalanceModal />
            {/* ******************************************** */}
        </>
    );
};

export default HrDashboard;