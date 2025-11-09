import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import auth from '../firebase.config';
import useAxiosProtect from '../utils/useAxiosProtect';

export default function CompleteProfile() {
    const navigate = useNavigate();
    const axiosProtect = useAxiosProtect();

    const [userEmail, setUserEmail] = useState('');
    const [firebaseUid, setFirebaseUid] = useState('');
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        fullName: '',
        fathersName: '',
        mothersName: '',
        spouseName: '',
        designation: '',
        phoneNumber: '',
        NID: '',
        DOB: '',
        bloodGroup: '',
        emergencyContact: '',
        emergencyContactPerson: '',
        emergencyContactPersonRelation: '',
        address: '',
    });

    // ======== GET LOGGED-IN FIREBASE USER ========
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email || '');
                setFirebaseUid(user.uid);
            } else {
                Swal.fire({
                    title: 'Not Authorized',
                    text: 'Please sign in first to complete your profile.',
                    icon: 'warning',
                }).then(() => navigate('/login'));
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    // ======== HANDLERS ========
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userEmail || !firebaseUid) {
            toast.error('Authentication missing. Please log in again.');
            return;
        }

        // Minimal validation
        if (!form.fullName || !form.designation || !form.phoneNumber) {
            toast.error('Please fill all required fields.');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                email: userEmail,
                firebaseUid,
                ...form,
            };

            const res = await axiosProtect.post(
                '/employees/complete-profile',
                payload
            );

            if (res?.data?.success) {
                Swal.fire({
                    title: 'Profile Completed!',
                    text: 'Your profile has been updated successfully.',
                    icon: 'success',
                    confirmButtonText: 'Continue to Login',
                }).then(() => navigate('/login'));
            } else {
                throw new Error(res?.data?.message || 'Profile update failed');
            }
        } catch (error) {
            console.error(error);
            const msg =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to update profile.';
            Swal.fire({
                title: 'Error',
                text: msg,
                icon: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    // ======== RENDER ========
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-3xl">
                <h2 className="text-2xl font-semibold text-center mb-2 text-gray-800">
                    Complete Your Profile
                </h2>
                <p className="text-center text-sm text-gray-600 mb-6">
                    Signed in as{' '}
                    <span className="font-medium">{userEmail}</span>
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    {/* Full Name */}
                    <input
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        value={form.fullName}
                        onChange={handleChange}
                        required
                        className="input border-2! border-primary! w-full"
                    />

                    {/* Designation */}
                    <input
                        type="text"
                        name="designation"
                        placeholder="Designation"
                        value={form.designation}
                        onChange={handleChange}
                        required
                        className="input border-2! border-primary! w-full"
                    />

                    {/* Father's Name */}
                    <input
                        type="text"
                        name="fathersName"
                        placeholder="Father's Name"
                        value={form.fathersName}
                        onChange={handleChange}
                        className="input border-2! border-primary! w-full"
                    />

                    {/* Mother's Name */}
                    <input
                        type="text"
                        name="mothersName"
                        placeholder="Mother's Name"
                        value={form.mothersName}
                        onChange={handleChange}
                        className="input border-2! border-primary! w-full"
                    />

                    {/* Spouse Name */}
                    <input
                        type="text"
                        name="spouseName"
                        placeholder="Spouse Name"
                        value={form.spouseName}
                        onChange={handleChange}
                        className="input border-2! border-primary! w-full"
                    />

                    {/* Phone Number */}
                    <input
                        type="tel"
                        name="phoneNumber"
                        placeholder="Phone Number"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        required
                        className="input border-2! border-primary! w-full"
                    />

                    {/* NID */}
                    <input
                        type="text"
                        name="NID"
                        placeholder="National ID"
                        value={form.NID}
                        onChange={handleChange}
                        className="input border-2! border-primary! w-full"
                    />

                    {/* DOB */}
                    <input
                        type="date"
                        name="DOB"
                        value={form.DOB}
                        onChange={handleChange}
                        className="input border-2! border-primary! w-full"
                    />

                    {/* Blood Group */}
                    <select
                        name="bloodGroup"
                        value={form.bloodGroup}
                        onChange={handleChange}
                        className="select border-2! border-primary! w-full"
                    >
                        <option value="">Select Blood Group</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                            (g) => (
                                <option key={g} value={g}>
                                    {g}
                                </option>
                            )
                        )}
                    </select>

                    {/* Emergency Contact */}
                    <input
                        type="tel"
                        name="emergencyContact"
                        placeholder="Emergency Contact"
                        value={form.emergencyContact}
                        onChange={handleChange}
                        className="input border-2! border-primary! w-full"
                    />

                    {/* Emergency Contact Person */}
                    <input
                        type="text"
                        name="emergencyContactPerson"
                        placeholder="Emergency Contact Person"
                        value={form.emergencyContactPerson}
                        onChange={handleChange}
                        className="input border-2! border-primary! w-full"
                    />

                    {/* Relationship */}
                    <input
                        type="text"
                        name="emergencyContactPersonRelation"
                        placeholder="Relationship (e.g., Father, Wife)"
                        value={form.emergencyContactPersonRelation}
                        onChange={handleChange}
                        className="input border-2! border-primary! w-full"
                    />

                    {/* Address */}
                    <textarea
                        name="address"
                        placeholder="Full Address"
                        value={form.address}
                        onChange={handleChange}
                        className="textarea border-2! border-primary! col-span-2 w-full"
                    ></textarea>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn bg-violet-600 hover:bg-violet-700 text-white col-span-2 mt-4"
                    >
                        {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
}
