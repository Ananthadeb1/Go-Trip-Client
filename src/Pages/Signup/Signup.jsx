import { useContext } from "react";
import { updateProfile } from "firebase/auth";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Provider/AuthProvider";

const Signup = () => {
    const { register, handleSubmit, setError, formState: { errors }, } = useForm();
    const { createUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const onSubmit = (data) => {
        const name = data.name;
        const email = data.email;
        const password1 = data.password;
        const password2 = data.confirm_password;

        if (password1.length < 6) {
            setError("password", { type: "manual", message: "Password must be at least 6 characters long" });
            return;
        }
        else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/.test(password1)) {
            setError("password", { type: "manual", message: "Password must contain at least one letter, one number, and one special character" });
            return;
        }
        if (password1 !== password2) {
            setError("confirm_password", { type: "manual", message: "Passwords do not match!" });
            return;
        }

        createUser(email, password1)
            .then(result => {
                const loggedUser = result.user;
                console.log(loggedUser);
                updateProfile(loggedUser, { displayName: name })
                navigate("/");
            })
            .catch(error => {
                if (error.code === "auth/email-already-in-use") {
                    setError("email", { type: "manual", message: "Email is already in use. Please use a different email." });
                } else if (error.code === "auth/invalid-email") {
                    setError("email", { type: "manual", message: "Invalid email format. Please enter a valid email." });
                } else if (error.code === "auth/weak-password") {
                    setError("password", { type: "manual", message: "Password is too weak. Please use a stronger password." });
                } else {
                    setError("form", { type: "manual", message: "Failed to create user. Please try again." });
                }
            });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold mb-2">Sign up</h1>
                    <p className="text-gray-500">Create your account to get started</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            {...register("name", { required: true })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Full Name"
                        />
                        {errors.name && <span className="text-red-500 text-sm">This field is required</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            {...register("email")}
                            name="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Email"
                        />
                        {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            {...register("password")}
                            name="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Password"
                        />
                        {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            {...register("confirm_password")}
                            name="confirm_password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Confirm Password"
                        />
                        {errors.confirm_password && <span className="text-red-500 text-sm">{errors.confirm_password.message}</span>}
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                    >
                        Sign up
                    </button>
                    <p className="text-center text-sm text-gray-600 mt-4">
                        Already have an account? <Link to={"/login"} className="text-blue-500 hover:underline">Log in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signup;