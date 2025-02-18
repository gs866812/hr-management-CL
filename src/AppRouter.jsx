import { createBrowserRouter } from 'react-router-dom';
import Root from './Root';
import NotFound from './Component/NotFound/NotFound';
import Protected from './Component/Protected/Protected';
import Home from './Pages/Home';
import Login from './Component/Login/Login';
import RecentOrders from './Component/Admin/RecentOrders';
import OrdersDeadline from './Component/Admin/OrdersDeadline';
import Expense from './Pages/Expense';
import Settings from './Pages/Settings';
import CreateLocalOrder from './Component/Admin/CreateLocalOrder';
import MyExpense from './Pages/MyExpense';
import OrderManagement from './Pages/OrderManagement';
import ActiveOrders from './Component/orderManagement/sub-menu/ActiveOrders';
import CompletedOrders from './Component/orderManagement/sub-menu/CompletedOrders';
import CanceledOrders from './Component/orderManagement/sub-menu/CanceledOrders';
import PendingOrders from './Component/orderManagement/sub-menu/PendingOrders';
import Clients from './Component/Clients/Clients';

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
            { path: '/expense', element: <Expense /> },
            { path: '/my-expense', element: <MyExpense /> },
            { path: '/recentOrders', element: <RecentOrders /> },
            { path: '/createLocalOrder', element: <CreateLocalOrder /> },
            { path: '/ordersDeadline', element: <OrdersDeadline /> },
            { path: '/settings', element: <Settings /> },
            { path: '/clients', element: <Clients /> },
            // my component
            { path: '/order-management', element: <OrderManagement /> },
            {
                path: '/order-management/active-orders',
                element: <ActiveOrders />,
            },
            {
                path: '/order-management/completed-orders',
                element: <CompletedOrders />,
            },
            {
                path: '/order-management/canceled-orders',
                element: <CanceledOrders />,
            },
            {
                path: '/order-management/pending-orders',
                element: <PendingOrders />,
            },
        ],
    },
]);
