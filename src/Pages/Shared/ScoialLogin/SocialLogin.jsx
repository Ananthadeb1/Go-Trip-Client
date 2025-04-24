import React, { useContext } from 'react';
import { AuthContext } from '../../../Provider/AuthProvider';
import googleLogo from "./../../../../public/images/loginimg/google.png";

const SocialLogin = () => {
    const { loginWithGoogle } = useContext(AuthContext);
    const hendleGoogleLogin = () => {
        loginWithGoogle()
            .then(result => {
                const loggedUser = result.user;
                console.log(loggedUser);
                window.location.href = '/';
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
                    onClick={hendleGoogleLogin}
                    style={{ cursor: 'pointer' }}
                >
                    <img src={googleLogo} alt="Google logo" className='h-8' />
                </button>
            </div>
        </div>
    );
};

export default SocialLogin;