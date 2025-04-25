import { useContext } from "react";
import { AuthContext } from "../../Provider/AuthProvider";


const Booking = () => {
    const user = useContext(AuthContext);
    return (
        <div>
            <h1>Booking is a private route</h1>
            <p>Only logged in users can see this page</p>
            <p>Welcome, {user ? user.displayName : ""}! to the secret place</p>
        </div>
    );
};

export default Booking;