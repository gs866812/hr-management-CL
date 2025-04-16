import React, { useState } from 'react';

const Employee = () => {
    const [employeeData, setEmployeeData] = useState({
        ID: '',
        email: '',
        fullName: '',
        fathersName: '',
        mothersName: '',
        spouseName: '',
        designation: '',
        joiningDate: '', //readonly field(add later by admin in DB)
        phoneNumber: '',
        salary: '', //readonly field(add later by admin in DB)
        NID: 0,
        DOB: '',
        providentFund: 0, //readonly field(add later by admin in DB)
        casualLeave: 0, //readonly field(add later by admin in DB)
        sickLeave: 0, //readonly field(add later by admin in DB)
        bloodGroup: '',
        emergencyContact: '',
        emergencyContactPerson: '',
        emergencyContactPersonRelation: '',
        address: '',
        overtime: 0,
    });

    

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
           <section>
            {/* Form goes here */}
                Wel-come
           </section>
        </div>
    );
};

export default Employee;
