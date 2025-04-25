import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../Provider/AuthProvider";

const NavBar = () => {
    const { user, logout } = useContext(AuthContext)
    const handleLogOut = () => {
        logout()
            .then(() => { })
            .catch(error => console.log(error));
    }
    return (
        <div>
            {/* <button>home</button>
            <button>login</button> */}
            <div className="flex space-x-4 justify-center">
                <button><Link to={"/"}>home</Link></button>
                <button><Link to={"/booking"}>Booking</Link></button>
                {
                    user ? <>
                        <button onClick={handleLogOut} className="btn ">Log out</button>
                    </> : <button><Link to={"/login"}>Log in</Link></button>
                }
            </div>
        </div>
    );
};

export default NavBar;