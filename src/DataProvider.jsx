import { onAuthStateChanged, signOut } from 'firebase/auth';
import React, { createContext, useEffect, useState } from 'react';
import auth from './firebase.config';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import useAxiosProtect from './utils/useAxiosProtect';
import moment from 'moment';
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
    const [authChecked, setAuthChecked] = useState(false);


    const [expenseItemsPerPage, setExpenseItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const [employee, setEmployee] = useState({});
    const [employeeList, setEmployeeList] = useState([]);
    const [searchEmployee, setSearchEmployee] = useState('');

    const [totalExpense, setTotalExpense] = useState(0);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);

    const [attendanceInfo, setAttendanceInfo] = useState([]);
    const [salaryAndPF, setSalaryAndPF] = useState({});



    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    const axiosProtect = useAxiosProtect();




    // ****************************************************************
    useEffect(() => {
        const interval = setInterval(() => {
            const token = localStorage.getItem('jwtToken');
            if (user && token) {
                clearInterval(interval);
                fetchPresentUser();
            }
        }, 200);

        const fetchPresentUser = async () => {
            try {
                const response = await axiosProtect.get('/getCurrentUser', {
                    params: {
                        userEmail: user.email,
                    },
                });

                setCurrentUser(response.data);
            } catch (error) {
                toast.error('Error fetching user data');
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
                fetchEmployee();
            }
        }, 200);
        const fetchEmployee = async () => {
            try {
                const response = await axiosProtect.get(`/getEmployee`, {
                    params: {
                        userEmail: user?.email,
                    },
                });
                setEmployee(response.data);
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
                fetchEmployeeList();
            }
        }, 200);
        const fetchEmployeeList = async () => {
            try {
                const response = await axiosProtect.get(`/getEmployeeList`, {
                    params: {
                        userEmail: user?.email,
                        search: searchEmployee,
                    },
                });
                setEmployeeList(response.data);
            } catch (error) {
                toast.error('Error fetching data:', error.message);
            }
        };
        return () => clearInterval(interval);

    }, [refetch, user, searchEmployee, axiosProtect]);
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
    useEffect(() => {
        const interval = setInterval(() => {
            const token = localStorage.getItem('jwtToken');
            if (user && token) {
                clearInterval(interval);
                fetchProfit();
            }
        }, 200);

        const fetchProfit = async () => {
            try {
                const response = await axiosProtect.get('/getProfit', {
                    params: { userEmail: user.email },
                });
                setTotalExpense(response.data.totalExpense);
                setTotalEarnings(response.data.totalEarnings);
                setTotalProfit(response.data.profit);
            } catch (error) {
                toast.error('Error fetching data');
            }
        };

        return () => clearInterval(interval);
    }, [refetch, user]);
    // ****************************************************************
    // Token validation logic
    // const validateToken = async () => {
    //     const token = localStorage.getItem('jwtToken');
    //     if (token) {
    //         try {
    //             const response = await axios.post(
    //                 '/validate-token',
    //                 null,
    //                 {
    //                     headers: { Authorization: `Bearer ${token}` },
    //                 }
    //             );
    //             if (response.data.success) {
    //                 setUser(response.data.user); // Set user if token is valid
    //                 // setTokenReady(true);
    //             } else {
    //                 localStorage.removeItem('jwtToken');
    //                 setUser(null);
    //             }
    //         } catch (error) {
    //             console.error('Error validating token:', error);
    //             localStorage.removeItem('jwtToken');
    //             setUser(null);
    //         }
    //     } else {
    //         setUser(null);
    //     }
    //     setLoading(false); // Stop loading after token validation
    // };

    useEffect(() => {
        let authTimeout;
        let isUnmounted = false;

        // We'll use this flag to prevent state updates after unmount
        const safeSetState = (setter, value) => {
            if (!isUnmounted) setter(value);
        };

        // Make sure we stay in loading state until auth is verified
        safeSetState(setLoading, true);

        // First, check for an existing JWT token
        const checkToken = async () => {
            const token = localStorage.getItem('jwtToken');

            if (token) {
                try {
                    const response = await axios.post(
                        'http://localhost:5000/validate-token',
                        null,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    if (response.data.success) {
                        return { valid: true, userData: response.data.user };
                    } else {
                        localStorage.removeItem('jwtToken');
                        return { valid: false };
                    }
                } catch (error) {
                    console.error('🚫 Error validating token:', error);
                    localStorage.removeItem('jwtToken');
                    return { valid: false };
                }
            }
            return { valid: false };
        };

        // Set a maximum time to wait for auth
        authTimeout = setTimeout(() => {
            if (!isUnmounted && loading) {
                safeSetState(setLoading, false);
                safeSetState(setUser, null);
                safeSetState(setAuthChecked, true);
            }
        }, 5000); // 5 second timeout

        // Listen for Firebase auth state
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

            // Clear timeout since we got a response
            clearTimeout(authTimeout);

            // Check Firebase authentication first
            if (firebaseUser) {
                // Then check JWT token
                const tokenResult = await checkToken();

                if (tokenResult.valid) {
                    // Both Firebase and JWT are valid
                    safeSetState(setUser, firebaseUser);
                    safeSetState(setCurrentUser, tokenResult.userData);
                } else {
                    // Firebase authenticated but no valid JWT
                    // This likely means the JWT expired or was deleted

                    // Try to generate a new JWT
                    try {
                        const emailData = { email: firebaseUser.email };
                        const res = await axios.post(
                            'http://localhost:5000/jwt',
                            emailData
                        );

                        if (res.data.token) {
                            localStorage.setItem('jwtToken', res.data.token);
                            safeSetState(setUser, firebaseUser);

                            // Fetch user data with new token
                            try {
                                const userRes = await axios.get(
                                    'http://localhost:5000/users',
                                    { headers: { Authorization: `Bearer ${res.data.token}` } }
                                );
                                const userData = userRes.data.find(u => u.email === firebaseUser.email);
                                if (userData) {
                                    safeSetState(setCurrentUser, userData);
                                }
                            } catch (error) {
                                console.error("🚫 Error fetching user data:", error);
                            }
                        } else {
                            safeSetState(setUser, null);
                        }
                    } catch (error) {
                        console.error("🚫 Error generating JWT:", error);
                        safeSetState(setUser, null);
                    }
                }
            } else {
                // No Firebase user
                localStorage.removeItem('jwtToken');
                safeSetState(setUser, null);
                safeSetState(setCurrentUser, null);
            }

            // Auth check complete
            safeSetState(setLoading, false);
            safeSetState(setAuthChecked, true);
        });

        // Cleanup function
        return () => {
            isUnmounted = true;
            clearTimeout(authTimeout);
            unsubscribe();
        };
    }, []); // Empty dependency array ensures this runs only once on mount



    // ****************************************************************
    useEffect(() => {
        const interval = setInterval(() => {
            const token = localStorage.getItem('jwtToken');
            if (user?.email && token) {
                clearInterval(interval);
                fetchAttendance();
            }
        }, 200);

        const fetchAttendance = async () => {
            try {
                const response = await axiosProtect.get('/getAttendance', {
                    params: { userEmail: user.email.toLowerCase().trim() },
                });
                setAttendanceInfo(response.data);
            } catch (error) {
                toast.error('Error fetching data');
            }
        };


        return () => clearInterval(interval);
    }, [refetch, user]);

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
    useEffect(() => {
        const interval = setInterval(() => {
            const token = localStorage.getItem('jwtToken');
            if (user?.email && token) {
                clearInterval(interval);
                fetchPFAndSalary();
            }
        }, 200);

        const fetchPFAndSalary = async () => {
            try {
                const response = await axiosProtect.get('/getSalaryAndPF', {
                    params: { userEmail: user.email.toLowerCase().trim() },
                });
                setSalaryAndPF(response.data[0]);
            } catch (error) {
                toast.error('Error fetching data');
            }
        };


        return () => clearInterval(interval);
    }, [refetch, user]);
    // ****************************************************************
    // Firebase authentication listener
    // useEffect(() => {
    //     const unSubscribe = onAuthStateChanged(auth, (currentUser) => {
    //         setUser(currentUser);
    //         setLoading(false);
    //     });
    //     return () => {
    //         unSubscribe();
    //     };
    // }, []);


    // ****************************************************************

    // Validate token on app load
    // useEffect(() => {
    //     validateToken();
    // }, []);
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
        mainBalance,
        employee,
        dispatch,
        refetch,
        employeeList,
        setSearchEmployee,
        authChecked,
        totalProfit,
        totalExpense,
        totalEarnings,
        attendanceInfo,
        salaryAndPF,
    };

    return <ContextData.Provider value={info}>{children}</ContextData.Provider>;
};

export default DataProvider;
