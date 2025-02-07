import React, { useContext, useEffect, useState } from 'react';
import { FaRegEdit } from "react-icons/fa";
import { ContextData } from '../DataProvider';
import DatePicker from 'react-datepicker';
import { useDispatch, useSelector } from 'react-redux';
import { setRefetch } from '../redux/refetchSlice';
import useAxiosSecure from '../utils/useAxiosSecure';
import { toast } from 'react-toastify';
import moment from 'moment';
import ExpenseModal from '../Component/Modal/ExpenseModal';

const Expense = () => {
    const { userName, categories } = useContext(ContextData);
    // ***************************************************************************************************************
    const [expenseList, setExpenseList] = useState([]); // State to store categories
    const [searchExpense, setSearchExpense] = useState(''); // State to store categories
    const [expenseItem, setExpenseItem] = useState([]); // State to store categories
    const [editId, setEditId] = useState(''); // State to store categories



    const [formData, setFormData] = useState({
        userName: userName || '',
        expenseDate: new Date(),
        expenseName: '',
        expenseCategory: '',
        expenseAmount: '',
        expenseStatus: '',
        expenseNote: '',
    });

    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);
    const axiosSecure = useAxiosSecure();

    // ***************************************************************************************************************
    useEffect(() => {
        if (expenseList && editId) {
            const foundExpense = expenseList.find(ex => ex._id === editId);
            setExpenseItem(foundExpense);

            if (foundExpense) {
                // Convert date string to Date object if needed
                const expenseDate = foundExpense.expenseDate ? new Date(foundExpense.expenseDate) : new Date();
                setFormData({ ...foundExpense, expenseDate: expenseDate });
            } else {
                console.warn("Expense not found for ID:", editId); // Corrected ID variable
            }
        }
    }, [editId, expenseList, userName]);
    // ***************************************************************************************************************
    const getExpenseData = (expenses) => {
        setExpenseList(expenses);
    };
    // ***************************************************************************************************************
    const handleEditExpense = (id) => {
        document.getElementById('edit-expense-modal').showModal();
        setEditId(id);

    };
    // ***************************************************************************************************************
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ***************************************************************************************************************
    const handleDateChange = (date) => {
        console.log("Date selected by user:", date);
        setFormData({ ...formData, expenseDate: date }); // Update with Date object
    };
    // ***************************************************************************************************************
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newAmount = parseFloat(formData.expenseAmount);
        // 1. Prepare the data:
        const dataToUpdate = { ...formData, expenseAmount: newAmount }; // Create a copy


        try {
            
            // 2. Send the update request:
            const response = await axiosSecure.put(`/editExpense/${editId}`, dataToUpdate); // Or your API endpoint

            // 3. Handle the response:
            if (response.status === 200) { // Or 204 No Content, depending on your API
                dispatch(setRefetch(!refetch));
                const modal = document.querySelector(`#edit-expense-modal`);
                modal.close();
                toast.success("Expense updated successfully:", response.data);
                // Optionally:
                // - Close the modal: document.getElementById('edit-expense-modal').close();
                // - Refresh the expense list in the parent component (if needed).
                // - Reset the form data.
                // - Show a success message to the user.
            } else {
                console.error("Error updating expense:", response.status, response.data);
                // Show an error message to the user.
            }

        } catch (error) {
            console.error("Error updating expense:", error);
            // Show an error message to the user.
        }
    };
    // ***************************************************************************************************************
    const handleReset = () => {
        if (expenseItem) {
            const expenseDate = expenseItem.expenseDate ? new Date(expenseItem.expenseDate) : new Date();
            setFormData({ ...expenseItem, expenseDate: expenseDate });
        }
    };
    // ***************************************************************************************************************


    return (
        <div>
            {/******************************************************************************************************/}
            <div>
                <div className='flex items-center justify-between'>
                    <h2 className='text-2xl'>Recent expense list:</h2>
                    <div className="flex gap-2">
                        <label className="flex gap-1 items-center py-1 px-3 border rounded-md border-gray-500">
                            <input
                                type="text"
                                name="search"
                                placeholder="Search"
                                onChange={(e) => setSearchExpense(e.target.value)}
                                className=" hover:outline-none outline-none border-none"
                                size="13"
                            />
                        </label>
                        <button className="bg-[#6E3FF3] text-white px-2 rounded-md py-1 cursor-pointer" onClick={() => document.getElementById('add-new-expense-modal').showModal()}>
                            Add new expense
                        </button>
                    </div>
                </div>
            </div>
            {/******************************************************************************************************/}
            <div className="overflow-x-auto mt-5">
                <table className="table table-zebra">
                    {/* head */}
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Expense</th>
                            <th>Amount</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Note</th>
                            <th>User</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            expenseList.length > 0 ? (
                                expenseList.map((expenseList, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{moment(expenseList.expenseDate).format("DD.MM.YYYY")}</td>
                                            <td>{expenseList.expenseName}</td>
                                            <td>{parseFloat(expenseList.expenseAmount).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                                            <td>{expenseList.expenseCategory}</td>
                                            <td>{expenseList.expenseStatus}</td>
                                            <td>{expenseList.expenseNote}</td>
                                            <td>{expenseList.userName}</td>
                                            <td className='w-[5%]'>
                                                <div className='flex justify-center'>
                                                    <FaRegEdit className='cursor-pointer' onClick={() => handleEditExpense(expenseList._id)} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center">No record found</td>
                                </tr>
                            )
                        }
                    </tbody>
                </table>
            </div>
            {/******************************************************************************************************/}
            <ExpenseModal onExpenseData={getExpenseData} searchOption={searchExpense} />
            {/****************************************Edit modal********************************************************/}
            <div>
                <dialog id="edit-expense-modal" className="modal overflow-y-scroll">
                    <div className="modal-box">
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-0 top-0">✕</button>
                        </form>
                        <h3 className="font-bold text-lg">Edit Expense</h3>
                        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-5">
                            <div className="grid grid-cols-2 gap-1">
                                {/* Expense Name */}
                                <div className="flex items-center">
                                    <label htmlFor="expenseName" className="font-medium">Date:</label>
                                </div>
                                <div>
                                    <label>
                                        <DatePicker
                                        dateFormat="dd.MM.yyyy"
                                            selected={formData.expenseDate} // Pass the Date object
                                            onChange={handleDateChange}        // Handle Date object
                                            placeholderText="Select date"
                                            maxDate={new Date}
                                            required
                                            className="py-1 px-2 rounded-md outline-none border"
                                        />
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <label htmlFor="expenseName" className="font-medium">Expense Name:</label>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        id="expenseName"
                                        name="expenseName"
                                        defaultValue={formData?.expenseName}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-md outline-none"
                                        required
                                    />
                                </div>

                                {/* Expense Category */}
                                <div className="flex items-center">
                                    <label htmlFor="expenseCategory" className="font-medium">Expense Category:</label>
                                </div>
                                <div>
                                    <select
                                        id="expenseCategory"
                                        name="expenseCategory"
                                        value={formData.expenseCategory}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((category) => (
                                            <option key={category.expenseCategory} value={category.expenseCategory}>
                                                {category.expenseCategory}
                                            </option>
                                        ))}
                                    </select>

                                </div>

                                {/* Expense Amount */}
                                <div className="flex items-center">
                                    <label htmlFor="expenseAmount" className="font-medium">Expense Amount:</label>
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        id="expenseAmount"
                                        name="expenseAmount"
                                        value={formData.expenseAmount}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>

                                {/* Expense Status */}
                                <div className="flex items-center">
                                    <label htmlFor="expenseStatus" className="font-medium">Expense Status:</label>
                                </div>
                                <div>
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
                                        <option value="Partial payment">Partial payment</option>
                                    </select>
                                </div>

                                {/* Expense Note */}
                                <div className="flex items-center">
                                    <label htmlFor="expenseNote" className="font-medium">Expense Note:</label>
                                </div>
                                <div>
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

                                <button onClick={handleReset}
                                    type="reset"
                                    className="w-full bg-yellow-500 text-white p-2 rounded-md transition-colors cursor-pointer"
                                >
                                    Reset
                                </button>
                                <button
                                    type="submit"
                                    className="w-full bg-[#6E3FF3] text-white p-2 rounded-md hover:bg-[#6E3FF3] transition-colors cursor-pointer"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </dialog>
            </div>
            {/******************************************************************************************************/}
            
        </div>
    );
};

export default Expense;