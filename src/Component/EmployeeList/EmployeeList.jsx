import React, { useContext, useEffect, useState } from 'react';
import { ContextData } from '../../DataProvider';
import { toast } from 'react-toastify';
import useAxiosSecure from '../../utils/useAxiosSecure';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { useDispatch, useSelector } from 'react-redux';
import { setRefetch } from '../../redux/refetchSlice';


const EmployeeList = () => {
    const { employeeList, setSearchEmployee, user } = useContext(ContextData);

    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch)

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedShift, setSelectedShift] = useState('');
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [shiftedEmployees, setShiftedEmployees] = useState([]);

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
                toast.success(`Added: ${insertedNames.join(', ')}`);
            }
            if (updatedNames.length) {
                toast.info(`Updated: ${updatedNames.join(', ')}`);
            }
            if (skippedNames.length) {
                toast.warning(`Skipped (already in shift): ${skippedNames.join(', ')}`);
            }

            handleReset();
            document.getElementById('addEmployeeToShift').close();
        } catch (err) {
            console.error(err);
            toast.error('Failed to assign shift.');
        }
    };


    // **********************************************************************

    return (
        <div className="p-6">
            <section className=''>
                {/* name of each tab group should be unique */}
                <div className="tabs tabs-box overflow-hidden mb-4">
                    <input type="radio" name="my_tabs_6" className="tab" aria-label="Morning shift" defaultChecked />
                    <div className="tab-content bg-base-100 border-base-300 p-6 overflow-y-auto max-h-52">
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
                    <input type="radio" name="my_tabs_6" className="tab" aria-label="Night shift" />
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
                    <input type="radio" name="my_tabs_6" className="tab" aria-label="General shift" />
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

                    <button className='btn text-x'
                        onClick={() => document.getElementById('addEmployeeToShift').showModal()}>
                        +
                    </button>
                </div>
            </section>

            {/* Search employee */}
            <section>
                <div className="flex items-center mb-4">
                    <input
                        type="text"
                        placeholder="Search Employee"
                        className="bg-gray-200 rounded-lg p-2 w-full"
                        onChange={(e) => setSearchEmployee(e.target.value)}
                    />
                </div>
            </section>
            <section>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {employeeList?.map((emp, index) => (
                        <div
                            key={index}
                            className="bg-white shadow-lg rounded-2xl p-5 border border-gray-200 hover:shadow-xl transition duration-300 cursor-pointer"
                            onClick={() => setSelectedEmployee(emp)}
                        >
                            <img
                                src={emp.photo}
                                alt={emp.fullName}
                                className="w-24 h-24 object-cover rounded-full mx-auto mb-4"
                            />
                            <h2 className="text-xl font-bold text-gray-800 text-center">{emp.fullName}</h2>
                            <p className="text-sm text-gray-500 text-center mb-2">{emp.designation}</p>

                            <div className="text-sm text-gray-700 space-y-1 text-center">
                                <p><span className="font-semibold">Phone:</span> {emp.phoneNumber}</p>
                                <p><span className="font-semibold">Blood Group:</span> {emp.bloodGroup}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal for full view */}
                {selectedEmployee && (
                    <div className="fixed inset-0 bg-gray-500 flex items-center justify-center z-50">
                        <div className="bg-white w-[90%] md:w-[600px] p-6 rounded-2xl relative">
                            <button
                                className="absolute top-2 right-3 text-gray-600 hover:text-red-500 text-xl"
                                onClick={() => setSelectedEmployee(null)}
                            >
                                &times;
                            </button>
                            <img
                                src={selectedEmployee.photo}
                                alt={selectedEmployee.fullName}
                                className="w-28 h-28 object-cover rounded-full mx-auto mb-4"
                            />
                            <h2 className="text-2xl font-bold text-center mb-2">{selectedEmployee.fullName}</h2>
                            <p className="text-center text-gray-500 mb-4">{selectedEmployee.designation}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700 border-t pt-4 rounded-md">
                                <p><strong>Phone:</strong> {selectedEmployee.phoneNumber}</p>
                                <p><strong>Blood Group:</strong> {selectedEmployee.bloodGroup}</p>
                                <p><strong>Email:</strong> {selectedEmployee.email}</p>
                                <p><strong>DOB:</strong> {selectedEmployee.DOB}</p>
                                <p><strong>Father’s Name:</strong> {selectedEmployee.fathersName}</p>
                                <p><strong>Mother’s Name:</strong> {selectedEmployee.mothersName}</p>
                                <p><strong>Spouse:</strong> {selectedEmployee.spouseName}</p>
                                <p><strong>NID:</strong> {selectedEmployee.NID}</p>
                                <p><strong>Emergency Contact:</strong> {selectedEmployee.emergencyContact}</p>
                                <p><strong>Emergency Person:</strong> {selectedEmployee.emergencyContactPerson}</p>
                                <p><strong>Relation:</strong> {selectedEmployee.emergencyContactPersonRelation}</p>
                            </div>
                        </div>
                    </div>
                )}
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
                            <label className="block font-semibold mb-2">Select Employees</label>
                            <div className="rounded p-2 h-40 overflow-y-auto !border !border-gray-300">
                                {employeeList.map(emp => (
                                    <label key={emp.email} className="flex items-center space-x-2 mb-1 shadow p-1 rounded-md">
                                        <input
                                            type="checkbox"
                                            className="checkbox !border !border-gray-300"
                                            checked={selectedEmployees.some(e => e.email === emp.email)}
                                            onChange={(e) => handleEmployeeCheckboxChange(e, emp)}
                                        />
                                        <span>{emp.fullName} - {emp.designation}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Shift selection */}
                        <select
                            className="select select-bordered w-full mb-4 !border !border-gray-300"
                            value={selectedShift}
                            onChange={(e) => setSelectedShift(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select Shift</option>
                            <option>Morning</option>
                            <option>Evening</option>
                            <option>Night</option>
                            <option>General</option>
                        </select>

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

export default EmployeeList;
