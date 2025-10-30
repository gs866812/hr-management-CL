import { useState, useEffect, useContext } from 'react';
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
        if (!id) return;
        setLoading(true);

        axiosProtect
            .get(`/getSingleEarning/${id}`)
            .then(({ data }) => {
                const earning = data?.data;
                if (!earning) throw new Error('Earning not found');
                console.log(earning);

                setForm({
                    month: earning.month || '',
                    clientId: earning.clientId || earning.clientID || '',
                    imageQty: earning.imageQty ?? '',
                    totalUsd: earning.totalUsd ?? '',
                    charge: earning.charge ?? 0,
                    receivable: earning.receivable ?? '',
                    convertRate: earning.convertRate ?? '',
                    convertedBdt: earning.convertedBdt ?? '',
                    status: earning.status || 'Unpaid',
                });
            })
            .catch(() => toast.error('Failed to load earning details'))
            .finally(() => setLoading(false));
    }, [id, axiosProtect, refetch]);

    // 🧠 Load clients by month
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
                setClients(data?.clients || []);
            } catch {
                toast.error('Failed to load clients');
            }
        })();
    }, [form.month, user?.email, axiosProtect]);

    // 🔁 Auto-fill totalUsd if client selected
    useEffect(() => {
        if (form.clientId && clients.length > 0) {
            const client = clients.find((c) => c.clientID === form.clientId);
            if (client) {
                setForm((prev) => ({
                    ...prev,
                    totalUsd: Number(client.totalUsd || 0).toFixed(2),
                }));
            }
        }
    }, [form.clientId, clients]);

    // 🧮 Handle input and recalc derived fields
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

    // 💾 Submit update
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.month) return toast.error('Please select a month');
        if (!form.clientId) return toast.error('Please select a client');

        try {
            setSubmitting(true);

            const payload = {
                userEmail: user?.email || '',
                month: String(form.month).toLowerCase(),
                clientId: form.clientId,
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
                document.getElementById('edit-withdraw-modal')?.close();
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
            <dialog id="edit-withdraw-modal" className="modal">
                <div className="modal-box">
                    <p>Loading earning data...</p>
                </div>
            </dialog>
        );

    return (
        <dialog id="edit-withdraw-modal" className="modal">
            <div className="modal-box w-full max-w-lg border-2 !border-primary">
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
                            className="select !border !border-primary w-full"
                            value={form.month}
                            onChange={handleChange}
                        >
                            <option value="">-- Select Month --</option>
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
                            className="select !border !border-primary w-full"
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
                            className="input !border !border-primary w-full"
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
                                className="input !border !border-primary w-full"
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
                                className="input !border !border-primary w-full"
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
                                className="input !border !border-primary w-full bg-gray-100"
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
                                className="input !border !border-primary w-full"
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
                            className="input !border !border-primary w-full bg-gray-100 font-semibold"
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
                            className="select !border !border-primary w-full"
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
