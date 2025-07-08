import React, { useContext, useEffect, useState } from 'react';
import { ContextData } from '../../DataProvider';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import useAxiosSecure from '../../utils/useAxiosSecure';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { setRefetch } from '../../redux/refetchSlice';
import { useDispatch, useSelector } from 'react-redux';

const ExpenseModal = ({ onExpenseData, searchOption, selectedMonth }) => {
    const { user, currentPage, expenseItemsPerPage, hrBalance, currentUser } = useContext(ContextData);

    const axiosSecure = useAxiosSecure();
    const axiosProtect = useAxiosProtect();
    const dispatch = useDispatch();
    const refetch = useSelector(state => state.refetch.refetch);
    const [categories, setCategories] = useState([]);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [formData, setFormData] = useState({
        expenseName: '',
        expenseCategory: '',
        expenseAmount: '',
        expenseStatus: '',
        expenseNote: '',
    });
    const [newCategory, setNewCategory] = useState('');
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

    // Fetch fresh expense data after new entry
    const fetchExpenseData = async () => {
        try {
            const response = await axiosProtect.get('/getExpense', {
                params: {
                    userEmail: user?.email,
                    page: currentPage,
                    size: expenseItemsPerPage,
                    search: searchOption,
                    selectedMonth,
                },
            });

            onExpenseData(response.data);
            setCategories(response.data.category);
        } catch (error) {
            toast.error('Error fetching data');
        }
    };

    useEffect(() => {
        fetchExpenseData();
    }, [refetch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        if (name === 'expenseCategory' && value === 'new') {
            setShowNewCategoryInput(true);
        } else if (name === 'expenseCategory') {
            setShowNewCategoryInput(false);
        }
    };

    const handleNewCategoryChange = (e) => {
        setNewCategory(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const finalCategory = formData.expenseCategory === 'new' ? newCategory : formData.expenseCategory;
        const amount = parseFloat(formData.expenseAmount);

        if (currentUser?.role === "HR-ADMIN" && hrBalance < amount) {
            toast.error("Not enough funds.");
            return;
        }

        const payload = {
            ...formData,
            expenseAmount: amount,
            expenseCategory: finalCategory,
            expenseDate: selectedDate,
            userName: currentUser?.userName,
            userMail: user?.email,
        };

        try {
            const response = await axiosSecure.post('/addExpense', payload);
            if (response.data.insertedId) {
                dispatch(setRefetch(!refetch));
                toast.success('Expense added successfully');
                handleReset();
            } else {
                toast.error('Error: ' + (response.data?.message || 'Insert failed'));
            }
        } catch (error) {
            console.error(error);
            toast.error('Error submitting form');
        }
    };

    const handleReset = () => {
        setFormData({
            expenseName: '',
            expenseCategory: '',
            expenseAmount: '',
            expenseStatus: '',
            expenseNote: '',
        });
        setNewCategory('');
        setShowNewCategoryInput(false);
        setSelectedDate(new Date());
    };

    return (
        <div>
            <dialog id="add-new-expense-modal" className="modal">
                <div className="modal-box max-w-2xl">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>

                    <h3 className="font-bold text-lg mb-4">Add New Expense</h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Expense Date */}
                        <div>
                            <label className="block font-medium mb-1">Expense Date:</label>
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                dateFormat="dd.MM.yyyy"
                                maxDate={new Date()}
                                className="w-full border border-gray-300 px-3 py-2 rounded-md"
                                required
                            />
                        </div>

                        {/* Expense Name */}
                        <div>
                            <label className="block font-medium mb-1">Expense Name:</label>
                            <input
                                type="text"
                                name="expenseName"
                                value={formData.expenseName}
                                onChange={handleChange}
                                className="w-full border border-gray-300 px-3 py-2 rounded-md"
                                placeholder="Enter expense name"
                                required
                            />
                        </div>

                        {/* Expense Category */}
                        <div>
                            <label className="block font-medium mb-1">Expense Category:</label>
                            <select
                                name="expenseCategory"
                                value={formData.expenseCategory}
                                onChange={handleChange}
                                className="w-full border border-gray-300 px-3 py-2 rounded-md"
                                required
                            >
                                <option value="">Select Category</option>
                                {Array.isArray(categories) && categories.map((cat, i) => (
                                    <option key={i} value={cat.expenseCategory}>{cat.expenseCategory}</option>
                                ))}
                                <option value="new">Add New Category</option>
                            </select>
                            {showNewCategoryInput && (
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={handleNewCategoryChange}
                                    placeholder="Enter new category"
                                    className="w-full border mt-2 border-gray-300 px-3 py-2 rounded-md"
                                    required
                                />
                            )}
                        </div>

                        {/* Expense Amount */}
                        <div>
                            <label className="block font-medium mb-1">Expense Amount:</label>
                            <input
                                type="number"
                                name="expenseAmount"
                                value={formData.expenseAmount}
                                onChange={handleChange}
                                className="w-full border border-gray-300 px-3 py-2 rounded-md"
                                min="0"
                                step="0.01"
                                placeholder="Enter amount"
                                required
                            />
                        </div>

                        {/* Expense Status */}
                        <div>
                            <label className="block font-medium mb-1">Expense Status:</label>
                            <select
                                name="expenseStatus"
                                value={formData.expenseStatus}
                                onChange={handleChange}
                                className="w-full border border-gray-300 px-3 py-2 rounded-md"
                                required
                            >
                                <option value="">Select Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="Partial payment">Partial payment</option>
                            </select>
                        </div>

                        {/* Note */}
                        <div>
                            <label className="block font-medium mb-1">Expense Note (optional):</label>
                            <textarea
                                name="expenseNote"
                                value={formData.expenseNote}
                                onChange={handleChange}
                                className="w-full border border-gray-300 px-3 py-2 rounded-md"
                                rows={3}
                                placeholder="Write a note..."
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button type="reset" onClick={handleReset} className="w-full bg-yellow-500 text-white py-2 rounded-md">
                                Reset
                            </button>
                            <button type="submit" className="w-full bg-[#6E3FF3] text-white py-2 rounded-md">
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
