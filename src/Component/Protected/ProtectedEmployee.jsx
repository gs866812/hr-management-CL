import React, { useContext } from 'react';
import { ContextData } from '../../DataProvider';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedEmployee = ({ children }) => {
    const { user, loading, currentUser } = useContext(ContextData);

    const location = useLocation();
    const allowedRoles = ["Developer", "Admin", "HR-ADMIN", 'teamLeader'];



    if (loading) {
        return <div className="flex justify-center items-center lg:p-20 mt-5 lg:mt-0">
            <span className="loading loading-ring loading-lg flex justify-center items-center"></span>
        </div>
    };


    if (user && allowedRoles.includes(currentUser?.role)) {
        return children;
    }

    return <Navigate state={{ from: location }} to='/' />;
};

export default ProtectedEmployee;