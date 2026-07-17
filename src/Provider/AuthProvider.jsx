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

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const isTokenForUser = (token, email) => {
    if (!token) return false;
    try {
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) return false;
        const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const decodedPayload = JSON.parse(jsonPayload);
        return decodedPayload.email === email;
    } catch (e) {
        return false;
    }
};

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loggedUser, setLoggedUser] = useState(null);
    const [loading, setLoading] = useState(true); // Firebase auth loading state
    const [dbUserLoading, setDbUserLoading] = useState(false); // Database profile loading state
    const [profileUpdating, setProfileUpdating] = useState(false); // Only for profile updates
    const axiosPublic = useAxiosPublic();

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
        setDbUserLoading(true);
        try {
            let token = localStorage.getItem('access-token');
            
            // Check if the stored token actually matches the current user
            if (token && !isTokenForUser(token, email)) {
                localStorage.removeItem('access-token');
                token = null;
            }

            if (!token) {
                const tokenResponse = await axiosPublic.post('/jwt', { email });
                token = tokenResponse.data.token;
                if (token) {
                    localStorage.setItem('access-token', token);
                }
            }
            if (token) {
                const userResponse = await axiosPublic.get(`/users/${email}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (userResponse.data) {
                    setLoggedUser(userResponse.data);
                } else {
                    // Prevent overwriting a valid state if it already exists for this email
                    setLoggedUser(prev => (prev && prev.email === email) ? prev : null);
                }
            }
        } catch (error) {
            console.error("Failed to fetch user data, retrying with fresh token...", error);
            try {
                // If query failed (e.g. token expired), fetch a fresh token and retry once
                const tokenResponse = await axiosPublic.post('/jwt', { email });
                const token = tokenResponse.data.token;
                if (token) {
                    localStorage.setItem('access-token', token);
                    const userResponse = await axiosPublic.get(`/users/${email}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (userResponse.data) {
                        setLoggedUser(userResponse.data);
                        return;
                    }
                }
            } catch (retryError) {
                console.error("Failed to refresh token and fetch user:", retryError);
            }
            // Do not call logout() here, prevent overwriting a valid state
            setLoggedUser(prev => (prev && prev.email === email) ? prev : null);
        } finally {
            setDbUserLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setLoading(false); // Let components mount/render immediately
                await fetchUserData(currentUser.email);
            } else {
                setUser(null);
                setLoggedUser(null);
                localStorage.removeItem('access-token');
                setLoading(false);
            }
        });

        return unsubscribe;
    }, [axiosPublic]);

    const authInfo = {
        user,
        loggedUser,
        dbUserLoading,
        setLoggedUser,
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