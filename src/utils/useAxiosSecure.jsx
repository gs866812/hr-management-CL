import axios from 'axios';

const axiosSecure = axios.create({
    baseURL: 'https://webbriks.backendsafe.com',
});

const useAxiosSecure = () => {
    return axiosSecure;
};

export default useAxiosSecure;
