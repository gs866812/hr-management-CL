import React, { useContext, useEffect, useState } from 'react';
import { ContextData } from '../../DataProvider';
import { useDispatch, useSelector } from 'react-redux';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { toast } from 'react-toastify';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { setRefetch } from '../../redux/refetchSlice';
import Swal from 'sweetalert2';

const Shifting = () => {
    const { employeeList, user, currentUser } = useContext(ContextData);

    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch)

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedShift, setSelectedShift] = useState('');
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [shiftedEmployees, setShiftedEmployees] = useState([]);
    const [OTHours, setOTHours] = useState(0);

    const axiosSecure = useAxiosSecure();
    // **********************************************************************
    const handleEmployeeCheckboxChange = (e, employee) => {
        const { checked } = e.target;
        if (checked) {
            setSelectedEmployees(prev => [...prev, employee]);
        } else {
            setSelectedEmployees(prev => prev.filter(emp => emp.email !== employee.email));
        }
    };
    // **********************************************************************
    const handleShiftingChange = (e) => {
        setSelectedShift(e.target.value);
        setOTHours(0); // Reset OT hours when changing shift
    };
    // **********************************************************************
    const axiosProtect = useAxiosProtect();

    useEffect(() => {
        const fetchShiftedEmployee = async () => {
            try {
                const response = await axiosProtect.get('/gethShiftedEmployee', {
                    params: {
                        userEmail: user?.email,
                    },
                });
                setShiftedEmployees(response.data);

            } catch (error) {
                toast.error('Error fetching data:', error.message);
            }
        };
        fetchShiftedEmployee();
    }, [refetch]);
    // **********************************************************************
    const handleReset = () => {
        setSelectedEmployees([]);
        setSelectedShift('');
    };
    // **********************************************************************
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEmployees.length || !selectedShift) {
            return toast.error('Please select at least one employee and a shift.');
        }

        try {
            const payload = {
                employees: selectedEmployees,
                shift: selectedShift,
                OTFor: Number(OTHours) || 0, // Default to 0 if not provided

            };

            const response = await axiosSecure.post('/assign-shift', payload);
            dispatch(setRefetch(!refetch))
            const {
                insertedNames = [],
                updatedNames = [],
                skippedNames = [],
            } = response.data;

            // Notify details
            if (insertedNames.length) {
                // toast.success(`Added: ${insertedNames.join(', ')}`);
                Swal.fire({
                    title: "Added",
                    text: `${insertedNames.join(', ')}`,
                    icon: "success"
                });
            }
            if (updatedNames.length) {
                // toast.info(`Updated: ${updatedNames.join(', ')}`);
                Swal.fire({
                    title: "Updated",
                    text: `${updatedNames.join(', ')}`,
                    icon: "info"
                });
            }
            if (skippedNames.length) {
                // toast.warning(`Skipped (already in shift): ${skippedNames.join(', ')}`);
                Swal.fire({
                    title: "Skipped",
                    text: `${skippedNames.join(', ')}`,
                    icon: "warning"
                });
            }

            handleReset();
            document.getElementById('addEmployeeToShift').close();
        } catch (err) {
            console.error(err);
            toast.error('Failed to assign shift.');
        }
    };


    // **********************************************************************
    const handleRemoveOT = async (id) => {
        if (!id) {
            return toast.error('Invalid ID for removal.');
        };
        try {
            const response = await axiosSecure.delete(`/removeOT/${id}`);
            if (response.data.message === 'success') {
                dispatch(setRefetch(!refetch));
                toast.success('Removed successfully');
            } else {
                toast.error('Failed to remove');
            }
        } catch (error) {
            toast.error('Error removing OT:', error.message);
        }
    };
    // **********************************************************************

    // **********************************************************************


    return (
        <div className="p-6">
            <section className=''>
                {/* name of each tab group should be unique */}
                <div className="tabs tabs-box overflow-hidden mb-4">
                    <input type="radio" name="my_tabs_6" className={`tab`} aria-label="Morning shift" defaultChecked />


                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        {
                            shiftedEmployees?.filter(emp => emp.shiftName === 'Morning').length > 0 &&
                            shiftedEmployees?.filter(emp => emp.shiftName === 'Morning').map((emp, index) => (
                                <div key={index} className="flex items-center mb-4">
                                    <img
                                        src={employeeList.find(e => e.email === emp.email)?.photo}
                                        alt={emp.fullName}
                                        className="w-8 h-8 object-cover rounded-md mr-"
                                    />
                                    <div>
                                        <h2 className="text-xl font-bold">
                                            {emp.fullName}
                                            <span className='text-sm text-gray-500 ml-1'>
                                                ({employeeList.find(e => e.email === emp.email)?.designation})
                                            </span>
                                        </h2>
                                    </div>

                                </div>
                            ))
                        }

                    </div>
                    {/* Evening shift */}
                    <input type="radio" name="my_tabs_6" className="tab" aria-label="Evening shift" />

                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        {
                            shiftedEmployees?.filter(emp => emp.shiftName === 'Evening').length > 0 &&
                            shiftedEmployees?.filter(emp => emp.shiftName === 'Evening').map((emp, index) => (
                                <div key={index} className="flex items-center mb-4">
                                    <img
                                        src={employeeList.find(e => e.email === emp.email)?.photo}
                                        alt={emp.fullName}
                                        className="w-8 h-8 object-cover rounded-md mr-"
                                    />
                                    <div>
                                        <h2 className="text-xl font-bold">
                                            {emp.fullName}
                                            <span className='text-sm text-gray-500 ml-1'>
                                                ({employeeList.find(e => e.email === emp.email)?.designation})
                                            </span>
                                        </h2>
                                    </div>

                                </div>
                            ))
                        }
                    </div>
                    {/* Night shift */}

                    <input
                        type="radio"
                        name="my_tabs_6"
                        className="tab"
                        aria-label="Night shift"
                    />
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        {
                            shiftedEmployees?.filter(emp => emp.shiftName === 'Night').length > 0 &&
                            shiftedEmployees?.filter(emp => emp.shiftName === 'Night').map((emp, index) => (
                                <div key={index} className="flex items-center mb-4">
                                    <img
                                        src={employeeList.find(e => e.email === emp.email)?.photo}
                                        alt={emp.fullName}
                                        className="w-8 h-8 object-cover rounded-md mr-"
                                    />
                                    <div>
                                        <h2 className="text-xl font-bold">
                                            {emp.fullName}
                                            <span className='text-sm text-gray-500 ml-1'>
                                                ({employeeList.find(e => e.email === emp.email)?.designation})
                                            </span>
                                        </h2>
                                    </div>

                                </div>
                            ))
                        }
                    </div>
                    {/* General shift */}
                    {currentUser?.role !== 'teamLeader' && (
                        <input type="radio" name="my_tabs_6" className="tab" aria-label="General shift" />
                    )}

                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        {
                            shiftedEmployees?.filter(emp => emp.shiftName === 'General').length > 0 &&
                            shiftedEmployees?.filter(emp => emp.shiftName === 'General').map((emp, index) => (
                                <div key={index} className="flex items-center mb-4">
                                    <img
                                        src={employeeList.find(e => e.email === emp.email)?.photo}
                                        alt={emp.fullName}
                                        className="w-8 h-8 object-cover rounded-md mr-"
                                    />
                                    <div>
                                        <h2 className="text-xl font-bold">
                                            {emp.fullName}
                                            <span className='text-sm text-gray-500 ml-1'>
                                                ({employeeList.find(e => e.email === emp.email)?.designation})
                                            </span>
                                        </h2>
                                    </div>

                                </div>
                            ))
                        }
                    </div>

                    <input type="radio" name="my_tabs_6" className="tab" aria-label="OT list" />
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        {
                            shiftedEmployees?.filter(emp => emp.shiftName === 'OT list').length > 0 &&
                            shiftedEmployees?.filter(emp => emp.shiftName === 'OT list').map((emp, index) => (
                                <div key={index} className="flex items-center gap-2 mb-4">
                                    <img
                                        src={employeeList.find(e => e.email === emp.actualEmail)?.photo}
                                        alt={emp.fullName}
                                        className="w-8 h-8 object-cover rounded-md mr-"
                                    />
                                    <div>
                                        <h2 className="text-xl font-bold">
                                            {emp.fullName}
                                            <span className='text-sm text-gray-500 ml-1'>
                                                ({employeeList.find(e => e.email === emp.actualEmail)?.designation})
                                            </span>
                                        </h2>
                                    </div>
                                    <button onClick={() => handleRemoveOT(emp._id)}
                                        className='cursor-pointer text-red-500 text-sm'>Remove</button>
                                </div>
                            ))
                        }

                    </div>

                    <button className='btn text-x'
                        onClick={() => document.getElementById('addEmployeeToShift').showModal()}>
                        +
                    </button>
                </div>
            </section>

            {/* Add employee shifting modal */}

            <dialog id="addEmployeeToShift" className="modal">
                <div className="modal-box max-w-md">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <form onSubmit={handleSubmit}>
                        <h2 className="text-2xl font-bold mb-4">Add Employees to Shift</h2>

                        {/* Custom multiselect with checkboxes */}
                        <div className="mb-4">
                            {/* <label className="block font-semibold mb-2">Select Employees</label> */}
                            <div className="rounded p-2 h-40 overflow-y-auto !border !border-gray-300">
                                {employeeList.map(emp => (
                                    <label key={emp.email} className="flex items-center justify-start space-x-2 mb-1 shadow p-1 rounded-md">
                                        <input
                                            type="checkbox"
                                            className="checkbox !border !border-gray-300"
                                            checked={selectedEmployees.some(e => e.email === emp.email)}
                                            onChange={(e) => handleEmployeeCheckboxChange(e, emp)}
                                        />
                                        <span>
                                            {emp.fullName} - {emp.designation}
                                        </span>
                                        <span className='text-sm'>
                                            (
                                            {shiftedEmployees.find(e => e.email === emp.email)?.shiftName.charAt(0).toUpperCase()}
                                            {shiftedEmployees.find(e => e.actualEmail === emp.email)?.shiftName.charAt(0).toUpperCase()}
                                            )
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Shift selection */}
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

                            {currentUser?.role !== 'teamLeader' && (
                                <option>General</option>
                            )}

                            <option>OT list</option>
                        </select>
                        {selectedShift === 'OT list' &&
                            <section>
                                <input
                                    onChange={(e) => setOTHours(e.target.value)} type="text" placeholder='Enter OT hours' className="w-full mb-4 p-2 !border !border-gray-300 rounded-md" required
                                />
                            </section>
                        }

                        <div className='flex justify-end gap-1'>
                            <button type="reset" className="btn bg-yellow-600 text-white"
                                onClick={() => handleReset()}>
                                Reset
                            </button>
                            <button type="submit" className="btn bg-[#6E3FF3] text-white">Add to Shift</button>
                        </div>
                    </form>
                </div>
                {/* <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form> */}
            </dialog>
        </div>
    );
};

export default Shifting;