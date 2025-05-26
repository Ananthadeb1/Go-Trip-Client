import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import SocialLogin from "../Shared/ScoialLogin/SocialLogin";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAuth from "../../hooks/useAuth";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Signup = () => {
    const axiosPublic = useAxiosPublic();
    const { register, setError, formState: { errors }, } = useForm();
    const { createUser, updateUserProfile } = useAuth();
    const navigate = useNavigate();

    const handleSignup = (event) => {
        event.preventDefault();
        const form = event.target;
        const data = {
            name: form.name.value,
            email: form.email.value,
            password: form.password.value,
            confirm_password: form.confirm_password.value,
        };
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
                updateUserProfile(result.name, "") // Fix: Pass name and empty string for photo
                    .then(() => {
                        console.log("User profile updated successfully");
                        const userInfo = {
                            uid: result.user.uid,
                            name: name,
                            email: email
                        }
                        axiosPublic.post("/users", userInfo)
                            .then(res => {
                                if (res.data.insertedId) {
                                    console.log("User info saved to database:", res.data);
                                }
                                else console.log("User info not saved to database:", res.data);
                            });
                        navigate("/");
                    })
                    .catch(error => {
                        console.error("Error updating user profile:", error);
                    });
            }).catch(error => {
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

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 ">
            <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg my-15">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold mb-2">Sign up</h1>
                    <p className="text-gray-500">Create your account to get started</p>
                </div>
                <form onSubmit={handleSignup} className="space-y-6">
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
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                {...register("password")}
                                name="password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 pr-10"
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                                tabIndex={-1}
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                {showPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
                            </button>
                        </div>
                        {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                {...register("confirm_password")}
                                name="confirm_password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 pr-10"
                                placeholder="Confirm Password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                                tabIndex={-1}
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                            >
                                {showConfirmPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
                            </button>
                        </div>
                        {errors.confirm_password && <span className="text-red-500 text-sm">{errors.confirm_password.message}</span>}
                    </div>
                    <input className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 cursor-pointer" type="submit" value="Sign up" />
                    <SocialLogin></SocialLogin>
                    <p className="text-center text-sm text-gray-600 ">
                        Already have an account? <Link to={"/login"} className="text-blue-500 hover:underline">Log in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signup;