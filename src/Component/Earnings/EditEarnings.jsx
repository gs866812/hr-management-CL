import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ContextData } from '../../DataProvider';
import useAxiosProtect from '../../utils/useAxiosProtect';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setRefetch } from '../../redux/refetchSlice';

const EditEarnings = () => {
    const { user } = useContext(ContextData);

    const { id } = useParams();
    const axiosProtect = useAxiosProtect();
    const axiosSecure = useAxiosSecure();

    const [clientID, setClientID] = useState([]);
    const [earnings, setEarnings] = useState([]);
    const [originalEarning, setOriginalEarning] = useState(null);

    const [formData, setFormData] = useState({
        month: '',
        clientId: '',
        imageQty: '',
        totalUsd: '',
        convertRate: '',
        convertedBdt: '',
        status: ''
    });

    // ********************************************************************************


    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);


    // ********************************************************************************
    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const response = await axiosProtect.get(`/getEarnings`, {
                    params: {
                        userEmail: user?.email,
                    },
                });
                setEarnings(response.data.totalRev);
            } catch (error) {
                toast.error('Error fetching data:', error.message);
            }
        };

        if (user?.email) {
            fetchEarnings();
        }
    }, [refetch, user?.email, axiosProtect]);
    // ********************************************************************************
    useEffect(() => {
        if (earnings.length > 0 && id) {
            const selectedEarning = earnings.find((earning) => earning._id === id);
            if (selectedEarning) {
                setFormData({
                    month: selectedEarning.month || '',
                    clientId: selectedEarning.clientId || '',
                    imageQty: selectedEarning.imageQty || '',
                    totalUsd: selectedEarning.totalUsd || '',
                    convertRate: selectedEarning.convertRate || '',
                    convertedBdt: selectedEarning.convertedBdt || '',
                    status: selectedEarning.status || ''
                });

                // Store original values separately for reset
                setOriginalEarning(selectedEarning);
            }
        }
    }, [earnings, id]);


    // ********************************************************************************
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
    // ********************************************************************************
    const handleReset = () => {
        if (originalEarning) {
            setFormData({
                month: originalEarning.month || '',
                clientId: originalEarning.clientId || '',
                imageQty: originalEarning.imageQty || '',
                totalUsd: originalEarning.totalUsd || '',
                convertRate: originalEarning.convertRate || '',
                convertedBdt: originalEarning.convertedBdt || '',
                status: originalEarning.status || ''
            });
        }
    };

    // ********************************************************************************
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
    // ********************************************************************************
    const handleSubmit = (e) => {
        e.preventDefault();

        const editEarningsData = async () => {
            try {
                const response = await axiosSecure.put('/updateEarnings', formData);
                if (response.data.modifiedCount > 0) {
                    dispatch(setRefetch(!refetch));
                    toast.success('Earnings updated successfully');
                    handleReset();
                } else {
                    toast.error(response.data.message || 'Something went wrong');
                }
            } catch (error) {
                toast.error('Failed to add earnings');
            }
        };

        editEarningsData();
    };
    // ********************************************************************************

    return (
        <div className="bg-gray-100 p-4 rounded-md">
            <div className=''>
                <h3 className="font-bold text-lg">Edit Earnings:</h3>
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
                    <div className="col-span-1 md:col-span-2 flex justify-center gap-2 mt-4">
                        <button type="button" onClick={handleReset} className="btn btn-outline">Reset</button>
                        <button type="submit" className="btn bg-[#6E3FF3] text-white">Submit</button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default EditEarnings;