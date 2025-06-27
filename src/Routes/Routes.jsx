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
import HotelDetails from "../Pages/Booking/HotelDetails/HotelDetails";
import UserProfile from "../Pages/UserProfile/UserProfile";
import GoogleMap from "../Map/GoogleMap/GoogleMap";


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
                element: <PrivateRoute>
                    <Dashboard></Dashboard>
                </PrivateRoute>
            },
            {
                path: "/booking",
                element: <PrivateRoute>
                    <Booking></Booking>
                </PrivateRoute>,
            },
            {
                path: "/hotelDetails/:id",
                element: <PrivateRoute>
                    <HotelDetails></HotelDetails>
                </PrivateRoute>
            },
            {
                path: "/userProfile",
                element: <PrivateRoute>
                    <UserProfile></UserProfile>
                </PrivateRoute>
            },
            // {
            //     path: "/googleMap",
            //     element: <GoogleMap latitude={23.800631731459443} longitude={90.41142662901615}></GoogleMap>
            // }

        ]
    },
]);