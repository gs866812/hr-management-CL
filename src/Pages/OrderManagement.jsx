import { useState } from 'react';
import OrderStats from '../Component/orderManagement/OrderStats';
import OrderTable from '../Component/orderManagement/OrderTable';
import { Link } from 'react-router-dom';
import { FaUpRightFromSquare } from "react-icons/fa6";

export default function OrderManagement() {
    const [selectedDate, setSelectedDate] = useState(Date.now);

    return (
        <section className="p-4 overflow-hidden">
            <div className="space-y-6">
                <div className="relative w-full">
                    <div className="flex flex-1 items-center gap-10 justify-between">
                        <h3 className="text-black text-xl font-medium">
                            Check Your all Order activity!
                        </h3>

                        <Link to="/createLocalOrder" className=" px-4 py-2 border-2 border-[#6E3FF3] rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-[#6E3FF3] text-white">
                            <span className='flex items-center gap-2'>
                                <FaUpRightFromSquare /> Assign an order
                            </span>
                        </Link>
                    </div>
                </div>

                <OrderStats />

                <OrderTable />
            </div>
        </section>
    );
}
