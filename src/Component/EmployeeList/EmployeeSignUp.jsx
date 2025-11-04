import { useState } from 'react';
import { MdOutlineMail } from 'react-icons/md';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { setRefetch } from '../../redux/refetchSlice';
import useAxiosSecure from '../../utils/useAxiosSecure';

const roles = ['employee', 'Admin', 'HR-ADMIN', 'teamLeader', 'Developer'];

const AdminAddEmployee = () => {
    const [form, setForm] = useState({
        email: '',
        eid: '',
        salary: '',
        role: 'employee',
    });
    const [loading, setLoading] = useState(false);

    const axiosSecure = useAxiosSecure();
    const dispatch = useDispatch();
    const refetch = useSelector((s) => s.refetch.refetch);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // keep EID uppercase (e.g., WB000001)
        if (name === 'eid') {
            return setForm((p) => ({ ...p, eid: value.toUpperCase() }));
        }
        // salary: allow only digits
        if (name === 'salary') {
            const v = value.replace(/[^\d.]/g, '');
            return setForm((p) => ({ ...p, salary: v }));
        }
        setForm((p) => ({ ...p, [name]: value }));
    };

    const handleReset = () => {
        setForm({
            email: '',
            eid: '',
            salary: '',
            role: 'employee',
        });
    };

    const validate = () => {
        const { email, eid, salary, role } = form;
        if (!email || !eid || !salary || !role) {
            toast.error('Email, EID, Salary and Role are required.');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            toast.error('Please enter a valid email address.');
            return false;
        }
        if (!/^WB\d{6,}$/.test(eid.trim())) {
            // adjust regex if your format differs
            toast.error('EID must look like WB000001 (WB + 6+ digits).');
            return false;
        }
        if (Number.isNaN(Number(salary)) || Number(salary) <= 0) {
            toast.error('Salary must be a positive number.');
            return false;
        }
        if (!roles.includes(role)) {
            toast.error('Please select a valid role.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const normalizedEmail = form.email.trim().toLowerCase();

        const payload = {
            email: normalizedEmail,
            eid: form.eid.trim(),
            salary: Number(form.salary),
            role: form.role,
        };

        setLoading(true);
        try {
            const res = await axiosSecure.post('/employees/add-employee', payload);

            if (res?.data?.success) {
                Swal.fire({
                    title: 'Employee Added',
                    text: 'Activation link has been emailed to the employee.',
                    icon: 'success',
                });
                handleReset();
                dispatch(setRefetch(!refetch));
            } else {
                throw new Error(
                    res?.data?.message || 'Failed to add employee.'
                );
            }
        } catch (error) {
            // try to infer conflict source (email vs eid) from backend message
            const serverMsg =
                error?.response?.data?.message ||
                error?.message ||
                'Request failed.';
            if (error?.response?.status === 409) {
                if (/EID/i.test(serverMsg)) {
                    Swal.fire({
                        title: 'Duplicate EID',
                        text: serverMsg,
                        icon: 'info',
                    });
                } else if (/email/i.test(serverMsg)) {
                    Swal.fire({
                        title: 'Duplicate Email',
                        text: serverMsg,
                        icon: 'info',
                    });
                } else {
                    Swal.fire({
                        title: 'Already Exists',
                        text: serverMsg,
                        icon: 'info',
                    });
                }
            } else {
                Swal.fire({
                    title: 'Error',
                    text: serverMsg,
                    icon: 'error',
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md">
            <h2 className="text-2xl font-bold text-center mb-6">
                Add Employee (Admin)
            </h2>

            <form
                onSubmit={handleSubmit}
                className="border p-5 rounded-md grid grid-cols-1 gap-4"
            >
                {/* Email */}
                <label className="input border-2! border-primary! flex items-center gap-2">
                    <MdOutlineMail />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email (e.g., user@company.com)"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full"
                    />
                </label>

                {/* EID */}
                <div>
                    <span className="label-text">EID</span>
                    <input
                        type="text"
                        name="eid"
                        value={form.eid}
                        onChange={handleChange}
                        required
                        className="input border-2! border-primary! w-full"
                        placeholder="WB000001"
                    />
                </div>

                {/* Salary */}
                <div>
                    <span className="label-text">Salary</span>
                    <input
                        type="text"
                        name="salary"
                        value={form.salary}
                        onChange={handleChange}
                        required
                        className="input border-2! border-primary! w-full"
                        placeholder="50000"
                        inputMode="decimal"
                    />
                </div>

                {/* Role */}
                <div>
                    <span className="label-text">Role</span>
                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="select border-2! border-primary! w-full capitalize"
                        required
                    >
                        {roles.map((r) => (
                            <option key={r} value={r}>
                                {r.toLowerCase()}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    className="btn bg-[#6E3FF3] text-white w-full mt-2"
                    disabled={loading}
                >
                    {loading ? 'Adding...' : 'Add Employee'}
                </button>
            </form>

            {/* Optional helper / hint */}
            <p className="text-xs text-gray-500 mt-3">
                After adding, an activation email is sent automatically. The
                employee will complete their profile and set a password via the
                link.
            </p>
        </div>
    );
};

export default AdminAddEmployee;
