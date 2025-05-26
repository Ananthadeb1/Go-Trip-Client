import useAuth from "../../../hooks/useAuth";



const Home = () => {
    const { loggedUser } = useAuth();
    console.log("Logged User:", loggedUser);

    return (
        <div>
            <p>Welcome, {loggedUser ? loggedUser.name : "Guest"}!</p>
            <img
                src={loggedUser ? loggedUser?.photoURL : ''}
                alt=""
                className="rounded-full"
            />
        </div>
    );
};

export default Home;