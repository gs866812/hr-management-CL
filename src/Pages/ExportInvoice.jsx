'use client';
import { useState, useEffect } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import useAxiosProtect from '../utils/useAxiosProtect';
import { ContextData } from '../DataProvider';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

jsPDF.API.autoTable = autoTable;

export default function ExportInvoice() {
    const { user } = useContext(ContextData);
    const axiosProtect = useAxiosProtect();

    const [form, setForm] = useState({ month: '' });
    const [clients, setClients] = useState([]);
    const [clientId, setClientId] = useState('');
    const [clientInfo, setClientInfo] = useState(null);
    const [orders, setOrders] = useState([]);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [showClientPopup, setShowClientPopup] = useState(false);
    const [tempClientData, setTempClientData] = useState({
        name: '',
        address: '',
    });

    useEffect(() => {
        if (!form.month || !user?.email) return;

        (async () => {
            try {
                const { data } = await axiosProtect.get('/getClientsByMonth', {
                    params: {
                        userEmail: user.email,
                        selectedMonth: form.month.toLowerCase(),
                    },
                });

                if (data?.success) {
                    setClients(data.clients || []);
                } else {
                    setClients([]);
                    toast.info('No client data found for this month');
                }
            } catch (err) {
                toast.error(
                    err?.response?.data?.message || 'Failed to load clients'
                );
            }
        })();
    }, [form.month, user?.email, axiosProtect]);

    const fetchClient = async (id) => {
        try {
            const { data } = await axiosProtect.get(`/getClient/${id}`);
            if (data && data.clientID) {
                setClientInfo(data);

                const isMissingInfo = !data.name || !data.address;

                setShowClientPopup(isMissingInfo);
            } else {
                toast.error('Client not found');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load client info');
        }
    };

    const fetchOrders = async () => {
        try {
            if (!form.month || !clientId) return;
            const { data } = await axiosProtect.get('/getClientOrders', {
                params: {
                    month: form.month,
                    clientId,
                    size: 0,
                },
            });
            console.log(data);
            setOrders(data?.result || []);
        } catch (error) {
            toast.error('Failed to load orders');
        }
    };

    useEffect(() => {
        if (clientId) fetchClient(clientId);
    }, [clientId]);

    useEffect(() => {
        if (clientId && form.month) fetchOrders();
    }, [clientId, form.month]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedOrders(orders.map((o) => o._id));
        } else {
            setSelectedOrders([]);
        }
    };

    const handleSelect = (id) => {
        setSelectedOrders((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // 🪙 Determine currency symbol by client ID
    const euroClients = ['WB_1008_69', 'WB_1025_92'];
    const currencySymbol = euroClients.includes(clientId) ? '€' : '$';

    const handleSaveClient = async () => {
        try {
            if (!clientId) {
                toast.warning('Client ID is missing');
                return;
            }

            const payload = {
                clientID: clientId,
                name: tempClientData.name?.trim() || clientInfo?.name || '',
                address:
                    tempClientData.address?.trim() || clientInfo?.address || '',
            };

            const { data } = await axiosProtect.put('/update-client', payload);

            if (data?.success && data?.updatedClient) {
                toast.success('Client info updated successfully');

                // ✅ Update the client info directly from response
                setClientInfo(data.updatedClient);

                // ✅ Close the popup and clear temporary state
                setShowClientPopup(false);
                setTempClientData({ name: '', address: '' });
            } else {
                toast.warning(
                    data?.message || 'Unexpected response. Refetching...'
                );
                await fetchClient(clientId); // fallback to ensure latest data
            }
        } catch (error) {
            console.error(error);
            toast.error(
                error?.response?.data?.message || 'Failed to save client info'
            );
        }
    };

    const handleExportPDF = async () => {
        if (!selectedOrders.length) {
            toast.warning('No orders selected');
            return;
        }

        const selectedData = orders.filter((o) =>
            selectedOrders.includes(o._id)
        );

        if (!clientInfo) {
            toast.warning('Client information missing');
            return;
        }

        const doc = new jsPDF('p', 'pt', 'a4');
        const margin = 40;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const orange = [255, 138, 0];
        const teal = [0, 153, 153];
        const gray = [70, 70, 70];
        const lightGray = [240, 240, 240];
        const white = [255, 255, 255];

        // ===== HEADER =====
        doc.setFillColor(...white);
        doc.rect(0, 0, pageWidth, 140, 'F');
        doc.setFillColor(...orange);
        doc.rect(0, 0, pageWidth, 8, 'F');

        // ===== LOGO =====
        const logoUrl =
            'https://res.cloudinary.com/dny7zfbg9/image/upload/v1755954483/mqontecf1xao7znsh6cx.png';
        try {
            const img = await fetch(logoUrl)
                .then((res) => res.blob())
                .then(
                    (blob) =>
                        new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        })
                );
            const logo = new Image();
            logo.src = img;
            await new Promise((resolve) => {
                logo.onload = () => {
                    const desiredHeight = 70;
                    const aspectRatio = logo.width / logo.height;
                    const autoWidth = desiredHeight * aspectRatio;
                    doc.addImage(
                        img,
                        'PNG',
                        margin,
                        40,
                        autoWidth,
                        desiredHeight
                    );
                    resolve();
                };
            });
        } catch (err) {
            console.warn('⚠️ Logo failed to load.', err);
        }

        const invoiceNumber = `NO. 000001`;
        const exportDate = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(32);
        doc.setTextColor(...teal);
        doc.text('INVOICE', pageWidth - margin - 150, 65);
        doc.setFillColor(...orange);
        doc.rect(pageWidth - margin - 150, 72, 140, 4, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(...gray);
        doc.text(`Invoice No: ${invoiceNumber}`, pageWidth - margin - 150, 95);
        doc.text(`Date: ${exportDate}`, pageWidth - margin - 150, 110);

        // ===== BILL FROM / BILL TO =====
        const infoY = 135;
        const columnGap = 30;
        const boxWidth = (pageWidth - margin * 2 - columnGap) / 2;
        const baseBoxHeight = 85;
        const leftX = margin;
        const rightX = margin + boxWidth + columnGap;

        const fromAddressLines = [
            'Web Briks LLC',
            '1209 Mountain Road PL NE,' ,
            'STE R, Albuquerque, NM 87110, US',
        ];

        const toAddress = clientInfo?.address || 'Address not provided';
        const wrappedToAddress = doc.splitTextToSize(toAddress, boxWidth - 40);
        const wrappedName = doc.splitTextToSize(
            clientInfo?.name || 'Client',
            boxWidth - 40
        );
        const dynamicBoxHeight = Math.max(
            baseBoxHeight,
            50 + wrappedToAddress.length * 10
        );

        // BILL FROM BOX
        doc.setFillColor(...teal);
        doc.rect(leftX, infoY, boxWidth, dynamicBoxHeight, 'F');
        doc.setFillColor(...orange);
        doc.rect(leftX, infoY, 8, dynamicBoxHeight, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...white);
        doc.text('BILL FROM', leftX + 20, infoY + 18);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        let yFrom = infoY + 38;
        fromAddressLines.forEach((line) => {
            doc.text(line, leftX + 20, yFrom);
            yFrom += 12;
        });

        // BILL TO BOX
        doc.setFillColor(...orange);
        doc.rect(rightX, infoY, boxWidth, dynamicBoxHeight, 'F');
        doc.setFillColor(...teal);
        doc.rect(rightX, infoY, 8, dynamicBoxHeight, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...white);
        doc.text('BILL TO', rightX + 20, infoY + 18);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        let yTo = infoY + 38;
        wrappedName.forEach((line) => {
            doc.text(line, rightX + 20, yTo);
            yTo += 12;
        });
        doc.text(wrappedToAddress, rightX + 20, yTo);

        // ===== TABLE =====
        const tableY = infoY + dynamicBoxHeight + 35;
        const tableColumns = [
            'No.',
            'Date',
            'Order Name',
            'Image QTY',
            'Per Image',
            'Sub Total',
        ];

        const tableRows = selectedData.map((o, i) => {
            const qty = parseFloat(o.orderQTY) || 0;
            const total = parseFloat(o.orderPrice) || 0;
            const perImage = qty > 0 ? total / qty : 0;
            return [
                i + 1,
                o.date || '—',
                o.orderName,
                qty,
                `${currencySymbol}${perImage.toFixed(2)}`,
                `${currencySymbol}${total.toFixed(2)}`,
            ];
        });

        const totalAmount = selectedData.reduce(
            (acc, o) => acc + (parseFloat(o.orderPrice) || 0),
            0
        );

        autoTable(doc, {
            startY: tableY,
            head: [tableColumns],
            body: tableRows,
            theme: 'plain',
            showHead: 'firstPage',
            styles: {
                fontSize: 9,
                cellPadding: 8,
                textColor: [50, 50, 50],
                lineColor: [220, 220, 220],
                lineWidth: 0.5,
            },
            headStyles: {
                fillColor: teal,
                textColor: white,
                fontStyle: 'bold',
                halign: 'center',
            },
            alternateRowStyles: { fillColor: lightGray },
            tableWidth: 'auto',
            columnStyles: {
                0: { halign: 'center' },
                1: { halign: 'center' },
                2: { halign: 'left' },
                3: { halign: 'center' },
                4: { halign: 'center' },
                5: { halign: 'center' },
            },
            margin: { left: margin, right: margin },
        });

        const tableEndY = doc.lastAutoTable.finalY;

        // ===== TOTAL BLOCK =====
        const totalY = tableEndY + 25;
        const totalBlockWidth = 180;
        const totalBlockHeight = 38;
        const totalBlockX = pageWidth - margin - totalBlockWidth;

        doc.setFillColor(...orange);
        doc.rect(totalBlockX, totalY, totalBlockWidth, totalBlockHeight, 'F');
        doc.setFillColor(...teal);
        doc.rect(totalBlockX, totalY, 8, totalBlockHeight, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...white);
        doc.text('TOTAL', totalBlockX + 22, totalY + 22);
        doc.setFontSize(12);
        doc.text(
            `${currencySymbol}${totalAmount.toFixed(2)}`,
            pageWidth - margin - 12,
            totalY + 22,
            { align: 'right' }
        );

        // ===== FOOTER =====
        const footerY = pageHeight - 40;
        doc.setFillColor(...teal);
        doc.rect(0, footerY, pageWidth, 3, 'F');

        doc.setFontSize(9);
        doc.setTextColor(...gray);
        const footerText =
            'Web Briks LLC — Excellence in Editing and Design. For inquiry info@webbriks.com';
        const wrappedFooter = doc.splitTextToSize(footerText, pageWidth - 100);
        doc.text(wrappedFooter, pageWidth / 2, footerY + 25, {
            align: 'center',
        });

        doc.setFillColor(...orange);
        doc.circle(pageWidth / 2 - 200, footerY + 22, 2, 'F');
        doc.circle(pageWidth / 2 + 200, footerY + 22, 2, 'F');

        const fileName = `Invoice_${
            clientInfo?.name?.replace(/\s+/g, '_') || 'Client'
        }_${new Date().toISOString().slice(0, 10)}.pdf`;

        doc.save(fileName);
        toast.success('🧾 Invoice PDF exported successfully!');
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-violet-600 mb-6">
                Export Client Invoices
            </h2>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-4 mb-6 items-center">
                {/* Month Select */}
                <select
                    className="select border-2! border-violet-600! focus:outline-none font-medium"
                    value={form.month}
                    onChange={(e) =>
                        setForm({ ...form, month: e.target.value })
                    }
                >
                    <option value="">Select Month</option>
                    {[
                        'January',
                        'February',
                        'March',
                        'April',
                        'May',
                        'June',
                        'July',
                        'August',
                        'September',
                        'October',
                        'November',
                        'December',
                    ].map((m) => (
                        <option key={m}>{m}</option>
                    ))}
                </select>

                {/* Client Select */}
                <select
                    className="select border-2! border-violet-600! focus:outline-none font-medium"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                >
                    <option value="">Select Client ID</option>
                    {clients.map((c) => (
                        <option key={c.clientID} value={c.clientID}>
                            {c.clientID}
                        </option>
                    ))}
                </select>

                <button
                    className="btn bg-violet-600 hover:bg-violet-700 text-white"
                    onClick={fetchOrders}
                >
                    Load Orders
                </button>
                {/* Export Button */}
                <div className="text-right">
                    <button
                        className={`btn flex items-center gap-2 text-white ${
                            selectedOrders.length
                                ? 'bg-violet-600 hover:bg-violet-700'
                                : 'btn-disabled bg-gray-400'
                        }`}
                        disabled={!selectedOrders.length}
                        onClick={handleExportPDF}
                    >
                        <FaFilePdf />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            {orders.length > 0 ? (
                <div className="overflow-x-auto border rounded-lg">
                    <table className="table table-zebra w-full">
                        <thead className="bg-violet-600 text-white">
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedOrders.length ===
                                            orders.length
                                        }
                                        onChange={handleSelectAll}
                                        className="checkbox checkbox-sm bg-white"
                                    />
                                </th>
                                <th>Date</th>
                                <th>Client ID</th>
                                <th>Order Name</th>
                                <th>Image QTY</th>
                                <th>Order Price</th>
                                <th>Deadline</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o) => (
                                <tr key={o._id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.includes(
                                                o._id
                                            )}
                                            onChange={() => handleSelect(o._id)}
                                            className="checkbox checkbox-sm border-2! border-violet-600!"
                                        />
                                    </td>
                                    <td>{o.date || '—'}</td>
                                    <td>{o.clientID}</td>
                                    <td>{o.orderName}</td>
                                    <td>{o.orderQTY}</td>
                                    <td>{o.orderPrice}</td>
                                    <td>{o.orderDeadLine}</td>
                                    <td>
                                        <span
                                            className={`badge ${
                                                o.orderStatus === 'Delivered'
                                                    ? 'badge-success'
                                                    : o.orderStatus === 'Hold'
                                                    ? 'badge-warning'
                                                    : 'badge-info'
                                            }`}
                                        >
                                            {o.orderStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500 mt-6 text-center">
                    No orders found. Select a month and client to view orders.
                </p>
            )}

            {/* Client Info Popup */}
            {showClientPopup && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h3 className="text-lg font-semibold text-violet-600 mb-4">
                            Complete Client Information
                        </h3>
                        <input
                            type="text"
                            placeholder="Client name or company name"
                            className="input border-2! w-full mb-2"
                            required
                            value={tempClientData.name}
                            onChange={(e) =>
                                setTempClientData({
                                    ...tempClientData,
                                    name: e.target.value,
                                })
                            }
                        />
                        <textarea
                            placeholder="Address"
                            className="textarea border-2! w-full mb-3"
                            value={tempClientData.address}
                            required
                            onChange={(e) =>
                                setTempClientData({
                                    ...tempClientData,
                                    address: e.target.value,
                                })
                            }
                        ></textarea>
                        <div className="flex justify-end gap-2">
                            <button
                                className="btn btn-sm"
                                onClick={() => setShowClientPopup(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-sm bg-violet-600 hover:bg-violet-700 text-white"
                                onClick={handleSaveClient}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
