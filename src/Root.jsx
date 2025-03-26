import { Outlet } from "react-router-dom";
import './App.css';

import Navbar from "./Component/Navbar/Navbar";
import Header from "./Component/Header/Header";
import { ToastContainer } from "react-toastify";


const Root = () => {
    return (
        <div className="h-screen flex flex-col">
            {/* Fixed Header */}
            <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
                <Header />
            </header>

            {/* Main Content */}
            <div className="flex flex-grow">
                {/* Scrollable Sidebar */}
                <div className="w-[20%] h-[calc(100vh-64px)] overflow-y-auto px-4 custom-scrollbar shadow-right shadow-xl"> 
                    <Navbar />
                </div>

                {/* Main Content Area */}
                <div className="w-[80%] h-[calc(100vh-64px)] overflow-y-auto px-2">
                    <Outlet />
                </div>
            </div>

            <ToastContainer position="bottom-right" autoClose={2000}/>
        </div>
    );
};

export default Root;
