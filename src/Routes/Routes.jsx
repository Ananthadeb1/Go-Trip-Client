import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

// Keep Main and PrivateRoute static because they control basic layout and security
import Main from "../Layout/Main";
import PrivateRoute from "../Pages/Shared/PrivateRoute/PrivateRoute";

// Convert your pages into lazy loaded components
const Home = lazy(() => import("../Pages/Home/Home/Home"));
const Login = lazy(() => import("../Pages/Login/Login"));
const Signup = lazy(() => import("../Pages/Signup/Signup"));
const Booking = lazy(() => import("../Pages/Booking/Booking"));
const Dashboard = lazy(() => import("../Pages/Dashboard/Dashboard"));
const HotelDetails = lazy(() => import("../Pages/Booking/HotelDetails/HotelDetails"));
const UserProfile = lazy(() => import("../Pages/UserProfile/UserProfile"));
const Itinerary = lazy(() => import("../Pages/UserProfile/Itinerary/Itinerary"));
const BookingStatusTab = lazy(() => import("../Pages/UserProfile/BookingStatusTab/BookingStatusTab"));
const HistoryTab = lazy(() => import("../Pages/UserProfile/HistoryTab/HistoryTab"));
const ExpenseTrackingTab = lazy(() => import("../Pages/UserProfile/ExpenseTrackingTab/ExpenseTrackingTab"));

// A quick loading wrapper helper to keep your code clean
const withSuspense = (Component) => (
    <Suspense fallback={<div className="loading-spinner">Loading page...</div>}>
        {Component}
    </Suspense>
);

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Main></Main>,
        children: [
            {
                path: "/",
                element: withSuspense(<Home />),
            },
            {
                path: "/login",
                element: withSuspense(<Login />),
            },
            {
                path: "/signup",
                element: withSuspense(<Signup />)
            },
            {
                path: "/dashboard",
                element: <PrivateRoute>{withSuspense(<Dashboard />)}</PrivateRoute>
            },
            {
                path: "/booking",
                element: <PrivateRoute>{withSuspense(<Booking />)}</PrivateRoute>,
            },
            {
                path: "/hotelDetails/:id",
                element: <PrivateRoute>{withSuspense(<HotelDetails />)}</PrivateRoute>
            },
            {
                path: "/userProfile",
                element: <PrivateRoute>{withSuspense(<UserProfile />)}</PrivateRoute>
            },
            {
                path: "/itinerary",
                element: <PrivateRoute>{withSuspense(<Itinerary />)}</PrivateRoute>
            },
            {
                path: "/Booking_Status",
                element: <PrivateRoute>{withSuspense(<BookingStatusTab />)}</PrivateRoute>
            },
            {
                path: "/History",
                element: <PrivateRoute>{withSuspense(<HistoryTab />)}</PrivateRoute>
            },
            {
                path: "/Expense_Tracking",
                element: <PrivateRoute>{withSuspense(<ExpenseTrackingTab />)}</PrivateRoute>
            }
        ]
    },
]);