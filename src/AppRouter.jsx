import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import NotFound from "./Component/NotFound/NotFound";
import Protected from "./Component/Protected/Protected";
import Home from "./Pages/Home";
import Login from "./Component/Login/Login";
import Settings from "./Component/Pages/Settings";
import Expense from "./Pages/Expense/Expense";


export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: (
      <Protected>
          <Root />
      </Protected>
    ), errorElement: <NotFound/>,
    children: [
      { path: "/", element: <Home /> },
      { path: "/expense", element: <Expense /> },
      { path: "/settings", element: <Settings /> },

    ],
  },
]);
