import { useContext, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import moment from 'moment';
import ExpenseModal from '../Modal/ExpenseModal';
import { FaRegEdit } from 'react-icons/fa';
import { BsChevronDoubleLeft, BsChevronDoubleRight } from 'react-icons/bs';
import DatePicker from 'react-datepicker';
import { ContextData } from '../../DataProvider';
import { useDispatch, useSelector } from 'react-redux';
import { selectPresentUser } from '../../redux/userSlice';
import { toast } from 'react-toastify';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { setRefetch } from '../../redux/refetchSlice';
import { RiResetRightFill } from 'react-icons/ri';
import { GrDocumentUpdate } from 'react-icons/gr';

const ExpenseTable = ({selectedMonth}) => {
    const {
        categories,
        userName,
        currentPage,
        setCurrentPage,
        expenseItemsPerPage,
        setExpenseItemsPerPage,
        hrBalance,
    } = useContext(ContextData);
    const axiosSecure = useAxiosSecure();

    const [searchExpense, setSearchExpense] = useState('');
    const [expenseList, setExpenseList] = useState([]);
    const [filteredExpenseList, setFilteredExpenseList] = useState([]);
    const [expenseItem, setExpenseItem] = useState([]);
    const [editId, setEditId] = useState('');
    const [expenseCount, setExpenseCount] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [formData, setFormData] = useState({
        userName: '',
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

    useEffect(() => {
        if (expenseList && editId) {
            const foundExpense = expenseList.find((ex) => ex._id === editId);
            setExpenseItem(foundExpense);
            if (foundExpense) {
                const expenseDate = foundExpense.expenseDate
                    ? new Date(foundExpense.expenseDate)
                    : new Date();
                setFormData({ ...foundExpense, expenseDate: expenseDate });
            } else {
                toast.warn('Expense not found for ID:', editId);
            }
        }
    }, [editId, expenseList]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDateChange = (date) => {
        setFormData({ ...formData, expenseDate: date });
    };

    const handleEditExpense = (id) => {
        document.getElementById('edit-expense-modal').showModal();
        setEditId(id);
        formData.userName = presentUser?.userName;
    };

    const getExpenseData = (expenses) => {
        setExpenseList(expenses?.expense);
        setExpenseCount(expenses?.count);

        const all = expenses?.allExpense || [];
        const filtered = all.filter((item) => {
            const formattedDate = moment(item.expenseDate).format('DD.MM.YYYY');
            const matchMonth = selectedMonth
                ? moment(item.expenseDate).format('YYYY-MM') === selectedMonth
                : true;
            const matchSearch = searchExpense
                ? formattedDate.includes(searchExpense) ||
                  Object.values(item).some(
                      (val) =>
                          typeof val === 'string' &&
                          val
                              .toLowerCase()
                              .includes(searchExpense.toLowerCase())
                  )
                : true;
            return matchMonth && matchSearch;
        });

        // 🔥 Sort newest first
        filtered.sort(
            (a, b) => new Date(b.expenseDate) - new Date(a.expenseDate)
        );

        setExpenseList(filtered); // Used for edit modal

        const paginated = filtered.slice(
            (currentPage - 1) * expenseItemsPerPage,
            currentPage * expenseItemsPerPage
        );
        setFilteredExpenseList(paginated);

        const total = filtered.reduce(
            (sum, item) => sum + parseFloat(item.expenseAmount || 0),
            0
        );
        setTotalAmount(total);
    };

    useEffect(() => {
        dispatch(setRefetch(!refetch));
    }, [selectedMonth, searchExpense]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newAmount = parseFloat(formData.expenseAmount);
        if (hrBalance < newAmount) {
            toast.error('Not enough funds');
            return;
        }
        const dataToUpdate = {
            ...formData,
            userName: userName,
            expenseAmount: newAmount,
        };
        try {
            const response = await axiosSecure.put(
                `/editExpense/${editId}`,
                dataToUpdate
            );
            if (response.data.message == 'Expense updated successfully') {
                dispatch(setRefetch(!refetch));
                const modal = document.querySelector(`#edit-expense-modal`);
                modal.close();
                toast.success(response.data.message);
            } else if (response.data.message == 'No changes found') {
                toast.warn(response.data.message);
            } else toast.warn(response.data.message);
        } catch (error) {
            toast.error('Error updating expense', error.message);
        }
    };

    const handleReset = () => {
        if (expenseItem) {
            const expenseDate = expenseItem.expenseDate
                ? new Date(expenseItem.expenseDate)
                : new Date();
            setFormData({ ...expenseItem, expenseDate: expenseDate });
        }
    };

    const totalItem = expenseCount;
    const numberOfPages = Math.ceil(totalItem / expenseItemsPerPage);

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        const halfMaxPagesToShow = Math.floor(maxPagesToShow / 2);
        const totalPages = numberOfPages;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else {
            if (currentPage <= halfMaxPagesToShow) {
                for (let i = 1; i <= maxPagesToShow; i++) pageNumbers.push(i);
                pageNumbers.push('...', totalPages);
            } else if (currentPage > totalPages - halfMaxPagesToShow) {
                pageNumbers.push(1, '...');
                for (
                    let i = totalPages - maxPagesToShow + 1;
                    i <= totalPages;
                    i++
                )
                    pageNumbers.push(i);
            } else {
                pageNumbers.push(1, '...');
                for (
                    let i = currentPage - halfMaxPagesToShow;
                    i <= currentPage + halfMaxPagesToShow;
                    i++
                )
                    pageNumbers.push(i);
                pageNumbers.push('...', totalPages);
            }
        }
        return pageNumbers;
    };

    const handleExpenseItemsPerPage = (e) => {
        setExpenseItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1);
    };
    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
    const handleNextPage = () => {
        if (currentPage < numberOfPages) setCurrentPage(currentPage + 1);
    };
    const handlePageClick = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="w-full bg-white rounded-xl shadow-lg border border-gray-100 p-6 ">
            <div className="flex justify-between items-center gap-4 mb-6">
                <div className="relative flex max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        className="w-full pl-10 pr-4 py-2 border-2! border-gray-200! rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6E3FF3]"
                        onChange={(e) => setSearchExpense(e.target.value)}
                    />
                </div>
            </div>

            <ExpenseModal
                onExpenseData={getExpenseData}
                searchOption={searchExpense}
            />

            <div className="overflow-x-auto mt-5">
                <table className="table table-zebra">
                    <thead className="bg-[#6E3FF3] text-white">
                        <tr>
                            <th>Date</th>
                            <th>Expense</th>
                            <th>Amount</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Office</th>
                            <th>Note</th>
                            <th>User</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenseList.length > 0 ? (
                            filteredExpenseList.map((exp, i) => (
                                <tr key={i}>
                                    <td>
                                        {moment(exp.expenseDate).format(
                                            'DD.MM.YYYY'
                                        )}
                                    </td>
                                    <td>{exp.expenseName}</td>
                                    <td>
                                        {parseFloat(
                                            exp.expenseAmount
                                        ).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                        })}
                                    </td>
                                    <td>{exp.expenseCategory}</td>
                                    <td>{exp.expenseStatus}</td>
                                    <td className="capitalize">{exp.office}</td>
                                    <td>{exp.expenseNote}</td>
                                    <td>{exp.userName}</td>
                                    <td>
                                        <FaRegEdit
                                            onClick={() =>
                                                handleEditExpense(exp._id)
                                            }
                                        />
                                    </td>
                                    {/* <td><FaRegEdit className='cursor-pointer' onClick={() => handleEditExpense(exp._id)} /></td> */}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="text-center">
                                    No record found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 text-right text-lg font-semibold text-gray-700">
                Total Amount{' '}
                {selectedMonth
                    ? `for ${moment(selectedMonth).format('MMMM YYYY')}`
                    : '(All)'}
                :
                <span className="ml-2 text-[#6E3FF3]">
                    {totalAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}{' '}
                    ৳
                </span>
            </div>

            <dialog id="edit-expense-modal" className="modal overflow-y-scroll">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-0 top-0">
                            ✕
                        </button>
                    </form>
                    <h3 className="font-bold text-lg">Edit Expense</h3>
                    <form
                        onSubmit={handleSubmit}
                        className="max-w-2xl mx-auto mt-5 custom-border rounded p-5"
                    >
                        <div className="grid grid-cols-2 gap-1">
                            {/* Expense Name */}
                            <div className="flex items-center">
                                <label
                                    htmlFor="expenseName"
                                    className="font-medium"
                                >
                                    Date:
                                </label>
                            </div>
                            <div className="border! border-gray-300! rounded-md">
                                <label>
                                    <DatePicker
                                        dateFormat="dd.MM.yyyy"
                                        selected={formData.expenseDate} // Pass the Date object
                                        onChange={handleDateChange} // Handle Date object
                                        placeholderText="Select date"
                                        maxDate={new Date()}
                                        required
                                        className="py-1 px-2 rounded-md"
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
                            <div className="">
                                <input
                                    type="text"
                                    id="expenseName"
                                    name="expenseName"
                                    defaultValue={formData?.expenseName}
                                    onChange={handleChange}
                                    className="w-full p-1 outline-1 rounded-md border! border-gray-300!"
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
                            <div>
                                <select
                                    id="expenseCategory"
                                    name="expenseCategory"
                                    value={formData.expenseCategory}
                                    onChange={handleChange}
                                    className="w-full p-1 rounded-md border! border-gray-300!"
                                    required
                                >
                                    <option value="">Select category</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.expenseCategory}
                                            value={category.expenseCategory}
                                        >
                                            {category.expenseCategory}
                                        </option>
                                    ))}
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
                            <div>
                                <input
                                    type="number"
                                    id="expenseAmount"
                                    name="expenseAmount"
                                    value={formData.expenseAmount}
                                    onChange={handleChange}
                                    className="w-full p-1 border! border-gray-300! rounded-md "
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
                            <div>
                                <select
                                    id="expenseStatus"
                                    name="expenseStatus"
                                    value={formData.expenseStatus}
                                    onChange={handleChange}
                                    className="w-full p-1 border! border-gray-300! rounded-md "
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
                            <div>
                                <textarea
                                    id="expenseNote"
                                    name="expenseNote"
                                    value={formData.expenseNote}
                                    onChange={handleChange}
                                    className="w-full p-1 rounded-md border! border-gray-300!"
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
                                <span className="flex items-center justify-center gap-1">
                                    <RiResetRightFill />
                                    Reset
                                </span>
                            </button>
                            <button
                                type="submit"
                                className="w-full bg-[#6E3FF3] text-white p-2 rounded-md hover:bg-[#6E3FF3] transition-colors cursor-pointer"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <GrDocumentUpdate />
                                    Update
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>

            {/* Restore pagination UI */}
            <div className="text-center">
                {filteredExpenseList.length > 0 && (
                    <div className="mt-5 flex justify-between items-center">
                        <p>
                            Showing{' '}
                            {(currentPage - 1) * expenseItemsPerPage + 1} -{' '}
                            {Math.min(
                                currentPage * expenseItemsPerPage,
                                expenseList.length
                            )}{' '}
                            of {expenseList.length} entries
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handlePrevPage}
                                className="py-2 px-2 bg-[#6E3FF3] text-white rounded-md"
                            >
                                <BsChevronDoubleLeft />
                            </button>
                            {renderPageNumbers().map((page, index) => (
                                <button
                                    key={index}
                                    onClick={() =>
                                        typeof page === 'number' &&
                                        handlePageClick(page)
                                    }
                                    className={`py-1 px-3 ${
                                        currentPage === page
                                            ? 'bg-yellow-600'
                                            : 'bg-[#6E3FF3]'
                                    } text-white rounded-md`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={handleNextPage}
                                className="py-2 px-2 bg-[#6E3FF3] text-white rounded-md"
                            >
                                <BsChevronDoubleRight />
                            </button>
                            <select
                                value={expenseItemsPerPage}
                                onChange={handleExpenseItemsPerPage}
                                className="select select-sm py-1 px-1 rounded-md bg-[#6E3FF3] text-white"
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseTable;
