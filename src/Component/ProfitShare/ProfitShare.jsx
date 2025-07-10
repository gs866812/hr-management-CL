import { useContext, useEffect, useState } from 'react';
import { ContextData } from '../../DataProvider';
import YearlySummary from './YearlySummary';
import useAxiosProtect from '../../utils/useAxiosProtect';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { useDispatch, useSelector } from 'react-redux';
import { setRefetch } from '../../redux/refetchSlice';
import { TbTransactionDollar } from "react-icons/tb";
import { toast } from 'react-toastify';
import moment from 'moment';

const ProfitShare = () => {
    const { user, currentUser } = useContext(ContextData);
    const axiosProtect = useAxiosProtect();
    const axiosSecure = useAxiosSecure();
    const dispatch = useDispatch();
    const refetch = useSelector(state => state.refetch.refetch);

    const [shareHolders, setShareHolders] = useState([]);
    const [shareHolderInfo, setShareHolderInfo] = useState([]);
    const [availableMonths, setAvailableMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [monthlyProfitBalance, setMonthlyProfitBalance] = useState(0);
    const [profitBalance, setProfitBalance] = useState('');

    useEffect(() => {
        const fetchShareHolders = async () => {
            try {
                const response = await axiosProtect.get('/getShareHolders', {
                    params: { userEmail: user?.email },
                });
                setShareHolders(response.data);
            } catch (error) {
                toast.error('Error fetching shareholders');
            }
        };
        fetchShareHolders();
    }, [refetch]);

    useEffect(() => {
        const fetchMonths = async () => {
            try {
                const res = await axiosProtect.get('/getMonthlyProfit', {
                    params: { userEmail: user?.email },
                });
                setAvailableMonths(res.data);
            } catch (error) {
                toast.error('Failed to load monthly profits');
            }
        };
        fetchMonths();
    }, []);

    useEffect(() => {
        const fetchShareHolderInfo = async () => {
            try {
                const response = await axiosProtect.get('/getShareholderInfo', {
                    params: { userEmail: user?.email },
                });
                setShareHolderInfo(response.data);
            } catch (error) {
                toast.error('Error fetching share info');
            }
        };
        fetchShareHolderInfo();
    }, [refetch]);

    const handleMonthChange = (e) => {
        const value = e.target.value;
        setSelectedMonth(value);
        const [month, year] = value.split('-');
        const match = availableMonths.find(item => item.month === month && item.year === year);
        setMonthlyProfitBalance(match?.profit || 0);
    };

    const numberFormat = (num) => {
        return Number(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handleDistributeProfit = async (e) => {
        e.preventDefault();
        if (!selectedMonth || !profitBalance) {
            toast.error('Please fill all required fields');
            return;
        }

        const [month, year] = selectedMonth.split('-');
        const sharedAmount = parseFloat(profitBalance);

        console.log(month, year, sharedAmount, monthlyProfitBalance);

        if (sharedAmount > monthlyProfitBalance) {
            toast.error('Cannot share more than available monthly profit');
            return;
        }

        try {
            const res = await axiosSecure.post('/addMonthlyProfitDistribution', {
                month,
                year,
                sharedAmount,
                userName: currentUser?.userName
            });

            if (res.data.insertedCount) {
                toast.success('Profit distributed successfully!');
                dispatch(setRefetch(!refetch));
                setProfitBalance('');
                setSelectedMonth('');
                setMonthlyProfitBalance(0);
                document.getElementById('share-profit-modal').close();
            } else {
                toast.error('Distribution failed');
            }
        } catch (error) {
            toast.error('Error sharing profit');
        }
    };

    return (
        <div>
            <section className='rounded-md'>
                <YearlySummary />
            </section>

            <section className='flex flex-wrap gap-4 justify-center my-10'>
                {
                    shareHolders.map((holder, i) => (
                        <div key={i} className='flex border rounded-md shadow-lg border-gray-300'>
                            <div className='flex flex-col items-center gap-2 p-4'>
                                <img src={holder?.userImage} alt="" className='w-10 h-10 rounded-full border' />
                                <h1 className='text-xl font-bold'>{holder?.shareHoldersName}</h1>
                                <h1 className='font-semibold'>{holder?.mobile}</h1>
                                <h1 className='text-sm font-semibold'>{holder?.email}</h1>
                                <button
                                    className='border py-1 px-2 rounded my-2'
                                    onClick={() => window.open(`/shareholder-details/${holder._id}`, '_blank')}
                                >
                                    View details
                                </button>
                            </div>
                        </div>
                    ))
                }
            </section>

            <section className='flex justify-end'>
                <button className="bg-[#6E3FF3] text-white px-4 py-2 rounded" onClick={() => document.getElementById('share-profit-modal').showModal()}>
                    <span className='flex items-center gap-2'>
                        <TbTransactionDollar />
                        Share profit
                    </span>
                </button>
            </section>

            {/* Table */}
            <section>
                <div className="overflow-x-auto mt-5 mb-5">
                    <table className="table table-zebra">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Name</th>
                                <th>Mobile</th>
                                <th>Share(%)</th>
                                <th>Profit Balance</th>
                                <th>User</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                shareHolderInfo.length > 0 ? (
                                    shareHolderInfo.map((info, i) => (
                                        <tr key={i}>
                                            <td>{moment(info.date).format('DD-MMM-YYYY')}</td>
                                            <td>{info.name}</td>
                                            <td>{info.mobile}</td>
                                            <td>{info.sharedPercent}</td>
                                            <td>{numberFormat(info.sharedProfitBalance)}</td>
                                            <td>{info.userName}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center">No record found</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Modal */}
            <dialog id="share-profit-modal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 bg-[#6E3FF3] text-white hover:bg-red-500">✕</button>
                    </form>
                    <h3 className="font-bold text-lg mb-3">Distribute Monthly Profit</h3>

                    <form onSubmit={handleDistributeProfit} className="space-y-4">

                        <div>
                            <label className='block font-semibold'>Select month:</label>
                            <select
                                required
                                value={selectedMonth}
                                onChange={handleMonthChange}
                                className='!border !border-gray-300 px-3 py-2 rounded w-full'
                            >
                                <option value="">Select month</option>
                                {availableMonths.map((m, i) => (
                                    <option key={i} value={`${m.month}-${m.year}`}>
                                        {m.month} {m.year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className='block font-semibold'>Available Profit for selected month:</label>
                            <input
                                type="text"
                                readOnly
                                value={numberFormat(monthlyProfitBalance || 0)}
                                className='border px-3 py-2 rounded w-full bg-gray-100'
                            />
                        </div>

                        <div>
                            <label className='block font-semibold'>Amount to distribute:</label>
                            <input
                                type="number"
                                required
                                min={1}
                                max={monthlyProfitBalance}
                                value={profitBalance}
                                onChange={(e) => setProfitBalance(parseFloat(e.target.value))}
                                className='!border !border-gray-300 px-3 py-2 rounded w-full'
                            />
                        </div>

                        <button
                            type="submit"
                            className='bg-[#6E3FF3] text-white px-4 py-2 rounded font-semibold cursor-pointer'
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default ProfitShare;
