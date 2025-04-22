import { useContext } from "react";
import { AuthContext } from "../../../Provider/AuthProvider";



const Home = () => {
    const { user } = useContext(AuthContext);

    return (
        <div>
            {user ? <h1>Welcome, {user.email}!</h1> : <h1>This is Home</h1>}
        </div>
    );
};

export default Home;