import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function AddTransaction({ fetchLoans }) {
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState([]);
    const [fetching, setFetching] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: '',
            phone: '',
            address: '',
            amount: '',
            type: 'borrow',
            date: format(new Date(), 'yyyy-MM-dd'),
        },
    });

    const fetchUsers = async (query) => {
        if (!query.trim()) {
            setUsers([]);
            return;
        }

        try {
            setFetching(true);
            const res = await fetch(
                `${
                    import.meta.env.VITE_BASE_URL
                }/loans/get-person?query=${encodeURIComponent(query)}`
            );
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || 'Failed to fetch users');
                return;
            }

            setUsers(data.data || []);
        } catch (error) {
            toast.error(error.message || 'Failed to fetch users');
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (debounceTimer) clearTimeout(debounceTimer);

        const timer = setTimeout(() => {
            if (search.trim()) fetchUsers(search);
        }, 500);

        setDebounceTimer(timer);
        return () => clearTimeout(timer);
    }, [search]);

    const onSubmit = async (formValue) => {
        try {
            if (!formValue.name.trim() || !formValue.phone.trim()) {
                toast.error('Name and Phone are required!');
                return;
            }

            if (parseFloat(formValue.amount) <= 0) {
                toast.error('Amount must be greater than 0!');
                return;
            }

            setLoading(true);

            const res = await fetch(
                `${import.meta.env.VITE_BASE_URL}/loans/new-loan`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formValue),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || 'Failed to save loan');
                return;
            }

            toast.success('Loan added successfully!');
            reset();
            setSearch('');
            setUsers([]);
            fetchLoans();
            document.getElementById('add-transaction-modal').close();
        } catch (error) {
            toast.error(
                error.message || 'Something went wrong! Please try again later.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUser = (user) => {
        setValue('name', user.name);
        setValue('phone', user.phone);
        setValue('address', user.address || '');
        setSearch(`${user.name}`);
        setUsers([]);
    };

    return (
        <div>
            <button
                className="btn btn-primary bg-violet-600 hover:bg-violet-700 text-white"
                onClick={() =>
                    document.getElementById('add-transaction-modal').showModal()
                }
            >
                <PlusIcon className="size-5" />
                New Transaction
            </button>

            <dialog
                id="add-transaction-modal"
                className="modal w-full max-w-2xl mx-auto"
            >
                <div className="modal-box relative">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-error text-white absolute right-2 top-2">
                            ✕
                        </button>
                    </form>

                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-violet-600">
                            💰 Add New Transaction
                        </h3>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="relative mb-4">
                                <label className="input input-primary !border flex items-center gap-2 w-full">
                                    <SearchIcon className="opacity-60 size-5" />
                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Search by name or phone..."
                                        className="grow"
                                    />
                                </label>

                                {fetching && (
                                    <div className="absolute z-10 bg-white border border-gray-200 w-full p-2 text-center text-sm text-gray-500">
                                        Searching...
                                    </div>
                                )}

                                {!fetching && users.length > 0 && (
                                    <ul className="absolute z-10 bg-white border border-gray-200 rounded-md mt-1 w-full max-h-48 overflow-auto shadow-lg">
                                        {users.map((u) => (
                                            <li
                                                key={u._id}
                                                onClick={() =>
                                                    handleSelectUser(u)
                                                }
                                                className="px-4 py-2 hover:bg-violet-100 cursor-pointer"
                                            >
                                                <span className="font-medium text-gray-800">
                                                    {u.name}
                                                </span>{' '}
                                                <span className="text-gray-500 text-sm">
                                                    ({u.phone})
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 grid gap-2 sm:col-span-1">
                                    <label className="font-medium">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter name"
                                        className="input input-primary !border w-full"
                                        {...register('name', {
                                            required: 'Name is required',
                                        })}
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm">
                                            {errors.name.message}
                                        </p>
                                    )}
                                </div>

                                <div className="col-span-2 grid gap-2 sm:col-span-1">
                                    <label className="font-medium">
                                        Phone *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter phone"
                                        className="input input-primary !border w-full"
                                        {...register('phone', {
                                            required: 'Phone is required',
                                        })}
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-sm">
                                            {errors.phone.message}
                                        </p>
                                    )}
                                </div>

                                <div className="col-span-2 grid gap-2">
                                    <label className="font-medium">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter address"
                                        className="input input-primary !border w-full"
                                        {...register('address')}
                                    />
                                </div>

                                <div className="col-span-2 grid gap-2 sm:col-span-1">
                                    <label className="font-medium">
                                        Amount *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Enter amount"
                                        className="input input-primary !border w-full"
                                        {...register('amount', {
                                            required: 'Amount is required',
                                            min: {
                                                value: 1,
                                                message:
                                                    'Amount must be greater than 0',
                                            },
                                        })}
                                    />
                                    {errors.amount && (
                                        <p className="text-red-500 text-sm">
                                            {errors.amount.message}
                                        </p>
                                    )}
                                </div>

                                <div className="col-span-2 grid gap-2 sm:col-span-1">
                                    <label className="font-medium">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        className="input input-primary !border w-full"
                                        {...register('date', {
                                            required: 'Date is required',
                                        })}
                                    />
                                    {errors.date && (
                                        <p className="text-red-500 text-sm">
                                            {errors.date.message}
                                        </p>
                                    )}
                                </div>

                                <div className="col-span-2 grid gap-2">
                                    <label className="font-medium">
                                        Type *
                                    </label>
                                    <select
                                        className="select select-primary !border w-full"
                                        {...register('type')}
                                    >
                                        <option value="borrow">
                                            Borrow (Money Received)
                                        </option>
                                        <option value="return">
                                            Return (Money Given Back)
                                        </option>
                                    </select>
                                </div>

                                <div className="col-span-2 grid gap-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`btn w-full bg-violet-600 hover:bg-violet-700 text-white ${
                                            loading ? 'loading' : ''
                                        }`}
                                    >
                                        {loading
                                            ? 'Saving...'
                                            : 'Save Transaction'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Backdrop */}
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    );
}
