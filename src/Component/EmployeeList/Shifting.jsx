import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ContextData } from '../../DataProvider';
import { useDispatch, useSelector } from 'react-redux';
import useAxiosSecure from '../../utils/useAxiosSecure';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { toast } from 'react-toastify';
import { setRefetch } from '../../redux/refetchSlice';
import Swal from 'sweetalert2';

const Shifting = () => {
  const { employeeList, user, currentUser } = useContext(ContextData);

  const dispatch = useDispatch();
  const refetch = useSelector((state) => state.refetch.refetch);

  const [selectedShift, setSelectedShift] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [shiftedEmployees, setShiftedEmployees] = useState([]);
  const [OTHours, setOTHours] = useState(0);

  const axiosSecure = useAxiosSecure();
  const axiosProtect = useAxiosProtect();

  // ---------- Helpers ----------
  const isDeactivated = (emp) =>
    String(emp?.status || '').toLowerCase() === 'de-activate';

  const activeEmployees = useMemo(() => {
    const arr = Array.isArray(employeeList) ? employeeList : [];
    return arr.filter((e) => !isDeactivated(e));
  }, [employeeList]);

  const getEmpByEmail = (email) =>
    (Array.isArray(employeeList) ? employeeList : []).find((e) => e.email === email);

  // For a shift record, figure out the "real" employee email
  const getRealEmailFromShift = (rec) =>
    rec?.shiftName === 'OT list' ? rec?.actualEmail : rec?.email;

  // Only show shift records whose underlying employee is ACTIVE
  const visibleShifted = useMemo(() => {
    const arr = Array.isArray(shiftedEmployees) ? shiftedEmployees : [];
    return arr.filter((rec) => {
      const realEmail = getRealEmailFromShift(rec);
      const emp = getEmpByEmail(realEmail);
      return emp && !isDeactivated(emp);
    });
  }, [shiftedEmployees, employeeList]);

  // ---------- Effects ----------
  useEffect(() => {
    const fetchShiftedEmployee = async () => {
      try {
        const { data } = await axiosProtect.get('/gethShiftedEmployee', {
          params: { userEmail: user?.email },
        });
        setShiftedEmployees(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error('Error fetching shift data');
      }
    };
    fetchShiftedEmployee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch]);

  // ---------- Handlers ----------
  const handleEmployeeCheckboxChange = (e, employee) => {
    const { checked } = e.target;
    if (checked) {
      setSelectedEmployees((prev) => [...prev, employee]);
    } else {
      setSelectedEmployees((prev) => prev.filter((emp) => emp.email !== employee.email));
    }
  };

  const handleShiftingChange = (e) => {
    setSelectedShift(e.target.value);
    setOTHours(0);
  };

  const handleReset = () => {
    setSelectedEmployees([]);
    setSelectedShift('');
    setOTHours(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployees.length || !selectedShift) {
      return toast.error('Please select at least one employee and a shift.');
    }

    try {
      const payload = {
        employees: selectedEmployees, // these are already active-only
        shift: selectedShift,
        OTFor: Number(OTHours) || 0,
      };

      const response = await axiosSecure.post('/assign-shift', payload);
      dispatch(setRefetch(!refetch));

      const {
        insertedNames = [],
        updatedNames = [],
        skippedNames = [],
      } = response.data || {};

      if (insertedNames.length) {
        Swal.fire({ title: 'Added', text: insertedNames.join(', '), icon: 'success' });
      }
      if (updatedNames.length) {
        Swal.fire({ title: 'Updated', text: updatedNames.join(', '), icon: 'info' });
      }
      if (skippedNames.length) {
        Swal.fire({ title: 'Skipped', text: skippedNames.join(', '), icon: 'warning' });
      }

      handleReset();
      document.getElementById('addEmployeeToShift')?.close();
    } catch (err) {
      toast.error('Failed to assign shift.');
    }
  };

  const handleRemoveOT = async (id) => {
    if (!id) return toast.error('Invalid ID for removal.');
    try {
      const response = await axiosSecure.delete(`/removeOT/${id}`);
      if (response.data.message === 'success') {
        dispatch(setRefetch(!refetch));
        toast.success('Removed successfully');
      } else {
        toast.error('Failed to remove');
      }
    } catch (error) {
      toast.error('Error removing OT');
    }
  };

  // ---------- Render helpers ----------
  const renderShiftList = (shiftName) => {
    const rows = visibleShifted.filter((emp) => emp.shiftName === shiftName);
    if (!rows.length) return null;

    return rows.map((rec, idx) => {
      const realEmail = getRealEmailFromShift(rec);
      const emp = getEmpByEmail(realEmail);
      const photo = emp?.photo;
      const designation = emp?.designation;

      return (
        <div key={`${rec._id || idx}`} className="flex items-center gap-2 mb-4">
          <img
            src={photo}
            alt={rec.fullName}
            className="w-8 h-8 object-cover rounded-md border"
          />
          <div>
            <h2 className="text-xl font-bold">
              {rec.fullName}
              <span className="text-sm text-gray-500 ml-1">
                ({designation || '—'})
              </span>
            </h2>
          </div>
          {shiftName === 'OT list' && (
            <button
              onClick={() => handleRemoveOT(rec._id)}
              className="ml-auto cursor-pointer text-red-500 text-sm"
            >
              Remove
            </button>
          )}
        </div>
      );
    });
  };

  const currentShiftLetter = (email) => {
    const found =
      shiftedEmployees.find((e) => e.email === email) ||
      shiftedEmployees.find((e) => e.actualEmail === email);
    return found?.shiftName ? found.shiftName.charAt(0).toUpperCase() : '';
  };

  return (
    <div className="p-6">
      <section>
        {/* Tabs (Morning, Evening, Night, General, OT list) */}
        <div className="tabs tabs-box overflow-hidden mb-4">
          <input type="radio" name="my_tabs_6" className="tab" aria-label="Morning shift" defaultChecked />
          <div className="tab-content bg-base-100 border-base-300 p-6">
            {renderShiftList('Morning')}
          </div>

          <input type="radio" name="my_tabs_6" className="tab" aria-label="Evening shift" />
          <div className="tab-content bg-base-100 border-base-300 p-6">
            {renderShiftList('Evening')}
          </div>

          <input type="radio" name="my_tabs_6" className="tab" aria-label="Night shift" />
          <div className="tab-content bg-base-100 border-base-300 p-6">
            {renderShiftList('Night')}
          </div>

          {currentUser?.role !== 'teamLeader' && (
            <>
              <input type="radio" name="my_tabs_6" className="tab" aria-label="General shift" />
              <div className="tab-content bg-base-100 border-base-300 p-6">
                {renderShiftList('General')}
              </div>
            </>
          )}

          <input type="radio" name="my_tabs_6" className="tab" aria-label="OT list" />
          <div className="tab-content bg-base-100 border-base-300 p-6">
            {renderShiftList('OT list')}
          </div>

          <button
            className="btn text-x"
            onClick={() => document.getElementById('addEmployeeToShift').showModal()}
          >
            +
          </button>
        </div>
      </section>

      {/* Add employee shifting modal */}
      <dialog id="addEmployeeToShift" className="modal">
        <div className="modal-box max-w-md">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>

          <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold mb-4">Add Employees to Shift</h2>

            {/* Active employees ONLY */}
            <div className="mb-4">
              <div className="rounded p-2 h-40 overflow-y-auto !border !border-gray-300">
                {activeEmployees.map((emp) => (
                  <label
                    key={emp.email}
                    className="flex items-center justify-start space-x-2 mb-1 shadow p-1 rounded-md"
                  >
                    <input
                      type="checkbox"
                      className="checkbox !border !border-gray-300"
                      checked={selectedEmployees.some((e) => e.email === emp.email)}
                      onChange={(e) => handleEmployeeCheckboxChange(e, emp)}
                    />
                    <span>
                      {emp.fullName} - {emp.designation}
                    </span>
                    <span className="text-sm">
                      ({currentShiftLetter(emp.email)})
                    </span>
                  </label>
                ))}
                {activeEmployees.length === 0 && (
                  <div className="text-sm text-gray-500 p-2">No active employees.</div>
                )}
              </div>
            </div>

            <select
              className="select select-bordered w-full mb-4 !border !border-gray-300"
              value={selectedShift}
              onChange={handleShiftingChange}
              required
            >
              <option value="" disabled>Select Shift</option>
              <option>Morning</option>
              <option>Evening</option>
              <option>Night</option>
              {currentUser?.role !== 'teamLeader' && <option>General</option>}
              <option>OT list</option>
            </select>

            {selectedShift === 'OT list' && (
              <section>
                <input
                  onChange={(e) => setOTHours(e.target.value)}
                  type="text"
                  placeholder="Enter OT hours"
                  className="w-full mb-4 p-2 !border !border-gray-300 rounded-md"
                  required
                />
              </section>
            )}

            <div className="flex justify-end gap-1">
              <button
                type="reset"
                className="btn bg-yellow-600 text-white"
                onClick={handleReset}
              >
                Reset
              </button>
              <button type="submit" className="btn bg-[#6E3FF3] text-white">
                Add to Shift
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default Shifting;
