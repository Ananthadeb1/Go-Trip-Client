import { Link, useLocation, useNavigate } from 'react-router-dom';
import SocialLogin from '../Shared/ScoialLogin/SocialLogin';
import useAuth from '../../hooks/useAuth';
import { useState, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import Swal from "sweetalert2";

const Login = () => {
    const { login, setUser, fetchUserData } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const emailRef = useRef(); // Used to capture email from the input if already typed
    const [errors, setErrors] = useState({ email: '', password: '', general: '' });
    const [showPassword, setShowPassword] = useState(false);

    const fromPath = location.state?.from?.pathname || location.state?.from || "/";
    const from = (fromPath === "/login" || fromPath === "/signup") ? "/" : fromPath;

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
            .then(async (result) => {
                const user = result.user;
                console.log(user);
                setUser(user);

                // Fetch token and database user details through AuthProvider
                await fetchUserData(user.email);

                navigate(from, { replace: true });
            })
            .catch(error => {
                console.error("Login failed:", error);
                setErrors({ ...newErrors, general: 'Invalid email or password' });
            });
    };

    const handleForgotPassword = () => {
        const currentEmail = emailRef.current?.value || '';

        Swal.fire({
            title: 'Reset Password',
            text: 'Please enter your account email address below:',
            input: 'email',
            inputValue: currentEmail,
            inputPlaceholder: 'Enter your email Address',
            showCancelButton: true,
            confirmButtonText: 'Send Reset Link',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            inputValidator: (value) => {
                if (!value) {
                    return 'You must enter a valid email address!';
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const auth = getAuth();
                sendPasswordResetEmail(auth, result.value)
                    .then(() => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Link Dispatched!',
                            text: `A secure password reset link has been sent to ${result.value}. Please check your inbox or spam folder.`,
                            confirmButtonColor: '#3b82f6'
                        });
                    })
                    .catch((error) => {
                        console.error("Password reset error:", error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Reset Failed',
                            text: error.message || 'Something went wrong. Please try again.',
                            confirmButtonColor: '#ef4444'
                        });
                    });
            }
        });
    };

    return (
        <div className="flex justify-center items-center min-h-screen ">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-center mb-6">Login now!</h1>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            ref={emailRef}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            placeholder="Email" 
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-12"
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm focus:outline-none"
                                onClick={() => setShowPassword((prev) => !prev)}
                                tabIndex={-1}
                            >
                                {showPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>
                    <div className="mb-4 text-right">
                        <button 
                            type="button" 
                            onClick={handleForgotPassword} 
                            className="text-blue-500 hover:underline text-sm font-medium focus:outline-none bg-transparent border-none cursor-pointer"
                        >
                            Forgot password?
                        </button>
                    </div>
                    <div>
                        <input className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 cursor-pointer text-center font-medium" type="submit" value="LogIn" />
                        {errors.general && <p className="text-red-500 text-sm mt-2 text-center">{errors.general}</p>}
                    </div>
                </form>
                <SocialLogin></SocialLogin>
                <div>
                    <p className="text-center text-sm text-gray-600 mt-6">
                        New Here? <Link to={"/signup"} state={{ from: location.state?.from || location }} className="text-blue-500 hover:underline">create an account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;