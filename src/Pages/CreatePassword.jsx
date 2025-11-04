import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { RiLockPasswordLine } from 'react-icons/ri';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import auth from '../firebase.config';
import useAxiosProtect from '../utils/useAxiosProtect';

export default function CreatePassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const axiosProtect = useAxiosProtect();

    // Decode token to get email
    useEffect(() => {
        if (!token) {
            Swal.fire({
                title: 'Invalid Link',
                text: 'The activation link is missing or broken.',
                icon: 'error',
            });
            navigate('/');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (decoded?.email) setEmail(decoded.email);
            else throw new Error('Invalid token');
        } catch (err) {
            Swal.fire({
                title: 'Invalid Link',
                text: 'The activation link is invalid or corrupted.',
                icon: 'error',
            });
            navigate('/');
        }
    }, [token, navigate]);

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            toast.error('Please enter and confirm your password.');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }

        try {
            setLoading(true);

            // ✅ Create user in Firebase
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const firebaseUID = userCredential.user.uid;

            // ✅ Notify backend to mark user active
            const res = await axiosProtect.post('/employees/activate-user', {
                email,
                firebaseUID,
            });

            if (res?.data?.success) {
                Swal.fire({
                    title: 'Password Created!',
                    text: 'Your account is now active. Let’s complete your profile.',
                    icon: 'success',
                    confirmButtonText: 'Continue',
                }).then(() => {
                    navigate('/complete-profile');
                });
            } else {
                throw new Error(
                    res?.data?.message || 'Backend activation failed'
                );
            }
        } catch (error) {
            console.error('Error:', error);
            let message =
                error?.response?.data?.message ||
                error?.message ||
                'Something went wrong. Please try again.';
            if (message.includes('auth/email-already-in-use')) {
                message = 'This email is already registered.';
            }

            Swal.fire({
                title: 'Activation Failed',
                text: message,
                icon: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                    Create Your Password
                </h2>

                {email && (
                    <p className="text-center text-sm text-gray-600 mb-4">
                        Creating password for{' '}
                        <span className="font-medium">{email}</span>
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Password */}
                    <label className="input border-2! border-primary! flex items-center gap-2 relative w-full">
                        <RiLockPasswordLine />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pr-5"
                        />
                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 cursor-pointer"
                        >
                            {showPassword ? (
                                <IoEyeOutline />
                            ) : (
                                <IoEyeOffOutline />
                            )}
                        </span>
                    </label>

                    {/* Confirm Password */}
                    <label className="input border-2! border-primary! flex items-center gap-2 relative w-full">
                        <RiLockPasswordLine />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full"
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn bg-violet-600 hover:bg-violet-700 text-white w-full mt-4"
                    >
                        {loading ? 'Creating Password...' : 'Create Password'}
                    </button>
                </form>

                <p className="text-sm text-gray-500 mt-5 text-center">
                    This link can only be used once.
                </p>
            </div>
        </div>
    );
}
