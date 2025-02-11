import moment from 'moment/moment';
import React, { useContext, useState } from 'react';
import DatePicker from 'react-datepicker';
import { ContextData } from '../../DataProvider';

const CreateLocalOrder = () => {
    const { userName } = useContext(ContextData);
    const [deadline, setDeadline] = useState(null);
    // ************************************************************************************************
    const [formData, setFormData] = useState({
            userName: "",
            client_ID:"",
            orderName: '',
            orderQTY: '',
            orderPrice: '',
            orderDeadLine: '',
            orderInstructions: '',
        });
    // ************************************************************************************************
    const handleDeadlineChange = (date) => {
        const timezoneOffset = date.getTimezoneOffset(); // Get the offset in minutes
        const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone; // Get IANA timezone name (more robust).
        const deadlineWithTimezone = {
            date: date.toISOString(), // Store as ISO string (UTC) for consistency
            timezoneOffset: timezoneOffset, // Or timezoneName, choose one and be consistent
            timezoneName: timezoneName,
        };
        setDeadline(deadlineWithTimezone);
    };
    // ************************************************************************************************
    const getSelectedDate = () => {
        if (deadline) {
            return new Date(deadline.date); // Convert ISO string back to Date object
        }
        return null;
    };
    // ************************************************************************************************
    // Disable past time
    const filterPastTimes = (time) => {
        const now = moment();
        const selectedDateTime = moment(time);
        return selectedDateTime.isSameOrAfter(now); // Compare date and time
    };
    // ************************************************************************************************
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    // ************************************************************************************************
    const handleAssignOrder = (e) => {
        e.preventDefault();
        console.log(formData, deadline);
    };
    // ************************************************************************************************
    return (
        <div>
            <div>
                <h2 className='text-2xl font-semibold'>Creating new order:</h2>

                <form onSubmit={handleAssignOrder} className='mt-5 border p-5 rounded-md border-gray-400'>
                    <div className='flex gap-5 justify-between w-full'>
                        <div className="w-1/2 space-y-2">
                            <section className="grid grid-cols-2">
                                <div>
                                    <label className="font-medium">Client ID:</label>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        id="client_ID"
                                        name="client_ID"
                                        value={formData?.client_ID}
                                        onChange={handleChange}
                                        className="w-full p-1 border border-gray-300 rounded-md outline-none"
                                        placeholder="Enter client ID"
                                        required
                                    />
                                </div>
                            </section>

                            <section className="grid grid-cols-2">
                                <div>
                                    <label className="font-medium">Order Name:</label>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        id="order_name"
                                        name="order-name"
                                        // value={formData?.orderName}
                                        onChange={handleChange}
                                        className="w-full p-1 border border-gray-300 rounded-md outline-none"
                                        placeholder="Enter order name"
                                        required
                                    />
                                </div>
                            </section>

                            <section className="grid grid-cols-2">
                                <div>
                                    <label className="font-medium">Instructions:</label>
                                </div>
                                <div>
                                    <textarea
                                        id="instructions"
                                        name="instructions"
                                        // value={formData?.orderInstructions}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="Write your instructions"
                                        rows="2"
                                    />
                                </div>
                            </section>

                        </div>

                        {/**** *right side ****/}
                        <div className="w-1/2 space-y-2">
                            <section className="grid grid-cols-2">
                                <div>
                                    <label className="font-medium">Order QTY:</label>
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        id="order_number"
                                        name="order-number"
                                        // value={formData?.orderQTY}
                                        onChange={handleChange}
                                        className="w-full p-1 border border-gray-300 rounded-md outline-none"
                                        placeholder="Enter Order QTY"
                                        required
                                    />
                                </div>
                            </section>

                            <section className="grid grid-cols-2">
                                <div>
                                    <label className="font-medium">Order Price:</label>
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        id="order_price"
                                        name="order-price"
                                        // value={formData?.orderPrice}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full p-1 border border-gray-300 rounded-md outline-none"
                                        placeholder="Enter order price"
                                        required
                                    />
                                </div>
                            </section>

                            <section className="grid grid-cols-2">
                                <div>
                                    <label htmlFor="expenseNote" className="font-medium">Deadline:</label>
                                </div>
                                <div className='border border-gray-300 rounded-md'>
                                    <DatePicker
                                        dateFormat="dd.MM.yyyy"
                                        selected={getSelectedDate()}
                                        onChange={handleDeadlineChange}
                                        showTimeSelect
                                        filterTime={filterPastTimes}
                                        placeholderText="Select date"
                                        minDate={new Date()}
                                        required
                                        className="py-1 px-2 rounded-md border-none"
                                    />
                                </div>
                            </section>

                        </div>
                    </div>
                    {/* ************************* */}
                    <div className='flex items-center justify-between mt-5'>
                        <button
                            type="reset"
                            className="bg-yellow-500 text-white py-2 px-3 rounded-md transition-colors cursor-pointer"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            className=" bg-[#6E3FF3] text-white py-2 px-3 rounded-md hover:bg-[#6E3FF3] transition-colors cursor-pointer"
                        >
                            Create order
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateLocalOrder;