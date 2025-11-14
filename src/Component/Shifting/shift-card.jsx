import { Building2, CalendarClock, Clock, ClipboardList } from 'lucide-react';
import EditShiftModal from './edit-shift-modal';
import { useDispatch } from 'react-redux';
import { setRefetch } from '../../redux/refetchSlice';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { ContextData } from '../../DataProvider';

export default function ShiftCard({ shift, refetch }) {
    const { user } = useContext(ContextData);

    const {
        shiftName,
        branch,
        startTime,
        endTime,
        lateAfterMinutes,
        absentAfterMinutes,
        allowOT,
    } = shift;

    const dispatch = useDispatch();

    const onEdit = () => {
        document.getElementById('edit-shift-modal').showModal();
    };

    const onDelete = async () => {
        if (!shift?._id) {
            return toast.error('Shift ID missing');
        }

        const sure = confirm(
            `Are you sure you want to delete the shift "${shift.shiftName}"?`
        );
        if (!sure) return;

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BASE_URL}/shifts/delete-shift/${
                    shift._id
                }?userEmail=${user?.email}`,
                {
                    method: 'DELETE',
                }
            );

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success(data.message || 'Shift deleted successfully');
                dispatch(setRefetch(!refetch));
            } else {
                toast.error(data.message || 'Failed to delete shift');
            }
        } catch (error) {
            console.error('Delete Shift Error:', error);
            toast.error('Something went wrong while deleting the shift');
        }
    };

    return (
        <div className="card w-96 bg-base-100 shadow-md border">
            <div className="card-body">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="card-title">{shiftName}</h2>
                    <div
                        className={`badge badge-soft ${
                            allowOT ? 'badge-success' : 'badge-error'
                        } capitalize`}
                    >
                        {allowOT ? 'OT allowed' : 'OT not allowed'}
                    </div>
                </div>

                {/* Body */}
                <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                        <Building2 size={18} />
                        <span className="font-medium">Branch:</span>
                        <span className="capitalize">{branch}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Clock size={18} />
                        <span className="font-medium">Time:</span>
                        <span className="capitalize">
                            {startTime} – {endTime}
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <CalendarClock size={18} />
                            <span className="font-medium">Late:</span>
                            <span>{lateAfterMinutes}m</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <ClipboardList size={18} />
                            <span className="font-medium">Absent:</span>
                            <span>{absentAfterMinutes}m</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="card-actions justify-end mt-4">
                    <button className="btn btn-primary btn-sm" onClick={onEdit}>
                        Edit
                    </button>
                    <button className="btn btn-error btn-sm" onClick={onDelete}>
                        Delete
                    </button>
                </div>
            </div>
            <EditShiftModal refetch={refetch} data={shift} />
        </div>
    );
}
