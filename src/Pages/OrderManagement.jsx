import DatePicker from 'react-datepicker';
import { CalendarDays } from 'lucide-react';
import { useState } from 'react';
import OrderStats from '../Component/orderManagement/OrderStats';
import OrderTable from '../Component/orderManagement/OrderTable';

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

                        <div className="flex items-center gap-3 px-4 py-2 bg-white border-2 border-[#6E3FF3] rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                            <CalendarDays className="text-[#6E3FF3] text-lg" />
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
                    </div>
                </div>

                <OrderStats />

                <OrderTable />
            </div>
        </section>
    );
}
