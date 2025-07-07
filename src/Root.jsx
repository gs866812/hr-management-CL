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
            <div className="flex flex-grow overflow-hidden">
                {/* Scrollable Sidebar */}
                <div className="w-[20%] h-[calc(100vh-64px)] overflow-y-auto px-4 custom-scrollbar shadow-right shadow-xl my-2">
                    <Navbar />
                </div>

                {/* Scrollable Outlet Container */}
                <div className="w-[80%] h-[calc(100vh-64px)] px-2 my-2">
                    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                        <Outlet />
                    </div>
                </div>
            </div>

            <ToastContainer position="bottom-right" autoClose={2000} />
        </div>
    );
};

export default Root;
