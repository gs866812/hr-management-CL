import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ContextData } from '../../DataProvider';
import { useDispatch } from 'react-redux';
import { setRefetch } from '../../redux/refetchSlice';

export default function EditShiftModal({ refetch, data }) {
    const { user } = useContext(ContextData);
    const dispatch = useDispatch();

    const [form, setForm] = useState({
        _id: '',
        shiftName: '',
        branch: '',
        startTime: '',
        endTime: '',
        lateAfterMinutes: 0,
        absentAfterMinutes: 5,
        allowOT: true,
    });

    const [loading, setLoading] = useState(false);

    // Load data when modal opens
    useEffect(() => {
        if (data) {
            setForm({
                _id: data._id,
                shiftName: data.shiftName,
                branch: data.branch,
                startTime: data.startTime,
                endTime: data.endTime,
                lateAfterMinutes: data.lateAfterMinutes,
                absentAfterMinutes: data.absentAfterMinutes,
                allowOT: data.allowOT,
            });
        }
    }, [data]);

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
                `${import.meta.env.VITE_BASE_URL}/shifts/update-shift`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...form,
                        userEmail: user?.email,
                    }),
                }
            );

            const responseData = await res.json();

            if (res.ok && responseData.success) {
                toast.success(
                    responseData?.message || 'Shift updated successfully'
                );

                const modal = document.getElementById('edit-shift-modal');
                if (modal && typeof modal.close === 'function') modal.close();

                dispatch(setRefetch(!refetch));
            } else {
                toast.error(responseData?.message || 'Failed to update shift');
            }
        } catch (err) {
            console.error('Error updating shift:', err);
            toast.error('Something went wrong while updating the shift');
        } finally {
            setLoading(false);
        }
    };

    return (
        <dialog id="edit-shift-modal" className="modal">
            <div className="modal-box max-w-md">
                <h3 className="font-bold text-lg mb-4">Update Shift</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Shift Name */}
                    <div>
                        <label className="label">
                            <span className="label-text">Shift Name</span>
                        </label>
                        <input
                            type="text"
                            name="shiftName"
                            value={form.shiftName}
                            onChange={handleChange}
                            required
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

                    {/* Times */}
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

                    {/* Late / Absent */}
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
                    <div className="flex items-center gap-2">
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
                            className="btn btn-primary"
                        >
                            {loading ? 'Updating...' : 'Update Shift'}
                        </button>

                        <button
                            type="button"
                            className="btn btn-soft"
                            onClick={() =>
                                document
                                    .getElementById('edit-shift-modal')
                                    ?.close()
                            }
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
