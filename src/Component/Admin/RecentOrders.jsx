import React, { useState } from 'react';

const RecentOrders = () => {
    const [searchOrder, setSearchOrder] = useState('');
    return (
        <div>
            {/******************************************************************************************************/}
            <div>
                <div className='flex items-center justify-between'>
                    <h2 className='text-2xl'>Recent order list:</h2>
                    <div className="flex gap-2">
                        <label className="flex gap-1 items-center py-1 px-3 border rounded-md border-gray-500">
                            <input
                                type="text"
                                name="search"
                                placeholder="Search"
                                onChange={(e) => setSearchOrder(e.target.value)}
                                className=" hover:outline-none outline-none border-none"
                                size="13"
                            />
                        </label>
                        <button className="bg-[#6E3FF3] text-white px-2 rounded-md py-1 cursor-pointer" onClick={() => document.getElementById('add-new-expense-modal').showModal()}>
                            Assign an order
                        </button>
                    </div>
                </div>
            </div>
            {/******************************************************************************************************/}
            {/******************************************************************************************************/}
        </div>
    );
};

export default RecentOrders;