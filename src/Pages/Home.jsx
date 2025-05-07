import React, { useContext, useEffect } from 'react';
import { ContextData } from '../DataProvider';
import AdminDashboard from '../Component/Admin/AdminDashboard';
import ClientDashboard from '../Component/ClientDashboard/ClientDashboard';
import HrDashboard from '../Component/HrAdmin/HrDashboard';
import Employee from '../Component/EmployeeList/Employee';

const roleComponentMap = {
    Admin: AdminDashboard,
    Developer: AdminDashboard,
    'HR-ADMIN': HrDashboard,
    client: ClientDashboard,
};

const Home = () => {
    const { user, currentUser } = useContext(ContextData);

    if (!user || !currentUser?.role) {
        return <div className="skeleton h-32 w-32"></div>
    }

    const ComponentToRender = roleComponentMap[currentUser.role] || Employee;

    return <ComponentToRender />;
};

export default Home;
