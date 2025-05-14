import React, { useContext, useEffect, useState } from 'react';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { ContextData } from '../../DataProvider';
import { setRefetch } from '../../redux/refetchSlice';
import useAxiosSecure from '../../utils/useAxiosSecure';

const EarningsModal = () => {
    const { user } = useContext(ContextData);

    const axiosProtect = useAxiosProtect();
    const axiosSecure = useAxiosSecure();

    const [clientID, setClientID] = useState([]);
    const [formData, setFormData] = useState({
        month: '',
        clientId: '',
        imageQty: '',
        totalUsd: '',
        convertRate: '',
        convertedBdt: '',
        status: ''
    });

    // *******************************************************************************************
    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    // *******************************************************************************************
    const handleChange = (e) => {
        const { name, value, type } = e.target;

        // Convert number inputs from string to number
        const isNumberField = ['imageQty', 'totalUsd', 'convertRate', 'convertedBdt'].includes(name);
        const parsedValue = isNumberField ? parseFloat(value) || 0 : value;

        // Prevent negative input
        if (isNumberField && parsedValue < 0) {
            return;
        }

        const updated = {
            ...formData,
            [name]: parsedValue,
        };

        // Dynamically calculate convertedBdt
        if (name === 'totalUsd' || name === 'convertRate') {
            const usd = name === 'totalUsd' ? parsedValue : updated.totalUsd;
            const rate = name === 'convertRate' ? parsedValue : updated.convertRate;
            updated.convertedBdt = usd * rate;
        }

        setFormData(updated);
    };

    // *******************************************************************************************
    const handleReset = () => {
        setFormData({
            month: '',
            clientId: '',
            imageQty: '',
            totalUsd: '',
            convertRate: '',
            convertedBdt: '',
            status: ''
        });
    };

    // *******************************************************************************************
    useEffect(() => {
        const fetchClientID = async () => {
            try {
                const response = await axiosProtect.get('/getClientID', {
                    params: {
                        userEmail: user?.email,
                    },
                });
                setClientID(response?.data);

            } catch (error) {
                toast.error('Error fetching data:', error.message);
            }
        };
        fetchClientID();
    }, [refetch]);
    // *******************************************************************************************

    const handleSubmit = (e) => {
        e.preventDefault();

        const postEarningsData = async () => {
            try {
                const response = await axiosSecure.post('/addEarnings', formData);
                if (response.data.insertedId) {
                    dispatch(setRefetch(!refetch));
                    const modal = document.querySelector(`#add-new-earnings-modal`);
                    modal.close();
                    toast.success('Earnings added successfully');
                    handleReset();
                } else {
                    toast.error(response.data.message || 'Something went wrong');
                }
            } catch (error) {
                // toast.error('Error adding earnings:', error.message);
                toast.error('Failed to add earnings');
            }
        };

        postEarningsData();
    };
    // ********************************************************************************************
    return (
        <div>
            <dialog id="add-new-earnings-modal" className="modal overflow-y-scroll">
                <div className="modal-box">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-0 top-0">✕</button>
                    </form>
                    <h3 className="font-bold text-lg">Add new Earnings:</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                        {/* Select Month */}
                        <div>
                            <label className="label">Select Month</label>
                            <select name="month" value={formData.month} required onChange={handleChange} className="input input-bordered w-full !border !border-gray-300 mt-1">
                                <option value="">Select</option>
                                <option value="January">January</option>
                                <option value="February">February</option>
                                <option value="March">March</option>
                                <option value="April">April</option>
                                <option value="May">May</option>
                                <option value="June">June</option>
                                <option value="July">July</option>
                                <option value="August">August</option>
                                <option value="September">September</option>
                                <option value="October">October</option>
                                <option value="November">November</option>
                                <option value="December">December</option>
                            </select>
                        </div>

                        {/* Client ID */}
                        <div>
                            <label className="label">Client ID</label>
                            <select name="clientId" value={formData.clientId} required onChange={handleChange} className="input input-bordered w-full !border !border-gray-300 mt-1">
                                <option value="">Select</option>
                                {clientID.map(client => (
                                    <option key={client._id} value={client.clientID}>{client.clientID}</option>
                                ))}
                            </select>
                        </div>

                        {/* Number of Image Qty */}
                        <div>
                            <label className="label">Number of Image QTY</label>
                            <input type="number" name="imageQty" required value={formData.imageQty} onChange={handleChange} className="input input-bordered w-full !border !border-gray-300 mt-1" />
                        </div>

                        {/* Total USD */}
                        <div>
                            <label className="label">Total USD Amount</label>
                            <input type="number" required name="totalUsd" value={formData.totalUsd} onChange={handleChange} className="input input-bordered w-full !border !border-gray-300 mt-1" />
                        </div>

                        {/* Convert Rate */}
                        <div>
                            <label className="label">Convert Rate</label>
                            <input type="number" required name="convertRate" value={formData.convertRate} onChange={handleChange} className="input input-bordered w-full !border !border-gray-300 mt-1" />
                        </div>

                        {/* Converted BDT */}
                        <div>
                            <label className="label">Converted Amount in BDT</label>
                            <input type="number" required name="convertedBdt" value={formData.convertedBdt} className="input input-bordered w-full !border !border-gray-300 mt-1 bg-red-200" readOnly />
                        </div>

                        {/* Status */}
                        <div className=''>
                            <label className="label">Status</label>
                            <select name="status" required value={formData.status} onChange={handleChange} className="input input-bordered w-full !border !border-gray-300 mt-1">
                                <option value="">Select</option>
                                <option value="Paid">Paid</option>
                                <option value="Unpaid">Due</option>
                            </select>
                        </div>

                        {/* Buttons */}
                        <div className="col-span-1 md:col-span-2 flex justify-end gap-4 mt-4">
                            <button type="button" onClick={handleReset} className="btn btn-outline">Reset</button>
                            <button type="submit" className="btn bg-[#6E3FF3] text-white">Submit</button>
                        </div>
                    </form>

                </div>
            </dialog>
        </div>
    );
};

export default EarningsModal;