import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { ContextData } from '../../DataProvider';

const ResetPassword = () => {
    const { user } = useContext(ContextData);
    const [email, setEmail] = useState('');
    const auth = getAuth();

    const navigate = useNavigate();
    // ******************************************************
    const handleReset = async () => {
        if (!email) {
            Swal.fire({
                title: "Enter your mail",
                showConfirmButton: false,
                icon: "error",
                timer: 2000
            });
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            Swal.fire({
                title: 'Password reset email sent to your email',
                showConfirmButton: false,
                icon: "success",
                timer: 4000
            });
            navigate('/');

        } catch (error) {
            Swal.fire({
                title: error.message || 'Something went wrong',
                showConfirmButton: false,
                icon: "error",
                timer: 2000
            });
        }
    };

    return (
        <div>
            {
                user ?
                    navigate('/') :
                    <div className="flex flex-col items-center gap-4 !border !border-gray-300 p-10 rounded-md w-96 mx-auto mt-20">
                        <h2 className="text-xl font-semibold">Reset Password</h2>
                        <input
                            type="email"
                            className="input input-bordered w-full max-w-xs !border !border-gray-300"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button
                            onClick={handleReset}
                            className="btn bg-[#6E3FF3] text-white w-full max-w-xs"
                        >
                            Reset Password
                        </button>
                    </div>
            }
        </div>
    );
};

export default ResetPassword;