import React from 'react';
import { Link } from 'react-router-dom';

const Payroll = () => {
    return (
        <div className='max-w-screen-2xl mx-auto'>
            <section className='flex gap-4'>

                <div className="w-1/4 border rounded-md p-5 shadow-amber-100 shadow-2xl text-center font-semibold text-xl hover:bg-[#6E3FF3] hover:text-white transition-all duration-200 cursor-pointer">
                    <h2>Employee details</h2>
                </div>
                <Link to='/payroll/appliedLeave' className="w-1/4 border rounded-md p-5 shadow-amber-100 shadow-2xl text-center font-semibold text-xl hover:bg-[#6E3FF3] hover:text-white transition-all duration-200 cursor-pointer">
                    <h2>Leave application</h2>
                </Link>
                <div className="w-1/4 border rounded-md p-5 shadow-amber-100 shadow-2xl text-center font-semibold text-xl hover:bg-[#6E3FF3] hover:text-white transition-all duration-200 cursor-pointer">
                    <h2>...</h2>
                </div>
                <div className="w-1/4 border rounded-md p-5 shadow-amber-100 shadow-2xl text-center font-semibold text-xl hover:bg-[#6E3FF3] hover:text-white transition-all duration-200 cursor-pointer">
                    <h2>...</h2>
                </div>

            </section>
        </div>
    );
};

export default Payroll;