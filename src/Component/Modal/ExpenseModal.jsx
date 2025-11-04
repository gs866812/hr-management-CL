import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { setRefetch } from '../../redux/refetchSlice';
import { toast } from 'react-toastify';
import { ContextData } from '../../DataProvider';
import useAxiosProtect from '../../utils/useAxiosProtect';
import DatePicker from 'react-datepicker';

const ExpenseModal = ({ onExpenseData, searchOption }) => {
    // *************************************************************************************************
    const {
        user,
        userName,
        categories,
        setCategories,
        currentPage,
        expenseItemsPerPage,
        hrBalance,
        currentUser,
    } = useContext(ContextData);

    const axiosSecure = useAxiosSecure();
    const axiosProtect = useAxiosProtect();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [formData, setFormData] = useState({
        userName: '',
        expenseName: '',
        expenseCategory: '',
        expenseAmount: '',
        expenseStatus: '',
        expenseNote: '',
        expenseDate: '',
        office: '',
    });

    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCategory, setNewCategory] = useState('');

    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    // *************************************************************************************************
    useEffect(() => {
        const fetchExpenseData = async () => {
            try {
                const response = await axiosProtect.get('/getExpense', {
                    params: {
                        userEmail: user?.email,
                        page: currentPage,
                        size: expenseItemsPerPage,
                        search: searchOption,
                    },
                });
                onExpenseData(response.data);
                setCategories(response.data.category);
            } catch (error) {
                toast.error('Error fetching data:', error.message);
            }
        };
        fetchExpenseData();
    }, [refetch, currentPage, expenseItemsPerPage, searchOption, axiosProtect]);
    // *************************************************************************************************
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        if (name === 'expenseCategory' && value === 'new') {
            setShowNewCategoryInput(true);
        } else {
            setShowNewCategoryInput(false);
        }
    };
    // *************************************************************************************************
    const handleNewCategoryChange = (e) => {
        setNewCategory(e.target.value);
    };
    // *************************************************************************************************

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission here
        const selectedCategory =
            formData.expenseCategory === 'new'
                ? newCategory
                : formData.expenseCategory;

        // Handle form submission here
        const newAmount = parseFloat(formData.expenseAmount);

        if (currentUser?.role == 'HR-ADMIN') {
            if (hrBalance < newAmount) {
                toast.error('Not enough funds');
                return;
            }
        }

        const updatedFormData = {
            ...formData,
            expenseAmount: newAmount,
            expenseCategory: selectedCategory, // Use the correct category
            expenseDate: selectedDate,
            userName: currentUser?.userName,
            userMail: user?.email,
        };

        // console.log(updatedFormData);

        const postExpenseData = async () => {
            try {
                const response = await axiosSecure.post(
                    '/addExpense',
                    updatedFormData
                );
                if (response.data.insertedId) {
                    dispatch(setRefetch(!refetch));
                    toast.success('Expense added successfully');
                } else {
                    toast.error(response.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error.message);
            }
        };

        postExpenseData();
        handleReset();
    };
    // *************************************************************************************************
    const handleReset = () => {
        setFormData({
            expenseName: '',
            expenseCategory: '',
            expenseAmount: '',
            office: '',
            expenseStatus: '',
            expenseNote: '',
        });
        setNewCategory('');
        setShowNewCategoryInput(false);
        setSelectedDate(new Date());
    };
    // *************************************************************************************************

    return (
        <div>
            <dialog
                id="add-new-expense-modal"
                className="modal overflow-y-scroll"
            >
                <div className="modal-box">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-0 top-0">
                            ✕
                        </button>
                    </form>
                    <h3 className="font-bold text-lg">Add new expense:</h3>
                    <form
                        onSubmit={handleSubmit}
                        className="max-w-2xl mx-auto mt-5"
                    >
                        <div className="grid grid-cols-2 gap-1">
                            {/* Expense Name */}
                            <div className="flex items-center">
                                <label
                                    htmlFor="expenseDate"
                                    className="font-medium"
                                >
                                    Expense Date:
                                </label>
                            </div>
                            <div className="border rounded-md border-gray-300">
                                <label>
                                    <DatePicker
                                        dateFormat="dd.MM.yyyy"
                                        selected={selectedDate} // Pass the Date object
                                        onChange={(date) =>
                                            setSelectedDate(date)
                                        } // Handle Date object
                                        placeholderText="Select date"
                                        maxDate={new Date()}
                                        required
                                        className="py-1 px-2 rounded-md border-none"
                                    />
                                </label>
                            </div>
                            <div className="flex items-center">
                                <label
                                    htmlFor="expenseName"
                                    className="font-medium"
                                >
                                    Expense Name:
                                </label>
                            </div>
                            <div className="border rounded-md border-gray-300">
                                <input
                                    type="text"
                                    id="expenseName"
                                    name="expenseName"
                                    value={formData.expenseName}
                                    onChange={handleChange}
                                    className="w-full p-2 rounded-md outline-none"
                                    placeholder="Enter expense name"
                                    required
                                />
                            </div>

                            {/* Expense Category */}
                            <div className="flex items-center">
                                <label
                                    htmlFor="expenseCategory"
                                    className="font-medium"
                                >
                                    Expense Category:
                                </label>
                            </div>
                            <div className="border rounded-md border-gray-300">
                                <select
                                    id="expenseCategory"
                                    name="expenseCategory"
                                    value={formData.expenseCategory}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="">Select category</option>
                                    {categories.map((category, index) => (
                                        <option
                                            key={index}
                                            value={category.expenseCategory}
                                        >
                                            {category.expenseCategory}
                                        </option>
                                    ))}
                                    <option value="new">
                                        Add New Category
                                    </option>
                                </select>
                                {showNewCategoryInput && (
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={handleNewCategoryChange}
                                        className="w-full p-2 border! border-gray-300! rounded-md mt-2"
                                        placeholder="Enter new category"
                                        required
                                    />
                                )}
                            </div>

                            {/* Expense Category */}
                            <div className="flex items-center">
                                <label htmlFor="office" className="font-medium">
                                    Office:
                                </label>
                            </div>
                            <div>
                                <select
                                    id="office"
                                    name="office"
                                    value={formData.office}
                                    onChange={handleChange}
                                    className="w-full p-2 border! border-gray-300! rounded-md capitalize"
                                    required
                                >
                                    <option value="">Select office</option>
                                    <option value="dhaka">Dhaka</option>
                                    <option value="gaibandha">Gaibandha</option>
                                </select>
                            </div>

                            {/* Expense Amount */}
                            <div className="flex items-center">
                                <label
                                    htmlFor="expenseAmount"
                                    className="font-medium"
                                >
                                    Expense Amount:
                                </label>
                            </div>
                            <div className="border rounded-md border-gray-300">
                                <input
                                    type="number"
                                    id="expenseAmount"
                                    name="expenseAmount"
                                    value={formData.expenseAmount}
                                    min="0"
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="Enter expense amount"
                                    required
                                />
                            </div>

                            {/* Expense Status */}
                            <div className="flex items-center">
                                <label
                                    htmlFor="expenseStatus"
                                    className="font-medium"
                                >
                                    Expense Status:
                                </label>
                            </div>
                            <div className="border rounded-md border-gray-300">
                                <select
                                    id="expenseStatus"
                                    name="expenseStatus"
                                    value={formData.expenseStatus}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="">Select status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Partial payment">
                                        Partial payment
                                    </option>
                                </select>
                            </div>

                            {/* Expense Note */}
                            <div className="flex items-center">
                                <label
                                    htmlFor="expenseNote"
                                    className="font-medium"
                                >
                                    Expense Note:
                                </label>
                            </div>
                            <div className="border rounded-md border-gray-300">
                                <textarea
                                    id="expenseNote"
                                    name="expenseNote"
                                    value={formData.expenseNote}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="Add a note (optional)"
                                    rows="2"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-6 flex gap-2">
                            <button
                                onClick={handleReset}
                                type="reset"
                                className="w-full bg-yellow-500 text-white p-2 rounded-md transition-colors cursor-pointer"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                className="w-full bg-[#6E3FF3] text-white p-2 rounded-md hover:bg-[#6E3FF3] transition-colors cursor-pointer"
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default ExpenseModal;
