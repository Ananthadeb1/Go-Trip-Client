import axios from 'axios';

const axiosPublic = axios.create({
    baseURL: `${import.meta.env.VITE_url}`,
});

// Add token to every request
axiosPublic.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access-token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const useAxiosPublic = () => {
    return axiosPublic;
};

export default useAxiosPublic;