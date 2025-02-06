import { Outlet } from "react-router-dom";
import './App.css';

import Navbar from "./Component/Navbar/Navbar";
import Header from "./Component/Header/Header";
import { ToastContainer } from "react-toastify";



const Root = () => {
    return (
        <div>
            <header>
                <Header/>
            </header>
            <div className="flex">
                <div className="w-[20%] px-5 h-[100vh] overflow-y-scroll sticky top-0 border-r">
                    <Navbar />
                </div>

                <div className="w-[80%] px-2">
                    <Outlet />
                </div>

                <ToastContainer position="bottom-right" autoClose={2000}/>
            </div>
        </div>
    );
};

export default Root;