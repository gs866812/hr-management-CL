import React, { useContext } from 'react';
import { ContextData } from '../DataProvider';
import AdminDashboard from '../Component/Admin/AdminDashboard';
import ClientDashboard from '../Component/Client/ClientDashboard';


const Home = () => {

    const { user, userName } = useContext(ContextData);


    return (
        <>
            {
                user && userName === "g_sarwar" ?
                    <AdminDashboard /> : 
                    user && userName === "Client" ?
                    <ClientDashboard/>:
                    <div className="flex justify-center items-center lg:p-20 mt-5 lg:mt-0">
                        <span className="loading loading-ring loading-lg flex justify-center items-center"></span>
                    </div>
            }
        </>
    );
};

export default Home;