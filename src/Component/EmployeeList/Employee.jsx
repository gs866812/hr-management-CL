import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { ContextData } from '../../DataProvider';
import { toast } from 'react-toastify';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { setRefetch } from '../../redux/refetchSlice';
import { FaPhoneAlt, FaUserTie } from 'react-icons/fa';
import { MdBloodtype, MdDriveFileRenameOutline, MdEmail } from 'react-icons/md';
import { IoMdHelpBuoy } from 'react-icons/io';
import { HiMiniCalendarDateRange } from "react-icons/hi2";
import { CgNametag } from "react-icons/cg";
import ProfileModal from '../Modal/ProfileModal';

const Employee = () => {
    const { user, employee } = useContext(ContextData);
    const inputRef = useRef(null);
    const [inTime, setInTime] = useState(null);
    const [outTime, setOutTime] = useState(null);
    const [isInClicked, setIsInClicked] = useState(false);
    const [workingHours, setWorkingHours] = useState(null);

    const [image, setImage] = useState(null);
    const [hovered, setHovered] = useState(false);

    const [loading, setLoading] = useState(false);



    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    const axiosProtect = useAxiosProtect();
    const axiosSecure = useAxiosSecure();


    // ********************************************************************************
    const handleInTime = async () => {
        if (isInClicked) return;

        const now = new Date();
        setInTime(now);
        setIsInClicked(true);

        try {
            await axios.post('/api/employee/in-time', { time: now });
            toast.success('In-Time recorded');
        } catch (error) {
            toast.error('Failed to save In-Time');
        }
    };

    const handleOutTime = async () => {
        if (!inTime) {
            toast.error('In-Time not recorded yet');
            return;
        }

        const now = new Date();
        setOutTime(now);

        const workedMs = new Date(now) - new Date(inTime);
        const hours = (workedMs / (1000 * 60 * 60)).toFixed(2);
        setWorkingHours(hours);

        try {
            await axios.post('/api/employee/out-time', {
                inTime,
                outTime: now,
                workedHours: hours
            });
            toast.success('Out-Time recorded');
        } catch (error) {
            toast.error('Failed to save Out-Time');
        }

        // Reset to allow next session
        setTimeout(() => {
            setIsInClicked(false);
            setInTime(null);
            setOutTime(null);
            setWorkingHours(null);
        }, 2000);
    };
    // ********************************************************************************




    // ********************************************************************************
    const formData = new FormData();
    formData.append('image', image);
    formData.append('email', user.email);


    const handleUpload = async () => {
        if (!image) {
            toast.error("No image selected");
            return;
        }

        const validTypes = ['image/jpeg', 'image/png'];
        if (!validTypes.includes(image.type)) {
            toast.error("Only JPG and PNG files are allowed.");
            return;
        }

        if (image.size > 1024 * 1024) { // 1MB limit
            toast.error("File too large. Max 1MB allowed.");
            return;
        }
        setLoading(true);

        try {
            const res = await axiosSecure.post('/uploadProfilePic', formData);
            dispatch(setRefetch(!refetch));
            const modal = document.querySelector(`#changeProfilePic`);
            modal.close();
            toast.success('Profile picture changed successfully');
            setImage(null);                   // Clear state
            if (inputRef.current) {
                inputRef.current.value = '';  // Step 2: Reset input
            }

        } catch (err) {
            toast.error('Upload failed');
        } finally {
            setLoading(false); // Reset loading after attempt
        }
    };


    // ********************************************************************************


    return (
        <div>
            {/* <section>
                <h2 className="text-xl font-semibold mb-4">Employee Time Tracker</h2>
                <div className="flex gap-4">
                    <button
                        className="btn btn-primary"
                        onClick={handleInTime}
                        disabled={isInClicked}
                    >
                        In Time
                    </button>

                    <button
                        className="btn btn-secondary"
                        onClick={handleOutTime}
                        disabled={!isInClicked || outTime}
                    >
                        Out Time
                    </button>
                </div>

                <div className="mt-4 text-sm text-gray-700">
                    {inTime && <p>In Time: {new Date(inTime).toLocaleTimeString()}</p>}
                    {outTime && <p>Out Time: {new Date(outTime).toLocaleTimeString()}</p>}
                    {workingHours && <p>Worked: {workingHours} hours</p>}
                </div>
            </section> */}
            <div className='flex gap-4 overflow-hidden h-[calc(100vh-64px)]'>
                <div className='w-3/4 !border !border-gray-300 shadow rounded-md p-2 overflow-y-auto custom-scrollbar'>
                    <section>
                        <p>jsdfjsd sdjfhskd g ksdjhfkjsd skdjfhksdjhf jshfk</p>

                    </section>
                </div>
                {/* ***************************************** */}
                <div className=' !border !border-gray-300 w-1/4 shadow rounded-md py-2 px-4 h-[calc(100vh-64px)] sticky top-0'>
                    <section className='flex justify-center'>
                        <div
                            className="relative w-40 h-40 rounded-full !border !border-gray-300 overflow-hidden group"
                            onMouseEnter={() => setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                        >
                            <img
                                src={employee.photo || 'https://i.ibb.co/7gY0J3C/placeholder.png'}
                                alt={employee.fullName}
                                className="w-full h-full object-cover !border !border-gray-300 rounded-md shadow"
                            />

                            {hovered && (
                                <div className="absolute cursor-pointer bottom-0 w-full bg-[#6E3FF3] text-white text-center py-2 text-sm" onClick={() => document.getElementById('changeProfilePic').showModal()}>
                                    Change photo
                                </div>
                            )}
                        </div>
                    </section>
                    {/* ************************* */}
                    <section>
                        <div className='mt-4 space-y-[2px]'>
                            <h2 className='font-semibold flex items-center gap-2'>
                                <MdDriveFileRenameOutline className='text-[#6E3FF3] text-xl' />{employee.fullName}
                            </h2>
                            <p className='text-sm flex items-center gap-2 tooltip' data-tip="Designation">
                                <FaUserTie className='text-[#6E3FF3]' /> {employee.designation}
                            </p>
                            <p className='text-sm'>
                                <a href={`tel: ${employee.phoneNumber}`} className='tooltip flex items-center gap-2' data-tip={`Call to ${employee.fullName}`}>
                                    <FaPhoneAlt className='text-[#6E3FF3]' /> {employee.phoneNumber}
                                </a>
                            </p>
                            <p className={`text-sm`}>
                                <a href={`mailto:${employee.email}`}>
                                    <span className='underline tooltip flex gap-2 items-center'
                                        data-tip={`Send mail to ${employee.fullName}`}>
                                        <MdEmail className='text-[#6E3FF3]' />{employee.email}
                                    </span>
                                </a>
                            </p>
                            <p className='text-sm flex items-center gap-2'>
                                <MdBloodtype className='text-[#6E3FF3]' /> {employee.bloodGroup}
                            </p>
                            <p className='text-sm'>
                                <a href={`tel: ${employee.emergencyContact}`} className='tooltip flex items-center gap-2'
                                    data-tip={`Call to ${employee.emergencyContactPerson} (${employee.emergencyContactPersonRelation})`}>
                                    <IoMdHelpBuoy className='text-[#6E3FF3]' /> {employee.emergencyContact}
                                </a>
                            </p>
                            <p className='text-sm flex items-center gap-2 tooltip' data-tip="Joining date">
                                <HiMiniCalendarDateRange className='text-[#6E3FF3]' /> Filled-up by admin
                            </p>
                            <p className='text-sm'>
                                Status: <span className='!border !border-green-300 rounded-md px-1 capitalize'>{
                                    employee.status}
                                </span>
                            </p>
                            <p className='text-sm underline cursor-pointer hover:text-[#6E3FF3] transition-all duration-200 mt-2' onClick={() => document.getElementById('viewProfile').showModal()}>
                                View full profile
                            </p>

                        </div>
                    </section>
                </div>
            </div>

            {/* *********************Dialog***************************** */}
            <dialog id="changeProfilePic" className="modal">
                <div className="modal-box flex flex-col items-center">
                    <input type="file" ref={inputRef} className="file-input file-input-primary !border bg-gray-300"
                        onChange={(e) => setImage(e.target.files[0])} />
                    <label className="text-[12px]">Max size 1MB</label>
                    <button onClick={handleUpload} disabled={loading}
                        className={`mt-5 bg-[#6E3FF3] rounded-sm px-3 py-2 text-white cursor-pointer ${loading ? 'opacity-50 cursor-none' : ''}`}>
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
            {/* ******************************************************** */}
            <ProfileModal />
            {/* ******************************************************** */}
        </div>
    );
};

export default Employee;
