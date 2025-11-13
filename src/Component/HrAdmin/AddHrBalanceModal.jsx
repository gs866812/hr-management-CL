import React, { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { setRefetch } from '../../redux/refetchSlice';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { ContextData } from '../../DataProvider';

const AddHrBalanceModal = () => {

    const { user } = useContext(ContextData);

    const axiosProtect = useAxiosProtect();


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
    const handleAddHrBalance = (e) => {
        e.preventDefault();

        if (value === confirmValue) {
            const parseValue = parseFloat(value);
            if (!user?.email) {
                toast.error('Please log in again to add balance.');
                return;
            }

            const balanceInfo = {
                parseValue,
                note,
                userEmail: user.email,
            };
            const addHrBalance = async () => {
                try {
                    const response = await axiosProtect.post('/addHrBalance', balanceInfo);

                    if (response.data.success) {
                        dispatch(setRefetch(!refetch));
                        toast.success(response.data.message || "Balance added successfully");

                        setValue("");
                        setConfirmValue("");
                        setNote("");
                        document.getElementById('addHrBalance').close();
                    } else {
                        toast.error(response.data.message || "Unable to add balance");
                    }
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to add balance');
                }
            };
            addHrBalance();
        } else {
            toast.error("Amount not matched");
        }
    };
    // ************************************************************************************************
    const handleReturnHrBalance = (e) => {
        e.preventDefault();

        if (value === confirmValue) {
            const parseValue = parseFloat(value);
            if (!user?.email) {
                toast.error('Please log in again to return balance.');
                return;
            }

            const balanceInfo = {
                parseValue,
                note,
                userEmail: user.email,
            };
            const returnHrBalance = async () => {
                try {
                    const response = await axiosProtect.put('/returnHrBalance', balanceInfo);

                    if (response.data.success) {
                        dispatch(setRefetch(!refetch));
                        toast.success(response.data.message || "Balance return successfully");

                        setValue("");
                        setConfirmValue("");
                        setNote("");
                        document.getElementById('returnHrBalance').close();
                    } else {
                        toast.error(response.data.message || "No available funds to return");
                    }
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to return balance');
                }
            };
            returnHrBalance();
        } else {
            toast.error("Amount not matched");
        }
    };
    // ************************************************************************************************
    const reset = () => {
        setValue("");
        setConfirmValue("");
        setNote("");
    };
    // ************************************************************************************************
    return (
        <div>
            <dialog id="addHrBalance" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>

                    <h3 className="font-bold text-lg">Add Balance (HR)</h3>
                    <form className='mt-3 space-y-2 border-gray-200 border p-3 rounded-md' onSubmit={handleAddHrBalance}>

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
            {/* *******************return modal***************************** */}
            <dialog id="returnHrBalance" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>

                    <h3 className="font-bold text-lg">Return Balance (HR)</h3>
                    <form className='mt-3 space-y-2 border-gray-200 border p-3 rounded-md' onSubmit={handleReturnHrBalance}>

                        <section className='grid grid-cols-2'>
                            <h2>Enter amount: </h2>
                            <input
                                type="text"
                                placeholder="Enter return amount"
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
                                placeholder="Enter confirm return amount"
                                id="confirmAmount"
                                className="rounded-md p-1 !border !border-gray-300"
                                required
                                value={confirmValue}
                                onChange={handleConfirmChange}
                            />
                        </section>
                        <section className='grid grid-cols-2'>
                            <h2>Return note: </h2>
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
                                Return
                            </button>
                        </section>

                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default AddHrBalanceModal;
