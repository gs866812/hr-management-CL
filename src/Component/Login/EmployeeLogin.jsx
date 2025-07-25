import React, { useContext, useState } from 'react';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { MdOutlineMail } from 'react-icons/md';
import { RiLockPasswordLine } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import { ContextData } from '../../DataProvider';
import { signInWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import Swal from 'sweetalert2';
import auth from '../../firebase.config';

const EmployeeLogin = () => {
    const {user} = useContext(ContextData);
    // ****************************************************************
    const [showPassword, setShowPassword] = useState(false);
    const { setUser, setLoading } = useContext(ContextData);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // ****************************************************************


    const navigate = useNavigate();
    const handleEmployeeEmailLogin = async (e) => {
        e.preventDefault();
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
                'http://localhost:5000/jwt',
                emailData
            );
            if (res.data.token) {
                localStorage.setItem('jwtToken', res.data.token); // Store token in localStorage
                setUser(user); // Set the user context
                navigate('/'); // Redirect after login
            }
            navigate('/');
        } catch (error) {
            Swal.fire({
                title: 'Invalid credentials',
            });
        }
    };

    // ****************************************************************
    return (
        <div>
            {
                user ? navigate('/') :
                    <div className="max-w-screen-2xl mx-auto">
                        <div className="text-center border p-10 rounded-md w-96 mx-auto mt-20">
                            <h2>Login as employee</h2>

                            <form
                                className="flex flex-col gap-5 mt-5"
                                onSubmit={handleEmployeeEmailLogin}
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
                                />
                                <div className="text-sm flex justify-between">
                                    <Link to="/resetPassword">Forgot password</Link>
                                    {/* <Link to="/client-login">Login as Admin</Link> */}
                                    <Link to="/employee-sign-up">Register</Link>
                                </div>
                            </form>
                        </div>
                    </div>
            }
        </div>
    );
};

export default EmployeeLogin;