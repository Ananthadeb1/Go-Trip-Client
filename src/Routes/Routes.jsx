import {
    createBrowserRouter,
} from "react-router-dom";
import Home from "../Pages/Home/Home/Home";
import Main from "../Layout/Main";
import Login from "../Pages/Login/Login";
import Signup from "../Pages/Signup/Signup";
import PrivateRoute from "../Pages/Shared/PrivateRoute/PrivateRoute";
import Booking from "../Pages/Booking/Booking";
import Dashboard from "../Pages/Dashboard/Dashboard";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <Main></Main>,
        children: [
            {
                path: "/",
                element: <Home></Home>,
            },
            {
                path: "/login",
                element: <Login></Login>,
            },
            {
                path: "/signup",
                element: <Signup></Signup>
            },
            {
                path: "/dashboard",
                element: <Dashboard></Dashboard>,
            },
            {
                path: "/booking",
                element: <PrivateRoute>
                    <Booking></Booking>
                </PrivateRoute>,
            }
        ]
    },
]);