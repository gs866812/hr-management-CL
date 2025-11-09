import { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { ContextData } from '../../DataProvider';

export default function NewShiftModal({ refetch }) {
    const { user } = useContext(ContextData);

    const [form, setForm] = useState({
        shiftName: '',
        branch: 'dhaka',
        startTime: '',
        endTime: '',
        lateAfterMinutes: 0,
        absentAfterMinutes: 5,
        allowOT: true,
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        try {
            setLoading(true);

            const res = await fetch(
                `${import.meta.env.VITE_BASE_URL}/shifts/new-shift`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...form,
                        userEmail: user?.email,
                    }),
                }
            );
            console.log(res);

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success(data?.message || 'Shift created successfully');

                setForm({
                    shiftName: '',
                    branch: 'dhaka',
                    startTime: '',
                    endTime: '',
                    lateAfterMinutes: 0,
                    absentAfterMinutes: 5,
                    allowOT: true,
                });

                const modal = document.getElementById('new-shift-modal');
                if (modal && typeof modal.close === 'function') modal.close();

                refetch?.();
            } else {
                toast.error(data?.message || 'Failed to create shift');
            }
        } catch (err) {
            console.error('Error creating shift:', err);
            toast.error('Something went wrong while creating the shift');
        } finally {
            setLoading(false);
        }
    };

    return (
        <dialog id="new-shift-modal" className="modal">
            <div className="modal-box max-w-md">
                <h3 className="font-bold text-lg mb-4">Create New Shift</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Shift Name */}
                    <div>
                        <label className="label">
                            <span className="label-text" disabled>
                                Shift Name
                            </span>
                        </label>
                        <input
                            type="text"
                            name="shiftName"
                            value={form.shiftName}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Morning"
                            className="input border! border-primary! w-full"
                        />
                    </div>

                    {/* Branch */}
                    <div>
                        <label className="label">
                            <span className="label-text">Branch</span>
                        </label>
                        <select
                            name="branch"
                            value={form.branch}
                            onChange={handleChange}
                            required
                            className="select border! border-primary! w-full capitalize"
                        >
                            <option value="" disabled>
                                Select Branch
                            </option>
                            {['dhaka', 'gaibandha'].map((branch) => (
                                <option key={branch} value={branch}>
                                    {branch}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Start Time / End Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">
                                <span className="label-text">Start Time</span>
                            </label>
                            <input
                                type="time"
                                name="startTime"
                                value={form.startTime}
                                onChange={handleChange}
                                required
                                className="input border! border-primary! w-full"
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text">End Time</span>
                            </label>
                            <input
                                type="time"
                                name="endTime"
                                value={form.endTime}
                                onChange={handleChange}
                                required
                                className="input border! border-primary! w-full"
                            />
                        </div>
                    </div>

                    {/* Late & Absent thresholds */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">
                                <span className="label-text">
                                    Late After (min)
                                </span>
                            </label>
                            <input
                                type="number"
                                name="lateAfterMinutes"
                                value={form.lateAfterMinutes}
                                onChange={handleChange}
                                min="0"
                                className="input border! border-primary! w-full"
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text">
                                    Absent After (min)
                                </span>
                            </label>
                            <input
                                type="number"
                                name="absentAfterMinutes"
                                value={form.absentAfterMinutes}
                                onChange={handleChange}
                                min="1"
                                className="input border! border-primary! w-full"
                            />
                        </div>
                    </div>

                    {/* Allow OT */}
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            name="allowOT"
                            checked={form.allowOT}
                            onChange={handleChange}
                            className="checkbox border! border-primary!"
                        />
                        <span className="label-text">Allow Overtime</span>
                    </div>

                    {/* Actions */}
                    <div className="modal-action">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {loading ? 'Creating...' : 'Create Shift'}
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                document
                                    .getElementById('new-shift-modal')
                                    .close()
                            }
                            className="btn btn-ghost"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    );
}
