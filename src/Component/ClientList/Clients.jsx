import React, { useContext, useEffect, useState } from 'react';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { ContextData } from '../../DataProvider';
import { IoEyeOutline } from 'react-icons/io5';
import { FaEye, FaPlus, FaRegEdit } from 'react-icons/fa';
import AddClientModal from './AddClientModal';
import { useDispatch, useSelector } from 'react-redux';
import EditClientList from './EditClientList';
import { Link } from 'react-router-dom';

const Clients = () => {
    const { user, userName } = useContext(ContextData);

    const [clientList, setClientList] = useState([]);
    const [searchClient, setSearchClient] = useState('');
    const [clientId, setClientId] = useState('');
    const [clientCountry, setClientCountry] = useState('');

    // const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    // *****************************************************************************************
    const axiosProtect = useAxiosProtect();
    useEffect(() => {
        const fetchClient = async () => {
            try {
                const response = await axiosProtect.get(`/getClient`, {
                    params: {
                        userEmail: user?.email,
                    },
                });
                setClientList(response.data);
            } catch (error) {
                toast.error('Error fetching data:', error.message);
            }
        };
        fetchClient();
    }, [refetch]);
    // *****************************************************************************************
    const handleEditClient = (id, country) => {
        document.getElementById('edit-client-list').showModal();
        setClientId(id);
        setClientCountry(country);
    };
    // *****************************************************************************************
    return (
        <div>
            <section>
                <section>
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Client List
                        </h2>

                        <div className="flex items-center gap-2">
                            <section>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="!border !border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                                    value={searchClient}
                                    onChange={(e) =>
                                        setSearchClient(e.target.value)
                                    }
                                />
                            </section>
                            <section>
                                <button
                                    className="bg-[#6E3FF3] text-white px-4 rounded-md py-2 cursor-pointer"
                                    onClick={() =>
                                        document
                                            .getElementById(
                                                'add-new-client-modal'
                                            )
                                            .showModal()
                                    }
                                >
                                    <span className="flex items-center gap-2">
                                        <FaPlus />
                                        Add new client
                                    </span>
                                </button>
                            </section>
                        </div>
                    </div>
                </section>
                {/* *************************************************************** */}
            </section>
            <section>
                <div className="overflow-x-auto mt-5">
                    <table className="table table-zebra">
                        {/* head */}
                        <thead className="bg-[#6E3FF3] text-white">
                            <tr>
                                <th>Client ID</th>
                                <th>Country</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientList.length > 0 ? (
                                clientList.map((client, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{client.clientID}</td>
                                            <td>{client.country}</td>
                                            <td className="w-[5%]">
                                                <div className="flex justify-center items-center gap-2">
                                                    <FaRegEdit
                                                        className="text-xl cursor-pointer hover:text-[#6E3FF3]"
                                                        title="Edit"
                                                        onClick={() =>
                                                            handleEditClient(
                                                                client.clientID,
                                                                client.country
                                                            )
                                                        }
                                                    />
                                                    <Link
                                                        to={`/clients/${client.clientID}`}
                                                    >
                                                        <FaEye className="text-xl cursor-pointer hover:text-[#6E3FF3]" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center">
                                        No record found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
            <AddClientModal />
            <EditClientList clientInfo={{ clientId, clientCountry }} />
        </div>
    );
};

export default Clients;
