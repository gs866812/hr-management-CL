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
    const { user, userName } = useContext(ContextData);


    const [clientID, setClientID] = useState([]);
    const [deadline, setDeadline] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);
    const [orderQuantity, setOrderQuantity] = useState(0);
    const [imagePrice, setImagePrice] = useState(0);


    const [services, setServices] = useState([]);
    const [dateTime, setDateTime] = useState(moment().format('DD-MMM-YYYY HH:mm:ss'));
    const [returnFile, setReturnFile] = useState('Original Format and BG');
    const [colorChangeInstruction, setColorChangeInstruction] = useState('');
    const [imageResizeInstruction, setImageResizeInstruction] = useState('');

    // console.log(colorChangeInstruction, imageResizeInstruction);



    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    // ************************************************************************************************
    const handleServiceChange = (event) => {
        const selectedService = event.target.value;

        if (selectedService !== "Select services") {
            if (!services.includes(selectedService)) { // Only add if NOT already in the array
                setServices([...services, selectedService]);
                if (selectedService === "Color change") {
                    document.getElementById('colorChange').showModal();
                }
                else if (selectedService === "Image resizing") {
                    document.getElementById('imageResizing').showModal();
                }
            }
            // If already selected, do nothing (or you could optionally add a visual cue)
        }
    };
    // ************************************************************************************************

    const handleServiceRemove = (serviceToRemove) => {
        setServices(services.filter(service => service !== serviceToRemove));
        if (serviceToRemove === "Color change") {
            setColorChangeInstruction('');
        }else if(serviceToRemove === "Image resizing"){
            setImageResizeInstruction('');
        }

    };
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
        date: "",
        clientID: "",
        orderName: '',
        orderQTY: '',
        orderPrice: '',
        orderDeadLine: '',
        orderInstructions: '',
        orderStatus: '',
        needServices: [],
        returnFormat: '',
        completeTime: 0,
        colorCode: '',
        imageResize: '',
        lastUpdated: 0,
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

    const handleColorChange = (e) => {
        e.preventDefault();
        setColorChangeInstruction(e.target.colorChange.value);

        // const modal = document.querySelector(`#edit-expense-modal`);
        // modal.close();

        document.querySelector(`#colorChange`).close();
    };
    // --------------------------------------------------
    const handleImageResize = (e) => {
        e.preventDefault();
        setImageResizeInstruction(e.target.imageResizing.value);

        document.querySelector(`#imageResizing`).close();
    };
    // ************************************************************************************************
    const navigate = useNavigate();
    const handleAssignOrder = (e) => {
        e.preventDefault();
        const deadlineMoment = moment(deadline.date, deadline.timezone);
        const gmt6Deadline = deadlineMoment.clone().tz('Asia/Dhaka');
        const newDeadline = gmt6Deadline._i;
        setDateTime(moment().format('DD-MMM-YYYY HH:mm:ss'));

        const updateOrder = { ...formData, date:dateTime, needServices: services, colorCode: colorChangeInstruction, imageResize: imageResizeInstruction, returnFormat: returnFile, orderQTY: orderQuantity, orderPrice: totalPrice, userName: userName, orderDeadLine: newDeadline, orderStatus: "Pending" };

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
                                <div className="border border-gray-300 rounded-md">
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
                                    <label className="font-medium">Services you need:</label>
                                </div>
                                <div>
                                    <select className="w-full p-1 !border !border-gray-300 rounded-md outline-none" onChange={handleServiceChange}>
                                        <option value="Select services">Select services</option>
                                        <option value="Clipping path">Clipping path</option>
                                        <option value="Multi clipping path">Multi clipping path</option>
                                        <option value="Transparent background">Transparent background</option>
                                        <option value="White background">White background</option>
                                        <option value="Color background">Color background</option>
                                        <option value="Hair masking">Hair masking</option>
                                        <option value="Single Selection">Single Selection</option>
                                        <option value="Multi Selection">Multi Selection</option>
                                        <option value="Drop shadow">Drop shadow</option>
                                        <option value="Natural shadow">Natural shadow</option>
                                        <option value="Reflection shadow">Reflection shadow</option>
                                        <option value="Image manipulation">Image manipulation</option>
                                        <option value="Neck join">Neck join</option>
                                        <option value="Ghost mannequin effect">Ghost mannequin effect</option>
                                        <option value="Basic retouching">Basic retouching</option>
                                        <option value="High-end retouching">High-end retouching</option>
                                        <option value="Jewelry retouching">Jewelry retouching</option>
                                        <option value="Skin retouching">Skin retouching</option>
                                        <option value="Color change">Color change</option>
                                        <option value="Color correction">Color correction</option>
                                        <option value="Image resizing">Image resizing</option>
                                        <option value="Raster to vector">Raster to vector</option>
                                        <option value="Lighting adjustment">Lighting adjustment</option>
                                        <option value="White balance">White balance</option>
                                    </select>
                                    <section className="mt-2 space-y-1 flex flex-wrap ">
                                        {
                                            services.length > 0 ?
                                                services.map((service, index) => (
                                                    <span key={index} className=" p-1 bg-[#6E3FF3] text-white mr-1 text-[12px] rounded-md">
                                                        {service}
                                                        <button onClick={() => handleServiceRemove(service)} className="text-red-500 ml-1 cursor-pointer bg-white rounded-full px-1" title="Remove service">X</button>
                                                    </span>

                                                )) : null
                                        }
                                    </section>
                                </div>
                            </section>

                            <section className="grid grid-cols-2">
                                <div>
                                    <label className="font-medium">Order/Folder Name:</label>
                                </div>
                                <div className="!border !border-gray-300 rounded-md">

                                    <input
                                        type="text"
                                        id="orderName"
                                        name="orderName"
                                        // value={formData?.orderName}
                                        onChange={handleChange}
                                        className="w-full p-1 border border-gray-300 rounded-md outline-none "
                                        placeholder="Enter order name"
                                        required
                                    />
                                </div>
                            </section>

                            <section className="grid grid-cols-2">
                                <div>
                                    <label className="font-medium">Instructions:</label>
                                </div>
                                <div className="!border !border-gray-300 rounded-md">
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
                                <div className="!border !border-gray-300 rounded-md">
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
                                <div className="!border !border-gray-300 rounded-md">
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
                                <div className="!border !border-gray-300 rounded-md">
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
                                    <label className="font-medium">Returned file format:</label>
                                </div>
                                <div>
                                    <select className="w-full p-1 !border !border-gray-300 rounded-md outline-none" value={returnFile} onChange={(e) => setReturnFile(e.target.value)}>
                                        <option value="Select return file format">Select return file format</option>
                                        <option value="Original Format and BG">Original Format and BG</option>
                                        <option value="JPG - White BG">JPG - White BG</option>
                                        <option value="PNG - Transparent">PNG - Transparent</option>
                                        <option value="PSD - Layer Mask">PSD - Layer Mask</option>
                                        <option value="PSD - Layered File">PSD - Layered File</option>
                                        <option value="PSD - Original BG">PSD - Original BG</option>
                                        <option value="TIFF - Original BG">TIFF - Original BG</option>
                                        <option value="TIFF - Transparent BG">TIFF - Transparent BG</option>
                                        <option value="PSF Pages">PSF Pages</option>
                                        <option value="PSB - Layered file">PSB - Layered file</option>
                                        <option value="PDF">PDF</option>

                                    </select>
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
            {/* ********************************service modal */}
            <dialog id="colorChange" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => handleServiceRemove('Color change')}>✕</button>
                    </form>
                    <h3 className="font-bold text-lg">Color change instruction</h3>
                    <form className="mt-3" onSubmit={handleColorChange}>
                        <textarea
                            id="colorChange"
                            name="colorChange"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Input the color code you want to change to or write instruction for color change."
                            rows="2"
                        />
                        <button className="bg-[#6E3FF3] text-white py-1 px-2 rounded-md hover:bg-[#6E3FF3] transition-colors cursor-pointer mt-2">Save</button>
                    </form>
                </div>
            </dialog>
            {/* *********************************************** */}
            <dialog id="imageResizing" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => handleServiceRemove('Image resizing')}>✕</button>
                    </form>
                    <h3 className="font-bold text-lg">image resizing instruction</h3>
                    <form className="mt-3" onSubmit={handleImageResize}>
                        <textarea
                            id="imageResizing"
                            name="imageResizing"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Input your required image size."
                            rows="2"
                        />
                        <button className="bg-[#6E3FF3] text-white py-1 px-2 rounded-md hover:bg-[#6E3FF3] transition-colors cursor-pointer mt-2">Save</button>
                    </form>
                </div>
            </dialog>
            {/* *********************************************** */}
        </div>
    );
};

export default CreateLocalOrder;