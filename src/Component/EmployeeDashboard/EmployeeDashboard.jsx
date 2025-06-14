import React, { useContext, useEffect, useState } from 'react';
import { Calendar, Clock, FileText, PieChart, DollarSign, Briefcase, Award, Bell, User, Settings, ChevronRight, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { useDispatch, useSelector } from 'react-redux';
import { setRefetch } from '../../redux/refetchSlice';
import { ContextData } from '../../DataProvider';
import moment from 'moment';
import { toast } from 'react-toastify';

// Mock data
const attendanceData = [
    { month: 'Jan', present: 21, absent: 1, leave: 1 },
    { month: 'Feb', present: 19, absent: 0, leave: 0 },
    { month: 'Mar', present: 22, absent: 0, leave: 1 },
    { month: 'Apr', present: 20, absent: 1, leave: 0 },
    { month: 'May', present: 18, absent: 0, leave: 3 },
    { month: 'Jun', present: 20, absent: 1, leave: 0 },
];

const leaveData = [
    { name: 'Casual Leave', used: 5, total: 12 },
    { name: 'Sick Leave', used: 2, total: 7 },
    { name: 'Paid Leave', used: 0, total: 15 },
    { name: 'Optional Holidays', used: 2, total: 3 },
];

const payrollData = [
    { month: 'Jan', basic: 50000, hra: 20000, allowances: 15000, deductions: 8000, pf: 6000 },
    { month: 'Feb', basic: 50000, hra: 20000, allowances: 15000, deductions: 8000, pf: 6000 },
    { month: 'Mar', basic: 50000, hra: 20000, allowances: 15000, deductions: 8000, pf: 6000 },
    { month: 'Apr', basic: 55000, hra: 22000, allowances: 16500, deductions: 8800, pf: 6600 },
    { month: 'May', basic: 55000, hra: 22000, allowances: 16500, deductions: 8800, pf: 6600 },
    { month: 'Jun', basic: 55000, hra: 22000, allowances: 16500, deductions: 8800, pf: 6600 },
];

const notifications = [
    { id: 1, message: "Your leave request has been approved", time: "1 hour ago" },
    { id: 2, message: "Team meeting at 3:00 PM", time: "3 hours ago" },
    { id: 3, message: "Monthly performance review next week", time: "1 day ago" },
    { id: 4, message: "Complete your pending timesheet", time: "2 days ago" }
];

const EmployeeDashboard = () => {
    const axiosSecure = useAxiosProtect();
    const axiosProtect = useAxiosProtect();

    const { user } = useContext(ContextData);
    const [checkInInfo, setCheckInfo] = useState({});
    const [checkOutInfo, setCheckOutInfo] = useState('');
    const [startOTInfo, setStartOTInfo] = useState({});




    // **********************************************************
    const [activeTab, setActiveTab] = useState('dashboard');
    const [timeParts, setTimeParts] = useState({
        hours: '',
        minutes: '',
        seconds: '',
        period: '',
    });


    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);



    // ***********************************************************
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const formatted = now.toLocaleTimeString('en-US', {
                hour12: true,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            const [timePart, period] = formatted.split(' ');
            const [hours, minutes, seconds] = timePart.split(':');

            setTimeParts({ hours, minutes, seconds, period });
        }, 1000);

        return () => clearInterval(interval);
    }, []);


    // *******************************************************
    const handleCheckIn = async () => {

        const date = moment(new Date()).format("DD-MMM-YYYY");
        const month = moment(new Date()).format("MMMM");
        const checkInTime = Date.now();
        const displayTime = moment(checkInTime).format("hh:mm:ss A");
        const signInTime = moment(user?.metadata.lastSignInTime).format('DD MMM hh:mm:ss A');


        const checkInInfo = {
            date,
            month,
            checkInTime,
            displayTime,
            signInTime,
            email: user.email,
        };

        try {
            const res = await axiosSecure.post('/employee/checkIn', checkInInfo);
            dispatch(setRefetch(!refetch));
            if (res.data.message === 'Check-in successful') {
                toast.success(res.data.message);
            } else {
                toast.warning(res.data.message);
            }
        } catch (error) {
            toast.error('Check-in failed:', error);
        }
    };
    // *************************************************************************************************
    useEffect(() => {
        const fetchInTime = async () => {
            try {
                const date = moment(new Date()).format("DD-MMM-YYYY");
                const response = await axiosProtect.get(`/getCheckInInfo`, {
                    params: {
                        userEmail: user?.email,
                        date,
                    },
                });
                setCheckInfo(response.data);
            } catch (error) {
                console.error('Error fetching check-in time:', error);
            }
        };
        fetchInTime();
    }, [refetch, user.email]);



    // *************************************************************************************************
    const handleCheckOut = async () => {

        const date = moment(new Date()).format("DD-MMM-YYYY");
        const month = moment(new Date()).format("MMMM");
        const checkOutTime = Date.now();
        const displayTime = moment(checkOutTime).format("hh:mm:ss A");

        const checkOutInfo = {
            date,
            month,
            checkOutTime,
            displayTime,
            email: user.email,
        };

        try {
            const res = await axiosSecure.post('/employee/checkOut', checkOutInfo);
            dispatch(setRefetch(!refetch));
            if (res.data.message === 'Check-out successful') {
                toast.success(res.data.message);
                return;
            } else {
                toast.warning(res.data.message);
            }

        } catch (error) {
            toast.error('Check-out failed:', error);
        }
    };

    // *************************************************************************************************
    useEffect(() => {
        const fetchOutTime = async () => {
            try {
                const date = moment(new Date()).format("DD-MMM-YYYY");
                const response = await axiosProtect.get(`/getCheckOutInfo`, {
                    params: {
                        userEmail: user?.email,
                        date,
                    },
                });
                setCheckOutInfo(response.data);
            } catch (error) {
                console.error('Error fetching check-out time:', error);
            }
        };
        fetchOutTime();
    }, [refetch, user.email]);
    // *************************************************************************************************
    const inTime = checkInInfo?.checkInTime; //In time is 1748415033052
    const outTime = checkOutInfo?.checkOutTime; // Out time is 1748425859974
    const calculateTime = outTime - inTime;

    const totalSeconds = Math.floor(calculateTime / 1000);
    const hours = Math.floor(totalSeconds / 3600) || 0;
    const minutes = Math.floor((totalSeconds % 3600) / 60) || 0;
    // const seconds = totalSeconds % 60 || 0;

    const workHours = `${hours}h ${minutes}m`;


    // *************************************************************************************************
    useEffect(() => {
        const fetchStartOT = async () => {
            try {
                const date = moment(new Date()).format("DD-MMM-YYYY");
                const response = await axiosProtect.get(`/getStartOTInfo`, {
                    params: {
                        userEmail: user?.email,
                        date,
                    },
                });
                setStartOTInfo(response.data);
            } catch (error) {
                console.error('Error fetching OT time:', error);
            }
        };
        fetchStartOT();
    }, [refetch, user.email]);
    // *************************************************************************************************

    const handleStartOverTime = async () => {
        if (checkInInfo?.checkInTime && !checkOutInfo) {
            return toast.error('You are still on duty.');
        };
        const date = moment(new Date()).format("DD-MMM-YYYY");
        const month = moment(new Date()).format("MMMM");
        const startingOverTime = Date.now();
        const displayTime = moment(startingOverTime).format("hh:mm:ss A");
        const signInTime = moment(user?.metadata.lastSignInTime).format('DD MMM hh:mm:ss A');

        const overTimeInfo = {
            date,
            month,
            startingOverTime,
            displayTime,
            signInTime,
            email: user.email,
        };
        try {
            const res = await axiosSecure.post('/employee/startOverTime', overTimeInfo);
            dispatch(setRefetch(!refetch));
            if (res.data.message === 'Over time started') {
                toast.success(res.data.message);
            } else {
                toast.warning(res.data.message);
            }
        } catch (error) {
            toast.error('Overtime start failed:', error);
        }

    };
    // *************************************************************************************************
    const handleStopOverTime = async () => {

    };
    // *************************************************************************************************
    return (
        <div className="p-6">
            {/* Time Tracking */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Time Tracking</h2>
                    <div className="flex items-center gap-1">
                        <span className='bg-[#6E3FF3] text-white px-2 py-1 rounded-md'>{timeParts.hours}</span>
                        <span className='bg-[#6E3FF3] text-white px-2 py-1 rounded-md'>{timeParts.minutes}</span>
                        <span className='bg-[#6E3FF3] text-white px-2 py-1 rounded-md'>{timeParts.seconds}</span>
                        <span className='bg-[#6E3FF3] text-white px-2 py-1 rounded-md'>{timeParts.period}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="text-xs text-gray-500 mb-1">Check-in Time</div>
                        <div className="text-lg font-semibold">{checkInInfo?.displayTime || `-- : --`}</div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="text-xs text-gray-500 mb-1">Check-out Time</div>
                        <div className="text-lg font-semibold">{checkOutInfo?.displayTime || `-- : --`}</div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="text-xs text-gray-500 mb-1">Today's Work Hours</div>
                        <div className="text-lg font-semibold">{workHours}</div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="text-xs text-gray-500 mb-1">Over Time</div>
                        <div className="text-lg font-semibold">1h 00m</div>
                    </div>
                </div>

                <div className="flex mt-6 gap-4">
                    {
                        checkInInfo ?
                            checkOutInfo ?
                                null :
                                <button
                                    onClick={handleCheckOut}
                                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded btn">
                                    Check Out
                                </button>
                            :

                            startOTInfo ?
                                null
                                :
                                <button
                                    onClick={handleCheckIn}
                                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded btn">
                                    Check In
                                </button>


                    }

                    {
                        startOTInfo ?
                            <button
                                onClick={handleStopOverTime}
                                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded btn">
                                Stop OT
                            </button>
                            :
                            <button
                                onClick={handleStartOverTime}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded btn">
                                Start OT
                            </button>
                    }



                    {/* <button onClick={handleStopOverTime}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded btn">
                        Stop OT
                    </button>

                    <button onClick={handleStartOverTime}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded btn">
                        Start OT
                    </button> */}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Attendance Summary */}
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Attendance Summary</h3>
                        <button className="text-blue-600 text-sm flex items-center">
                            This Month <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-3xl font-bold text-green-600">21</div>
                            <div className="text-xs text-gray-500 mt-1">Present Days</div>
                        </div>

                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-3xl font-bold text-red-600">1</div>
                            <div className="text-xs text-gray-500 mt-1">Absent Days</div>
                        </div>

                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-3xl font-bold text-yellow-600">3</div>
                            <div className="text-xs text-gray-500 mt-1">Leaves Taken</div>
                        </div>

                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-3xl font-bold text-blue-600">3</div>
                            <div className="text-xs text-gray-500 mt-1">Late Check-ins</div>
                        </div>
                    </div>
                </div>

                {/* Leave Balance */}
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Leave Balance</h3>
                        <button className="text-blue-600 text-sm flex items-center">
                            View Details <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {leaveData.map((leave, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium">{leave.name}</div>
                                    <div className="text-xs text-gray-500">{leave.used} used of {leave.total}</div>
                                </div>
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${(leave.used / leave.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
                        Apply for Leave
                    </button>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Notifications</h3>
                        <button className="text-blue-600 text-sm flex items-center">
                            View All <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div key={notification.id} className="border-b border-gray-100 pb-2">
                                <div className="text-sm">{notification.message}</div>
                                <div className="text-xs text-gray-500 mt-1">{notification.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Attendance Chart */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="font-medium mb-4">Monthly Attendance</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="present" fill="#10B981" name="Present" />
                                <Bar dataKey="absent" fill="#EF4444" name="Absent" />
                                <Bar dataKey="leave" fill="#F59E0B" name="Leave" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Salary & PF */}
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Salary & PF Information</h3>
                        <button className="text-blue-600 text-sm flex items-center">
                            View Pay Slips <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">UAN Number</div>
                            <div className="font-medium">100XXXXXXX123</div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">PF Number</div>
                            <div className="font-medium">PF/ABC/12345</div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Monthly PF Contribution</div>
                            <div className="font-medium text-green-600">₹6,600</div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Total PF Balance</div>
                            <div className="font-medium text-green-600">₹2,45,500</div>
                        </div>
                    </div>

                    <div className="h-48 mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={payrollData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="pf" stroke="#3B82F6" name="PF Contribution" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Performance Metrics</h2>
                    <div>
                        <select className="bg-gray-50 border border-gray-200 text-gray-700 py-1 px-3 rounded-md text-sm">
                            <option>Last Quarter</option>
                            <option>This Year</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">Goal Completion</div>
                        <div className="text-lg font-semibold text-green-600">92%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">Project Deliveries</div>
                        <div className="text-lg font-semibold">11/12 On Time</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">Team Feedback</div>
                        <div className="text-lg font-semibold text-blue-600">4.8/5.0</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">Training Completed</div>
                        <div className="text-lg font-semibold">3 / 4 Courses</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 text-sm">
                    <button className="text-blue-600 font-medium">
                        View Complete Performance Report
                    </button>
                </div>
            </div>

            {/* Documents & Company Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="font-medium mb-4">Important Documents</h3>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <div className="flex items-center">
                                <FileText size={16} className="text-blue-600 mr-2" />
                                <span className="text-sm">Appointment Letter</span>
                            </div>
                            <button className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                Download
                            </button>
                        </div>

                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <div className="flex items-center">
                                <FileText size={16} className="text-blue-600 mr-2" />
                                <span className="text-sm">Form-16 (2023-24)</span>
                            </div>
                            <button className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                Download
                            </button>
                        </div>

                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <div className="flex items-center">
                                <FileText size={16} className="text-blue-600 mr-2" />
                                <span className="text-sm">ID Card</span>
                            </div>
                            <button className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                Download
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <FileText size={16} className="text-blue-600 mr-2" />
                                <span className="text-sm">Health Insurance Card</span>
                            </div>
                            <button className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                Download
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="font-medium mb-4">Company Information</h3>

                    <div className="space-y-4">
                        <div>
                            <div className="text-xs text-gray-500">Current Pay Cycle</div>
                            <div className="text-sm font-medium">1st - 30th May, 2025</div>
                        </div>

                        <div>
                            <div className="text-xs text-gray-500">Next Pay Date</div>
                            <div className="text-sm font-medium">1st June, 2025</div>
                        </div>

                        <div>
                            <div className="text-xs text-gray-500">HR Contact</div>
                            <div className="text-sm font-medium">hr@company.com | +1 (555) 123-4567</div>
                        </div>

                        <div>
                            <div className="text-xs text-gray-500">Upcoming Holidays</div>
                            <div className="text-sm font-medium">Memorial Day (May 26, 2025)</div>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 text-sm rounded-lg border border-blue-100 flex items-start">
                        <Info size={16} className="text-blue-600 mr-2 mt-0.5" />
                        <div>
                            <span className="font-medium">Remote Work Policy Update:</span>
                            <span className="text-gray-600"> Work from home allowed up to 3 days per week with manager approval.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;