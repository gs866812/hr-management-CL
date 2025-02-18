import moment from "moment-timezone";
import React, { useContext, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { ContextData } from '../../DataProvider';
import useAxiosSecure from "../../utils/useAxiosSecure";
import { useDispatch, useSelector } from "react-redux";
import { setRefetch } from "../../redux/refetchSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useAxiosProtect from "../../utils/useAxiosProtect";


const CreateLocalOrder = () => {
    const axiosSecure = useAxiosSecure();
    const {user, userName } = useContext(ContextData);


    const [clientID, setClientID] = useState([]);
    const [deadline, setDeadline] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);
    const [orderQuantity, setOrderQuantity] = useState(0);
    const [imagePrice, setImagePrice] = useState(0);

    
    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    // ************************************************************************************************
    const axiosProtect = useAxiosProtect();

    useEffect(() => {
            const fetchClientID = async () => {
                try {
                    const response = await axiosProtect.get('/getClientID', {
                        params: {
                            userEmail: user?.email,
                        },
                    });
                    setClientID(response?.data);
    
                } catch (error) {
                    toast.error('Error fetching data:', error.message);
                }
            };
            fetchClientID();
        }, [refetch]);
    // ************************************************************************************************
    const [formData, setFormData] = useState({
        userName: "",
        clientID: "",
        orderName: '',
        orderQTY: '',
        orderPrice: '',
        orderDeadLine: '',
        orderInstructions: '',
        orderStatus: '',
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
    const qty = parseInt(orderQuantity);

    const price = parseFloat(imagePrice);



    useEffect(() => {
        setTotalPrice(qty * price);
    }, [qty, price]);



    // ************************************************************************************************
    const navigate = useNavigate();
    const handleAssignOrder = (e) => {
        e.preventDefault();
        const deadlineMoment = moment(deadline.date, deadline.timezone);
        const gmt6Deadline = deadlineMoment.clone().tz('Asia/Dhaka'); 
        const newDeadline = gmt6Deadline._i;

        const updateOrder = { ...formData, orderQTY: orderQuantity, orderPrice: totalPrice, userName: userName, orderDeadLine: newDeadline, orderStatus: "Pending" };


        

        const postLocalOrder = async () => {
            try {
                // Simulate an API call
                const response = await axiosSecure.post('/createLocalOrder', updateOrder);
                if (response.data.insertedId) {
                    dispatch(setRefetch(!refetch));
                    toast.success('Order created successfully');
                }
            } catch (error) {
                console.error('Error fetching data:', error.message);
            }
        };
        postLocalOrder();
        resetOrder();
        navigate('/recentOrders');
        
    };

    const resetOrder = () => {
        setOrderQuantity(0);
        setImagePrice(0);
        setDeadline('');
    }
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
                                    <select
                                    id="clientID"
                                    name="clientID"
                                    value={formData?.clientID}
                                    onChange={handleChange}
                                    className="w-full p-1 border border-gray-300 rounded-md outline-none"
                                    required
                                >
                                    <option value="">Select ID</option>
                                    {clientID.map((client, index) => (
                                        <option key={index} value={client.clientID}>
                                            {client.clientID}
                                        </option>
                                    ))}
                                </select>

                                </div>
                            </section>

                            <section className="grid grid-cols-2">
                                <div>
                                    <label className="font-medium">Order/Folder Name:</label>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        id="orderName"
                                        name="orderName"
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
                                        id="orderInstructions"
                                        name="orderInstructions"
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
                                        type="text"
                                        id="orderQTY"
                                        name="orderQTY"
                                        onChange={(e) => setOrderQuantity(e.target.value)}
                                        className="w-full p-1 border border-gray-300 rounded-md outline-none"
                                        placeholder="Enter Order QTY"
                                        required
                                    />
                                </div>
                            </section>

                            <section className="grid grid-cols-2">
                                <div>
                                    <label className="font-medium">Price/image ($):</label>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        id="orderPrice"
                                        name="orderPrice"
                                        onChange={(e) => setImagePrice(e.target.value)}
                                        className="w-full p-1 border border-gray-300 rounded-md outline-none"
                                        placeholder="Enter price per image IE: 0.50"
                                        required
                                    />
                                </div>
                            </section>
                            <section className="grid grid-cols-2">
                                <div>
                                    <label className="font-medium">Total price ($):</label>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        id="totalPrice"
                                        name="totalPrice"
                                        value={totalPrice}
                                        className="w-full p-1 border border-gray-300 rounded-md outline-none"
                                        placeholder="Total price"
                                        readOnly
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
                            onClick={resetOrder}
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