import { useContext, useEffect, useState } from 'react';
import { ContextData } from '../../DataProvider';
import YearlySummary from './YearlySummary';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { setRefetch } from '../../redux/refetchSlice';
import useAxiosSecure from '../../utils/useAxiosSecure';
import moment from 'moment';
import { TbTransactionDollar } from "react-icons/tb";

const ProfitShare = () => {
    const { user, totalProfit, totalExpense, totalEarnings, currentUser, mainBalance } = useContext(ContextData);
    const axiosProtect = useAxiosProtect();
    const axiosSecure = useAxiosSecure();


    const [shareHolders, setShareHolders] = useState([]);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [shareProfit, setShareProfit] = useState([]);
    const [profitPercent, setProfitPercent] = useState('');
    const [profitBalance, setProfitBalance] = useState('');
    const [shareHolderInfo, setShareHolderInfo] = useState([]);



    // ****************************************************************
    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    // ****************************************************************
    useEffect(() => {
        const fetchShareHolders = async () => {
            try {
                const response = await axiosProtect.get('/getShareHolders', {
                    params: {
                        userEmail: user?.email,
                    },
                });
                setShareHolders(response.data);
            } catch (error) {
                toast.error('Error fetching data:', error.message);
            }

        };
        fetchShareHolders();
    }, [refetch]);
    // ****************************************************************
    const handleShareProfit = async (shareHolder) => {
        const { _id, ...share } = shareHolder;
        setShareProfit(share);
        document.getElementById('shareProfit').showModal()
    };
    // ****************************************************************
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (profitBalance > mainBalance) {
            toast.error('No available balance to share profit');
            return;
        };
        const currentTime = moment().format('hh:mm:ss A');

        const dataToSend = {
            name: shareProfit.shareHoldersName,
            mobile: shareProfit.mobile,
            email: shareProfit.email,
            sharedPercent: parseFloat(profitPercent),
            totalProfitBalance: parseFloat(totalProfit),
            userName: currentUser?.userName,
            sharedProfitBalance: parseFloat(profitBalance),
            mainBalance,
            currentTime,

        };
        const postProfitData = async () => {
            try {
                const response = await axiosSecure.post('/addProfitShareData', dataToSend);
                if (response.data.insertedId) {
                    dispatch(setRefetch(!refetch));
                    setProfitBalance('');
                    setProfitPercent('');
                    document.getElementById('shareProfit').close();
                    toast.success('Profit added successfully');
                } else {
                    toast.error(response.data.message || 'Something went wrong');
                }
            } catch (error) {
                toast.error('Failed to add profit sharing', error.message);
            }
        };
        postProfitData();

    };
    // ****************************************************************
    const handleProfitPercent = (e) => {
        const value = e.target.value;
        setProfitPercent(value);
        const singleShare = (parseFloat(totalProfit) * parseFloat(value) / 100);
        setProfitBalance(singleShare);

    };
    // ****************************************************************
    useEffect(() => {
        const fetchShareHolderInfo = async () => {
            try {
                const response = await axiosProtect.get('/getShareholderInfo', {
                    params: {
                        userEmail: user?.email,
                    },
                });
                setShareHolderInfo(response.data);
            } catch (error) {
                toast.error('Error fetching data:', error.message);
            }
        };
        fetchShareHolderInfo();
    }, [refetch]);
    // ****************************************************************
    const numberFormat = (num) => {
        return Number(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    // ****************************************************************

    return (
        <div>
            <section className='rounded-md'>
                <YearlySummary />
            </section>

            <section>
                {/* Share holders card */}
                <div className='flex flex-wrap gap-4 justify-center my-10'>
                    {
                        shareHolders &&
                        shareHolders.map((shareHolder, index) => (
                            <div key={index} className='flex border border-gray-300 rounded-md hover:text-white hover:bg-[#6E3FF3]' onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}>
                                <div className='flex flex-col items-center gap-2 p-4' >
                                    <img src={shareHolder?.userImage} alt="" className='w-10 h-10 rounded-full' />
                                    <h1 className='text-xl font-bold'>{shareHolder?.shareHoldersName}</h1>
                                    <h1 className='font-semibold'>{shareHolder?.mobile}</h1>
                                    <h1 className='text-sm font-semibold'>{shareHolder?.email}</h1>
                                    {/* button name Share profit */}
                                    {
                                        hoveredIndex === index && (
                                            <button className='mt-2 px-4 py-1 bg-white text-[#6E3FF3] font-semibold rounded cursor-pointer' onClick={() => handleShareProfit(shareHolder)}>
                                                Share Profit
                                            </button>
                                        )
                                    }
                                </div>
                            </div>
                        ))
                    }
                </div>
            </section>
            <section>
                {/* Share holders card */}
                <div className='flex flex-wrap gap-4 justify-center my-10'>
                    {
                        shareHolders &&
                        shareHolders.map((shareHolder, index) => (
                            <div key={index} className='flex border border-gray-300 rounded-md hover:text-white hover:bg-[#6E3FF3]' onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}>
                                <div className='flex flex-col items-center gap-2 p-4' >
                                    <img src={shareHolder?.userImage} alt="" className='w-10 h-10 rounded-full' />
                                    <h1 className='text-xl font-bold'>{shareHolder?.shareHoldersName}</h1>
                                    <h1 className='font-semibold'>{shareHolder?.mobile}</h1>
                                    <h1 className='text-sm font-semibold'>{shareHolder?.email}</h1>
                                    {/* button name Share profit */}
                                    {
                                        hoveredIndex === index && (
                                            <button className='mt-2 px-4 py-1 bg-white text-[#6E3FF3] font-semibold rounded cursor-pointer' onClick={() => handleShareProfit(shareHolder)}>
                                                Share Profit
                                            </button>
                                        )
                                    }
                                </div>
                            </div>
                        ))
                    }
                </div>
            </section>

            <section className='flex justify-end'>
                <button className="bg-[#6E3FF3] text-white px-4 rounded-md py-2 cursor-pointer" onClick={() => document.getElementById('share-profit-modal').showModal()}>
                    <span className='flex items-center gap-2'>
                        <TbTransactionDollar />
                        Share profit
                    </span>
                </button>
            </section>

            {/* Shareholders info table */}
            <section>
                <div className="overflow-x-auto mt-5 mb-5">
                    <table className="table table-zebra">
                        {/* head */}
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
                                    shareHolderInfo.map((info, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{info.date}</td>
                                                <td>{info.name}</td>
                                                <td>{info.mobile}</td>
                                                <td>{info.sharedPercent}</td>
                                                <td>{numberFormat(info.sharedProfitBalance)}</td>
                                                <td>{info.userName}</td>
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

            {/* Modal */}
            <dialog id="shareProfit" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg">Share profit</h3>
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div>
                            <label className='block font-semibold'>Share holder name:</label>
                            <input
                                type="text"
                                value={shareProfit.shareHoldersName}
                                readOnly
                                className='border px-3 py-2 rounded w-full bg-gray-100'
                            />
                        </div>

                        <div>
                            <label className='block font-semibold'>Share holder number:</label>
                            <input
                                type="text"
                                value={shareProfit.mobile}
                                readOnly
                                className='border px-3 py-2 rounded w-full bg-gray-100'
                            />
                        </div>

                        <div>
                            <label className='block font-semibold'>Share holder email:</label>
                            <input
                                type="email"
                                value={shareProfit.email}
                                readOnly
                                className='border px-3 py-2 rounded w-full bg-gray-100'
                            />
                        </div>

                        <div>
                            <label className='block font-semibold'>Profit share (%):</label>
                            <input
                                type="number"
                                required
                                value={profitPercent}
                                onChange={handleProfitPercent}
                                className='!border !border-gray-300 px-3 py-2 rounded w-full'
                            />
                        </div>
                        <div>
                            <label className='block font-semibold'>
                                Will get
                                <span className='text-sm'>
                                    (Current Balance {numberFormat(mainBalance)} BDT)
                                </span>:
                            </label>
                            <input
                                type="text"
                                value={profitBalance || 0}
                                readOnly
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
            {/* Modal */}

            {/* Share profit modal start */}
            {/* You can open the modal using document.getElementById('ID').showModal() method */}

            <dialog id="share-profit-modal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg">Hello!</h3>
                    <p className="py-4">Press ESC key or click on ✕ button to close</p>
                </div>
            </dialog>
            {/* Share profit modal end */}
        </div>
    );
};

export default ProfitShare;