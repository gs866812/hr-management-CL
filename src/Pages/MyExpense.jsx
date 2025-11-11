import { useState } from 'react';
import ExpenseStats from '../Component/expenses/ExpenseStats';
import ExpenseTable from '../Component/expenses/ExpenseTable';
import moment from 'moment';
import { FaPlus } from 'react-icons/fa';

export default function MyExpense() {
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');

    return (
        <section className="p-4 overflow-hidden">
            <div className="space-y-6">
                <div className="relative w-full">
                    <div className="flex flex-1 items-center gap-10 justify-between">
                        <div className="flex items-center gap-3">
                            <select
                                className="flex items-center gap-3 px-4 py-2 bg-white border-2! border-[#6E3FF3]! rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                                value={selectedMonth}
                                onChange={(e) =>
                                    setSelectedMonth(e.target.value)
                                }
                            >
                                <option value="">All Months</option>
                                {Array.from({ length: 12 }).map((_, i) => {
                                    const value = moment()
                                        .month(i)
                                        .format('YYYY-MM');
                                    const label = moment()
                                        .month(i)
                                        .format('MMMM');
                                    return (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    );
                                })}
                            </select>

                            <select
                                className="flex items-center gap-3 px-4 py-2 bg-white border-2! border-[#6E3FF3]! rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 capitalize"
                                value={selectedBranch}
                                onChange={(e) =>
                                    setSelectedBranch(e.target.value)
                                }
                            >
                                <option value="">All Branches</option>
                                {['gaibandha', 'dhaka'].map((branch) => (
                                    <option key={branch} value={branch}>
                                        {branch}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            className="bg-[#6E3FF3] text-white h-[43px] px-4 py-3 rounded-lg justify-start items-center gap-2 inline-flex"
                            onClick={() =>
                                document
                                    .getElementById('add-new-expense-modal')
                                    .showModal()
                            }
                        >
                            <FaPlus /> Add New Expense
                        </button>
                    </div>
                </div>

                <div>
                    <ExpenseStats />
                </div>

                <div>
                    <ExpenseTable
                        selectedMonth={selectedMonth}
                        selectedBranch={selectedBranch}
                    />
                </div>
            </div>
        </section>
    );
}
