import { SlCalender } from 'react-icons/sl';
import { IoIosAddCircleOutline } from 'react-icons/io';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useState } from 'react';
import ExpenseStats from '../Component/expenses/ExpenseStats';
import ExpenseTable from '../Component/expenses/ExpenseTable';

export default function MyExpense() {
    const [selectedDate, setSelectedDate] = useState(Date.now);

    return (
        <section className="p-4 overflow-hidden">
            <div className="space-y-6">
                <div className="relative w-full">
                    <div className="flex flex-1 items-center gap-10 justify-between">
                        <div className="flex items-center gap-3 px-4 py-2 bg-white border-2 border-[#6E3FF3] rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                            <SlCalender className="text-[#6E3FF3] text-lg" />
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                dateFormat="dd MMMM, yyyy"
                                placeholderText="Select date"
                                maxDate={new Date()}
                                required
                                className="outline-none border-none text-[#6E3FF3] text-base font-medium bg-transparent cursor-pointer focus:ring-0 focus:outline-none"
                            />
                        </div>

                        <button className="bg-[#6E3FF3] text-white h-[43px] px-4 py-3 rounded-lg justify-start items-center gap-2 inline-flex">
                            <IoIosAddCircleOutline className="text-white text-lg" />
                            <span className="text-white text-base font-normal">
                                Expenses report
                            </span>
                        </button>
                    </div>
                </div>

                <div>
                    <ExpenseStats />
                </div>

                <div>
                    <ExpenseTable />
                </div>
            </div>
        </section>
    );
}
