import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { MdOutlineMail } from 'react-icons/md';
import { RiLockPasswordLine } from 'react-icons/ri';
import auth from '../../firebase.config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { setRefetch } from '../../redux/refetchSlice';
import Swal from 'sweetalert2';

const EmployeeSignUp = () => {
    const [employeeData, setEmployeeData] = useState({
        email: '',
        password: '',
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

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);
    // *******************************************************************
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmployeeData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // *******************************************************************
    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log(employeeData);
        setLoading(true);

        try {
            // 1. Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                employeeData.email,
                employeeData.password
            );

            const user = userCredential.user;

            // 2. Prepare data for MongoDB (excluding password)
            const { password, ...employeeDataWithoutPassword } = employeeData;

            const employeeRecord = {
                ...employeeDataWithoutPassword,
                firebaseUID: user.uid,
                status: 'active',
                createdAt: new Date().toISOString()
            };

            // 3. Save employee data to MongoDB
            const response = await axios.post('https://webbriks.backendsafe.com/registerEmployees', employeeRecord);

            if (response.data.insertedId) {
                console.log(response.data);
                Swal.fire({
                    title: 'Registration successfully',
                });
                dispatch(setRefetch(!refetch));
                toast.success('Registration successfully');
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    // *******************************************************************

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
            <h2 className="text-2xl font-bold text-center mb-6">Employee Registration</h2>

            <form onSubmit={handleSubmit} className="border p-5 rounded-md">



                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Email */}
                    <div className="">
                        <label className="input input-bordered flex items-center gap-2">
                            <MdOutlineMail />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={employeeData.email}
                                onChange={handleChange}
                                required
                                className="w-full"
                            />
                        </label>
                    </div>

                    {/* Password */}
                    <div className="">
                        <label className="input input-bordered flex items-center gap-2 relative">
                            <RiLockPasswordLine />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Password"
                                value={employeeData.password}
                                onChange={handleChange}
                                required
                                minLength="6"
                                className="w-full pr-5"
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 cursor-pointer"
                            >
                                {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
                            </span>
                        </label>
                    </div>

                    {/* Full Name */}
                    <div>
                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Full Name</span>
                            </div>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Full Name"
                                value={employeeData.fullName}
                                onChange={handleChange}
                                required
                                className="input input-bordered w-full !border !border-gray-300"
                            />
                        </label>
                    </div>

                    {/* Designation */}
                    <div>
                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Designation</span>
                            </div>
                            <input
                                type="text"
                                name="designation"
                                placeholder="Designation"
                                value={employeeData.designation}
                                onChange={handleChange}
                                required
                                className="input input-bordered w-full !border !border-gray-300"
                            />
                        </label>
                    </div>

                    {/* Father's Name */}
                    <div>
                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Father's Name</span>
                            </div>
                            <input
                                type="text"
                                name="fathersName"
                                placeholder="Father's Name"
                                value={employeeData.fathersName}
                                onChange={handleChange}
                                className="input input-bordered w-full !border !border-gray-300"
                            />
                        </label>
                    </div>

                    {/* Mother's Name */}
                    <div>
                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Mother's Name</span>
                            </div>
                            <input
                                type="text"
                                name="mothersName"
                                placeholder="Mother's Name"
                                value={employeeData.mothersName}
                                onChange={handleChange}
                                className="input input-bordered w-full !border !border-gray-300"
                            />
                        </label>
                    </div>

                    {/* Spouse Name */}
                    <div>
                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Spouse Name (if applicable)</span>
                            </div>
                            <input
                                type="text"
                                name="spouseName"
                                placeholder="Spouse Name"
                                value={employeeData.spouseName}
                                onChange={handleChange}
                                className="input input-bordered w-full !border !border-gray-300"
                            />
                        </label>
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Phone Number</span>
                            </div>
                            <input
                                type="tel"
                                name="phoneNumber"
                                placeholder="Phone Number"
                                value={employeeData.phoneNumber}
                                onChange={handleChange}
                                required
                                className="input input-bordered w-full !border !border-gray-300"
                            />
                        </label>
                    </div>

                    {/* NID */}
                    <div>
                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">National ID (NID)</span>
                            </div>
                            <input
                                type="text"
                                name="NID"
                                placeholder="National ID Number"
                                value={employeeData.NID}
                                onChange={handleChange}
                                required
                                className="input input-bordered w-full !border !border-gray-300"
                            />
                        </label>
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Date of Birth</span>
                            </div>
                            <input
                                type="date"
                                name="DOB"
                                value={employeeData.DOB}
                                onChange={handleChange}
                                required
                                className="input input-bordered w-full !border !border-gray-300"
                            />
                        </label>
                    </div>

                    {/* Blood Group */}
                    <div>
                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Blood Group</span>
                            </div>
                            <select
                                name="bloodGroup"
                                value={employeeData.bloodGroup}
                                onChange={handleChange}
                                className="select select-bordered w-full"
                            >
                                <option value="">Select Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </label>
                    </div>

                    {/* Emergency Contact */}
                    <div>
                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Emergency Contact Number</span>
                            </div>
                            <input
                                type="tel"
                                name="emergencyContact"
                                placeholder="Emergency Contact"
                                value={employeeData.emergencyContact}
                                onChange={handleChange}
                                required
                                className="input input-bordered w-full !border !border-gray-300"
                            />
                        </label>
                    </div>

                    {/* Emergency Contact Person */}
                    <div>
                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Emergency Contact Person</span>
                            </div>
                            <input
                                type="text"
                                name="emergencyContactPerson"
                                placeholder="Contact Person Name"
                                value={employeeData.emergencyContactPerson}
                                onChange={handleChange}
                                required
                                className="input input-bordered w-full !border !border-gray-300"
                            />
                        </label>
                    </div>

                    {/* Emergency Contact Relation */}
                    <div>
                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Relationship to Contact Person</span>
                            </div>
                            <input
                                type="text"
                                name="emergencyContactPersonRelation"
                                placeholder="Relationship (e.g., Father, Mother)"
                                value={employeeData.emergencyContactPersonRelation}
                                onChange={handleChange}
                                required
                                className="input input-bordered w-full !border !border-gray-300"
                            />
                        </label>
                    </div>

                    {/* Address */}
                    <div className="col-span-2">
                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Address</span>
                            </div>
                            <textarea
                                name="address"
                                placeholder="Full Address"
                                value={employeeData.address}
                                onChange={handleChange}
                                required
                                className="textarea textarea-bordered w-full !border !border-gray-300"
                                rows="3"
                            ></textarea>
                        </label>
                    </div>
                </div>

                <div className="flex justify-center mt-6">
                    <button
                        type="submit"
                        className="btn btn-primary w-full md:w-1/2"
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </div>
            </form>

            <div className="text-center mt-4">
                <p>Already have an account? <a href="/employee-login" className="text-primary">Login here</a></p>
            </div>
        </div>
    );
};

export default EmployeeSignUp;