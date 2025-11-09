import React, { useState } from 'react';
import {
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Edit2,
    SlidersHorizontal,
} from 'lucide-react';
import moment from 'moment';

const CanceledOrdersData = [
    {
        id: 1,
        date: '2024-02-10',
        expense: 'Office Supplies',
        amount: 299.99,
        category: 'Office',
        status: 'Approved',
        note: 'Quarterly supplies purchase',
        user: 'John Doe',
    },
    {
        id: 2,
        date: '2024-02-09',
        expense: 'Client Lunch',
        amount: 125.5,
        category: 'Meals',
        status: 'Pending',
        note: 'Business lunch with ABC Corp',
        user: 'Jane Smith',
    },
];

const CanceledOrders = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isOpen, setIsOpen] = useState(false);
    const [sortValue, setSortValue] = useState('10');

    const sortValues = ['10', '20', '50', '100', 'All'];

    const statusStyles = {
        Approved: 'bg-green-100 text-green-700',
        Pending: 'bg-yellow-100 text-yellow-700',
        Rejected: 'bg-red-100 text-red-700',
    };

    return (
        <section className="p-4">
            <div className="w-full bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex flex-col gap-6 mb-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Canceled Order List
                        </h2>
                    </div>

                    <div className="flex justify-between items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
                            <input
                                type="text"
                                placeholder="Search order..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6E3FF3] focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                <SlidersHorizontal className="size-4 text-gray-600" />
                                <span className="text-sm text-gray-600">
                                    {sortValue}
                                </span>
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {isOpen && (
                                <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-100 rounded-lg shadow-lg z-10">
                                    {sortValues.map((period) => (
                                        <button
                                            key={period}
                                            onClick={() => {
                                                setSortValue(period);
                                                setIsOpen(false);
                                            }}
                                            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left first:rounded-t-lg last:rounded-b-lg"
                                        >
                                            {period}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                    Expense
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                    Amount
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                    Category
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                    Note
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                    User
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {CanceledOrdersData.map((expense) => (
                                <tr
                                    key={expense.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {moment(expense.expenseDate).format(
                                            'DD MMMM, YYYY'
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                        {expense.expense}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        ${expense.amount.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                statusStyles[expense.status]
                                            }`}
                                        >
                                            {expense.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {expense.note}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {expense.user}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center">
                                            <button className="p-1 hover:bg-gray-100 rounded">
                                                <Edit2 className="size-4 text-gray-600" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between mt-6 py-4">
                    <div className="text-sm text-gray-600">
                        Showing 1-10 of 50 entries
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <ChevronLeft className="size-4 text-gray-600" />
                        </button>
                        {[1, 2, 3, 4, 5].map((page) => (
                            <button
                                key={page}
                                className={`px-3 py-1 rounded-lg ${
                                    currentPage === page
                                        ? 'bg-[#6E3FF3] text-white'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <ChevronRight className="size-4 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CanceledOrders;
