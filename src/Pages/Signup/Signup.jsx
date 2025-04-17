import { useContext } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { AuthContext } from "../../Provider/AuthProvider";

//"react hook form" theke sob dhoroner validation er kaj kora lagbe *** 66-6 ph

const Signup = () => {
    const { register, handleSubmit, formState: { errors }, } = useForm()
    const { createUser } = useContext(AuthContext)

    const onSubmit = (data) => {
        console.log(data)
        createUser(data.email, data.password)
            .then(result => {
                const loggedUser = result.user;
                console.log(loggedUser);
            })
    }
    return (
        <div>
            <div className="hero min-h-screen">
                <div className="hero-content flex-col lg:flex-row-reverse">
                    <div className="">
                        <h1 className="text-5xl font-bold">Sign up now!</h1>
                        <br />
                        <p>Allready have an account?<Link to={"/login"}>Log in</Link></p>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="card w-full max-w-sm shrink-0 shadow-2xl">
                        <div className="card-body">
                            <fieldset className="fieldset">
                                <label className="fieldset-label text-black">Name</label>
                                <input type="text" name="name" {...register("name", { required: true })} className="input text-white" placeholder="Full Name" />
                                {errors.name && <span className="text-red-500">This field is required</span>}
                                <label className="fieldset-label text-black">Email</label>
                                <input type="email" {...register("email")} name="email" className="input text-white" placeholder="Email" />
                                <label className="fieldset-label text-black">Password</label>
                                <input type="password" {...register("password")} name="password" className="input text-white" placeholder="Password" />
                                <div><a className="link link-hover">Forgot password?</a></div>
                                <input className="btn btn-primary mt-4" type="submit" value="Signup" />
                            </fieldset>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;