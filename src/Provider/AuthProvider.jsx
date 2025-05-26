import { createContext, useEffect, useState } from "react";
import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile,
} from "firebase/auth";
import { app } from "../firebase/firebase.config";
import useAxiosPublic from "../hooks/useAxiosPublic";
import useAxiosSecure from "../hooks/useAxiosSecure";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loggedUser, setloggedUser] = useState(null);
    const axiosPublic = useAxiosPublic();
    const axiosSecure = useAxiosSecure();

    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const login = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    };

    const loginWithGoogle = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    };

    const logout = () => {
        setLoading(true);
        return signOut(auth);
    };

    const updateUserProfile = (name, photo) => {
        return updateProfile(auth.currentUser, {
            displayName: name,
            photoURL: photo
        });
    }


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async currentUser => {
            setUser(currentUser);
            console.log("current user:", currentUser);
            if (currentUser) {
                // get token and store client
                try {
                    const res = await axiosPublic.post('/jwt', { email: currentUser.email });
                    if (res.data.token) {
                        localStorage.setItem('access-token', res.data.token);
                        const userRes = await axiosSecure.get(`/users/${currentUser.email}`);
                        if (userRes.data) {
                            setloggedUser(userRes.data);
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
            } else {
                localStorage.removeItem('access-token');
                setloggedUser(null);
            }
            setLoading(false);
        });
        return () => {
            unsubscribe();
        };
    }, [axiosPublic]);

    const authinfo = {
        user,
        loading,
        createUser,
        login,
        loginWithGoogle,
        logout,
        updateUserProfile,
        loggedUser,
    };

    return (
        <AuthContext.Provider value={authinfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;