import { useContext, useEffect, useState } from 'react';
import { ContextData } from '../../DataProvider';
import YearlySummary from './YearlySummary';
import useAxiosProtect from '../../utils/useAxiosProtect';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { useDispatch, useSelector } from 'react-redux';
import { setRefetch } from '../../redux/refetchSlice';
import { TbTransactionDollar } from "react-icons/tb";
import { IoMdPersonAdd } from "react-icons/io";
import { toast } from 'react-toastify';
import moment from 'moment';
import { FaMoneyBillTransfer } from 'react-icons/fa6';

const ProfitShare = () => {
    const { user, currentUser, mainBalance, unpaidAmount, totalExpense, sharedProfit } = useContext(ContextData);
    const axiosProtect = useAxiosProtect();
    const axiosSecure = useAxiosSecure();
    const dispatch = useDispatch();
    const refetch = useSelector(state => state.refetch.refetch);

    const [shareHolders, setShareHolders] = useState([]);
    const [shareHolderInfo, setShareHolderInfo] = useState([]);
    const [availableMonths, setAvailableMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [monthlyProfitBalance, setMonthlyProfitBalance] = useState(0);
    const [monthlyRemainingProfitBalance, setMonthlyRemainingProfitBalance] = useState(0);
    const [profitBalance, setProfitBalance] = useState('');

    const [newShareholder, setNewShareholder] = useState({
        shareHoldersName: '',
        mobile: '',
        email: '',
        userName: ''
    });

    const totalSharedAmount = shareHolderInfo.reduce(
        (acc, info) => acc + (info.sharedProfitBalance || 0) + (info.transferProfitBalance || 0),
        0
    );




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
    }, [refetch]);

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
        setMonthlyRemainingProfitBalance(match?.remaining || 0);
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


        if (sharedAmount > monthlyRemainingProfitBalance) {
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
                setMonthlyRemainingProfitBalance(0);
                document.getElementById('share-profit-modal').close();
            } else {
                toast.error('Distribution failed');
            }
        } catch (error) {
            toast.error('Error sharing profit');
        }
    };
    // *************************************************************
    const handleShareholderChange = (e) => {
        const { name, value } = e.target;

        // For mobile: restrict to digits only and 11 characters
        if (name === 'mobile') {
            const numericValue = value.replace(/\D/g, '');
            if (numericValue.length > 11) return;
            setNewShareholder({ ...newShareholder, [name]: numericValue });
        } else {
            setNewShareholder({ ...newShareholder, [name]: value });
        }
    };


    // *****************************************************************
    const handleAddShareholder = async (e) => {
        e.preventDefault();

        const { shareHoldersName, mobile, email, userName } = newShareholder;

        if (!shareHoldersName || !mobile || !email || !userName) {
            toast.error("Please fill in all fields.");
            return;
        }

        if (mobile.length !== 11) {
            toast.error("Mobile number must be 11 digits.");
            return;
        }


        try {
            const res = await axiosSecure.post('/addShareHolder', newShareholder);

            if (res.data.insertedId) {
                toast.success('Shareholder added successfully!');
                setNewShareholder({ shareHoldersName: '', mobile: '', email: '', userName: '' });
                document.getElementById('add-shareholder-modal').close();
                dispatch(setRefetch(!refetch));
            } else {
                toast.error(res.data.message || 'Failed to add shareholder.');
            }
        } catch (error) {
            toast.error('Error adding shareholder.');
        }
    };


    // *****************************************************************
    const handleTransferProfit = async (e) => {
        e.preventDefault();
        if (!selectedMonth || !profitBalance) {
            toast.error('Please fill all required fields');
            return;
        }

        const [month, year] = selectedMonth.split('-');
        const transferAmount = parseFloat(profitBalance);


        if (transferAmount > monthlyRemainingProfitBalance) {
            toast.error('Cannot transfer more than available monthly profit');
            return;
        }

        try {
            const res = await axiosSecure.post('/transferMonthlyProfit', {
                month,
                year,
                transferAmount,
                userName: currentUser?.userName
            });

            if (res.data.insertedId) {
                toast.success('Balance transfer successful!');
                dispatch(setRefetch(!refetch));
                setProfitBalance('');
                setSelectedMonth('');
                setMonthlyProfitBalance(0);
                setMonthlyRemainingProfitBalance(0);
                document.getElementById('transfer-profit-balance').close();
            } else {
                toast.error('Transfer failed');
            }
        } catch (error) {
            toast.error('Error transfer profit balance');
        }
    };
    // *****************************************************************


    return (
        <div>
            <section className='rounded-md'>
                <YearlySummary />
            </section>

            <section className='flex flex-wrap gap-4 justify-start my-10'>
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

            <section className='flex justify-between items-center gap-2'>
                <h2 className='font-bold text-xl'>Total shared amount: {totalSharedAmount}</h2>

                <div className='flex gap-2'>
                    <button className="!border-[#6E3FF3] border-[1px] px-4 py-2 rounded text-[#6E3FF3] hover:bg-[#6E3FF3] hover:text-white" onClick={() => document.getElementById('add-shareholder-modal').showModal()}>
                        <span className='flex items-center gap-2'>
                            <IoMdPersonAdd />
                            Add shareholder
                        </span>
                    </button>

                    <button className="!border-[#6E3FF3] border-[1px] px-4 py-2 rounded text-[#6E3FF3] hover:bg-[#6E3FF3] hover:text-white" onClick={() => document.getElementById('transfer-profit-balance').showModal()}>
                        <span className='flex items-center gap-2'>
                            <FaMoneyBillTransfer />
                            Transfer balance
                        </span>
                    </button>

                    <button className="bg-[#6E3FF3] text-white px-4 py-2 rounded" onClick={() => document.getElementById('share-profit-modal').showModal()}>
                        <span className='flex items-center gap-2'>
                            <TbTransactionDollar />
                            Share profit
                        </span>
                    </button>
                </div>
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
                                <th>Share/Transfer Balance</th>
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
                                            <td>{info.sharedPercent || 'N/A'}</td>
                                            <td>
                                                {numberFormat(
                                                    info.sharedProfitBalance ?? info.transferProfitBalance
                                                )}
                                            </td>

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
                            <label className='block font-semibold'>Available Profit for selected month: {`Total: (${monthlyProfitBalance})`}</label>
                            <input
                                type="text"
                                readOnly
                                value={numberFormat(monthlyRemainingProfitBalance || 0)}
                                className='border px-3 py-2 rounded w-full bg-gray-100'
                            />
                        </div>

                        <div>
                            <label className='block font-semibold'>Amount to distribute:</label>
                            <input
                                type="number"
                                required
                                min={1}
                                max={monthlyRemainingProfitBalance}
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
            {/* Balance transfer modal */}
            <dialog id="transfer-profit-balance" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute bg-[#6E3FF3] text-white hover:bg-red-500 right-0 top-0">✕</button>
                    </form>
                    <h3 className="font-bold text-lg mb-3">Transfer Monthly Profit</h3>

                    <form onSubmit={handleTransferProfit} className="space-y-4">

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
                            <label className='block font-semibold'>Available Profit for selected month: {`Total: (${monthlyProfitBalance})`}</label>
                            <input
                                type="text"
                                readOnly
                                value={numberFormat(monthlyRemainingProfitBalance || 0)}
                                className='border px-3 py-2 rounded w-full bg-gray-100'
                            />
                        </div>

                        <div>
                            <label className='block font-semibold'>Amount to transfer:</label>
                            <input
                                type="number"
                                required
                                min={1}
                                max={monthlyRemainingProfitBalance}
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

            {/* Add Share holder modal*/}
            <dialog id="add-shareholder-modal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 bg-[#6E3FF3] text-white hover:bg-red-500">✕</button>
                    </form>
                    <h3 className="font-bold text-lg mb-3">Add shareholder</h3>

                    <form onSubmit={handleAddShareholder} className="space-y-4">
                        <div>
                            <label className="block font-semibold">Shareholder name:</label>
                            <input
                                type="text"
                                name="shareHoldersName"
                                value={newShareholder.shareHoldersName}
                                onChange={handleShareholderChange}
                                required
                                className="!border !border-gray-300 px-3 py-2 rounded w-full"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold">Mobile number:</label>
                            <input
                                type="text"
                                name="mobile"
                                value={newShareholder.mobile}
                                onChange={handleShareholderChange}
                                required
                                maxLength={11}
                                className="!border !border-gray-300 px-3 py-2 rounded w-full"
                                pattern="\d*"
                                inputMode="numeric"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold">Email:</label>
                            <input
                                type="email"
                                name="email"
                                value={newShareholder.email}
                                onChange={handleShareholderChange}
                                required
                                className="!border !border-gray-300 px-3 py-2 rounded w-full"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold">User name:</label>
                            <input
                                type="text"
                                name="userName"
                                value={newShareholder.userName}
                                onChange={handleShareholderChange}
                                required
                                className="!border !border-gray-300 px-3 py-2 rounded w-full"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-[#6E3FF3] text-white px-4 py-2 rounded font-semibold cursor-pointer"
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
