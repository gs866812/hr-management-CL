import React, { useContext, useEffect, useState } from 'react';
import { ContextData } from '../../DataProvider';
import useAxiosProtect from '../../utils/useAxiosProtect';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setRefetch } from '../../redux/refetchSlice';

const AppliedLeave = () => {

    const { user, currentUser } = useContext(ContextData);
    const axiosProtect = useAxiosProtect();
    const axiosSecure = useAxiosSecure();

    // ********************************************************************************************
    const [appliedLeaveApplication, setAppliedLeaveApplication] = useState([]);
    // ********************************************************************************************
    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);
    // ********************************************************************************************
    useEffect(() => {
        const fetchAppliedLeaveApplication = async () => {
            try {
                const response = await axiosProtect.get('/getAppliedLeave', {
                    params: {
                        userEmail: user?.email,
                    },
                });

                setAppliedLeaveApplication(response.data);

            } catch (error) {
                toast.error('Error fetching data:', error.message);
            }
        };


        fetchAppliedLeaveApplication();

    }, [user.email, refetch]);
    // *******************************************************************
    const handleAccept = async (leaveId) => {
        console.log(leaveId);
        try {
            const response = await axiosSecure.put(`/acceptLeave/${leaveId}`);

            if (response.data.modifiedCount > 0) {
                dispatch(setRefetch(!refetch));
                console.log(response.data);
                toast.success('Leave application accepted successfully');
            } else {
                toast.error('Failed to accept leave application');
            }
        } catch (error) {
            toast.error('Error accepting leave application:', error.message);
        }
    }
    // *******************************************************************

    return (
        <div>
            <section className='flex gap-4 justify-end text-xl'>
                <div className='border p-3 rounded font-semibold'>
                    Total application: {appliedLeaveApplication?.length}
                </div>
                <div className='border p-3 rounded font-semibold'>
                    Approved application: {appliedLeaveApplication.filter(leave => leave.status === 'Approved').length}
                </div>
                <div className='border p-3 rounded font-semibold'>
                    Pending application: {appliedLeaveApplication.filter(leave => leave.status === 'Pending').length}
                </div>
            </section>

            <section className='mt-5'>
                <div className="overflow-x-auto mt-5">
                    <table className="table table-zebra">
                        {/* head */}
                        <thead className='bg-[#6E3FF3] text-white'>
                            <tr>
                                <th className='w-[5%]'>Employee ID</th>
                                <th className='w-[15%]'>Name</th>
                                <th>Position</th>
                                <th>Leave type</th>
                                <th>Start date</th>
                                <th>End date</th>
                                <th className='w-[5%]'>Total day's</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appliedLeaveApplication.length > 0 ? (
                                appliedLeaveApplication.map((leave, index) => {
                                    return (
                                        <tr
                                            key={index}
                                            className="relative group"
                                        >
                                            {/* Row content faded on hover */}
                                            <td className={`${leave.status === 'Pending' ? 'group-hover:opacity-30 transition-all duration-200':''} `}>
                                                {leave.employeeId}
                                            </td>
                                            <td className={`${leave.status === 'Pending' ? 'group-hover:opacity-30 transition-all duration-200':''} `}>
                                                {leave.employeeName}
                                            </td>
                                            <td className={`${leave.status === 'Pending' ? 'group-hover:opacity-30 transition-all duration-200':''} `}>
                                                {leave.position}
                                            </td>
                                            <td className={`${leave.status === 'Pending' ? 'group-hover:opacity-30 transition-all duration-200':''} `}>
                                                {leave.leaveType}
                                            </td>
                                            <td className={`${leave.status === 'Pending' ? 'group-hover:opacity-30 transition-all duration-200':''} `}>
                                                {leave.startDate}
                                            </td>
                                            <td className={`${leave.status === 'Pending' ? 'group-hover:opacity-30 transition-all duration-200':''} `}>
                                                {leave.endDate}
                                            </td>
                                            <td className={`${leave.status === 'Pending' ? 'group-hover:opacity-30 transition-all duration-200':''} `}>
                                                {leave.totalDays}
                                            </td>
                                            <td className={`${leave.status === 'Pending' ? 'group-hover:opacity-30 transition-all duration-200':''} `}>
                                                {leave.status}
                                            </td>

                                            {
                                                leave.status === 'Pending' &&
                                                <td className="absolute inset-0 flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white bg-opacity-30">
                                                    <button className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600" onClick={() => handleAccept(leave._id)}>
                                                        Accept
                                                    </button>

                                                    <button className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                                                        View
                                                    </button>
                                                    <button className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
                                                        Decline
                                                    </button>
                                                </td>
                                            }
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center">
                                        No leave applications found.
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>
            </section >
        </div >
    );
};

export default AppliedLeave;