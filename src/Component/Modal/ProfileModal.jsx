import React, { useContext, useEffect, useState } from 'react';
import { ContextData } from '../../DataProvider';
import { MdEdit } from 'react-icons/md';

const ProfileModal = () => {
    const { employee } = useContext(ContextData);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(null);

    const handleEditToggle = () => setIsEditing(true);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        if (employee) {
            setFormData({
                fullName: employee.fullName || '',
                designation: employee.designation || '',
                fathersName: employee.fathersName || '',
                mothersName: employee.mothersName || '',
                spouseName: employee.spouseName || '',
                phoneNumber: employee.phoneNumber || '',
                DOB: employee.DOB || '',
                NID: employee.NID || '',
                bloodGroup: employee.bloodGroup || '',
                emergencyContact: employee.emergencyContact || '',
                emergencyContactPerson: employee.emergencyContactPerson || '',
                emergencyContactPersonRelation: employee.emergencyContactPersonRelation || '',
                email: employee.email || '',
            });
        }
    }, [employee]);

    const handleSubmit = async () => {
        console.log(formData);
        // Submit logic here
        // await axiosSecure.patch(`/employees/${employee._id}`, formData);
        // toast.success('Profile updated successfully');
        // setRefetch(!refetch);
        setIsEditing(false);
    };

    if (!formData) return null;

    return (
        <div>
            <dialog id="viewProfile" className="modal">
                <div className="modal-box max-w-2xl">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4 items-center">
                            <img
                                src={employee.photo}
                                alt={formData.fullName}
                                className="h-20 w-20 rounded-full border object-cover"
                            />
                            <div>
                                <h3 className="text-xl font-bold">{formData.fullName}</h3>
                                <p className="text-sm text-gray-500">{formData.designation}</p>
                            </div>
                        </div>

                        {!isEditing && (
                            <button onClick={handleEditToggle} className="text-xl text-gray-500 hover:text-gray-700">
                                <MdEdit />
                            </button>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <label>
                            <span className="font-semibold">Name:</span>
                            <input
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="input input-bordered input-sm w-full mt-1"
                            />
                        </label>
                        <label>
                            <span className="font-semibold">Designation:</span>
                            <input
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="input input-bordered input-sm w-full mt-1"
                            />
                        </label>
                        <label>
                            <span className="font-semibold">Email:</span>
                            <input
                                name="email"
                                value={formData.email}
                                readOnly
                                className="input input-bordered input-sm w-full mt-1"
                            />
                        </label>
                        <label>
                            <span className="font-semibold">Phone Number:</span>
                            <input
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="input input-bordered input-sm w-full mt-1"
                            />
                        </label>
                        <label>
                            <span className="font-semibold">Father's Name:</span>
                            <input
                                name="fathersName"
                                value={formData.fathersName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="input input-bordered input-sm w-full mt-1"
                            />
                        </label>
                        <label>
                            <span className="font-semibold">Mother's Name:</span>
                            <input
                                name="mothersName"
                                value={formData.mothersName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="input input-bordered input-sm w-full mt-1"
                            />
                        </label>
                        <label>
                            <span className="font-semibold">Spouse Name:</span>
                            <input
                                name="spouseName"
                                value={formData.spouseName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="input input-bordered input-sm w-full mt-1"
                            />
                        </label>
                        <label>
                            <span className="font-semibold">DOB:</span>
                            <input
                                type="date"
                                name="DOB"
                                value={formData.DOB}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="input input-bordered input-sm w-full mt-1"
                            />
                        </label>
                        <label>
                            <span className="font-semibold">NID:</span>
                            <input
                                name="NID"
                                value={formData.NID}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="input input-bordered input-sm w-full mt-1"
                            />
                        </label>
                        <label>
                            <span className="font-semibold">Blood Group:</span>
                            <input
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="input input-bordered input-sm w-full mt-1"
                            />
                        </label>
                        <label>
                            <span className="font-semibold">Emergency Contact:</span>
                            <input
                                name="emergencyContact"
                                value={formData.emergencyContact}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="input input-bordered input-sm w-full mt-1"
                            />
                        </label>
                        <label>
                            <span className="font-semibold">Emergency Contact Person:</span>
                            <input
                                name="emergencyContactPerson"
                                value={formData.emergencyContactPerson}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="input input-bordered input-sm w-full mt-1"
                            />
                        </label>
                        <label>
                            <span className="font-semibold">Relation:</span>
                            <input
                                name="emergencyContactPersonRelation"
                                value={formData.emergencyContactPersonRelation}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="input input-bordered input-sm w-full mt-1"
                            />
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Close</button>
                        </form>
                        {isEditing && (
                            <button onClick={handleSubmit} className="btn btn-primary">
                                Save Changes
                            </button>
                        )}
                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default ProfileModal;
