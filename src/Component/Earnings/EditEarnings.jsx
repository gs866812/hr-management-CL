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
const niceMonth = (m) =>
    typeof m === 'string' && m.length
        ? m[0].toUpperCase() + m.slice(1).toLowerCase()
        : '';

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
        imageQtyText: '',
        totalUsdText: '',
        convertRateText: '',
        charge: '',
        receivable: '',
        status: 'Unpaid',
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
            } catch {
                toast.error('Failed to load client IDs');
            }
        };
        load();
    }, [axiosProtect, user?.email, refetch]);

    // ---- Fetch earning by ID (normalize incoming fields)
    useEffect(() => {
        let mounted = true;
        const fetchEarningById = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await axiosProtect.get(
                    `/getSingleEarning/${id}`
                );
                const earning = response.data?.data;

                if (earning && mounted) {
                    setFormData({
                        month: niceMonth(earning.month || earning.Month || ''),
                        clientId: earning.clientId || earning.clientID || '',
                        imageQtyText:
                            earning.imageQty != null
                                ? String(earning.imageQty)
                                : earning.imageQTY != null
                                ? String(earning.imageQTY)
                                : '',
                        totalUsdText: (() => {
                            const v =
                                earning.totalUsd ??
                                earning.totalUSD ??
                                earning.totalDollar ??
                                earning.total;
                            return v != null ? String(v) : '';
                        })(),
                        convertRateText: (() => {
                            const v = earning.convertRate ?? earning.rate;
                            return v != null ? String(v) : '';
                        })(),
                        status: earning.status || 'Unpaid',
                    });
                }
            } catch {
                toast.error('Failed to load earning details');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchEarningById();
        return () => {
            mounted = false;
        };
    }, [id, axiosProtect, refetch]);

    // ---- Handle typed changes (kept as text)
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (
            name === 'imageQty' ||
            name === 'totalUsd' ||
            name === 'convertRate'
        ) {
            const key = `${name}Text`;
            setFormData((prev) => ({ ...prev, [key]: value }));
            return;
        }

        if (name === 'month') {
            setFormData((prev) => ({ ...prev, month: value }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ---- Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.month || !formData.clientId || !formData.status) {
            toast.error('Please fill all required fields');
            return;
        }
        if (totalUsd <= 0 || convertRate <= 0) {
            toast.error('USD and Convert Rate must be positive numbers');
            return;
        }

        const payload = {
            userEmail: user?.email || '',
            month: formData.month.toLowerCase(), // backend expects lowercase
            clientId: formData.clientId,
            imageQty, // numeric
            totalUsd, // numeric
            convertRate, // numeric
            convertedBdt, // derived numeric
            status: formData.status, // include status
        };

        try {
            console.log(id);
            const res = await axiosSecure.put(`/updateEarnings/${id}`, payload);
            if (res.data?.success) {
                toast.success('Earning updated successfully!');
                dispatch(setRefetch(!refetch));
                document.getElementById('edit-earning-modal')?.close();
            } else {
                toast.error(res.data?.message || 'Update failed');
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.log(err);
            toast.error('Failed to update earning');
        }
    };

    const handleReset = () => {
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
                        className="select select-bordered w-full mt-1"
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
                        className="select select-bordered w-full mt-1"
                    >
                        <option value="">Select</option>
                        {clientIDs.map((c) => (
                            <option
                                key={c._id || c.clientID}
                                value={c.clientID}
                            >
                                {c.clientID}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Image QTY */}
                <div>
                    <label className="label">Image Quantity</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        name="imageQty"
                        value={formData.imageQtyText}
                        onChange={handleChange}
                        placeholder="e.g. 1200"
                        className="input input-bordered w-full mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Parsed: {imageQty.toLocaleString()}
                    </p>
                </div>

                {/* Total USD */}
                <div>
                    <label className="label">Total USD</label>
                    <input
                        type="text"
                        inputMode="decimal"
                        name="totalUsd"
                        value={formData.totalUsdText}
                        onChange={handleChange}
                        placeholder="e.g. 320"
                        className="input input-bordered w-full mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Parsed: {totalUsd.toLocaleString()}
                    </p>
                </div>
                <div>
                    <label className="label">Total USD</label>
                    <input
                        type="text"
                        inputMode="decimal"
                        name="totalUsd"
                        value={formData.receivable}
                        onChange={handleChange}
                        placeholder="e.g. 320"
                        className="input input-bordered w-full mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Parsed: {totalUsd.toLocaleString()}
                    </p>
                </div>

                {/* Convert Rate */}
                <div>
                    <label className="label">Convert Rate</label>
                    <input
                        type="text"
                        inputMode="decimal"
                        name="convertRate"
                        value={formData.convertRateText}
                        onChange={handleChange}
                        placeholder="e.g. 120"
                        className="input input-bordered w-full mt-1"
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
                        className="input input-bordered w-full mt-1 bg-red-100"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                        = Total USD × Convert Rate = {totalUsd.toLocaleString()}{' '}
                        × {convertRate.toLocaleString()}
                    </p>
                </div>

                {/* Status */}
                <div>
                    <label className="label">Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        className="select select-bordered w-full mt-1"
                    >
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                    </select>
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
