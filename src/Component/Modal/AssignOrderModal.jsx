import React, { useState } from 'react';
import DatePicker from 'react-datepicker';

const AssignOrderModal = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    // ************************************************************************************************
    const handleAssignOrder = (e) => {
        e.preventDefault();
    };
    // ************************************************************************************************

    return (
        <div>
            {/* You can open the modal using document.getElementById('ID').showModal() method */}
            <dialog id="assignOrder" className="modal">
                <div className="modal-box w-auto max-w-5xl">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg">Assigning new order</h3>

                    <form onSubmit={handleAssignOrder} className='mt-5'>
                        <div className='flex gap-5 justify-between w-full'>
                            <div className="grid grid-cols-2 gap-1">
                                <div className="flex items-center">
                                    <label className="font-medium">Client ID:</label>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        id="clientID"
                                        name="clientID"
                                        // value={formData.expenseName}
                                        // onChange={handleChange}
                                        className="w-full p-1 border border-gray-300 rounded-md outline-none"
                                        placeholder="Enter client ID"
                                        required
                                    />
                                </div>

                            </div>
                            {/**** *right side ****/}
                            <div className="grid grid-cols-2 gap-1">
                                <div className="flex items-center">
                                    <label className="font-medium">Order Date:</label>
                                </div>
                                <div>
                                    <label>
                                        <DatePicker
                                            dateFormat="dd.MM.yyyy"
                                            selected={selectedDate} // Pass the Date object
                                            onChange={(date) => setSelectedDate(date)}        // Handle Date object
                                            placeholderText="Select date"
                                            maxDate={new Date()}
                                            required
                                            className="p-1 rounded-md border-gray-300"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </dialog>
            {/*************************************************************************************************/}
        </div>
    );
};

export default AssignOrderModal;