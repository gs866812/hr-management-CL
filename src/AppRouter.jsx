import { createBrowserRouter } from 'react-router-dom';
import Root from './Root';
import NotFound from './Component/NotFound/NotFound';
import Protected from './Component/Protected/Protected';
import Home from './Pages/Home';
import Login from './Component/Login/Login';
import RecentOrders from './Component/Admin/RecentOrders';
import Settings from './Pages/Settings';
import CreateLocalOrder from './Component/Admin/CreateLocalOrder';
import MyExpense from './Pages/MyExpense';
import OrderManagement from './Pages/OrderManagement';
import ViewLocalOrder from './Component/Admin/ViewLocalOrder';
import NoticeBoard from './Component/NoticeBoard/NoticeBoard';
import Clients from './Component/ClientList/Clients';
import Leave from './Component/Leave/Leave';
import EmployeeSignUp from './Component/EmployeeList/EmployeeSignUp';
import Earnings from './Component/Earnings/Earnings';
import ProtectedRole from './Component/Protected/ProtectedRole';
import ResetPassword from './Component/Login/ResetPassword';
import EmployeeList from './Component/EmployeeList/EmployeeList';
import MorningShift from './Component/Shifting/MorningShift';
import Profile from './Component/Common/Profile';
import Analytics from './Component/Analytics/Analytics';
import EditEarnings from './Component/Earnings/EditEarnings';
import ProtectHr from './Component/Protected/ProtectHr';

export const router = createBrowserRouter([
    { path: '/login', element: <Login /> },
    { path: '/resetPassword', element: <ResetPassword /> },
    {
        path: '/',
        element: (
            <Protected>
                <Root />
            </Protected>
        ),
        errorElement: <NotFound />,
        children: [
            { path: '/', element: <Home /> },
            { path: '/notice-board', element: <NoticeBoard /> },
            { path: '/expense', element: <ProtectedRole><MyExpense /></ProtectedRole> },
            { path: '/employee-registration', element: <ProtectedRole><EmployeeSignUp /></ProtectedRole> },
            { path: '/earnings/editEarnings/:id', element: <EditEarnings /> },
            { path: '/analytics', element: <ProtectHr><Analytics /></ProtectHr> },
            { path: '/recentOrders', element: <RecentOrders /> },
            { path: '/profile', element: <Profile /> },
            { path: '/recentOrders/:orderId', element: <ViewLocalOrder /> },
            { path: '/createLocalOrder', element: <ProtectedRole><CreateLocalOrder /></ProtectedRole> },
            { path: '/settings', element: <Settings /> },
            { path: '/orders', element: <OrderManagement /> },
            { path: '/employeeList', element: <ProtectedRole><EmployeeList /></ProtectedRole> },
            { path: '/clients', element: <ProtectedRole><Clients /></ProtectedRole> },
            { path: '/leave', element: <Leave /> },
            { path: '/earnings', element: <ProtectedRole><Earnings /></ProtectedRole> },
            { path: '/employeeList/morning-shift', element: <MorningShift /> },



        ],
    },
]);
