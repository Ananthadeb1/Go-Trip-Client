import React, { useContext } from 'react';
import { AuthContext } from '../../Provider/AuthProvider';
import { Link } from 'react-router-dom';

const Login = () => {
    const { login } = useContext(AuthContext)
    const handleLogin = event => {
        event.preventDefault();
        const form = event.target;
        const email = form.email.value;
        const password = form.password.value;
        console.log(email, password);
        login(email, password)
            .then(result => {
                const user = result.user;
                console.log(user);
            })
    }
    return (
        <div>
            <div className="hero min-h-screen">
                <div className="hero-content flex-col lg:flex-row-reverse">
                    <div className="">
                        <h1 className="text-5xl font-bold">Login now!</h1>
                        <br />
                        <p>New Here?<Link to={"/signup"}>create an account</Link></p>
                    </div>
                    <form onSubmit={handleLogin} className="card w-full max-w-sm shrink-0 shadow-2xl">
                        <div className="card-body">
                            <fieldset className="fieldset">
                                <label className="fieldset-label text-black">Email</label>
                                <input type="email" name="email" className="input text-white" placeholder="Email" />
                                <label className="fieldset-label text-black">Password</label>
                                <input type="password" name="password" className="input text-white" placeholder="Password" />
                                <div><a className="link link-hover">Forgot password?</a></div>
                                <input className="btn btn-primary mt-4" type="submit" value="LogIn" />
                            </fieldset>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;