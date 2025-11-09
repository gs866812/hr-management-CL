import React, { useContext, useEffect, useState } from 'react';
import { ContextData } from '../../DataProvider';
import useAxiosProtect from '../../utils/useAxiosProtect';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setRefetch } from '../../redux/refetchSlice';

// Icons
import { FiCheck, FiEye, FiX } from 'react-icons/fi';

const AppliedLeave = () => {
  const { user } = useContext(ContextData);
  const axiosProtect = useAxiosProtect();
  const axiosSecure = useAxiosSecure();

  const [appliedLeaveApplication, setAppliedLeaveApplication] = useState([]);
  const dispatch = useDispatch();
  const refetch = useSelector((state) => state.refetch.refetch);

  useEffect(() => {
    const fetchAppliedLeaveApplication = async () => {
      try {
        const response = await axiosProtect.get('/getAppliedLeave', {
          params: { userEmail: user?.email },
        });
        setAppliedLeaveApplication(response.data || []);
      } catch (error) {
        toast.error(`Error fetching data: ${error?.message || 'Unknown error'}`);
      }
    };
    if (user?.email) fetchAppliedLeaveApplication();
  }, [user?.email, refetch, axiosProtect]);

  const handleAccept = async (leaveId) => {
    try {
      const response = await axiosSecure.put(`/acceptLeave/${leaveId}`);
      if (response.data?.modifiedCount > 0) {
        dispatch(setRefetch(!refetch));
        toast.success('Leave application accepted successfully');
      } else {
        toast.error('Failed to accept leave application');
      }
    } catch (error) {
      toast.error(`Error accepting leave application: ${error?.message || 'Unknown error'}`);
    }
  };

  // Stub for View — you can replace with a modal later
  const handleView = (leave) => {
    toast.info(
      `Leave by ${leave.employeeName} (${leave.leaveType}) — ${leave.startDate} to ${leave.endDate} • ${leave.totalDays} day(s)`
    );
  };

  // Decline handler — ensure you add a backend route: PUT /declineLeave/:id to set { status: 'Declined' }
  const handleDecline = async (leaveId) => {
    try {
      const response = await axiosSecure.put(`/declineLeave/${leaveId}`);
      if (response.data?.modifiedCount > 0) {
        dispatch(setRefetch(!refetch));
        toast.success('Leave application declined');
      } else {
        toast.error('Failed to decline leave application');
      }
    } catch (error) {
      toast.error(`Error declining leave application: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <div>
      <section className="flex gap-4 justify-end text-xl">
        <div className="border p-3 rounded font-semibold">
          Total application: {appliedLeaveApplication?.length || 0}
        </div>
        <div className="border p-3 rounded font-semibold">
          Approved application: {appliedLeaveApplication.filter((l) => l.status === 'Approved').length}
        </div>
        <div className="border p-3 rounded font-semibold">
          Pending application: {appliedLeaveApplication.filter((l) => l.status === 'Pending').length}
        </div>
      </section>

      <section className="mt-5">
        <div className="overflow-x-auto mt-5">
          <table className="table table-zebra text-[14px]">
            <thead className="bg-[#6E3FF3] text-white">
              <tr>
                <th className="w-[5%]">Employee ID</th>
                <th className="">Name</th>
                <th className=''>Position</th>
                <th>Leave type</th>
                <th>Start date</th>
                <th>End date</th>
                <th className="w-[5%]">Day&apos;s</th>
                <th className="w-[10%]">Action</th> {/* ← New Action column */}
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {appliedLeaveApplication.length > 0 ? (
                appliedLeaveApplication.map((leave) => {
                  const disabled = leave.status !== 'Pending';
                  const commonBtn =
                    'p-2 rounded hover:scale-105 transition transform active:scale-95 focus:outline-none';
                  const disabledClass = disabled ? 'opacity-40 pointer-events-none' : '';

                  return (
                    <tr key={leave._id || `${leave.employeeId}-${leave.startDate}`}>
                      <td>{leave.employeeId}</td>
                      <td>{leave.employeeName}</td>
                      <td>{leave.position}</td>
                      <td>{leave.leaveType}</td>
                      <td>{leave.startDate}</td>
                      <td>{leave.endDate}</td>
                      <td>{leave.totalDays}</td>

                      {/* Action icons */}
                      <td>
                        <div className="flex items-center gap-3">
                          <button
                            title="Accept"
                            className={`${commonBtn} bg-green-100 ${disabledClass} cursor-pointer`}
                            onClick={() => handleAccept(leave._id)}
                          >
                            <FiCheck size={18} />
                          </button>

                          <button
                            title="View"
                            className={`${commonBtn} bg-blue-100 cursor-pointer`}
                            onClick={() => handleView(leave)}
                          >
                            <FiEye size={18} />
                          </button>

                          <button
                            title="Decline"
                            className={`${commonBtn} bg-red-100 ${disabledClass} cursor-pointer`}
                            onClick={() => handleDecline(leave._id)}
                          >
                            <FiX size={18} />
                          </button>
                        </div>
                      </td>

                      <td>{leave.status}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="text-center">
                    No leave applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AppliedLeave;
