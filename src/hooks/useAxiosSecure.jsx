import axios from 'axios';
import useAuth from './useAuth';
import { useNavigate } from 'react-router-dom';

const axiosSecure = axios.create({
    baseURL: 'http://localhost:5000',
})
axiosSecure.interceptors.request.use(function (config) {
    const token = localStorage.getItem('access-token');
    // console.log("request stopped by config", token);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, function (error) {
    // do something with request error
    return Promise.reject(error);
});

axiosSecure.interceptors.response.use(function (response) {
    return response;
}, async (error) => {
    const status = error.response?.status;
    // console.log("interceptor error", status);
    if (status === 401 || status === 403) {
        const { logout } = useAuth();
        const navigate = useNavigate();
        await logout();
        navigate('/login');
        console.log("interceptor error", status);
    }
    return Promise.reject(error);
});

const useAxiosSecure = () => {
    return axiosSecure;
};
export default useAxiosSecure;