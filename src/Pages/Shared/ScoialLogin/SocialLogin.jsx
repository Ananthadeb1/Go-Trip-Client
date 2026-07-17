import React, { useContext } from 'react';
import { AuthContext } from '../../../Provider/AuthProvider';
import googleLogo from "./../../../../public/images/loginimg/google.png";
import { useLocation, useNavigate } from 'react-router-dom';
import useAxiosPublic from '../../../hooks/useAxiosPublic';

const SocialLogin = () => {
    const { loginWithGoogle, updateUserProfile, fetchUserData } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";
    const axiosPublic = useAxiosPublic();

    const handleGoogleLogin = () => {
        loginWithGoogle()
            .then(result => {
                const loggedUser = result.user;
                const userInfo = {
                    uid: loggedUser.uid,
                    name: loggedUser.displayName,
                    email: loggedUser.email,
                    image: loggedUser.photoURL
                };
                return axiosPublic.post("/users", userInfo)
                    .then(async () => {
                        // Fetch token and database user details through AuthProvider
                        await fetchUserData(loggedUser.email);
                        
                        const fromPath = location.state?.from?.pathname || location.state?.from || "/";
                        const targetPath = (location.pathname === "/signup" || fromPath === "/login" || fromPath === "/signup") ? "/" : fromPath;
                        navigate(targetPath, { replace: true });
                    });
            })
            .catch(error => {
                console.error("Google login failed:", error);
            });
    };
    return (
        <div className='pt-4'>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <hr style={{ flex: 1, border: 'none', borderTop: '2px solid #ccc' }} />
                <span style={{ margin: '0 10px', color: '#555', fontSize: '18px' }}>OR Log in with</span>
                <hr style={{ flex: 1, border: 'none', borderTop: '2px solid #ccc' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <button
                    onClick={handleGoogleLogin}
                    style={{ cursor: 'pointer' }}
                >
                    <img src={googleLogo} alt="Google logo" className='h-8' />
                </button>
            </div>
        </div>
    );
};

export default SocialLogin;