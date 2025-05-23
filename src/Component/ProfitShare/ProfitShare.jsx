import { useContext, useEffect, useState } from 'react';
import { ContextData } from '../../DataProvider';
import YearlySummary from './YearlySummary';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';

const ProfitShare = () => {
    const { user, totalProfit, totalExpense, totalEarnings, currentUser } = useContext(ContextData);
    const axiosProtect = useAxiosProtect();


    const [shareHolders, setShareHolders] = useState([]);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [shareProfit, setShareProfit] = useState([]);
    const [profitPercent, setProfitPercent] = useState('');
    const [profitBalance, setProfitBalance] = useState('');

    console.log(currentUser);


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
        const dataToSend = {
            name: shareProfit.shareHoldersName,
            mobile: shareProfit.mobile,
            email: shareProfit.email,
            profitPercent: parseFloat(profitPercent),
            totalProfit: parseFloat(totalProfit),
            userName: currentUser?.userName,
            profitBalance: parseFloat(profitBalance),
        };

    };
    // ****************************************************************
    const handleProfitPercent = (e) => {
        const value = e.target.value;
        setProfitPercent(value);
        const singleShare = (parseFloat(totalProfit) * parseFloat(value)/100);
        setProfitBalance(singleShare);
        console.log(profitBalance);
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
                            <label className='block font-semibold'>Will get({totalProfit}):</label>
                            <input
                                type="text"
                                value={profitBalance}
                                readOnly
                                className='!border !border-gray-300 px-3 py-2 rounded w-full'
                            />
                        </div>

                        <button
                            type="submit"
                            className='bg-[#6E3FF3] text-white px-4 py-2 rounded font-semibold'
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </dialog>
            {/* Modal */}
        </div>
    );
};

export default ProfitShare;