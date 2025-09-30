import React, { useState } from 'react';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { setRefetch } from '../../redux/refetchSlice';

const AddClientModal = () => {

    const axiosSecure = useAxiosSecure();

    const [clientId, setClientId] = useState('');
    const [country, setCountry] = useState('');

    const [loading, setLoading] = useState(false);


    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    // ************************************************************************************

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return; // block if already submitting

        setLoading(true);

        const clientData = {
            clientId,
            country,
        };

        try {
            const response = await axiosSecure.post('/addClient', clientData);
            if (response.data.insertedId) {
                setClientId('');
                setCountry('');
                toast.success('Client added successfully');
                dispatch(setRefetch(!refetch));
                const modal = document.querySelector(`#add-new-client-modal`);
                modal.close();
            } else {
                toast.error(response.data.message);
            }

        } catch (error) {
            toast.error('Error adding client:', error);
        } finally {
            setLoading(false);
        }
    };
    // ************************************************************************************
    const handleReset = () => {
        setClientId('');
        setCountry('');
    };
    // ************************************************************************************
    return (
        <div>
            <dialog id="add-new-client-modal" className="modal overflow-y-scroll">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-0 top-0">✕</button>
                    </form>
                    <h3 className="font-bold text-lg">Add new client:</h3>
                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                        <div>
                            <label className="label">Client ID</label>
                            <input
                                type="text"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                required
                                className="input !border !border-gray-300 w-full mt-1"
                            />
                        </div>
                        <div>
                            <label className="label">Country</label>
                            <input
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
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

export default AddClientModal;