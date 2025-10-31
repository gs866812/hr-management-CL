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
        company: '',
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

                const isMissingInfo =
                    !data.name || !data.address || !data.companyName;

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
                },
            });
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

    const handleSaveClient = async () => {
        try {
            // ensure clientId exists
            if (!clientId) {
                toast.warning('Client ID is missing');
                return;
            }

            const payload = {
                clientID: clientId,
                name: tempClientData.name?.trim() || clientInfo?.name || '',
                companyName:
                    tempClientData.company?.trim() ||
                    clientInfo?.companyName ||
                    '',
                address:
                    tempClientData.address?.trim() || clientInfo?.address || '',
            };

            const { data } = await axiosProtect.put('/update-client', payload);

            if (data?.success) {
                toast.success('Client info updated successfully');
                setClientInfo(data.updatedClient); // 👈 update state with new data
            } else {
                toast.warning(data?.message || 'Update may not have succeeded');
            }

            setShowClientPopup(false);
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
        const violet = [111, 66, 193];

        // ============ HEADER ============

        // 🖼️ Company Logo - Made bigger
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
            // Increased logo size from 120x40 to 150x50
            doc.addImage(img, 'PNG', margin, 20, 150, 50);
        } catch (err) {
            console.warn('Logo failed to load.');
        }

        // Invoice title and meta
        const invoiceNumber = `INV-${new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, '')}-001`;
        const exportDate = new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(...violet);
        doc.text('INVOICE', pageWidth - margin - 100, 40);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`#${invoiceNumber}`, pageWidth - margin - 100, 58);
        doc.text(`Date: ${exportDate}`, pageWidth - margin - 100, 72);

        // ============ BILL TO SECTION ============

        const billY = 100;
        doc.setDrawColor(220, 220, 220);
        doc.roundedRect(margin, billY, pageWidth - margin * 2, 70, 6, 6, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...violet);
        doc.text('BILL TO', margin + 15, billY + 20);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        doc.text(`${clientInfo?.name || 'N/A'}`, margin + 15, billY + 38);
        doc.text(
            `${clientInfo?.companyName || 'N/A'}`,
            margin + 15,
            billY + 52
        );
        doc.text(`${clientInfo?.address || 'N/A'}`, margin + 15, billY + 66);

        // ============ TABLE ============

        const tableColumn = [
            'Date',
            'Order Name',
            'Image QTY',
            'Price (USD)',
            'Deadline',
            'Status',
        ];

        const tableRows = selectedData.map((o, i) => [
            o.date || '—',
            o.orderName,
            o.orderQTY,
            `$${o.orderPrice}`,
            o.orderDeadLine,
            o.orderStatus,
        ]);

        autoTable(doc, {
            startY: 190,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: {
                fillColor: [245, 245, 245], // ✅ light gray background
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineWidth: 0.2,
                lineColor: [200, 200, 200],
                fontSize: 9.5,
            },
            bodyStyles: {
                textColor: [60, 60, 60],
                fontSize: 9,
                cellPadding: 6,
                lineWidth: 0.2,
                lineColor: [230, 230, 230],
            },
            alternateRowStyles: {
                fillColor: [250, 250, 250],
            },
            columnStyles: {
                5: { halign: 'center' },
            },
            styles: { overflow: 'linebreak' },
        });

        // ============ FOOTER ============

        const pageHeight = doc.internal.pageSize.height;

        // Full width border top
        doc.setDrawColor(230, 230, 230);
        doc.line(0, pageHeight - 60, pageWidth, pageHeight - 60); // Changed to full width

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);

        // Centered text for footer
        const footerText1 =
            'Thank you for your business. If you have any questions about this invoice, contact us at info@webbriks.com.';
        const footerText2 = 'Web Briks LLC — Excellence in Editing and Design';

        // Center align both footer lines
        const textWidth1 = doc.getTextWidth(footerText1);
        const textWidth2 = doc.getTextWidth(footerText2);

        doc.text(footerText1, (pageWidth - textWidth1) / 2, pageHeight - 30);
        doc.text(footerText2, (pageWidth - textWidth2) / 2, pageHeight - 10);

        // ============ SAVE FILE ============
        const fileName = `Invoice_${
            clientInfo?.companyName?.replace(/\s+/g, '_') || 'Client'
        }_${invoiceNumber}.pdf`;
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

            {/* Export Button */}
            <div className="mt-6 text-right">
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

            {/* Client Info Popup */}
            {showClientPopup && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h3 className="text-lg font-semibold text-violet-600 mb-4">
                            Complete Client Information
                        </h3>
                        <input
                            type="text"
                            placeholder="Client Name"
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
                        <input
                            type="text"
                            placeholder="Company Name"
                            className="input border-2! w-full mb-2"
                            required
                            value={tempClientData.company}
                            onChange={(e) =>
                                setTempClientData({
                                    ...tempClientData,
                                    company: e.target.value,
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
