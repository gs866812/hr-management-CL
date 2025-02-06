import React, { useContext } from 'react';
import { ContextData } from '../DataProvider';
import AdminDashboard from '../Component/Admin/AdminDashboard';


const Home = () => {

    const { user } = useContext(ContextData);


    return (
        <>
            {
                user?.uid === 'wkDNrcHvtsdSYmRAxtkZAYWOx373' ?
                    <AdminDashboard /> : 
                    <div className="flex justify-center items-center lg:p-20 mt-5 lg:mt-0">
                        <span className="loading loading-ring loading-lg flex justify-center items-center"></span>
                    </div>
            }
        </>
    );
};

export default Home;