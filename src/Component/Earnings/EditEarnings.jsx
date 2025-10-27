import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ContextData } from '../../DataProvider';
import useAxiosProtect from '../../utils/useAxiosProtect';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setRefetch } from '../../redux/refetchSlice';

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

function toNum(val) {
    const n = parseFloat(val);
    return Number.isFinite(n) ? n : 0;
}

export default function EditEarnings({ id }) {
    const { user } = useContext(ContextData);
    const axiosProtect = useAxiosProtect();
    const axiosSecure = useAxiosSecure();

    const dispatch = useDispatch();
    const refetch = useSelector((s) => s.refetch.refetch);

    const [loading, setLoading] = useState(true);
    const [clientIDs, setClientIDs] = useState([]);

    // Keep text for inputs to avoid NaN / flickers while typing
    const [formData, setFormData] = useState({
        month: '',
        clientId: '',
        imageQtyText: '', // text version
        totalUsdText: '', // text version
        convertRateText: '', // text version
        status: '',
    });

    // Derived numbers
    const imageQty = useMemo(
        () => toNum(formData.imageQtyText),
        [formData.imageQtyText]
    );
    const totalUsd = useMemo(
        () => toNum(formData.totalUsdText),
        [formData.totalUsdText]
    );
    const convertRate = useMemo(
        () => toNum(formData.convertRateText),
        [formData.convertRateText]
    );
    const convertedBdt = useMemo(
        () => totalUsd * convertRate,
        [totalUsd, convertRate]
    );

    // ---- Fetch client IDs
    useEffect(() => {
        const load = async () => {
            if (!user?.email) return;
            try {
                const res = await axiosProtect.get('/getClientID', {
                    params: { userEmail: user.email },
                });
                setClientIDs(res.data || []);
            } catch (err) {
                toast.error('Failed to load client IDs');
            }
        };
        load();
    }, [axiosProtect, user?.email, refetch]);

    // ---- Fetch earning by ID
    useEffect(() => {
        let mounted = true;
        const fetchEarningById = async () => {
            if (!id) return;
            try {
                const response = await axiosProtect.get(
                    `/getSingleEarning/${id}`
                );
                const earning = response.data?.data;
                if (earning && mounted) {
                    setFormData({
                        month: earning.month || '',
                        clientId: earning.clientId || '',
                        imageQtyText:
                            (earning.imageQty ?? '') === ''
                                ? ''
                                : String(earning.imageQty),
                        totalUsdText:
                            (earning.totalUsd ?? '') === ''
                                ? ''
                                : String(earning.totalUsd),
                        convertRateText:
                            (earning.convertRate ?? '') === ''
                                ? ''
                                : String(earning.convertRate),
                        status: earning.status || '',
                    });
                }
            } catch (error) {
                toast.error('Failed to load earning details');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        setLoading(true);
        fetchEarningById();
        return () => {
            mounted = false;
        };
    }, [id, axiosProtect, refetch]);

    // ---- Handle typed changes (kept as text)
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Map old field names to new *Text state keys if needed
        if (
            name === 'imageQty' ||
            name === 'totalUsd' ||
            name === 'convertRate'
        ) {
            const key = `${name}Text`;
            setFormData((prev) => ({ ...prev, [key]: value }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ---- Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.month || !formData.clientId || !formData.status) {
            toast.error('Please fill all required fields');
            return;
        }
        if (totalUsd <= 0 || convertRate <= 0) {
            toast.error('USD and Convert Rate must be positive numbers');
            return;
        }

        const payload = {
            month: formData.month,
            clientId: formData.clientId,
            imageQty, // numeric
            totalUsd, // numeric
            convertRate, // numeric
            convertedBdt, // derived numeric
        };

        try {
            const res = await axiosSecure.put(`/updateEarnings/${id}`, payload);

            if (res.data?.success) {
                toast.success('Earning updated successfully!');
                dispatch(setRefetch(!refetch));
                const dlg = document.getElementById('edit-earning-modal');
                if (dlg?.close) dlg.close();
            } else {
                toast.error(res.data?.message || 'Update failed');
            }
        } catch (err) {
            console.log(err)
            toast.error('Failed to update earning');
        }
    };

    const handleReset = () => {
        // Keep month/clientId/status so user doesn’t lose selections; clear numbers
        setFormData((prev) => ({
            ...prev,
            imageQtyText: '',
            totalUsdText: '',
            convertRateText: '',
        }));
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="font-bold text-lg mb-4">Edit Earnings</h3>

            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                {/* Month */}
                <div>
                    <label className="label">Month</label>
                    <select
                        name="month"
                        value={formData.month}
                        onChange={handleChange}
                        required
                        className="input input-bordered w-full !border !border-gray-300 mt-1"
                    >
                        <option value="">Select</option>
                        {months.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Client ID */}
                <div>
                    <label className="label">Client ID</label>
                    <select
                        name="clientId"
                        value={formData.clientId}
                        onChange={handleChange}
                        required
                        className="input input-bordered w-full !border !border-gray-300 mt-1"
                    >
                        <option value="">Select</option>
                        {clientIDs.map((c) => (
                            <option key={c._id} value={c.clientID}>
                                {c.clientID}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Image QTY (text -> numeric later) */}
                <div>
                    <label className="label">Image Quantity</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        name="imageQty"
                        value={formData.imageQtyText}
                        onChange={handleChange}
                        placeholder="e.g. 1200"
                        className="input input-bordered w-full !border !border-gray-300 mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Parsed: {imageQty.toLocaleString()}
                    </p>
                </div>

                {/* Total USD (text -> numeric later) */}
                <div>
                    <label className="label">Total USD</label>
                    <input
                        type="text"
                        inputMode="decimal"
                        name="totalUsd"
                        value={formData.totalUsdText}
                        onChange={handleChange}
                        placeholder="e.g. 320"
                        className="input input-bordered w-full !border !border-gray-300 mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Parsed: {totalUsd.toLocaleString()}
                    </p>
                </div>

                {/* Convert Rate (text -> numeric later) */}
                <div>
                    <label className="label">Convert Rate</label>
                    <input
                        type="text"
                        inputMode="decimal"
                        name="convertRate"
                        value={formData.convertRateText}
                        onChange={handleChange}
                        placeholder="e.g. 120"
                        className="input input-bordered w-full !border !border-gray-300 mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Parsed: {convertRate.toLocaleString()}
                    </p>
                </div>

                {/* Converted BDT (derived) */}
                <div>
                    <label className="label">Converted BDT</label>
                    <input
                        type="text"
                        value={
                            Number.isFinite(convertedBdt)
                                ? convertedBdt.toLocaleString()
                                : '0'
                        }
                        readOnly
                        className="input input-bordered w-full !border !border-gray-300 mt-1 bg-red-100"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                        = Total USD × Convert Rate = {totalUsd.toLocaleString()}{' '}
                        × {convertRate.toLocaleString()}
                    </p>
                </div>

                {/* Buttons */}
                <div className="col-span-1 md:col-span-2 flex flex-col items-center gap-2 mt-4">
                    <div className="text-sm text-gray-700">
                        <strong>Preview Total:</strong>{' '}
                        {Number.isFinite(convertedBdt)
                            ? convertedBdt.toLocaleString()
                            : '0'}{' '}
                        BDT
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="btn btn-outline"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            className="btn bg-[#6E3FF3] text-white"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
