import React, { useContext, useState } from 'react';
import { AuthContext } from '../../Provider/AuthProvider';
import { Link, useNavigate } from 'react-router-dom';
import SocialLogin from '../Shared/ScoialLogin/SocialLogin';

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [errors, setErrors] = useState({ email: '', password: '', general: '' });

    const handleLogin = event => {
        event.preventDefault();
        const form = event.target;
        const email = form.email.value;
        const password = form.password.value;

        let hasError = false;
        const newErrors = { email: '', password: '', general: '' };

        if (!email) {
            newErrors.email = 'Email is required';
            hasError = true;
        }
        if (!password) {
            newErrors.password = 'Password is required';
            hasError = true;
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        login(email, password)
            .then(result => {
                const user = result.user;
                console.log(user);
                navigate("/");
            })
            .catch(error => {
                console.error("Login failed:", error);
                setErrors({ ...newErrors, general: 'Invalid email or password' });
            });
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-center mb-6">Login now!</h1>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input type="email" name="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Email" />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input type="password" name="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Password" />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>
                    <div className="mb-4 text-right">
                        <a className="text-blue-500 hover:underline">Forgot password?</a>
                    </div>
                    <div>
                        <input className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 cursor-pointer" type="submit" value="LogIn" />
                        {errors.general && <p className="text-red-500 text-sm mt-2 text-center">{errors.general}</p>}
                    </div>
                </form>
                <SocialLogin></SocialLogin>
                <div>
                    <p className="text-center text-sm text-gray-600 mt-6">
                        New Here? <Link to={"/signup"} className="text-blue-500 hover:underline">create an account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;