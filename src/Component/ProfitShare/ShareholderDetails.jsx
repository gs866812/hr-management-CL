import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { toast } from 'react-toastify';
import moment from 'moment';

const ShareholderDetails = () => {
    const { id } = useParams();
    const axiosProtect = useAxiosProtect();
    const [shareholderHistory, setShareholderHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShareholder = async () => {
            try {
                const response = await axiosProtect.get(`/getSingleShareholder/${id}`);
                setShareholderHistory(response.data);
            } catch (error) {
                toast.error('Failed to fetch shareholder info');
            } finally {
                setLoading(false);
            }
        };

        fetchShareholder();
    }, [id]);

    const numberFormat = (num) =>
        Number(num).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    if (loading) return <div className='text-center mt-10 font-bold'>Loading...</div>;

    if (!shareholderHistory || shareholderHistory.length === 0)
        return <div className='text-center mt-10 text-red-500'>No data found</div>;

    // Get common info from the first item
    const { name, email, mobile } = shareholderHistory[0];
    const totalShared = shareholderHistory.reduce((sum, item) => sum + item.sharedProfitBalance, 0);

    return (
        <div className='max-w-5xl mx-auto mt-10 p-6 border rounded shadow'>
            <h2 className='text-2xl font-bold mb-6 text-center'>Shareholder Summary</h2>

            <div className='grid md:grid-cols-3 gap-4 mb-8 bg-gray-100 p-4 rounded'>
                <p><strong>Name:</strong> {name}</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Mobile:</strong> {mobile}</p>
                <p><strong>Total Shares:</strong> {shareholderHistory.length}</p>
                <p><strong>Total Shared Profit:</strong> {numberFormat(totalShared)} BDT</p>
            </div>

            <div className="overflow-x-auto">
                <table className="table table-zebra w-full text-sm">
                    <thead className='bg-gray-200'>
                        <tr>
                            <th>Date</th>
                            <th>Shared %</th>
                            <th>
                                {mobile === '01795616265'? 'Transfer Amount' : 'Profit Amount'}
                            </th>
                            <th>Total Profit</th>
                            <th>Month</th>
                            <th>User</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shareholderHistory.map((record, index) => (
                            <tr key={index}>
                                <td>{moment(record.date).format('DD-MMM-yyyy')}</td>
                                <td>{record.sharedPercent}%</td>
                                <td>
                                    {numberFormat(
                                        record.sharedProfitBalance ?? record.transferProfitBalance
                                    )}
                                </td>

                                <td>{numberFormat(record.totalProfitBalance)}</td>
                                <td>{record.month}</td>
                                <td>{record.userName}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ShareholderDetails;
