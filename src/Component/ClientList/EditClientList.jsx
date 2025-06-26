import React, { useState, useEffect } from 'react';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setRefetch } from '../../redux/refetchSlice';

const EditClientList = ({ clientInfo }) => {
    const { clientId, clientCountry } = clientInfo;
    const axiosSecure = useAxiosSecure();

    const [newClientId, setNewClientId] = useState('');
    const [newCountry, setNewCountry] = useState('');
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    // 🔁 Update input state when clientInfo changes (e.g., when modal opens)
    useEffect(() => {
        setNewClientId(clientId);
        setNewCountry(clientCountry);
    }, [clientId, clientCountry]);

    // ✅ Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const response = await axiosSecure.put(`/clients/${clientId}`, {
                clientId: newClientId,
                clientCountry: newCountry,
            });

            if (response?.data?.message === 'Client updated successfully') {
                toast.success('Client updated successfully');
                // dispatch or refetch if needed
                dispatch(setRefetch(!refetch));
                document.getElementById('edit-client-list').close(); // Close modal
            } else {
               toast.error(response?.data?.message || 'Update failed. Please try again.');
            }
        } catch (error) {
            toast.error('Update error:', error);
        } finally {
            setLoading(false);
        }
    };

    // 🔁 Reset to original values
    const handleReset = () => {
        setNewClientId(clientId);
        setNewCountry(clientCountry);
    };

    return (
        <div>
            <dialog id="edit-client-list" className="modal overflow-y-scroll">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-0 top-0">✕</button>
                    </form>
                    <h3 className="font-bold text-lg">Edit client:</h3>
                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                        <div>
                            <label className="label">Client ID</label>
                            <input
                                type="text"
                                value={newClientId}
                                onChange={(e) => setNewClientId(e.target.value)}
                                required
                                className="input !border !border-gray-300 w-full mt-1"
                            />
                        </div>
                        <div>
                            <label className="label">Country</label>
                            <input
                                type="text"
                                value={newCountry}
                                onChange={(e) => setNewCountry(e.target.value)}
                                required
                                className="input !border !border-gray-300 w-full mt-1"
                            />
                        </div>
                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="btn btn-outline"
                                disabled={loading}
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                className="btn bg-[#6E3FF3] text-white"
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default EditClientList;
