import React, { useContext, useEffect } from 'react';
import { ContextData } from '../DataProvider';
import AdminDashboard from '../Component/Admin/AdminDashboard';
import ClientDashboard from '../Component/ClientDashboard/ClientDashboard';
import HrDashboard from '../Component/HrAdmin/HrDashboard';
import EmployeeDashboard from '../Component/EmployeeDashboard/EmployeeDashboard';
import { useNavigate } from 'react-router-dom';


const roleComponentMap = {
    Admin: AdminDashboard,
    Developer: AdminDashboard,
    'HR-ADMIN': HrDashboard,
    client: ClientDashboard,
};

const Home = () => {
    const { user, currentUser } = useContext(ContextData);
    const navigate = useNavigate();

    useEffect(() => {
        const originalPath = localStorage.getItem('originalPath');
        if (user && currentUser?.role && originalPath && originalPath !== '/') {
            localStorage.removeItem('originalPath'); // ✅ Clear it once used
            navigate(originalPath, { replace: true });
        }
    }, [user, currentUser, navigate]);


    if (!user || !currentUser?.role) {
        return <div className="skeleton h-32 w-32"></div>
    }




    const ComponentToRender = roleComponentMap[currentUser.role] || EmployeeDashboard;

    return <ComponentToRender />;
};

export default Home;
