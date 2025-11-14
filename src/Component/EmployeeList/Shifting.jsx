import { useContext, useEffect, useMemo, useState } from 'react';
import { ContextData } from '../../DataProvider';
import { useDispatch, useSelector } from 'react-redux';
import useAxiosSecure from '../../utils/useAxiosSecure';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { toast } from 'react-toastify';
import { setRefetch } from '../../redux/refetchSlice';
import Swal from 'sweetalert2';
import { PlusIcon } from 'lucide-react';
import NewShiftModal from '../Shifting/new-shift-modal';
import ShiftCard from '../Shifting/shift-card';

export default function Shifting() {
    const { employeeList, user, currentUser } = useContext(ContextData);
    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    const axiosSecure = useAxiosSecure();
    const axiosProtect = useAxiosProtect();

    const [shiftList, setShiftList] = useState([]);
    const [shiftedEmployees, setShiftedEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [selectedShift, setSelectedShift] = useState('');
    const [OTHours, setOTHours] = useState(0);
    const [selectedBranch, setSelectedBranch] = useState('');

    // ---------- Helpers ----------
    const isDeactivated = (emp) =>
        String(emp?.status || '').toLowerCase() === 'de-activate';

    const activeEmployees = useMemo(() => {
        const arr = Array.isArray(employeeList) ? employeeList : [];
        return arr.filter((e) => !isDeactivated(e));
    }, [employeeList]);

    const getEmpByEmail = (email) =>
        (Array.isArray(employeeList) ? employeeList : []).find(
            (e) => e.email === email
        );

    const getRealEmailFromShift = (rec) =>
        rec?.shiftName === 'OT list' ? rec?.actualEmail : rec?.email;

    const visibleShifted = useMemo(() => {
        const arr = Array.isArray(shiftedEmployees) ? shiftedEmployees : [];
        return arr.filter((rec) => {
            const realEmail = getRealEmailFromShift(rec);
            const emp = getEmpByEmail(realEmail);
            return emp && !isDeactivated(emp);
        });
    }, [shiftedEmployees, employeeList]);

    // ---------- Fetch Dynamic Shifts ----------
    useEffect(() => {
        const fetchShifts = async () => {
            try {
                const { data } = await axiosProtect.get('/shifts/get-shifts', {
                    params: { userEmail: user?.email },
                });
                if (data.success) setShiftList(data.shifts || []);
                else toast.error(data?.message || 'Failed to load shifts');
            } catch (error) {
                console.error('❌ Error fetching shift list:', error);
                toast.error('Error fetching shift list');
            }
        };
        if (user?.email) fetchShifts();
    }, [user?.email, refetch]);

    // ---------- Fetch Shifted Employees ----------
    useEffect(() => {
        const fetchShiftedEmployee = async () => {
            try {
                const { data } = await axiosProtect.get(
                    '/gethShiftedEmployee',
                    {
                        params: { userEmail: user?.email },
                    }
                );
                setShiftedEmployees(Array.isArray(data) ? data : []);
            } catch (error) {
                toast.error('Error fetching shifted employees');
            }
        };
        fetchShiftedEmployee();
    }, [refetch, axiosProtect, user?.email]);

    // ---------- Assign Shifts ----------
    const handleEmployeeCheckboxChange = (e, employee) => {
        const { checked } = e.target;
        setSelectedEmployees((prev) =>
            checked
                ? [...prev, employee]
                : prev.filter((emp) => emp.email !== employee.email)
        );
    };

    const handleShiftingChange = (e) => {
        setSelectedShift(e.target.value);
        setOTHours(0);
    };

    const handleReset = () => {
        setSelectedEmployees([]);
        setSelectedShift('');
        setOTHours(0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedEmployees.length || !selectedShift)
            return toast.error('Select at least one employee and a shift.');

        try {
            const payload = {
                employees: selectedEmployees,
                shift: selectedShift,
                branch: selectedBranch,
                OTFor: Number(OTHours) || 0,
            };

            const res = await axiosSecure.post('/assign-shift', payload);
            dispatch(setRefetch(!refetch));

            const {
                insertedNames = [],
                updatedNames = [],
                skippedNames = [],
            } = res.data || {};

            if (insertedNames.length)
                Swal.fire({
                    title: '✅ Added',
                    text: insertedNames.join(', '),
                    icon: 'success',
                });
            if (updatedNames.length)
                Swal.fire({
                    title: 'ℹ️ Updated',
                    text: updatedNames.join(', '),
                    icon: 'info',
                });
            if (skippedNames.length)
                Swal.fire({
                    title: '⚠️ Skipped',
                    text: skippedNames.join(', '),
                    icon: 'warning',
                });

            handleReset();
            document.getElementById('addEmployeeToShift')?.close();
        } catch (err) {
            console.error('Error assigning shift:', err);
            toast.error('Failed to assign shift');
        }
    };

    // ---------- Remove OT ----------
    const handleRemoveOT = async (id) => {
        if (!id) return toast.error('Invalid record');
        try {
            const response = await axiosSecure.delete(`/removeOT/${id}`);
            if (response.data.message === 'success') {
                dispatch(setRefetch(!refetch));
                toast.success('Removed successfully');
            } else toast.error('Failed to remove');
        } catch (error) {
            toast.error('Error removing OT');
        }
    };

    // ---------- Render Shift Overview ----------
    const renderShiftOverview = () => {
        if (!shiftList.length)
            return (
                <p className="text-gray-500 text-sm italic text-center">
                    No shifts found.
                </p>
            );

        return (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {shiftList.map((shift) => (
                    <ShiftCard
                        shift={shift}
                        refetch={refetch}
                        key={shift._id}
                    />
                ))}
            </div>
        );
    };

    const renderShiftList = (shiftName) => {
        const shift = shiftList.find((s) => s.shiftName === shiftName);
        const rows = visibleShifted.filter(
            (emp) => emp.shiftName === shiftName
        );
        if (!rows.length) return null;

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{shiftName}</h3>
                    {['admin', 'hr-admin', 'developer'].includes(
                        currentUser?.role?.toLowerCase()
                    ) &&
                        shift?.branch && (
                            <span className="text-sm text-gray-500 capitalize">
                                Branch: {shift.branch}
                            </span>
                        )}
                </div>

                {rows.map((rec, idx) => {
                    const realEmail = getRealEmailFromShift(rec);
                    const emp = getEmpByEmail(realEmail);
                    if (!emp) return null;

                    return (
                        <div
                            key={rec._id || idx}
                            className="flex items-center gap-3 bg-base-200 p-3 rounded-lg shadow-sm hover:shadow-md transition-all"
                        >
                            <img
                                src={emp?.photo}
                                alt={rec.fullName}
                                className="w-10 h-10 object-cover rounded-full border"
                            />
                            <div>
                                <h2 className="font-semibold text-gray-800">
                                    {rec.fullName}
                                </h2>
                                <p className="text-xs text-gray-500">
                                    {emp.designation || '—'}
                                </p>
                            </div>
                            {shiftName === 'OT list' && (
                                <button
                                    onClick={() => handleRemoveOT(rec._id)}
                                    className="ml-auto text-red-500 hover:text-red-600 text-sm font-medium"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const currentShiftLetter = (email) => {
        const found =
            shiftedEmployees.find((e) => e.email === email) ||
            shiftedEmployees.find((e) => e.actualEmail === email);
        return found?.shiftName ? found.shiftName.charAt(0).toUpperCase() : '';
    };

    // ---------- Render ----------
    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="text-3xl font-bold text-gray-800">
                    Employee Shifting
                </h1>

                <div className="flex gap-2">
                    {(currentUser.role === 'Admin' ||
                        currentUser.role === 'Developer' ||
                        currentUser.role === 'HR-ADMIN') && (
                        <button
                            className="btn btn-outline btn-primary flex items-center gap-1"
                            onClick={() =>
                                document
                                    .getElementById('new-shift-modal')
                                    .showModal()
                            }
                        >
                            <PlusIcon size={18} /> New Shift
                        </button>
                    )}

                    <button
                        className="btn btn-primary"
                        onClick={() =>
                            document
                                .getElementById('addEmployeeToShift')
                                .showModal()
                        }
                    >
                        + Assign Employees
                    </button>
                </div>
            </div>

            {/* Shift Overview */}
            <div>
                <h2 className="text-xl font-semibold mb-2">
                    📋 Shift Overview
                </h2>
                {renderShiftOverview()}
            </div>

            <section>
                <div className="tabs tabs-lifted">
                    {shiftList.map((shift, i) => (
                        <>
                            <input
                                key={`tab-${shift._id}`}
                                type="radio"
                                name="shift_tabs"
                                className="tab"
                                aria-label={shift.shiftName}
                                defaultChecked={i === 0}
                            />
                            <div
                                key={`content-${shift._id}`}
                                className="tab-content p-6 bg-base-100"
                            >
                                {renderShiftList(shift.shiftName)}
                            </div>
                        </>
                    ))}

                    {/* OT list tab */}
                    <input
                        type="radio"
                        name="shift_tabs"
                        className="tab"
                        aria-label="OT list"
                    />
                    <div className="tab-content p-6 bg-base-100">
                        {renderShiftList('OT list')}
                    </div>
                </div>
            </section>

            {/* ---------- Add Employee Modal ---------- */}
            <dialog id="addEmployeeToShift" className="modal">
                <div className="modal-box max-w-md">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                            ✕
                        </button>
                    </form>

                    <form onSubmit={handleSubmit}>
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">
                            Assign Employees to Shift
                        </h2>

                        {['Admin', 'HR-ADMIN', 'Developer'].includes(
                            currentUser?.role
                        ) && (
                            <select
                                className="select border-2! border-primary! w-full mb-4 capitalize"
                                value={selectedBranch}
                                onChange={(e) =>
                                    setSelectedBranch(e.target.value)
                                }
                                required
                            >
                                <option value="" disabled>
                                    Select Branch
                                </option>
                                {['gaibandha', 'dhaka'].map((branch) => (
                                    <option
                                        key={branch}
                                        value={branch}
                                        className="capitalize"
                                    >
                                        {branch}
                                    </option>
                                ))}
                            </select>
                        )}

                        <div className="mb-4 border rounded-xl p-3 h-96 overflow-y-auto bg-base-100 shadow-sm">
                            {activeEmployees.length ? (
                                activeEmployees
                                    .filter(
                                        (emp) =>
                                            !selectedBranch ||
                                            emp.branch === selectedBranch
                                    )
                                    .map((emp) => (
                                        <label
                                            key={emp.email}
                                            className="flex items-center gap-3 p-2 mb-2 bg-base-50 border border-transparent rounded-lg cursor-pointer transition-all hover:border-primary/40 hover:bg-primary/5"
                                        >
                                            {/* Checkbox */}
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-primary"
                                                checked={selectedEmployees.some(
                                                    (e) => e.email === emp.email
                                                )}
                                                onChange={(e) =>
                                                    handleEmployeeCheckboxChange(
                                                        e,
                                                        emp
                                                    )
                                                }
                                            />

                                            {/* Employee Info */}
                                            <div className="flex items-center justify-between w-full">
                                                {/* Left - Image & Details */}
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={emp.photo}
                                                        alt={`${emp.fullName}'s photo`}
                                                        className="size-10 rounded-full object-cover ring-2 ring-primary/50"
                                                    />

                                                    <div className="">
                                                        <p className="font-semibold text-gray-800 capitalize">
                                                            {emp.fullName}
                                                        </p>
                                                        <p className="text-sm text-gray-500 capitalize">
                                                            {emp.designation} •{' '}
                                                            {emp.branch}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Right - Current Shift */}
                                                <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                                                    {currentShiftLetter(
                                                        emp.email
                                                    )}
                                                </span>
                                            </div>
                                        </label>
                                    ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    No active employees found.
                                </p>
                            )}
                        </div>

                        <select
                            className="select border-2! border-primary! w-full mb-4"
                            value={selectedShift}
                            onChange={handleShiftingChange}
                            required
                        >
                            <option value="" disabled>
                                Select Shift
                            </option>
                            {shiftList
                                .filter(
                                    (shift) =>
                                        !selectedBranch ||
                                        shift.branch === selectedBranch
                                )
                                .map((shift) => (
                                    <option
                                        key={shift._id}
                                        value={shift.shiftName}
                                        className="capitalize flex items-center gap-2"
                                    >
                                        <span>{shift.shiftName}</span>
                                        <span>({shift.branch})</span>
                                    </option>
                                ))}
                            <option>OT list</option>
                        </select>

                        {selectedShift === 'OT list' && (
                            <input
                                onChange={(e) => setOTHours(e.target.value)}
                                type="number"
                                placeholder="Enter OT hours"
                                className="input border! border-primary! w-full mb-4"
                                required
                            />
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                type="reset"
                                className="btn btn-warning text-white"
                                onClick={handleReset}
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary text-white"
                            >
                                Assign
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>

            {/* Create New Shift */}
            <NewShiftModal refetch={refetch} />
        </div>
    );
}
