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
import { SiRedhatopenshift } from "react-icons/si";
import ProfileModal from '../Modal/ProfileModal';

const Employee = () => {
    const { user, employee } = useContext(ContextData);
    const inputRef = useRef(null);

    const [image, setImage] = useState(null);
    const [hovered, setHovered] = useState(false);
    const [loading, setLoading] = useState(false);
    const [workingShift, setWorkingShift] = useState('');




    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    const axiosProtect = useAxiosProtect();
    const axiosSecure = useAxiosSecure();



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
            toast.error('Upload failed', err);
        } finally {
            setLoading(false); // Reset loading after attempt
        }
    };


    // ********************************************************************************
    useEffect(() => {
        const fetchWorkingShift = async () => {
            try {
                const response = await axiosProtect.get('/gethWorkingShift', {
                    params: {
                        userEmail: user?.email,
                    },
                });
                setWorkingShift(response.data);

            } catch (error) {
                toast.error('Error fetching data:', error.message);
            }
        };
        fetchWorkingShift();
    }, [refetch]);
    // ********************************************************************************


    return (
        <div>
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
                            <p className='text-sm flex items-center gap-2 tooltip' data-tip="Shift">
                                <SiRedhatopenshift className='text-[#6E3FF3]' /> {workingShift}
                            </p>
                            <p className='text-sm'>
                                Status: <span className='!border !border-green-500 rounded-md px-1 capitalize'>{
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
