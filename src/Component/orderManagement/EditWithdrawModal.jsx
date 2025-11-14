import { useState, useEffect, useContext, useRef } from 'react';
import { X } from 'lucide-react';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { ContextData } from '../../DataProvider';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { setRefetch } from '../../redux/refetchSlice';

export default function EditWithdrawModal({ id }) {
    const axiosProtect = useAxiosProtect();
    const { user } = useContext(ContextData);
    const dispatch = useDispatch();
    const refetch = useSelector((s) => s.refetch.refetch);
    const dialogRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState([]);
    const [submitting, setSubmitting] = useState(false);

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

    const normalizeMonthLabel = (value) => {
        if (!value) return '';
        const text = String(value).trim();
        return text
            ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
            : '';
    };

    const toFixedOrEmpty = (value, fractionDigits = 2) =>
        Number.isFinite(Number(value))
            ? Number(value).toFixed(fractionDigits)
            : '';

    const stringOrEmpty = (value) =>
        value === undefined || value === null ? '' : String(value);

    const [form, setForm] = useState({
        month: '',
        clientId: '',
        imageQty: '',
        totalUsd: '',
        charge: '',
        receivable: '',
        convertRate: '',
        convertedBdt: '',
        status: 'Unpaid',
    });

    useEffect(() => {
        if (!id || !user?.email) return;
        const controller = new AbortController();
        let isActive = true;

        setLoading(true);

        axiosProtect
            .get(`/getSingleEarning/${id}`, {
                params: { userEmail: user.email },
                signal: controller.signal,
            })
            .then(({ data }) => {
                if (!isActive) return;
                const earning = data?.data;
                if (!earning) throw new Error('Earning not found');

                setForm({
                    month: normalizeMonthLabel(earning.month || ''),
                    clientId: earning.clientId || earning.clientID || '',
                    imageQty: stringOrEmpty(earning.imageQty),
                    totalUsd: toFixedOrEmpty(earning.totalUsd),
                    charge: toFixedOrEmpty(earning.charge),
                    receivable: toFixedOrEmpty(earning.receivable),
                    convertRate: stringOrEmpty(earning.convertRate),
                    convertedBdt: toFixedOrEmpty(earning.convertedBdt),
                    status: earning.status || 'Unpaid',
                });
            })
            .catch((error) => {
                if (!controller.signal.aborted) {
                    console.error(error);
                    toast.error(
                        error?.response?.data?.message ||
                            'Failed to load earning details'
                    );
                }
            })
            .finally(() => {
                if (isActive) setLoading(false);
            });

        return () => {
            isActive = false;
            controller.abort();
        };
    }, [id, axiosProtect, refetch, user?.email]);

    useEffect(() => {
        if (!form.month || !user?.email) {
            setClients([]);
            return;
        }

        const controller = new AbortController();
        const selectedMonth = form.month.toLowerCase();

        (async () => {
            try {
                const { data } = await axiosProtect.get(
                    '/getClientsByMonth',
                    {
                        params: {
                            userEmail: user.email,
                            selectedMonth,
                        },
                        signal: controller.signal,
                    }
                );
                setClients(data?.clients || []);
            } catch (error) {
                if (!controller.signal.aborted) {
                    toast.error(
                        error?.response?.data?.message ||
                            'Failed to load clients'
                    );
                }
            }
        })();

        return () => controller.abort();
    }, [form.month, user?.email, axiosProtect]);

    useEffect(() => {
        if (!form.clientId || clients.length === 0) return;

        const client = clients.find(
            (c) => String(c.clientID) === String(form.clientId)
        );
        if (!client) return;

        setForm((prev) => {
            const totalUsdValue = toFixedOrEmpty(client.totalUsd);
            const total = parseFloat(totalUsdValue) || 0;
            const charge = parseFloat(prev.charge) || 0;
            const rate = parseFloat(prev.convertRate) || 0;
            const receivable = Math.max(total - charge, 0);
            return {
                ...prev,
                totalUsd: totalUsdValue,
                receivable: receivable.toFixed(2),
                convertedBdt:
                    rate > 0
                        ? (receivable * rate).toFixed(2)
                        : prev.convertedBdt || '0.00',
            };
        });
    }, [form.clientId, clients]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => {
            const next = { ...prev, [name]: value };

            if (name === 'month') {
                next.month = normalizeMonthLabel(value);
            }

            if (['totalUsd', 'charge', 'convertRate'].includes(name)) {
                const total = parseFloat(next.totalUsd) || 0;
                const charge = parseFloat(next.charge) || 0;
                const rate = parseFloat(next.convertRate) || 0;
                const receivable = Math.max(total - charge, 0);

                next.receivable = receivable.toFixed(2);
                next.convertedBdt =
                    rate > 0 ? (receivable * rate).toFixed(2) : '0.00';
            }

            if (name === 'status') {
                next.status = value === 'Paid' ? 'Paid' : 'Unpaid';
            }

            return next;
        });
    };

    const closeModal = () => {
        dialogRef.current?.close();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.month) return toast.error('Please select a month');
        if (!form.clientId) return toast.error('Please select a client');
        if (!user?.email)
            return toast.error('Authentication expired. Please log in again.');

        try {
            setSubmitting(true);

            const payload = {
                userEmail: user.email,
                month: normalizeMonthLabel(form.month),
                clientId: String(form.clientId).trim(),
                imageQty: Number(form.imageQty) || 0,
                totalUsd: Number(form.totalUsd) || 0,
                charge: Number(form.charge) || 0,
                receivable: Number(form.receivable) || 0,
                convertRate: Number(form.convertRate) || 0,
                convertedBdt: Number(form.convertedBdt) || 0,
                status: form.status,
                updatedAt: new Date(),
            };

            const { data } = await axiosProtect.put(
                `/updateEarnings/${id}`,
                payload
            );

            if (data?.success) {
                dispatch(setRefetch(!refetch));
                toast.success('Earning updated successfully');
                closeModal();
            } else {
                throw new Error(data?.message || 'Update failed');
            }
        } catch (err) {
            console.log(err);
            toast.error(
                err?.response?.data?.message ||
                    err.message ||
                    'Failed to update'
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading)
        return (
            <dialog id="edit-withdraw-modal" className="modal" ref={dialogRef}>
                <div className="modal-box">
                    <p>Loading earning data...</p>
                </div>
            </dialog>
        );

    return (
        <dialog id="edit-withdraw-modal" className="modal" ref={dialogRef}>
            <div className="modal-box w-full max-w-lg border-2 border-primary!">
                <form method="dialog">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="btn btn-sm btn-circle btn-error absolute right-2 top-2 text-white"
                    >
                        <X size={16} />
                    </button>
                </form>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 text-gray-700"
                >
                    <h3 className="font-bold text-xl mb-2 text-center">
                        Edit Withdrawal
                    </h3>

                    {/* Month */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">
                                Select Month
                            </span>
                        </label>
                        <select
                            name="month"
                            className="select border! border-primary! w-full"
                            value={form.month}
                            onChange={handleChange}
                        >
                            <option value="">-- Select Month --</option>
                            {months.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Client */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">
                                Select Client
                            </span>
                        </label>
                        <select
                            name="clientId"
                            className="select border! border-primary! w-full"
                            value={form.clientId}
                            onChange={handleChange}
                            disabled={!form.month}
                        >
                            <option value="">-- Select Client ID --</option>
                            {clients.map((c) => (
                                <option key={c.clientID} value={c.clientID}>
                                    Client_{c.clientID}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Image Qty */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">
                                Image Quantity
                            </span>
                        </label>
                        <input
                            type="number"
                            name="imageQty"
                            value={form.imageQty}
                            onChange={handleChange}
                            className="input border! border-primary! w-full"
                        />
                    </div>

                    {/* USD & Charge */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">
                                    Total USD ($)
                                </span>
                            </label>
                            <input
                                type="number"
                                name="totalUsd"
                                step="0.01"
                                value={form.totalUsd}
                                onChange={handleChange}
                                className="input border! border-primary! w-full"
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">
                                    Charge ($)
                                </span>
                            </label>
                            <input
                                type="number"
                                name="charge"
                                step="0.01"
                                value={form.charge}
                                onChange={handleChange}
                                className="input border! border-primary! w-full"
                            />
                        </div>
                    </div>

                    {/* Receivable & Rate */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">
                                    Receivable ($)
                                </span>
                            </label>
                            <input
                                type="number"
                                name="receivable"
                                value={form.receivable}
                                readOnly
                                className="input border! border-primary! w-full bg-gray-100"
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">
                                    Convert Rate (৳)
                                </span>
                            </label>
                            <input
                                type="number"
                                name="convertRate"
                                step="0.01"
                                value={form.convertRate}
                                onChange={handleChange}
                                className="input border! border-primary! w-full"
                            />
                        </div>
                    </div>

                    {/* Converted BDT */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">
                                BDT Amount (৳)
                            </span>
                        </label>
                        <input
                            type="text"
                            name="convertedBdt"
                            value={form.convertedBdt}
                            readOnly
                            className="input border! border-primary! w-full bg-gray-100 font-semibold"
                        />
                    </div>

                    {/* Status */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">
                                Payment Status
                            </span>
                        </label>
                        <select
                            name="status"
                            className="select border! border-primary! w-full"
                            value={form.status}
                            onChange={handleChange}
                        >
                            <option value="Paid">Paid</option>
                            <option value="Unpaid">Unpaid</option>
                        </select>
                    </div>

                    <div className="modal-action">
                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={submitting}
                        >
                            {submitting ? 'Updating...' : 'Update Earning'}
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    );
}
