import { useState, useEffect, useContext } from 'react';
import { X } from 'lucide-react';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { ContextData } from '../../DataProvider';
import { toast } from 'react-toastify';

export default function WithdrawModal() {
    const axiosProtect = useAxiosProtect();
    const { user } = useContext(ContextData);

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

    const [clients, setClients] = useState([]);
    const [submitting, setSubmitting] = useState(false);

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

    // 🔹 Fetch clients by selected month
    useEffect(() => {
        if (!form.month || !user?.email) return;

        (async () => {
            try {
                const { data } = await axiosProtect.get('/getClientsByMonth', {
                    params: {
                        userEmail: user.email,
                        selectedMonth: form.month.toLowerCase(),
                    },
                });

                if (data?.success) {
                    setClients(data.clients || []);
                } else {
                    setClients([]);
                    toast.info('No client data found for this month');
                }
            } catch (err) {
                toast.error(
                    err?.response?.data?.message || 'Failed to load clients'
                );
            }
        })();
    }, [form.month, user?.email, axiosProtect]);

    // 🔹 Auto-fill client’s imageQty & totalUsd when client changes
    useEffect(() => {
        if (form.clientId && clients.length > 0) {
            const selectedClient = clients.find(
                (c) => c.clientID === form.clientId
            );

            if (selectedClient) {
                setForm((prev) => ({
                    ...prev,
                    imageQty: selectedClient.imageQty || '',
                    totalUsd: Number(selectedClient.totalUsd || 0).toFixed(2),
                }));
            }
        }
    }, [form.clientId, clients]);

    // 🔹 Input handler with live calculation
    const handleChange = (e) => {
        const { name, value } = e.target;
        const updated = { ...form, [name]: value };

        const total = parseFloat(updated.totalUsd) || 0;
        const charge = parseFloat(updated.charge) || 0;
        const rate = parseFloat(updated.convertRate) || 0;
        const receivable = total - charge;
        const convertedBdt = receivable * rate;

        updated.receivable = receivable.toFixed(2);
        updated.convertedBdt = convertedBdt.toFixed(2);
        setForm(updated);
    };

    // 🔹 Reset handler
    const handleReset = () =>
        setForm({
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

    // 🔹 Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.month) return toast.error('Please select a month');
        if (!form.clientId) return toast.error('Please select a client');

        try {
            setSubmitting(true);

            const payload = {
                userEmail: user?.email || '',
                month: form.month.toLowerCase(),
                clientId: form.clientId,
                imageQty: Number(form.imageQty) || 0,
                totalUsd: Number(form.totalUsd) || 0,
                charge: Number(form.charge) || 0,
                receivable: Number(form.receivable) || 0,
                convertRate: Number(form.convertRate) || 0,
                convertedBdt: Number(form.convertedBdt) || 0,
                status: form.status,
                createdAt: new Date(),
            };

            const { data } = await axiosProtect.post('/addEarnings', payload);

            if (data?.success || data?.insertedId) {
                toast.success('Withdrawal form submitted successfully');
                handleReset();
                document.getElementById('withdraw-modal')?.close();
            } else {
                throw new Error(data?.message || 'Submission failed');
            }
        } catch (err) {
            toast.error(
                err?.response?.data?.message ||
                    err.message ||
                    'Failed to submit'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <dialog id="withdraw-modal" className="modal">
            <div className="modal-box w-full max-w-lg border-2 border-primary!">
                <form method="dialog">
                    <button className="btn btn-sm btn-circle btn-error absolute right-2 top-2 text-white">
                        <X size={16} />
                    </button>
                </form>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 text-gray-700"
                >
                    <h3 className="font-bold text-xl mb-2 text-center">
                        Withdraw Form
                    </h3>

                    {/* Select Month */}
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
                            required
                        >
                            <option value="">Select Month</option>
                            {months.map((m) => (
                                <option key={m} value={m.toLowerCase()}>
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
                            required
                            disabled={!form.month || clients.length === 0}
                        >
                            <option value="">Select Client ID</option>
                            {clients.map((c) => (
                                <option key={c.clientID} value={c.clientID}>
                                    Client_{c.clientID}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Image Quantity */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">
                                Image Quantity
                            </span>
                        </label>
                        <input
                            type="number"
                            name="imageQty"
                            min={0}
                            step={1}
                            placeholder="e.g., 120"
                            className="input border! border-primary! w-full"
                            value={form.imageQty}
                            onChange={handleChange}
                            required
                            readOnly
                        />
                    </div>

                    {/* Total Dollar + Charge */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">
                                    Total Dollar ($)
                                </span>
                            </label>
                            <input
                                type="number"
                                name="totalUsd"
                                step="0.01"
                                placeholder="Total"
                                className="input border! border-primary! w-full"
                                value={form.totalUsd}
                                onChange={handleChange}
                                required
                                readOnly
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
                                placeholder="Charge"
                                className="input border! border-primary! w-full"
                                value={form.charge}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Receivable + Rate */}
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
                                placeholder="Rate"
                                className="input border! border-primary! w-full"
                                value={form.convertRate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* BDT Amount */}
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

                    {/* Payment Status */}
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
                            {submitting ? 'Submitting...' : 'Submit Withdrawal'}
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    );
}
