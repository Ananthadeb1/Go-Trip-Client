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
    const [loading, setLoading] = useState(true); // Combined loading state
    const [profileUpdating, setProfileUpdating] = useState(false); // Only for profile updates
    const axiosPublic = useAxiosPublic();
    const axiosSecure = useAxiosSecure();

    const createUser = async (email, password) => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            return userCredential;
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            await fetchUserData(userCredential.user.email);
            return userCredential;
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = async () => {
        setLoading(true);
        try {
            const userCredential = await signInWithPopup(auth, googleProvider);
            setUser(userCredential.user);
            await fetchUserData(userCredential.user.email);
            return userCredential;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await signOut(auth);
            setUser(null);
            setLoggedUser(null);
            localStorage.removeItem('access-token');
        } finally {
            setLoading(false);
        }
    };

    const updateUserProfile = async (name, photo) => {
        setProfileUpdating(true);
        try {
            await updateProfile(auth.currentUser, {
                displayName: name,
                photoURL: photo
            });
            setUser({ ...auth.currentUser });
            // Refresh user data after profile update
            await fetchUserData(auth.currentUser.email);
        } finally {
            setProfileUpdating(false);
        }
    };

    const fetchUserData = async (email) => {
        try {
            const tokenResponse = await axiosPublic.post('/jwt', { email });
            if (tokenResponse.data.token) {
                localStorage.setItem('access-token', tokenResponse.data.token);
                const userResponse = await axiosSecure.get(`/users/${email}`);
                setLoggedUser(userResponse.data);
            }
        } catch (error) {
            console.error("Failed to fetch user data:", error);
            // If fetching user data fails, log out the user
            await logout();
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await fetchUserData(currentUser.email);
            } else {
                setUser(null);
                setLoggedUser(null);
                localStorage.removeItem('access-token');
            }
            setLoading(false);
        });

        return unsubscribe;
    }, [axiosPublic, axiosSecure]);

    const authInfo = {
        user,
        loggedUser,
        loading,
        profileUpdating,
        isAuthenticated: !!user,
        createUser,
        login,
        loginWithGoogle,
        logout,
        updateUserProfile,
        setUser,
        fetchUserData
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;