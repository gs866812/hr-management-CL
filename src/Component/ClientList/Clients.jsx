import React, { useContext, useEffect, useState } from 'react';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { ContextData } from '../../DataProvider';
import { IoEyeOutline } from 'react-icons/io5';

const Clients = () => {

    const { user, userName } = useContext(ContextData);
    const [clientList, setClientList] = useState([]);


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
    }, []);
    // *****************************************************************************************
    return (
        <div>
            <h2 className='text-xl font-semibold'>Client List</h2>
            <section>
                <div className="overflow-x-auto mt-5">
                    <table className="table table-zebra">
                        {/* head */}
                        <thead className='bg-[#6E3FF3] text-white'>
                            <tr>
                                <th>Client ID</th>
                                <th>Country</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                clientList.length > 0 ? (
                                    clientList.map((client, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{client.clientID}</td>
                                                <td>{client.country}</td>
                                                <td className='w-[5%]'>
                                                    <div className='flex justify-center'>
                                                        <IoEyeOutline className='text-xl cursor-pointer hover:text-[#6E3FF3]'  />
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
        </div>
    );
};

export default Clients;