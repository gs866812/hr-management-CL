import React, { useContext, useState } from 'react';
import { ContextData } from '../../DataProvider';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAxiosSecure from '../../utils/useAxiosSecure';


const EmployeeList = () => {
    const { employeeList, setSearchEmployee } = useContext(ContextData);

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedShift, setSelectedShift] = useState('');
    const [selectedEmployees, setSelectedEmployees] = useState([]);

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
            console.log(response.data);
            toast.success(response.data.message);
            // Reset form
            setSelectedEmployees([]);
            setSelectedShift('');
            document.getElementById('addEmployeeToShift').close();
        } catch (err) {
            console.error(err);
            toast.error('Failed to assign shift.');
        }
    };
    // **********************************************************************

    return (
        <div className="p-6">
            <section>
                {/* name of each tab group should be unique */}
                <div className="tabs tabs-box">
                    <input type="radio" name="my_tabs_6" className="tab" aria-label="Morning shift" defaultChecked />
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        Morning shift
                    </div>

                    <input type="radio" name="my_tabs_6" className="tab" aria-label="Evening shift" />
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        Evening shift
                    </div>

                    <input type="radio" name="my_tabs_6" className="tab" aria-label="Night shift" />
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        Night shift
                    </div>

                    <input type="radio" name="my_tabs_6" className="tab" aria-label="General shift" />
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        General shift
                    </div>

                    <button className='btn text-x'
                        onClick={() => document.getElementById('addEmployeeToShift').showModal()}>
                        +
                    </button>
                </div>
            </section>
            {/* shifting */}
            <section className='flex justify-between gap-2 mb-4'>
                {/* Morning shift */}
                <Link to='/employeeList/morning-shift' className='w-1/4 !border !border-gray-300 p-2 rounded-md shadow-md hover:bg-[#6E3FF3] hover:text-white cursor-pointer'>
                    <h2 className='text-center text-lg font-semibold'>Morning Shift</h2>
                </Link>
                {/* Evening shift */}
                <div
                    className='w-1/4 !border !border-gray-300 p-2 rounded-md shadow-md hover:bg-[#6E3FF3] hover:text-white cursor-pointer'>
                    <h2 className='text-center text-lg font-semibold'>Evening Shift</h2>
                </div>
                {/* Night shift */}
                <div
                    className='w-1/4 !border !border-gray-300 p-2 rounded-md shadow-md hover:bg-[#6E3FF3] hover:text-white cursor-pointer'>
                    <h2 className='text-center text-lg font-semibold'>Night Shift</h2>
                </div>
                {/* General shift */}
                <div
                    className='w-1/4 !border !border-gray-300 p-2 rounded-md shadow-md hover:bg-[#6E3FF3] hover:text-white cursor-pointer'>
                    <h2 className='text-center text-lg font-semibold'>General Shift</h2>
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
                    <form onSubmit={handleSubmit}>
                        <h2 className="text-2xl font-bold mb-4">Add Employees to Shift</h2>

                        {/* Custom multiselect with checkboxes */}
                        <div className="mb-4">
                            <label className="block font-semibold mb-2">Select Employees</label>
                            <div className="rounded p-2 h-40 overflow-y-auto">
                                {employeeList.map(emp => (
                                    <label key={emp.email} className="flex items-center space-x-2 mb-1">
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
                            className="select select-bordered w-full mb-4"
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

                        <button type="submit" className="btn bg-[#6E3FF3] w-full text-white">Add to Shift</button>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    );
};

export default EmployeeList;
