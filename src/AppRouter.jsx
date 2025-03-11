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

export const router = createBrowserRouter([
    { path: '/login', element: <Login /> },
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
            { path: '/expense', element: <MyExpense /> },
            { path: '/recentOrders', element: <RecentOrders /> },
            { path: '/recentOrders/:orderId', element: <ViewLocalOrder /> },
            { path: '/createLocalOrder', element: <CreateLocalOrder /> },
            { path: '/ordersDeadline', element: <OrdersDeadline /> },
            { path: '/settings', element: <Settings /> },
            { path: '/orders', element: <OrderManagement /> },
            { path: '/employee', element: <Employee /> },
            { path: '/clients', element: <Clients /> },
            { path: '/leave', element: <Leave /> },
            
        ],
    },
]);
