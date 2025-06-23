/* eslint-disable react-hooks/exhaustive-deps */
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
    const [loggedUser, setLoggedUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const axiosPublic = useAxiosPublic();
    const axiosSecure = useAxiosSecure();

    const createUser = async (email, password) => {
        setAuthLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            return userCredential;
        } finally {
            setAuthLoading(false);
        }
    };

    const login = async (email, password) => {
        setAuthLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            await fetchUserData(userCredential.user.email);
            return userCredential;
        } finally {
            setAuthLoading(false);
        }
    };

    const loginWithGoogle = async () => {
        setAuthLoading(true);
        try {
            const userCredential = await signInWithPopup(auth, googleProvider);
            setUser(userCredential.user);
            await fetchUserData(userCredential.user.email);
            return userCredential;
        } finally {
            setAuthLoading(false);
        }
    };

    const logout = async () => {
        setAuthLoading(true);
        try {
            await signOut(auth);
            setUser(null);
            setLoggedUser(null);
            localStorage.removeItem('access-token');
        } finally {
            setAuthLoading(false);
        }
    };

    const updateUserProfile = async (name, photo) => {
        setProfileLoading(true);
        try {
            await updateProfile(auth.currentUser, {
                displayName: name,
                photoURL: photo
            });
            setUser({ ...auth.currentUser });
        } finally {
            setProfileLoading(false);
        }
    };

    const fetchUserData = async (email) => {
        setProfileLoading(true);
        try {
            const tokenResponse = await axiosPublic.post('/jwt', { email });
            if (tokenResponse.data.token) {
                localStorage.setItem('access-token', tokenResponse.data.token);
                const userResponse = await axiosSecure.get(`/users/${email}`);
                setLoggedUser(userResponse.data);
            }
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        } finally {
            setProfileLoading(false);
        }
    };
    console.log("loggedUser", loggedUser);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                await fetchUserData(currentUser.email);
            } else {
                localStorage.removeItem('access-token');
                setLoggedUser(null);
            }
            setAuthLoading(false);
        });

        return unsubscribe;
    }, [axiosPublic, axiosSecure]);

    const authInfo = {
        user,
        loggedUser,
        authLoading,
        profileLoading,
        createUser,
        login,
        loginWithGoogle,
        logout,
        updateUserProfile,
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;