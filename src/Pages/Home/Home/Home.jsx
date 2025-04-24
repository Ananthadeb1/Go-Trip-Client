import { useContext } from "react";
import { AuthContext } from "../../../Provider/AuthProvider";



const Home = () => {
    const { user } = useContext(AuthContext);

    return (
        <div>
            <p>Welcome, {user ? user.displayName : "Guest"}!</p>
        </div>
    );
};

export default Home;