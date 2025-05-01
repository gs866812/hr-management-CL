import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { ContextData } from '../../DataProvider';
import { toast } from 'react-toastify';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { setRefetch } from '../../redux/refetchSlice';

const Employee = () => {
    const { user } = useContext(ContextData);

    const [inTime, setInTime] = useState(null);
    const [outTime, setOutTime] = useState(null);
    const [isInClicked, setIsInClicked] = useState(false);
    const [workingHours, setWorkingHours] = useState(null);
    const [employee, setEmployee] = useState({});
    const [image, setImage] = useState(null);

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
    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await axiosProtect.get(`/getEmployee`, {
                    params: {
                        userEmail: user?.email,
                    },
                });
                setEmployee(response.data);
                console.log(response.data);
            } catch (error) {
                toast.error('Error fetching data:', error.message);
            }
        };
        fetchEmployee();
    }, [refetch]);

    // ********************************************************************************
    const formData = new FormData();
    formData.append('image', image);
    formData.append('email', user.email);


    const handleUpload = async () => {
        if (!image) return;

        try {
            const res = await axiosSecure.post('/uploadProfilePic', formData);
            dispatch(setRefetch(!refetch));
            toast.success('Uploaded successfully');
        } catch (err) {
            toast.error('Upload failed');
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

            <section className='!border ! border-gray-300 rounded-md'>

                {/* <input type="file" onChange={(e) => setImage(e.target.files[0])} />
            <button onClick={handleUpload}>Upload</button> */}

                <div className='p-4 shadow'>
                    <section className='flex items-start gap-4'>
                        <img src={employee.photo} alt={employee.fullName} className='rounded-md' />
                        <div className='space-y-[2px]'>
                            <h2 className='font-semibold'>Name: {employee.fullName}</h2>
                            <p className='text-sm'>Designation: {employee.designation}</p>
                            <p className='text-sm'>Phone: <a href={`tel: ${employee.phoneNumber}`} title={`Call to ${employee.fullName}`}>{employee.phoneNumber}</a></p>
                            <p className='text-sm'>Email: <a href={`mailto:${employee.email}`}><span className='underline'>{employee.email}</span></a></p>
                            <p className='text-sm'>Blood group: {employee.bloodGroup}</p>
                            <p className='text-sm'>Joining date: { }</p>
                            <p className='text-sm'>Status: {employee.department}</p>
                        </div>
                    </section>
                </div>
            </section>
        </div>
    );
};

export default Employee;
