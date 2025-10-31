import OrderStats from '../Component/orderManagement/OrderStats';
import OrderTable from '../Component/orderManagement/OrderTable';
import { Link } from 'react-router-dom';
import { FaUpRightFromSquare } from 'react-icons/fa6';
import { ContextData } from '../DataProvider';
import { useContext, useState } from 'react';
import { TbCashRegister } from 'react-icons/tb';
import WithdrawModal from '../Component/orderManagement/WithdrawModal';
import { Download } from 'lucide-react';

export default function OrderManagement() {
    const { currentUser } = useContext(ContextData);
    const [selectedMonth, setSelectedMonth] = useState('all');

    return (
        <section className="p-4 overflow-hidden">
            <div className="space-y-6">
                <div className="relative w-full">
                    <div className="flex flex-1 items-center gap-10 justify-between">
                        <h3 className="text-black text-xl font-medium">
                            Check Your all Order activity!
                        </h3>

                        {currentUser &&
                            (currentUser?.role === 'Admin' ||
                                currentUser?.role === 'HR-ADMIN' ||
                                currentUser?.role === 'Developer') && (
                                <div className="flex items-center gap-4">
                                    <Link
                                        to={'/orders/export-invoice'}
                                        className="px-4 py-2 border-2 border-[#6E3FF3] rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-[#6E3FF3] text-white flex items-center gap-2"
                                    >
                                        <Download size={16} /> Export Invoice
                                    </Link>
                                    <button
                                        onClick={() => {
                                            document
                                                .getElementById(
                                                    'withdraw-modal'
                                                )
                                                .showModal();
                                        }}
                                        className="px-4 py-2 border-2 border-[#6E3FF3] rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-[#6E3FF3] text-white flex items-center gap-2"
                                    >
                                        <TbCashRegister /> Withdraw
                                    </button>
                                    <Link
                                        to="/createLocalOrder"
                                        className="px-4 py-2 border-2 border-[#6E3FF3] rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-[#6E3FF3] text-white"
                                    >
                                        <span className="flex items-center gap-2">
                                            <FaUpRightFromSquare /> Assign an
                                            order
                                        </span>
                                    </Link>
                                </div>
                            )}
                    </div>
                </div>

                <OrderStats selectedMonth={selectedMonth} />

                <OrderTable
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                />
                <WithdrawModal />
            </div>
        </section>
    );
}
