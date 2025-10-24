import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { PlusIcon } from 'lucide-react';

export default function AddPerson() {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: '',
            phone: '',
            address: '',
            description: '',
        },
    });

    const onSubmit = async (formValue) => {
        try {
            if (!formValue.name.trim() || !formValue.phone.trim()) {
                toast.error('Name and Phone are required!');
                return;
            }

            setLoading(true);

            const res = await fetch(
                `${import.meta.env.VITE_BASE_URL}/loans/new-person`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formValue),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || 'Failed to save person');
                return;
            }

            toast.success('Person added successfully!');
            reset();
            document.getElementById('add-person-modal').close();
        } catch (error) {
            toast.error(
                error.message || 'Something went wrong! Please try again later.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                className="btn btn-primary bg-violet-600 hover:bg-violet-700 text-white"
                onClick={() =>
                    document.getElementById('add-person-modal').showModal()
                }
            >
                <PlusIcon className="size-5" />
                New Person
            </button>

            <dialog
                id="add-person-modal"
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
                            Add New Person
                        </h3>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-2 items-start gap-4">
                                <div className="grid gap-2">
                                    <label
                                        htmlFor="full-name"
                                        className="font-medium"
                                    >
                                        Full Name{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="full-name"
                                        type="text"
                                        placeholder="Enter Name"
                                        className="input !border input-primary w-full"
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

                                <div className="grid gap-2">
                                    <label
                                        htmlFor="phone-number"
                                        className="font-medium"
                                    >
                                        Phone Number{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="phone-number"
                                        type="text"
                                        placeholder="Enter Phone Number"
                                        className="input !border input-primary w-full"
                                        {...register('phone', {
                                            required:
                                                'Phone number is required',
                                            pattern: {
                                                value: /^[0-9+\-() ]+$/,
                                                message: 'Invalid phone number',
                                            },
                                        })}
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-sm">
                                            {errors.phone.message}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2 col-span-2">
                                    <label
                                        htmlFor="address"
                                        className="font-medium"
                                    >
                                        Address
                                    </label>
                                    <input
                                        id="address"
                                        type="text"
                                        placeholder="Enter Address"
                                        className="input !border input-primary w-full"
                                        {...register('address')}
                                    />
                                </div>

                                <div className="grid gap-2 col-span-2">
                                    <label
                                        htmlFor="description"
                                        className="font-medium"
                                    >
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        className="textarea !border input-primary w-full"
                                        placeholder="Say something about him..."
                                        rows={3}
                                        {...register('description')}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`btn bg-violet-600 hover:bg-violet-700 text-white col-span-2 ${
                                        loading && 'bg-violet-100'
                                    }`}
                                >
                                    {loading ? (
                                        <span className="loading loading-spinner" />
                                    ) : (
                                        'Save'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    );
}
