import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DatePicker from 'react-datepicker';
import moment from "moment-timezone";
import { toast } from "react-toastify";

import useAxiosSecure from "../../utils/useAxiosSecure";
import useAxiosProtect from "../../utils/useAxiosProtect";
import { ContextData } from '../../DataProvider';
import { setRefetch } from "../../redux/refetchSlice";

import 'react-datepicker/dist/react-datepicker.css';

const CreateLocalOrder = () => {
    const { user, userName } = useContext(ContextData);
    const axiosSecure = useAxiosSecure();
    const axiosProtect = useAxiosProtect();
    const dispatch = useDispatch();
    const refetch = useSelector(state => state.refetch.refetch);
    const navigate = useNavigate();

    const [clientID, setClientID] = useState([]);
    const [deadline, setDeadline] = useState(null);
    const [orderQuantity, setOrderQuantity] = useState(0);
    const [imagePrice, setImagePrice] = useState(0);
    const [services, setServices] = useState([]);
    const [customService, setCustomService] = useState('');
    const [returnFile, setReturnFile] = useState('Original Format and BG');
    const [colorChangeInstruction, setColorChangeInstruction] = useState('');
    const [imageResizeInstruction, setImageResizeInstruction] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);

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

    // Fetch client IDs
    useEffect(() => {
        const fetchClientID = async () => {
            try {
                const response = await axiosProtect.get('/getClientID', {
                    params: { userEmail: user?.email },
                });
                setClientID(response?.data);
            } catch (error) {
                toast.error('Error fetching client IDs');
            }
        };
        fetchClientID();
    }, [refetch]);

    // Total price calculation
    useEffect(() => {
        const qty = parseInt(orderQuantity);
        const price = parseFloat(imagePrice);
        setTotalPrice((qty && price) ? qty * price : 0);
    }, [orderQuantity, imagePrice]);

    // Handlers
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDeadlineChange = (date) => {
        const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const deadlineWithTimezone = {
            date: date.toISOString(),
            timezoneName,
        };
        setDeadline(deadlineWithTimezone);
    };

    const getSelectedDate = () => (deadline ? new Date(deadline.date) : null);

    const filterPastTimes = (time) => moment(time).isSameOrAfter(moment());

    const handleServiceChange = (e) => {
        const selected = e.target.value;
        if (selected === 'custom') {
            document.getElementById("customServiceModal").showModal();
        } else if (!services.includes(selected)) {
            setServices(prev => [...prev, selected]);
            if (selected === "Color change") document.getElementById("colorChange").showModal();
            if (selected === "Image resizing") document.getElementById("imageResizing").showModal();
        }
    };

    const handleServiceRemove = (service) => {
        setServices(prev => prev.filter(s => s !== service));
        if (service === "Color change") setColorChangeInstruction('');
        if (service === "Image resizing") setImageResizeInstruction('');
    };

    const handleColorChange = (e) => {
        e.preventDefault();
        setColorChangeInstruction(e.target.colorChange.value);
        document.getElementById("colorChange").close();
    };

    const handleImageResize = (e) => {
        e.preventDefault();
        setImageResizeInstruction(e.target.imageResizing.value);
        document.getElementById("imageResizing").close();
    };

    const handleCustomServiceSubmit = (e) => {
        e.preventDefault();
        if (customService && !services.includes(customService)) {
            setServices(prev => [...prev, customService]);
        }
        setCustomService('');
        document.getElementById("customServiceModal").close();
    };

    const resetOrder = () => {
        setFormData({});
        setOrderQuantity(0);
        setImagePrice(0);
        setDeadline(null);
        setServices([]);
        setColorChangeInstruction('');
        setImageResizeInstruction('');
    };

    const handleAssignOrder = async (e) => {
        e.preventDefault();

        const deadlineMoment = moment(deadline.date).tz(deadline.timezoneName);
        const newDeadline = deadlineMoment.format('DD-MMM-YYYY HH:mm:ss');
        const dateTimeNow = moment().format('DD-MMM-YYYY HH:mm:ss');

        const updateOrder = {
            ...formData,
            date: dateTimeNow,
            needServices: services,
            colorCode: colorChangeInstruction,
            imageResize: imageResizeInstruction,
            returnFormat: returnFile,
            orderQTY: orderQuantity,
            orderPrice: totalPrice,
            userName: userName,
            orderDeadLine: newDeadline,
            orderStatus: "Pending"
        };

        try {
            const response = await axiosSecure.post('/createLocalOrder', updateOrder);
            if (response.data.insertedId) {
                toast.success('Order created successfully');
                dispatch(setRefetch(!refetch));
                resetOrder();
                navigate('/orders');
            }
        } catch (err) {
            toast.error('Failed to create order');
        }
    };

    // UI
    return (
        <div className="max-w-6xl mx-auto p-5 bg-gray-100">
            <h2 className="text-2xl font-bold mb-4">Create New Local Order</h2>

            <form onSubmit={handleAssignOrder} className="bg-white shadow-md rounded-lg p-6 space-y-6 border border-gray-200">
                {/* Top Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left */}
                    <div className="space-y-4">
                        <label className="block font-semibold">Client ID</label>
                        <select
                            name="clientID"
                            value={formData.clientID}
                            onChange={handleChange}
                            className="w-full !border !border-gray-300 p-2 rounded"
                            required
                        >
                            <option value="">Select Client ID</option>
                            {clientID.map((client, idx) => (
                                <option key={idx} value={client.clientID}>{client.clientID}</option>
                            ))}
                        </select>

                        <label className="block font-semibold">Order Name</label>
                        <input type="text" name="orderName" onChange={handleChange} className="w-full !border !border-gray-300 p-2 rounded" required />

                        <label className="block font-semibold">Instructions</label>
                        <textarea name="orderInstructions" rows={3} onChange={handleChange} className="w-full !border !border-gray-300 p-2 rounded" />
                    </div>

                    {/* Right */}
                    <div className="space-y-4">
                        <label className="block font-semibold">Order QTY</label>
                        <input type="number" value={orderQuantity} onChange={(e) => setOrderQuantity(e.target.value)} className="w-full !border !border-gray-300 p-2 rounded" required />

                        <label className="block font-semibold">Price per Image ($)</label>
                        <input type="number" step="0.01" value={imagePrice} onChange={(e) => setImagePrice(e.target.value)} className="w-full !border !border-gray-300 p-2 rounded" required />

                        <label className="block font-semibold">Total Price ($)</label>
                        <input type="text" value={totalPrice} readOnly className="w-full !border !border-gray-300 p-2 rounded bg-gray-100" />
                    </div>
                </div>

                {/* Services */}
                <div>
                    <label className="block font-semibold mb-1">Select Services</label>
                    <select onChange={handleServiceChange} className="w-full !border !border-gray-300 p-2 rounded">
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
                        <option value="BG and skin">BG and skin</option>
                        <option value="custom">Other (write your own)</option>
                    </select>
                    <div className="flex flex-wrap mt-2 gap-2">
                        {services.map((service, idx) => (
                            <span key={idx} className="bg-blue-600 text-white text-sm px-2 py-1 rounded-full flex items-center gap-1">
                                {service}
                                <button type="button" onClick={() => handleServiceRemove(service)} className="ml-1 text-white bg-red-500 rounded-full px-1">x</button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Returned format */}
                <div>
                    <label className="block font-semibold mb-1">Returned File Format</label>
                    <select value={returnFile} onChange={(e) => setReturnFile(e.target.value)} className="w-full !border !border-gray-300 p-2 rounded">
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

                {/* Deadline */}
                <div>
                    <label className="block font-semibold mb-1">Deadline</label>
                    <DatePicker
                        selected={getSelectedDate()}
                        onChange={handleDeadlineChange}
                        showTimeSelect
                        dateFormat="dd.MM.yyyy hh:mm aa"
                        filterTime={filterPastTimes}
                        className="!border !border-gray-300 p-2 rounded w-full"
                        minDate={new Date()}
                        placeholderText="Select deadline"
                        required
                    />
                </div>

                {/* Buttons */}
                <div className="flex justify-between mt-6">
                    <button type="reset" onClick={resetOrder} className="bg-yellow-500 text-white px-4 py-2 rounded">Reset</button>
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Create Order</button>
                </div>
            </form>

            {/* Color Change Modal */}
            <dialog id="colorChange" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => handleServiceRemove('Color change')}>✕</button>
                    </form>
                    <h3 className="text-lg font-bold">Color Change Instructions</h3>
                    <form onSubmit={handleColorChange} className="mt-4">
                        <textarea name="colorChange" rows="3" className="w-full border p-2 rounded" />
                        <button type="submit" className="bg-indigo-600 text-white mt-3 px-3 py-1 rounded">Save</button>
                    </form>
                </div>
            </dialog>

            {/* Image Resize Modal */}
            <dialog id="imageResizing" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => handleServiceRemove('Image resizing')}>✕</button>
                    </form>
                    <h3 className="text-lg font-bold">Image Resize Instructions</h3>
                    <form onSubmit={handleImageResize} className="mt-4">
                        <textarea name="imageResizing" rows="3" className="w-full border p-2 rounded" />
                        <button type="submit" className="bg-indigo-600 text-white mt-3 px-3 py-1 rounded">Save</button>
                    </form>
                </div>
            </dialog>

            {/* Custom Service Modal */}
            <dialog id="customServiceModal" className="modal">
                <div className="modal-box">
                    <h3 className="text-lg font-bold">Add Custom Service</h3>
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => setCustomService('')}>✕</button>
                    </form>
                    <form onSubmit={handleCustomServiceSubmit} className="mt-4">
                        <input type="text" value={customService} onChange={(e) => setCustomService(e.target.value)} className="w-full border p-2 rounded" required />
                        <button type="submit" className="bg-indigo-600 text-white mt-3 px-3 py-1 rounded">Add</button>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default CreateLocalOrder;
