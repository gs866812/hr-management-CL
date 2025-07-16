import React, { useState } from 'react';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { useDispatch, useSelector } from 'react-redux';
import { setRefetch } from '../../redux/refetchSlice';
import { toast } from 'react-toastify';
import moment from 'moment';

const AddMainBalanceModal = () => {
    const axiosSecure = useAxiosSecure();

    const [value, setValue] = useState("");
    const [confirmValue, setConfirmValue] = useState("");
    const [note, setNote] = useState("");

    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    // ************************************************************************************************
    const handleChange = (e) => {
        let newValue = e.target.value;

        if (/^\d*\.?\d*$/.test(newValue)) {
            setValue(newValue);
        }
    };




    const handleConfirmChange = (e) => {
        let newValue = e.target.value;

        if (/^\d*\.?\d*$/.test(newValue)) {
            setConfirmValue(newValue);
        }
    };
    // ************************************************************************************************
    const reset = () => {
        setValue("");
        setConfirmValue("");
        setNote("");
    };
    // ************************************************************************************************
    const handleAddMainBalance = (e) => {
        e.preventDefault();

        if (value === confirmValue) {
            const parseValue = parseFloat(value);
            const balanceInfo = { parseValue, note };

            const addMainBalance = async () => {
                try {
                    const response = await axiosSecure.post('/addMainBalance', balanceInfo);

                    if (response.data.message) {

                        dispatch(setRefetch(!refetch));

                        toast.success(response.data.message);
                    }
                } catch (error) {
                    toast.error('Error fetching data:', error.message);
                }
            };
            addMainBalance();
            reset();

            document.getElementById('addMainBalance').close();
        } else {
            toast.error("Amount not matched");
        }
    };
    // ************************************************************************************************


    return (
        <div>
            <dialog id="addMainBalance" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle absolute right-2 top-2 hover:bg-red-500 hover:text-white">✕</button>
                    </form>

                    <h3 className="font-bold text-lg">Add Balance</h3>
                    <form className='mt-3 space-y-2 border-gray-200 border p-3 rounded-md' onSubmit={handleAddMainBalance}>

                        <section className='grid grid-cols-2'>
                            <h2>Enter amount: </h2>
                            <input
                                type="text"
                                placeholder="Enter amount"
                                id="amount"
                                className="rounded-md p-1 !border !border-gray-300"
                                required
                                value={value}
                                onChange={handleChange}
                            />
                        </section>
                        <section className='grid grid-cols-2'>
                            <h2>Enter confirm amount: </h2>
                            <input
                                type="text"
                                placeholder="Enter confirm amount"
                                id="confirmAmount"
                                className="rounded-md p-1 !border !border-gray-300"
                                required
                                value={confirmValue}
                                onChange={handleConfirmChange}
                            />
                        </section>
                        <section className='grid grid-cols-2'>
                            <h2>Receive note: </h2>
                            <textarea name="note" id="note"
                                className='p-1 rounded-md text-sm focus:bg-gray-200 !border !border-gray-300'
                                required
                                onChange={(e) => setNote(e.target.value)}>
                            </textarea>
                        </section>
                        <section className='grid grid-cols-2 gap-2 mt-5'>
                            <button
                                type='reset'
                                onClick={reset}
                                className='px-2 py-1 bg-yellow-600 border-yellow-600 text-white rounded-md cursor-pointer'>

                                Reset
                            </button>
                            <button
                                className='px-2 py-1 bg-[#6E3FF3] border-[#6E3FF3] text-white rounded-md cursor-pointer'>
                                Add
                            </button>
                        </section>

                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default AddMainBalanceModal;