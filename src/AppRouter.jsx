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
import Clients from './Component/ClientList/Clients';
import EmployeeSignUp from './Component/EmployeeList/EmployeeSignUp';
import Earnings from './Component/Earnings/Earnings';
import ProtectedRole from './Component/Protected/ProtectedRole';
import ResetPassword from './Component/Login/ResetPassword';
import EmployeeList from './Component/EmployeeList/EmployeeList';
import Profile from './Component/Common/Profile';
import Analytics from './Component/Analytics/Analytics';
import EditEarnings from './Component/Earnings/EditEarnings';
import ProtectHr from './Component/Protected/ProtectHr';
import ProfitShare from './Component/ProfitShare/ProfitShare';
import ProtectedEmployee from './Component/Protected/ProtectedEmployee';
import ShareholderDetails from './Component/ProfitShare/ShareholderDetails';
import Payroll from './Component/Payroll/Payroll';
import LeaveApplication from './Component/Leave/LeaveApplication';
import AppliedLeave from './Component/Leave/AppliedLeave';
import EmployeeDetails from './Component/Payroll/EmployeeDetails';
import Shifting from './Component/EmployeeList/Shifting';
import EmployeeProfile from './Component/EmployeeList/EmployeeProfile';
import NoticeBoardAdmin from './Component/NoticeBoard/NoticeBoardAdmin';
import NoticeBoard from './Component/NoticeBoard/NoticeBoard';
import DebitPage from './Pages/Debit';
import ClientDetails from './Component/ClientDetails/ClientDetails';

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
            { path: '/notice-board-admin', element: <NoticeBoardAdmin /> },
            { path: '/notice-board-employee', element: <NoticeBoard /> },
            {
                path: '/expense',
                element: (
                    <ProtectedRole>
                        <MyExpense />
                    </ProtectedRole>
                ),
            },
            {
                path: '/employee-registration',
                element: (
                    <ProtectedRole>
                        <EmployeeSignUp />
                    </ProtectedRole>
                ),
            },
            { path: '/earnings/editEarnings/:id', element: <EditEarnings /> },
            {
                path: '/analytics',
                element: (
                    <ProtectHr>
                        <Analytics />
                    </ProtectHr>
                ),
            },
            { path: '/recentOrders', element: <RecentOrders /> },
            { path: '/profile', element: <Profile /> },
            { path: '/recentOrders/:orderId', element: <ViewLocalOrder /> },
            {
                path: '/createLocalOrder',
                element: (
                    <ProtectedRole>
                        <CreateLocalOrder />
                    </ProtectedRole>
                ),
            },
            { path: '/settings', element: <Settings /> },
            { path: '/orders', element: <OrderManagement /> },
            {
                path: '/employeeList',
                element: (
                    <ProtectedRole>
                        <EmployeeList />
                    </ProtectedRole>
                ),
            },
            {
                path: '/clients',
                element: (
                    <ProtectedRole>
                        <Clients />
                    </ProtectedRole>
                ),
            },
            {
                path: '/clients/:id',
                element: (
                    <ProtectedRole>
                        <ClientDetails />
                    </ProtectedRole>
                ),
            },
            { path: '/leaveApplication', element: <LeaveApplication /> },
            {
                path: '/earnings',
                element: (
                    <ProtectedRole>
                        <Earnings />
                    </ProtectedRole>
                ),
            },
            {
                path: '/payroll',
                element: (
                    <ProtectedRole>
                        <Payroll />
                    </ProtectedRole>
                ),
            },
            {
                path: '/appliedLeave',
                element: (
                    <ProtectedRole>
                        <AppliedLeave />
                    </ProtectedRole>
                ),
            },
            {
                path: '/employeeDetails',
                element: (
                    <ProtectedRole>
                        <EmployeeDetails />
                    </ProtectedRole>
                ),
            },
            {
                path: '/shifting',
                element: (
                    <ProtectedEmployee>
                        <Shifting />
                    </ProtectedEmployee>
                ),
            },
            {
                path: '/employees/:id',
                element: (
                    <ProtectedRole>
                        <EmployeeProfile />
                    </ProtectedRole>
                ),
            },
            {
                path: '/profit-share',
                element: (
                    <ProtectHr>
                        <ProfitShare />
                    </ProtectHr>
                ),
            },
            {
                path: '/shareholder-details/:id',
                element: (
                    <ProtectHr>
                        <ShareholderDetails />
                    </ProtectHr>
                ),
            },

            // fuyad's pages
            {
                path: '/debit',
                element: (
                    <ProtectHr>
                        <DebitPage />
                    </ProtectHr>
                ),
            },
        ],
    },
]);
