import React, { useContext } from 'react';
import { ContextData } from '../../DataProvider';

const ProfileModal = () => {
    const { user, employee } = useContext(ContextData);

    return (
        <div>
            <dialog id="viewProfile" className="modal">
                <div className="modal-box ">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Profile Header */}
                        <div className="md:col-span-3 flex flex-col md:flex-row items-center gap-4 pb-2 mb-4">
                            <div className="avatar">
                                <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                    <img src={employee.photo} alt={employee.fullName} />
                                </div>
                            </div>
                            <div className="text-center md:text-left">
                                <h2 className="text-2xl font-bold">{employee.fullName}</h2>
                                <div className="badge badge-primary">{employee.designation}</div>
                                <div className="badge badge-outline ml-1">{employee.status}</div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="md:col-span-3 ">
                            <h3 className="text-lg font-bold mb-1 border-b pb-1">Personal Information</h3>
                        </div>
                        
                        <div className="card bg-base-200 shadow-sm">
                            <div className="card-body p-4">
                                <h4 className="card-title text-sm">Date of Birth</h4>
                                <p>{employee.DOB}</p>
                            </div>
                        </div>
                        
                        <div className="card bg-base-200 shadow-sm">
                            <div className="card-body p-4">
                                <h4 className="card-title text-sm">NID</h4>
                                <p>{employee.NID}</p>
                            </div>
                        </div>
                        
                        <div className="card bg-base-200 shadow-sm">
                            <div className="card-body p-4">
                                <h4 className="card-title text-sm">Blood Group</h4>
                                <p>{employee.bloodGroup}</p>
                            </div>
                        </div>

                        {/* Family Information */}
                        <div className="md:col-span-3 mt-4">
                            <h3 className="text-lg font-bold mb-2 border-b pb-1">Family Information</h3>
                        </div>
                        
                        <div className="card bg-base-200 shadow-sm">
                            <div className="card-body p-4">
                                <h4 className="card-title text-sm">Father's Name</h4>
                                <p>{employee.fathersName}</p>
                            </div>
                        </div>
                        
                        <div className="card bg-base-200 shadow-sm">
                            <div className="card-body p-4">
                                <h4 className="card-title text-sm">Mother's Name</h4>
                                <p>{employee.mothersName}</p>
                            </div>
                        </div>
                        
                        <div className="card bg-base-200 shadow-sm">
                            <div className="card-body p-4">
                                <h4 className="card-title text-sm">Spouse's Name</h4>
                                <p>{employee.spouseName || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="md:col-span-3 mt-4">
                            <h3 className="text-lg font-bold mb-2 border-b pb-1">Contact Information</h3>
                        </div>
                        
                        <div className="card bg-base-200 shadow-sm">
                            <div className="card-body p-4">
                                <h4 className="card-title text-sm">Phone Number</h4>
                                <p>{employee.phoneNumber}</p>
                            </div>
                        </div>
                        
                        <div className="card bg-base-200 shadow-sm md:col-span-2">
                            <div className="card-body p-4">
                                <h4 className="card-title text-sm">Emergency Contact</h4>
                                <div className="flex flex-col">
                                    <span><b>Number:</b> {employee.emergencyContact}</span>
                                    <span><b>Person:</b> {employee.emergencyContactPerson}</span>
                                    <span><b>Relation:</b> {employee.emergencyContactPersonRelation}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn btn-primary">Close</button>
                        </form>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    );
};

export default ProfileModal;