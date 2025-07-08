import React, { useContext, useEffect, useState } from 'react';
import { Search, ChevronDown, SlidersHorizontal } from 'lucide-react';
import moment from 'moment';
import { BsChevronDoubleLeft, BsChevronDoubleRight } from "react-icons/bs";
import DatePicker from 'react-datepicker';
import { ContextData } from '../../DataProvider';
import useAxiosProtect from '../../utils/useAxiosProtect';
import ExpenseModal from '../Modal/ExpenseModal';
import { FaCalendarAlt, FaPlus, FaRegEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ExpenseTable = () => {
    const {
        currentPage, setCurrentPage,
        expenseItemsPerPage, setExpenseItemsPerPage
    } = useContext(ContextData);

    const axiosProtect = useAxiosProtect();
    const [searchExpense, setSearchExpense] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [expenseList, setExpenseList] = useState([]);
    const [expenseCount, setExpenseCount] = useState(0);
    const [categories, setCategories] = useState([]);
    const [totalMonthExpense, setTotalMonthExpense] = useState(0);

    // Fetch Expense List
    const fetchExpenseData = async () => {
        try {
            const token = localStorage.getItem("jwtToken");
            const userEmail = JSON.parse(atob(token.split('.')[1]))?.email;

            const response = await axiosProtect.get('/getExpense', {
                params: {
                    userEmail,
                    page: currentPage,
                    size: expenseItemsPerPage,
                    search: searchExpense,
                    selectedMonth
                }
            });

            const { expense, count, category } = response.data;
            setExpenseList(expense);
            setExpenseCount(count);
            setCategories(category);

            const total = response.data.expense.reduce((acc, cur) => acc + parseFloat(cur.expenseAmount || 0), 0);
            setTotalMonthExpense(total);
        } catch (err) {
            toast.error("Error fetching expense data");
        }
    };

    useEffect(() => {
        fetchExpenseData();
    }, [currentPage, expenseItemsPerPage, searchExpense, selectedMonth]);

    // Pagination Logic
    const numberOfPages = Math.ceil(expenseCount / expenseItemsPerPage);
    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPages = 5;
        const half = Math.floor(maxPages / 2);

        let startPage = Math.max(1, currentPage - half);
        let endPage = Math.min(numberOfPages, currentPage + half);

        if (currentPage <= half) {
            endPage = maxPages;
        }

        if (currentPage + half >= numberOfPages) {
            startPage = numberOfPages - maxPages + 1;
        }

        for (let i = Math.max(1, startPage); i <= Math.min(numberOfPages, endPage); i++) {
            pageNumbers.push(i);
        }

        return pageNumbers;
    };

    return (
        <div className="w-full bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            {/* Top Header */}
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold text-gray-800">Expense List</h2>
                <button className="bg-[#6E3FF3] text-white px-4 py-2 rounded-md" onClick={() => document.getElementById('add-new-expense-modal').showModal()}>
                    <span className="flex items-center gap-2"><FaPlus /> Add new expense</span>
                </button>
            </div>

            {/* Filter Options */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="flex gap-2 items-center">
                    <DatePicker
                        onChange={date => setSearchExpense(moment(date).format("YYYY-MM-DD"))}
                        customInput={<button className="text-2xl"><FaCalendarAlt /></button>}
                    />
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        className="border border-gray-300 rounded-md px-3 py-2 w-60"
                        onChange={(e) => setSearchExpense(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 items-center">
                    <select
                        onChange={(e) => {
                            setSelectedMonth(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="border border-gray-300 rounded-md px-3 py-2"
                    >
                        <option value="">All Months</option>
                        {moment.months().map((month) => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>

                    <div className="flex items-center gap-1 border border-gray-300 rounded-md px-3 py-2 cursor-pointer">
                        <SlidersHorizontal size={16} />
                        <span>Sort</span>
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="table table-zebra">
                    <thead className='bg-[#6E3FF3] text-white'>
                        <tr>
                            <th>Date</th>
                            <th>Name</th>
                            <th>Amount</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Note</th>
                            <th>User</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenseList.length > 0 ? (
                            expenseList.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{moment(item.expenseDate).format("DD.MM.YYYY")}</td>
                                    <td>{item.expenseName}</td>
                                    <td>{parseFloat(item.expenseAmount).toFixed(2)}</td>
                                    <td>{item.expenseCategory}</td>
                                    <td>{item.expenseStatus}</td>
                                    <td>{item.expenseNote}</td>
                                    <td>{item.userName}</td>
                                    <td><FaRegEdit className="cursor-pointer" /></td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center py-5 text-gray-500">No records found.</td>
                            </tr>
                        )}

                        {expenseList.length > 0 && (
                            <tr className="bg-gray-100 font-semibold">
                                <td colSpan="2" className="text-right">Total:</td>
                                <td>
                                    {totalMonthExpense.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </td>
                                <td colSpan="5"></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-5">
                <p>
                    Showing {(currentPage - 1) * expenseItemsPerPage + 1} - {Math.min(currentPage * expenseItemsPerPage, expenseCount)} of {expenseCount} entries
                </p>
                <div className="flex gap-1 items-center">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="bg-[#6E3FF3] text-white px-2 py-1 rounded"
                    >
                        <BsChevronDoubleLeft />
                    </button>
                    {renderPageNumbers().map((num, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(num)}
                            className={`px-3 py-1 rounded ${currentPage === num ? 'bg-yellow-500 text-white' : 'bg-[#6E3FF3] text-white'}`}
                        >
                            {num}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(numberOfPages, prev + 1))}
                        disabled={currentPage === numberOfPages}
                        className="bg-[#6E3FF3] text-white px-2 py-1 rounded"
                    >
                        <BsChevronDoubleRight />
                    </button>

                    <select
                        value={expenseItemsPerPage}
                        onChange={(e) => {
                            setExpenseItemsPerPage(parseInt(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="ml-2 border border-gray-300 rounded-md px-2 py-1"
                    >
                        {[10, 20, 50, 100].map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Modal */}
            <ExpenseModal
                onExpenseData={({ expense, count, category }) => {
                    setExpenseList(expense);
                    setExpenseCount(count);
                    setCategories(category);
                }}
                searchOption={searchExpense}
                selectedMonth={selectedMonth}
            />
        </div>
    );
};

export default ExpenseTable;
