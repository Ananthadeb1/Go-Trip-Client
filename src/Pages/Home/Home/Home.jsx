import { useContext } from "react";
import { AuthContext } from "../../../Provider/AuthProvider";



const Home = () => {
    const { user } = useContext(AuthContext);

    return (
        <div>
            <p>Welcome, {user ? user.displayName : "Guest"}!</p>
            <img
                src={user ? user.photoURL : ''}
                alt=""
                className="rounded-full"
            />
        </div>
    );
};

export default Home;