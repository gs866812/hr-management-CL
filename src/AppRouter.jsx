import { createBrowserRouter } from 'react-router-dom';
import Root from './Root';
import NotFound from './Component/NotFound/NotFound';
import Protected from './Component/Protected/Protected';
import Home from './Pages/Home';
import Login from './Component/Login/Login';
import RecentOrders from './Component/Admin/RecentOrders';
import OrdersDeadline from './Component/Admin/OrdersDeadline';
import Settings from './Pages/Settings';
import CreateLocalOrder from './Component/Admin/CreateLocalOrder';
import MyExpense from './Pages/MyExpense';
import OrderManagement from './Pages/OrderManagement';
import ViewLocalOrder from './Component/Admin/ViewLocalOrder';
import NoticeBoard from './Component/NoticeBoard/NoticeBoard';
import Employee from './Component/EmployeeList/Employee';
import Clients from './Component/ClientList/Clients';
import Leave from './Component/Leave/Leave';
import EmployeeLogin from './Component/Login/EmployeeLogin';
import EmployeeSignUp from './Component/EmployeeList/EmployeeSignUp';
import Earnings from './Component/Earnings/Earnings';
import ProtectedRole from './Component/Protected/ProtectedRole';
import ResetPassword from './Component/Login/ResetPassword';
import EmployeeList from './Component/EmployeeList/EmployeeList';

export const router = createBrowserRouter([
    { path: '/login', element: <Login /> },
    { path: '/employee-login', element: <EmployeeLogin/> },
    { path: '/employee-sign-up', element: <EmployeeSignUp/> },
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
            { path: '/recentOrders', element: <RecentOrders /> },
            { path: '/recentOrders/:orderId', element: <ViewLocalOrder /> },
            { path: '/createLocalOrder', element: <ProtectedRole><CreateLocalOrder /></ProtectedRole> },
            { path: '/settings', element: <Settings /> },
            { path: '/orders', element: <OrderManagement /> },
            { path: '/employeeList', element: <ProtectedRole><EmployeeList/></ProtectedRole> },
            { path: '/clients', element: <ProtectedRole><Clients /></ProtectedRole> },
            { path: '/leave', element: <Leave /> },
            { path: '/earnings', element: <ProtectedRole><Earnings /></ProtectedRole> },
            
            
            
        ],
    },
]);
