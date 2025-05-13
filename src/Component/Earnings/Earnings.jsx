import React, { useContext, useEffect, useState } from 'react';
import { FaPlus, FaRegEdit } from 'react-icons/fa';
import EarningsModal from './EarningsModal';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { ContextData } from '../../DataProvider';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { setRefetch } from '../../redux/refetchSlice';
import EditEarningModal from './EditEarningModal';

const Earnings = () => {

    const { user } = useContext(ContextData);

    const [searchEarnings, setSearchEarnings] = useState('');
    const [earnings, SetEarnings] = useState([]);
    const [selectedEarning, setSelectedEarning] = useState(null);


    const axiosProtect = useAxiosProtect();
    const axiosSecure = useAxiosSecure();

    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);


    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const response = await axiosProtect.get(`/getEarnings`, {
                    params: {
                        userEmail: user?.email,
                    },
                });
                SetEarnings(response.data);
            } catch (error) {
                toast.error('Error fetching data:', error.message);
            }
        };
        fetchEarnings();
    }, [refetch]);


    const handleEditEarnings = (earning) => {
        setSelectedEarning(earning);
        document.getElementById('edit-earnings-modal').showModal();
    };

    return (
        <div className="mt-2">
            <section>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Earnings List
                    </h2>

                    <div className='flex items-center gap-2'>
                        <section>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="!border !border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                                value={searchEarnings}
                                onChange={(e) => setSearchEarnings(e.target.value)}
                            />

                        </section>
                        <section>
                            <button className="bg-[#6E3FF3] text-white px-4 rounded-md py-2 cursor-pointer" onClick={() => document.getElementById('add-new-earnings-modal').showModal()}>
                                <span className='flex items-center gap-2'>
                                    <FaPlus />
                                    Add new earnings
                                </span>
                            </button>
                        </section>
                    </div>
                </div>
            </section>

            <section>
                <div className="overflow-x-auto mt-5">
                    <table className="table table-zebra">
                        {/* head */}
                        <thead className='bg-[#6E3FF3] text-white'>
                            <tr>
                                <th>Date</th>
                                <th>Month</th>
                                <th>Client ID</th>
                                <th>Image QTY</th>
                                <th>Total USD</th>
                                <th>Converted Rate</th>
                                <th>BDT Balance</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                earnings.length > 0 ? (
                                    earnings.map((earningList, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{earningList.date || '00-00-0000'}</td>
                                                <td>{earningList.month}</td>
                                                <td>{earningList.clientId}</td>
                                                <td>{earningList.imageQty}</td>
                                                <td>
                                                    {earningList.totalUsd.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                                                </td>
                                                <td>
                                                    {earningList.convertRate.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                                                </td>
                                                <td>
                                                    {earningList.convertedBdt.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                                                </td>
                                                <td>{earningList.status}</td>
                                                <td className='w-[5%]'>
                                                    <div className='flex justify-center'>
                                                        <FaRegEdit className='cursor-pointer' onClick={() => handleEditEarnings(earningList)} />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center">No record found</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </section>
            <EarningsModal />
            <EditEarningModal
                selectedEarning={selectedEarning}
                setSelectedEarning={setSelectedEarning}
            />
        </div>
    );
};

export default Earnings;