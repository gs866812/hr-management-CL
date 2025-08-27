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
    const { user, currentUser } = useContext(ContextData);
    const axiosSecure = useAxiosSecure();
    const axiosProtect = useAxiosProtect();
    const dispatch = useDispatch();
    const refetch = useSelector(state => state.refetch.refetch);
    const navigate = useNavigate();

    const [clientID, setClientID] = useState([]);
    const [deadline, setDeadline] = useState(null);

    // --- pricing states ---
    const [orderQuantity, setOrderQuantity] = useState(0);
    const [imagePrice, setImagePrice] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [lastEdited, setLastEdited] = useState(null); // 'total' | 'ppi' | null

    const [services, setServices] = useState([]);
    const [customService, setCustomService] = useState('');
    const [returnFile, setReturnFile] = useState('Original Format and BG');
    const [colorChangeInstruction, setColorChangeInstruction] = useState('');
    const [imageResizeInstruction, setImageResizeInstruction] = useState('');

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetch]);

    // --- Bi-directional pricing logic ---
    const toNum = (v) => {
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : 0;
    };
    const round2 = (n) => Number.isFinite(n) ? Number(n.toFixed(2)) : 0;

    const handleQtyChange = (e) => {
        const val = e.target.value;
        setOrderQuantity(val);
        const qty = toNum(val);
        if (qty <= 0) return;

        if (lastEdited === 'total') {
            const tp = toNum(totalPrice);
            setImagePrice(qty > 0 ? round2(tp / qty) : 0);
        } else if (lastEdited === 'ppi') {
            const ppi = toNum(imagePrice);
            setTotalPrice(round2(ppi * qty));
        }
    };

    const handleTotalPriceChange = (e) => {
        const val = e.target.value;
        setLastEdited('total');
        setTotalPrice(val);

        const qty = toNum(orderQuantity);
        const tp = toNum(val);
        if (qty > 0) {
            setImagePrice(round2(tp / qty));
        } else {
            setImagePrice(0);
        }
    };

    const handleImagePriceChange = (e) => {
        const val = e.target.value;
        setLastEdited('ppi');
        setImagePrice(val);

        const qty = toNum(orderQuantity);
        const ppi = toNum(val);
        if (qty > 0) {
            setTotalPrice(round2(ppi * qty));
        } else {
            setTotalPrice(0);
        }
    };

    // Recalculate when quantity changes via other means (e.g., spinner arrows)
    useEffect(() => {
        const qty = toNum(orderQuantity);
        if (qty <= 0) return;
        if (lastEdited === 'total') {
            setImagePrice((prev) => {
                const tp = toNum(totalPrice);
                return round2(tp / qty);
            });
        } else if (lastEdited === 'ppi') {
            setTotalPrice((prev) => {
                const ppi = toNum(imagePrice);
                return round2(ppi * qty);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderQuantity]);

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
        setTotalPrice(0);
        setDeadline(null);
        setServices([]);
        setColorChangeInstruction('');
        setImageResizeInstruction('');
        setLastEdited(null);
    };

    const handleAssignOrder = async (e) => {
        e.preventDefault();

        const deadlineMoment = moment(deadline?.date).tz(deadline?.timezoneName);
        const newDeadline = deadlineMoment.format('DD-MMM-YYYY HH:mm:ss');
        const selectedOrderDate = formData.date
            ? moment(formData.date, "DD-MMM-YYYY").format("DD-MMM-YYYY HH:mm:ss")
            : moment().format("DD-MMM-YYYY HH:mm:ss");

        const updateOrder = {
            ...formData,
            date: selectedOrderDate,
            needServices: services,
            colorCode: colorChangeInstruction,
            imageResize: imageResizeInstruction,
            returnFormat: returnFile,
            orderQTY: orderQuantity,
            orderPrice: totalPrice,
            userName: currentUser?.userName,
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

            <form onSubmit={handleAssignOrder} className="bg-white shadow-md rounded-lg p-6 border border-gray-200 space-y-8">

                {/* Section: Dates */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Order Timing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Order Date */}
                        <div>
                            <label className="block font-semibold mb-1">Order Date</label>
                            <DatePicker
                                selected={formData.date ? moment(formData.date, "DD-MMM-YYYY").toDate() : null}
                                onChange={(date) =>
                                    setFormData({
                                        ...formData,
                                        date: moment(date).format("DD-MMM-YYYY")
                                    })
                                }
                                maxDate={new Date()}
                                dateFormat="dd-MMM-yyyy"
                                placeholderText="Select order date"
                                className="!border !border-gray-300 p-2 rounded w-full"
                                required
                            />
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
                    </div>
                </div>

                {/* Section: Order Info */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Order Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Client ID */}
                        <div>
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
                        </div>

                        {/* Order Name */}
                        <div>
                            <label className="block font-semibold">Order Name</label>
                            <input
                                type="text"
                                name="orderName"
                                onChange={handleChange}
                                className="w-full !border !border-gray-300 p-2 rounded"
                                required
                            />
                        </div>
                    </div>

                    {/* Quantity, Price, Total */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                        <div>
                            <label className="block font-semibold">Order QTY</label>
                            <input
                                type="number"
                                value={orderQuantity}
                                onChange={handleQtyChange}
                                min="0"
                                className="w-full !border !border-gray-300 p-2 rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-semibold">Total Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={totalPrice}
                                onChange={handleTotalPriceChange}
                                min="0"
                                className="w-full !border !border-gray-300 p-2 rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-semibold">Price per Image ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={imagePrice}
                                onChange={handleImagePriceChange}
                                min="0"
                                className="w-full !border !border-gray-300 p-2 rounded"
                            />
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="mt-4">
                        <label className="block font-semibold">Instructions</label>
                        <textarea
                            name="orderInstructions"
                            rows={3}
                            onChange={handleChange}
                            className="w-full !border !border-gray-300 p-2 rounded"
                        />
                    </div>
                </div>

                {/* Section: Services */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Services & Return Format</h3>

                    {/* Services */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Select Services</label>
                        <select
                            value=""
                            onChange={handleServiceChange}
                            className="w-full !border !border-gray-300 p-2 rounded"
                        >
                            <option value="">Select services</option>
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

                        {/* Selected services list */}
                        <div className="flex flex-wrap mt-2 gap-2">
                            {services.map((service, idx) => (
                                <span
                                    key={idx}
                                    className="bg-blue-600 text-white text-sm px-2 py-1 rounded-full flex items-center gap-1"
                                >
                                    {service}
                                    <button
                                        type="button"
                                        onClick={() => handleServiceRemove(service)}
                                        className="ml-1 text-white bg-red-500 rounded-full px-1"
                                    >x</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Return File Format */}
                    <div>
                        <label className="block font-semibold mb-1">Returned File Format</label>
                        <select
                            value={returnFile}
                            onChange={(e) => setReturnFile(e.target.value)}
                            className="w-full !border !border-gray-300 p-2 rounded"
                        >
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
                </div>

                {/* Buttons */}
                <div className="flex justify-between mt-6">
                    <button
                        type="reset"
                        onClick={resetOrder}
                        className="bg-yellow-500 text-white px-4 py-2 rounded"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded cursor-pointer"
                    >
                        Create Order
                    </button>
                </div>
            </form>

            {/* Color Change Modal */}
            <dialog id="colorChange" className="modal">
                <div className="modal-box">
                    <form method="dialog">
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
