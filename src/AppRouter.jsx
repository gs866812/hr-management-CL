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
import CreateLocalOrder from './Component/Orders/CreateLocalOrder';
import MyExpense from './Pages/MyExpense';

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
        ],
    },
]);
