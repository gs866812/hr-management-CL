import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { toast } from 'react-toastify';
import { setRefetch } from '../../redux/refetchSlice';

const EditEarningModal = ({ selectedEarning, setSelectedEarning }) => {

    const [formData, setFormData] = useState({});


    const dispatch = useDispatch();
    const axiosProtect = useAxiosProtect();
    const refetch = useSelector((state) => state.refetch.refetch);

    // ************************************************************************
    useEffect(() => {
        if (selectedEarning) {
            setFormData(selectedEarning);
        }
    }, [selectedEarning]);

    // ************************************************************************
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };
    // ***************************************************************
    const handleUpdate = async () => {
        try {
            const response = await axiosProtect.put('/updateEarnings', formData);
            console.log(response);
            // toast.success("Earnings updated!");
            dispatch(setRefetch(!refetch));
            document.getElementById('edit-earnings-modal').close();
        } catch (error) {
            toast.error("Update failed");
        }
    };
    // *************************************************************
    const handleReset = () => {
        setFormData(selectedEarning); // Reset to original
    };

    // *********************************************************
    if (!selectedEarning) return null;

    return (
        <div>
            <dialog id="edit-earnings-modal" className="modal">
                <div className="modal-box max-w-3xl">
                    <h3 className="font-bold text-lg mb-3">Edit Earnings</h3>
                    <form className="grid grid-cols-2 gap-4">
                        <input name="date" value={formData.date || ''} onChange={handleChange} className="input input-bordered" placeholder="Date" />
                        <input name="month" value={formData.month || ''} onChange={handleChange} className="input input-bordered" placeholder="Month" />
                        <input name="clientId" value={formData.clientId || ''} onChange={handleChange} className="input input-bordered" placeholder="Client ID" />
                        <input name="imageQty" value={formData.imageQty || ''} onChange={handleChange} className="input input-bordered" placeholder="Image QTY" />
                        <input name="totalUsd" value={formData.totalUsd || ''} onChange={handleChange} className="input input-bordered" placeholder="Total USD" />
                        <input name="convertRate" value={formData.convertRate || ''} onChange={handleChange} className="input input-bordered" placeholder="Converted Rate" />
                        <input name="convertedBdt" value={formData.convertedBdt || ''} onChange={handleChange} className="input input-bordered" placeholder="BDT Balance" />
                        <select name="status" value={formData.status || ''} onChange={handleChange} className="select select-bordered">
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                        </select>
                    </form>
                    <div className="modal-action">
                        <button onClick={handleReset} className="btn btn-outline">Reset</button>
                        <button onClick={handleUpdate} className="btn btn-success">Update</button>
                        <form method="dialog">
                            <button className="btn">Close</button>
                        </form>
                    </div>
                </div>
            </dialog>

        </div>
    );
};

export default EditEarningModal;