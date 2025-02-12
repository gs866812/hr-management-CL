import { onAuthStateChanged, signOut } from 'firebase/auth';
import React, { createContext, useEffect, useState } from 'react';
import auth from './firebase.config';
import axios from 'axios';
export const ContextData = createContext(null);

const DataProvider = ({ children }) => {
    // ****************************************************************
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]); // State to store categories
    const [userName, setUserName] = useState(null);

    // ****************************************************************
    useEffect(() => {
        if (user) {
            switch (user?.email) {
                case import.meta.env.VITE_SARWAR:
                    setUserName('g_sarwar');
                    break;
                case import.meta.env.VITE_ASAD:
                    setUserName('asad100');
                    break;
                default:
                    setUserName('Client');
            }
        } else {
            setUserName(null); // Reset userName if there's no user or email
        }
    }, [user]);
    // ****************************************************************
    // Token validation logic
    const validateToken = async () => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            try {
                const response = await axios.post(
                    'http://localhost:5000/validate-token',
                    null,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (response.data.success) {
                    setUser(response.data.user); // Set user if token is valid
                    // setTokenReady(true);
                } else {
                    localStorage.removeItem('jwtToken');
                    setUser(null);
                }
            } catch (error) {
                console.error('Error validating token:', error);
                localStorage.removeItem('jwtToken');
                setUser(null);
            }
        } else {
            setUser(null);
        }
        setLoading(false); // Stop loading after token validation
    };

    // ****************************************************************
    const logOut = async () => {
        setLoading(true);
        try {
            await signOut(auth); // Await the signOut process
            localStorage.removeItem('jwtToken'); // Remove the token
            localStorage.removeItem('user'); // Remove user data
            setUser(null); // Clear user
        } catch (error) {
            console.error('Error logging out:', error); // Handle any errors
        } finally {
            setLoading(false); // Always stop loading, whether successful or not
        }
    };
    // ****************************************************************

    useEffect(() => {
        const handleStorageChange = () => {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                setUser(null); // Clear user context/state when token is removed
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // ****************************************************************
    // Firebase authentication listener
    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => {
            unSubscribe();
        };
    }, []);

    // ****************************************************************
    // Validate token on app load
    useEffect(() => {
        validateToken();
    }, []);
    // ****************************************************************
    const info = {
        user,
        setUser,
        userName,
        loading,
        setLoading,
        categories,
        setCategories,
        logOut,
    };

    return <ContextData.Provider value={info}>{children}</ContextData.Provider>;
};

export default DataProvider;
