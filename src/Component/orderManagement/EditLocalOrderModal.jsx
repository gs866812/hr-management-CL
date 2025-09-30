import React, { useContext, useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import moment from "moment-timezone";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setRefetch } from "../../redux/refetchSlice";
import { ContextData } from "../../DataProvider";

import "react-datepicker/dist/react-datepicker.css";
import useAxiosProtect from "../../utils/useAxiosProtect";

const EditLocalOrderModal = ({ open, order, onClose, onUpdated }) => {
    const axiosProtect = useAxiosProtect();
    const dispatch = useDispatch();
    const { user } = useContext(ContextData);
    const refetch = useSelector((s) => s.refetch.refetch);

    const [submitting, setSubmitting] = useState(false);

    // Basic fields
    const [form, setForm] = useState({
        clientID: "",
        orderName: "",
        orderInstructions: "",
        returnFormat: "Original Format and BG",
        colorCode: "",
        imageResize: "",
    });

    // Dates
    const [orderDate, setOrderDate] = useState(null); // Date
    const [deadlineObj, setDeadlineObj] = useState(null); // { date: ISO, timezoneName }

    // Qty/Price
    const [orderQTY, setOrderQTY] = useState(0);
    const [imagePrice, setImagePrice] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [lastEdited, setLastEdited] = useState(null); // 'total' | 'ppi' | null

    // Services
    const [services, setServices] = useState([]);
    const [customService, setCustomService] = useState("");

    const serviceOptions = useMemo(
        () => [
            "Clipping path",
            "Multi clipping path",
            "Transparent background",
            "White background",
            "Color background",
            "Hair masking",
            "Single Selection",
            "Multi Selection",
            "Drop shadow",
            "Natural shadow",
            "Reflection shadow",
            "Image manipulation",
            "Neck join",
            "Ghost mannequin effect",
            "Basic retouching",
            "High-end retouching",
            "Jewelry retouching",
            "Skin retouching",
            "Color change",
            "Color correction",
            "Image resizing",
            "Raster to vector",
            "Lighting adjustment",
            "White balance",
            "BG and skin",
            "custom",
        ],
        []
    );

    // helpers
    const toNum = (v) => {
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : 0;
    };
    const round2 = (n) => (Number.isFinite(n) ? Number(n.toFixed(2)) : 0);

    // Load modal with existing order
    useEffect(() => {
        if (!open || !order) return;

        setForm({
            clientID: order.clientID || "",
            orderName: order.orderName || "",
            orderInstructions: order.orderInstructions || "",
            returnFormat: order.returnFormat || "Original Format and BG",
            colorCode: order.colorCode || "",
            imageResize: order.imageResize || "",
        });

        // order date (stored as "DD-MMM-YYYY")
        if (order.date) {
            setOrderDate(moment(order.date, "DD-MMM-YYYY").toDate());
        } else {
            setOrderDate(null);
        }

        // deadline (stored as "DD-MMM-YYYY HH:mm:ss")
        if (order.orderDeadLine) {
            const m = moment(order.orderDeadLine, "DD-MMM-YYYY HH:mm:ss");
            setDeadlineObj({
                date: m.toDate().toISOString(),
                timezoneName: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });
        } else {
            setDeadlineObj(null);
        }

        // qty & prices
        const qty = toNum(order.orderQTY ?? 0);
        const total = toNum(order.orderPrice ?? 0);
        setOrderQTY(qty);
        setTotalPrice(total);
        setImagePrice(qty > 0 ? round2(total / qty) : 0);
        setLastEdited(null);

        // services
        setServices(Array.isArray(order.needServices) ? order.needServices : []);
        setCustomService("");
    }, [open, order]); // eslint-disable-line

    // deadline picker helpers
    const getDeadlineDate = () => (deadlineObj ? new Date(deadlineObj.date) : null);
    const filterPastTimes = (time) => moment(time).isSameOrAfter(moment());
    const handleDeadlineChange = (date) => {
        const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setDeadlineObj({ date: date.toISOString(), timezoneName });
    };

    // services
    const handleServiceChange = (e) => {
        const selected = e.target.value;
        if (!selected) return;
        if (selected === "custom") {
            document.getElementById("editCustomServiceModal").showModal();
            return;
        }
        if (!services.includes(selected)) {
            setServices((prev) => [...prev, selected]);
            if (selected === "Color change") document.getElementById("editColorChangeModal").showModal();
            if (selected === "Image resizing") document.getElementById("editImageResizingModal").showModal();
        }
    };

    const removeService = (s) => {
        setServices((prev) => prev.filter((x) => x !== s));
        if (s === "Color change") setForm((f) => ({ ...f, colorCode: "" }));
        if (s === "Image resizing") setForm((f) => ({ ...f, imageResize: "" }));
    };

    // qty/price coupling
    const handleQtyChange = (e) => {
        const val = e.target.value;
        setOrderQTY(val);
        const qty = toNum(val);
        if (qty <= 0) return;
        if (lastEdited === "total") {
            const tp = toNum(totalPrice);
            setImagePrice(qty > 0 ? round2(tp / qty) : 0);
        } else if (lastEdited === "ppi") {
            const ppi = toNum(imagePrice);
            setTotalPrice(round2(ppi * qty));
        }
    };

    const handleTotalChange = (e) => {
        setLastEdited("total");
        const val = e.target.value;
        setTotalPrice(val);
        const qty = toNum(orderQTY);
        const tp = toNum(val);
        setImagePrice(qty > 0 ? round2(tp / qty) : 0);
    };

    const handlePPIChange = (e) => {
        setLastEdited("ppi");
        const val = e.target.value;
        setImagePrice(val);
        const qty = toNum(orderQTY);
        const ppi = toNum(val);
        setTotalPrice(qty > 0 ? round2(ppi * qty) : 0);
    };

    // submit
    const handleSave = async (e) => {
        e.preventDefault();
        if (!order?._id) return;
        if (
            ["Completed", "Delivered"].includes(String(order?.orderStatus)) ||
            order?.isLocked
        ) {
            toast.error("This order is locked/completed/delivered and cannot be edited.");
            return;
        }
        try {
            setSubmitting(true);

            const selectedDate = orderDate
                ? moment(orderDate).format("DD-MMM-YYYY")
                : order?.date || moment().format("DD-MMM-YYYY");

            const deadlineMoment = deadlineObj
                ? moment(deadlineObj.date).tz(deadlineObj.timezoneName)
                : null;

            const newDeadline = deadlineMoment
                ? deadlineMoment.format("DD-MMM-YYYY HH:mm:ss")
                : "";

            // EXCLUDES orderStatus & userName (by requirement)
            const payload = {
                clientID: form.clientID,
                orderName: form.orderName,
                orderInstructions: form.orderInstructions,
                returnFormat: form.returnFormat,
                colorCode: form.colorCode,
                imageResize: form.imageResize,
                date: selectedDate,
                orderQTY: toNum(orderQTY),
                orderPrice: toNum(totalPrice),
                needServices: services,
                orderDeadLine: newDeadline,
            };

            const { data } = await axiosProtect.put(
                `/orders/${order._id}/edit`,
                payload,
                { params: { userEmail: user?.email } }
            );

            toast.success(data?.message || "Order updated");
            dispatch(setRefetch(!refetch));
            onUpdated?.();
            onClose?.();
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Failed to save changes";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (!open || !order) return null;

    return (
        <dialog id="editLocalOrderModal" open className="modal">
            <div className="modal-box max-w-3xl">
                <form method="dialog">
                    <button
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </form>

                <h3 className="text-lg font-bold mb-4">Edit Order</h3>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-semibold mb-1">Order Date</label>
                            <DatePicker
                                selected={orderDate}
                                onChange={(d) => setOrderDate(d)}
                                dateFormat="dd-MMM-yyyy"
                                className="!border !border-gray-300 p-2 rounded w-full"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold mb-1">Deadline</label>
                            <DatePicker
                                selected={getDeadlineDate()}
                                onChange={handleDeadlineChange}
                                showTimeSelect
                                dateFormat="dd.MM.yyyy hh:mm aa"
                                filterTime={filterPastTimes}
                                className="!border !border-gray-300 p-2 rounded w-full"
                                placeholderText="Select deadline"
                            />
                        </div>
                    </div>

                    {/* Basic */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-semibold">Client ID</label>
                            <input
                                type="text"
                                className="w-full !border !border-gray-300 p-2 rounded"
                                value={form.clientID}
                                onChange={(e) => setForm((f) => ({ ...f, clientID: e.target.value }))}
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-semibold">Order Name</label>
                            <input
                                type="text"
                                className="w-full !border !border-gray-300 p-2 rounded"
                                value={form.orderName}
                                onChange={(e) => setForm((f) => ({ ...f, orderName: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    {/* Qty/Price */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block font-semibold">Order QTY</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full !border !border-gray-300 p-2 rounded"
                                value={orderQTY}
                                onChange={handleQtyChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-semibold">Total Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full !border !border-gray-300 p-2 rounded"
                                value={totalPrice}
                                onChange={handleTotalChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-semibold">Price per Image ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full !border !border-gray-300 p-2 rounded"
                                value={imagePrice}
                                onChange={handlePPIChange}
                            />
                        </div>
                    </div>

                    {/* Instructions */}
                    <div>
                        <label className="block font-semibold">Instructions</label>
                        <textarea
                            rows={3}
                            className="w-full !border !border-gray-300 p-2 rounded"
                            value={form.orderInstructions}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, orderInstructions: e.target.value }))
                            }
                        />
                    </div>

                    {/* Services & Return */}
                    <div>
                        <label className="block font-semibold mb-1">Select Services</label>
                        <select
                            value=""
                            onChange={handleServiceChange}
                            className="w-full !border !border-gray-300 p-2 rounded"
                        >
                            <option value="">Select services</option>
                            {serviceOptions.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>

                        <div className="flex flex-wrap mt-2 gap-2">
                            {services.map((s) => (
                                <span
                                    key={s}
                                    className="bg-blue-600 text-white text-sm px-2 py-1 rounded-full flex items-center gap-1"
                                >
                                    {s}
                                    <button
                                        type="button"
                                        onClick={() => removeService(s)}
                                        className="ml-1 text-white bg-red-500 rounded-full px-1"
                                    >
                                        x
                                    </button>
                                </span>
                            ))}
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-semibold mb-1">Returned File Format</label>
                                <select
                                    value={form.returnFormat}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, returnFormat: e.target.value }))
                                    }
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

                            <div>
                                <label className="block font-semibold mb-1">Color Change Instructions</label>
                                <textarea
                                    rows={2}
                                    className="w-full !border !border-gray-300 p-2 rounded"
                                    placeholder="e.g., #FF0000 to #00FF00"
                                    value={form.colorCode}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, colorCode: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block font-semibold mb-1">Image Resize Instructions</label>
                            <textarea
                                rows={2}
                                className="w-full !border !border-gray-300 p-2 rounded"
                                placeholder="e.g., 2000x2000px @ 300dpi"
                                value={form.imageResize}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, imageResize: e.target.value }))
                                }
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn bg-[#6E3FF3] text-white" disabled={submitting}>
                            {submitting ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </form>
            </div>

            {/* auxiliary modals */}
            <dialog id="editCustomServiceModal" className="modal">
                <div className="modal-box">
                    <h3 className="text-lg font-bold">Add Custom Service</h3>
                    <form method="dialog">
                        <button
                            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                            onClick={() => setCustomService("")}
                        >
                            ✕
                        </button>
                    </form>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (customService && !services.includes(customService)) {
                                setServices((prev) => [...prev, customService]);
                            }
                            setCustomService("");
                            document.getElementById("editCustomServiceModal").close();
                        }}
                        className="mt-4"
                    >
                        <input
                            type="text"
                            value={customService}
                            onChange={(e) => setCustomService(e.target.value)}
                            className="w-full border p-2 rounded"
                            required
                        />
                        <button type="submit" className="bg-indigo-600 text-white mt-3 px-3 py-1 rounded">
                            Add
                        </button>
                    </form>
                </div>
            </dialog>

            <dialog id="editColorChangeModal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button
                            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                            onClick={() => removeService("Color change")}
                        >
                            ✕
                        </button>
                    </form>
                    <h3 className="text-lg font-bold">Color Change Instructions</h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            document.getElementById("editColorChangeModal").close();
                        }}
                        className="mt-4"
                    >
                        <textarea
                            rows="3"
                            className="w-full border p-2 rounded"
                            value={form.colorCode}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, colorCode: e.target.value }))
                            }
                        />
                        <button type="submit" className="bg-indigo-600 text-white mt-3 px-3 py-1 rounded">
                            Save
                        </button>
                    </form>
                </div>
            </dialog>

            <dialog id="editImageResizingModal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button
                            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                            onClick={() => removeService("Image resizing")}
                        >
                            ✕
                        </button>
                    </form>
                    <h3 className="text-lg font-bold">Image Resize Instructions</h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            document.getElementById("editImageResizingModal").close();
                        }}
                        className="mt-4"
                    >
                        <textarea
                            rows="3"
                            className="w-full border p-2 rounded"
                            value={form.imageResize}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, imageResize: e.target.value }))
                            }
                        />
                        <button type="submit" className="bg-indigo-600 text-white mt-3 px-3 py-1 rounded">
                            Save
                        </button>
                    </form>
                </div>
            </dialog>
        </dialog>
    );
};

export default EditLocalOrderModal;
