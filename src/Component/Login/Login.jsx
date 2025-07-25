import React, { useContext, useState } from 'react';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { MdOutlineMail } from 'react-icons/md';
import { RiLockPasswordLine } from 'react-icons/ri';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import auth from '../../firebase.config';
import axios from 'axios';
import { ContextData } from '../../DataProvider';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const Login = () => {
    // ****************************************************************
    const { setUser, setLoading } = useContext(ContextData);
    const [showPassword, setShowPassword] = useState(false);
    // const [user, setUser] = useState([]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    // ****************************************************************

    const navigate = useNavigate();
    const location = useLocation();

    const originalPath = localStorage.getItem('originalPath');
    const from = location.state?.from || originalPath || "/";



    const handleAdminEmailLogin = async (e) => {
        e.preventDefault();
        setIsLoggingIn(true);
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;
            const emailData = { email: user.email };

            // Call backend to generate JWT
            const res = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/jwt`,
                emailData
            );
            if (res.data.token) {
                localStorage.setItem('jwtToken', res.data.token); // Store token in localStorage
                setUser(user); // Set the user context
                localStorage.removeItem('originalPath');

                setTimeout(() => {
                    navigate(from, { replace: true });
                    setIsLoggingIn(false);
                }, 100);
            } else {
                setIsLoggingIn(false);
                Swal.fire({
                    title: 'Authentication error',
                    text: 'Could not complete login',
                });
            }
        } catch (error) {
            console.error("🚫 Login error: ", error);
            setIsLoggingIn(false);
            Swal.fire({
                title: 'Invalid credentials',
            });
        }
    };
    // ****************************************************************
    return (
        <div className="max-w-screen-2xl mx-auto">
            <div className="text-center border p-10 rounded-md w-96 mx-auto mt-20">
                <h2 className='text-xl font-bold'>Login</h2>

                <form
                    className="flex flex-col gap-5 mt-5"
                    onSubmit={handleAdminEmailLogin}
                >
                    <label className="input input-bordered flex items-center gap-2">
                        <MdOutlineMail />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full"
                            disabled={isLoggingIn}
                        />
                    </label>

                    <label className="input input-bordered flex items-center gap-2 relative">
                        <RiLockPasswordLine />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pr-5"
                            disabled={isLoggingIn}
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

                    <input
                        type="submit"
                        value="Submit"
                        className="py-2 px-5 rounded-md w-full custom-button bg-[#6E3FF3] text-white cursor-pointer"
                        disabled={isLoggingIn}
                    />
                    <div className="text-sm flex justify-between">
                        <Link to="/resetPassword">Forgot password</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
