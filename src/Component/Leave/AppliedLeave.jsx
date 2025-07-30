import React, { useContext, useEffect, useState } from 'react';
import { ContextData } from '../../DataProvider';
import useAxiosProtect from '../../utils/useAxiosProtect';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const AppliedLeave = () => {

    const { logOut, user, employee, currentUser } = useContext(ContextData);
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

    return (
        <div>
            <section className='flex gap-4 justify-end text-xl'>
                <div className='border py-1 px-2 rounded font-semibold'>
                    Total application: {appliedLeaveApplication?.length}
                </div>
                <div className='border py-1 px-2 rounded font-semibold'>
                    Approved application: {appliedLeaveApplication.filter(leave => leave.status === 'Approved').length}
                </div>
                <div className='border py-1 px-2 rounded font-semibold'>
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
                                <th className='w-[5%]'>Total leave day's</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                appliedLeaveApplication.length > 0 ? (
                                    appliedLeaveApplication.map((leave, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{leave.employeeId}</td>
                                                <td>{leave.employeeName}</td>
                                                <td>{leave.position}</td>
                                                <td>{leave.leaveType}</td>
                                                <td>{leave.startDate}</td>
                                                <td>{leave.endDate}</td>
                                                <td>{leave.totalDays}</td>
                                                <td>{leave.status}</td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center">No leave applications found.</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AppliedLeave;