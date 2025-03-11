import React, { useContext, useEffect, useState } from 'react';
import { FaRegEdit } from "react-icons/fa";
import { ContextData } from '../DataProvider';
import DatePicker from 'react-datepicker';
import { useDispatch, useSelector } from 'react-redux';
import useAxiosSecure from '../utils/useAxiosSecure';
import moment from 'moment';
import ExpenseModal from '../Component/Modal/ExpenseModal';
import { toast } from 'react-toastify';
import { selectPresentUser } from '../redux/userSlice';
import { selectUserName } from '../redux/userNameSlice';
import { setRefetch } from '../redux/refetchSlice';

const Expense = () => {
    const { categories, userName, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage } = useContext(ContextData);
    const axiosSecure = useAxiosSecure();


    // ***************************************************************************************************************
    const [expenseList, setExpenseList] = useState([]); // State to store categories
    const [searchExpense, setSearchExpense] = useState(''); // State to store categories
    const [expenseItem, setExpenseItem] = useState([]); // State to store categories
    const [editId, setEditId] = useState(''); // State to store categories

    const [expenseCount, setExpenseCount] = useState(0); // State to store
    



    const [formData, setFormData] = useState({
        userName: "",
        expenseDate: new Date(),
        expenseName: '',
        expenseCategory: '',
        expenseAmount: '',
        expenseStatus: '',
        expenseNote: '',
    });

    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    const presentUser = useSelector(selectPresentUser);
    const currentUserName = useSelector(selectUserName);

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
    }, [editId, expenseList]);
    // ***************************************************************************************************************
    const getExpenseData = (expenses) => {
        setExpenseList(expenses?.expense);
        setExpenseCount(expenses?.count);
    };
    // ***************************************************************************************************************
    const handleEditExpense = (id) => {
        document.getElementById('edit-expense-modal').showModal();
        setEditId(id);
        formData.userName = presentUser?.userName;

    };
    // ***************************************************************************************************************
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ***************************************************************************************************************
    const handleDateChange = (date) => {
        setFormData({ ...formData, expenseDate: date }); // Update with Date object
    };
    // ***************************************************************************************************************
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newAmount = parseFloat(formData.expenseAmount);
        // 1. Prepare the data:
        const dataToUpdate = { ...formData, userName: userName, expenseAmount: newAmount }; // Create a copy  
        console.log(dataToUpdate);
        try {

            const response = await axiosSecure.put(`/editExpense/${editId}`, dataToUpdate); // Or your API endpoint

            if (response.data.message == 'Expense updated successfully') {
                dispatch(setRefetch(!refetch));
                const modal = document.querySelector(`#edit-expense-modal`);
                modal.close();
                toast.success(response.data.message);
            } else if (response.data.message == 'No changes found') {
                toast.warn(response.data.message);
            } else
                toast.warn(response.data.message);

        } catch (error) {
            toast.error("Error updating expense", error.message);
        }
    };
    // ***************************************************************************************************************
    const handleReset = () => {
        if (expenseItem) {
            const expenseDate = expenseItem.expenseDate ? new Date(expenseItem.expenseDate) : new Date();
            setFormData({ ...expenseItem, expenseDate: expenseDate });
        }
    };
    // *************************pagination****************************************************************************
    const totalItem = expenseCount;
    const numberOfPages = Math.ceil(totalItem / itemsPerPage);

    // ----------------------------------------------------------------

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        const halfMaxPagesToShow = Math.floor(maxPagesToShow / 2);
        const totalPages = numberOfPages;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage <= halfMaxPagesToShow) {
                for (let i = 1; i <= maxPagesToShow; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push("...", totalPages);
            } else if (currentPage > totalPages - halfMaxPagesToShow) {
                pageNumbers.push(1, "...");
                for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                pageNumbers.push(1, "...");
                for (
                    let i = currentPage - halfMaxPagesToShow;
                    i <= currentPage + halfMaxPagesToShow;
                    i++
                ) {
                    pageNumbers.push(i);
                }
                pageNumbers.push("...", totalPages);
            }
        }

        return pageNumbers;
    };
    // ----------------------------------------------------------------
    const handleItemsPerPage = (e) => {
        const val = parseInt(e.target.value);
        setItemsPerPage(val);
        setCurrentPage(1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < numberOfPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePageClick = (page) => {
        setCurrentPage(page);
    };
    // ----------------------------------------------------------------
    // ***************************************************************************************************************


    return (
        <div>
            {/******************************************************************************************************/}
            <div className='mt-3'>
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
                                            <td>{parseFloat(expenseList.expenseAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
                        <h3 className="font-bold text-lg">Edit Expense 99</h3>
                        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-5 custom-border rounded p-5">
                            <div className="grid grid-cols-2 gap-1">
                                {/* Expense Name */}
                                <div className="flex items-center">
                                    <label htmlFor="expenseName" className="font-medium">Date:</label>
                                </div>
                                <div className='border border-[#e2e8f0] rounded-md'>
                                    <label>
                                        <DatePicker
                                            dateFormat="dd.MM.yyyy"
                                            selected={formData.expenseDate} // Pass the Date object
                                            onChange={handleDateChange}        // Handle Date object
                                            placeholderText="Select date"
                                            maxDate={new Date}
                                            required
                                            className="py-1 px-2 rounded-md !border-none"
                                        />
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <label htmlFor="expenseName" className="font-medium">Expense Name:</label>
                                </div>
                                <div className=''>
                                    <input
                                        type="text"
                                        id="expenseName"
                                        name="expenseName"
                                        defaultValue={formData?.expenseName}
                                        onChange={handleChange}
                                        className="w-full p-1 outline-1 rounded-md custom-border"
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
                                        className="w-full p-1 border border-gray-300 rounded-md custom-border"
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
                                        className="w-full p-1 border border-gray-300 rounded-md custom-border"
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
                                        className="w-full p-1 border border-gray-300 rounded-md custom-border"
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
                                        className="w-full p-1 rounded-md custom-border"
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
            {/*********************************pagination***********************************************************/}
            {expenseCount > 20 && (
                <div className="my-8 flex justify-center gap-1">
                    <button
                        onClick={handlePrevPage}
                        className="py-2 px-3 bg-[#6E3FF3] text-white rounded-md hover:bg-yellow-600"
                        disabled={currentPage === 1}
                    >
                        Prev
                    </button>
                    {renderPageNumbers().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === "number" && handlePageClick(page)}
                            className={`py-2 px-5 bg-[#6E3FF3] text-white rounded-md hover:bg-yellow-600 ${currentPage === page ? "!bg-yellow-600" : ""
                                }`}
                            disabled={typeof page !== "number"}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={handleNextPage}
                        className="py-2 px-3 bg-[#6E3FF3] text-white rounded-md hover:bg-yellow-600"
                        disabled={currentPage === numberOfPages}
                    >
                        Next
                    </button>

                    <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPage}
                        name=""
                        id=""
                        className="py-2 px-1 rounded-md bg-[#6E3FF3] text-white outline-none hover:bg-yellow-600"
                    >
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>
            )}
            {/******************************************************************************************************/}

        </div>
    );
};

export default Expense;