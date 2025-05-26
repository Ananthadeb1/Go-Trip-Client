import { Link } from "react-router-dom";
import useAdmin from "../../../hooks/useAdmin";
import useAuth from "../../../hooks/useAuth";

const NavBar = () => {
    const [isAdmin] = useAdmin();
    const { user, logout } = useAuth();
    const handleLogOut = () => {
        logout()
            .then(() => { })
            .catch(error => console.log(error));
    };
    return (
        <div className="navbar bg-gray-600 shadow-lg">
            <div className="navbar-start">
                <div className="dropdown">
                    <label tabIndex={0} className="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </label>
                    <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-gray-600 rounded-box w-52">
                        <li><Link to={"/"}>Home</Link></li>
                        <li><Link to={"/booking"}>Booking</Link></li>
                        {isAdmin && <li><Link to={"/dashboard"}>Dashboard</Link></li>}
                    </ul>
                </div>
                <Link to={"/"} className="btn btn-ghost normal-case text-xl">GoTrip</Link>
            </div>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    <li><Link to={"/"}>Home</Link></li>
                    <li><Link to={"/booking"}>Booking</Link></li>
                    {isAdmin && <li><Link to={"/dashboard"}>Dashboard</Link></li>}
                </ul>
            </div>
            <div className="navbar-end">
                {user ? (
                    <div className="flex items-center space-x-4">
                        <button onClick={handleLogOut} className="btn btn-primary">Log out</button>
                        {user.photoURL ? (
                            console.log("profile", user.photoURL),
                            <div className="avatar">
                                <div className="w-10 rounded-full">
                                    <img src={user.photoURL} alt="Profile" />
                                </div>
                            </div>
                        ) : (
                            <div className="avatar placeholder">
                                <div className="w-10 rounded-full bg-gray-500 flex items-center justify-center">
                                    <i className="fas fa-user text-white text-xl"></i>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link to={"/login"} className="btn btn-primary">Log in</Link>
                )}
            </div>
        </div>
    );
};

export default NavBar;