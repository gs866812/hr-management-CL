import { useContext } from "react";
import { ContextData } from "../../DataProvider";
import { Navigate, useLocation } from "react-router-dom";


const ProtectedRole = ({ children }) => {
    const { user, loading, currentUser } = useContext(ContextData);

    const location = useLocation();



    if (loading) {
        return <div className="flex justify-center items-center lg:p-20 mt-5 lg:mt-0">
            <span className="loading loading-ring loading-lg flex justify-center items-center"></span>
        </div>
    };


    const accessMails = [
        "gooogle.sarwar@gmail.com",
        "agraphicsaction@gmail.com",
        "wbllc.order@gmail.com",
        "asad4nur@gmail.com"
    ];

    if (user && accessMails.includes(user.email)) {
        return children;
    };

    // return <Navigate state={location.pathname} to='/login'></Navigate>
    return <Navigate state={{ from: location }} to='/' />;
};

export default ProtectedRole;