import { useContext, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ContextData } from "../../DataProvider";

const Protected = ({ children }) => {
    const { user, loading, authChecked } = useContext(ContextData);
    const location = useLocation();

    // Show loading indicator while auth state is being determined
    useEffect(() => {
        if (!user && !authChecked && location.pathname !== '/' && location.pathname !== '/login') {
            // Save the original path once if not already saved
            const storedPath = localStorage.getItem('originalPath');
            if (!storedPath) {
                localStorage.setItem('originalPath', location.pathname);
            }
        }
    }, [user, authChecked, location.pathname]);





    if (loading || !authChecked) {
        return (
            <div className="flex justify-center items-center lg:p-20 mt-5 lg:mt-0">
                <span className="loading loading-ring loading-lg flex justify-center items-center"></span>
            </div>
        );
    }


    if (!user && authChecked) {
        return <Navigate to="/login" replace />;
    }
    // If authenticated, render the protected content
    if (user) {
        return children;
    }

    // If not authenticated, redirect to login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
};

export default Protected;