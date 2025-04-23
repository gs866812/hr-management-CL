import { Search } from 'lucide-react';
import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import EarningsModal from './EarningsModal';

const Earnings = () => {

    const [searchEarnings, setSearchEarnings] = useState('');
    console.log(searchEarnings);
    return (
        <div className="mt-2">
            <section>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Earnings List
                    </h2>

                    <div className='flex items-center gap-2'>
                        <section>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="!border !border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                                value={searchEarnings}
                                onChange={(e) => setSearchEarnings(e.target.value)}
                            />
                            
                        </section>
                        <section>
                            <button className="bg-[#6E3FF3] text-white px-4 rounded-md py-2 cursor-pointer" onClick={() => document.getElementById('add-new-earnings-modal').showModal()}>
                                <span className='flex items-center gap-2'>
                                    <FaPlus />
                                    Add new earnings
                                </span>
                            </button>
                        </section>
                    </div>
                </div>
            </section>
            <EarningsModal/>
        </div>
    );
};

export default Earnings;