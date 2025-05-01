import { onAuthStateChanged, signOut } from 'firebase/auth';
import React, { createContext, useEffect, useState } from 'react';
import auth from './firebase.config';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import useAxiosProtect from './utils/useAxiosProtect';
export const ContextData = createContext(null);

const DataProvider = ({ children }) => {
    // ****************************************************************
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [userName, setUserName] = useState(null);
    const [hrBalance, setHrBalance] = useState(0);
    const [hrTransactions, setHrTransactions] = useState(0);

    const [hrExpense, setHrExpense] = useState([]);

    const [mainBalance, setMainBalance] = useState(0);


    const [expenseItemsPerPage, setExpenseItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);


    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    const axiosProtect = useAxiosProtect();

    // ****************************************************************
    useEffect(() => {
        const interval = setInterval(() => {
            const token = localStorage.getItem('jwtToken');
            if (user && token) {
                clearInterval(interval);
                fetchHrBalance();
            }
        }, 200);

        const fetchHrBalance = async () => {
            try {
                const response = await axiosProtect.get('/getHrBalance', {
                    params: {
                        userEmail: user?.email,
                    },
                });
                setHrBalance(response.data.balance);
                setHrExpense(response.data.expense);
                setHrTransactions(response.data.hrTransaction);
            } catch (error) {
                toast.error('Error fetching data:', error.message);
            }
        };
        return () => clearInterval(interval);
    }, [refetch, user]);
    // ****************************************************************
    useEffect(() => {
        const interval = setInterval(() => {
            const token = localStorage.getItem('jwtToken');
            if (user && token) {
                clearInterval(interval);
                fetchMainBalance();
            }
        }, 200);

        const fetchMainBalance = async () => {
            try {
                const response = await axiosProtect.get('/getMainBalance', {
                    params: { userEmail: user.email },
                });
                setMainBalance(response.data.mainBalance);
            } catch (error) {
                toast.error('Error fetching data');
            }
        };

        return () => clearInterval(interval);
    }, [refetch, user]);


    // ****************************************************************
    // Token validation logic
    const validateToken = async () => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            try {
                const response = await axios.post(
                    'https://webbriks.backendsafe.com/validate-token',
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
        expenseItemsPerPage,
        setExpenseItemsPerPage,
        currentPage,
        setCurrentPage,
        hrBalance,
        hrTransactions,
        hrExpense,
        setHrExpense,
        currentUser,
        setCurrentUser,
        mainBalance
    };

    return <ContextData.Provider value={info}>{children}</ContextData.Provider>;
};

export default DataProvider;
