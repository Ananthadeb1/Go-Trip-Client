
import useAuth from './useAuth';
import useAxiosSecure from './useAxiosSecure';
import { useQuery } from '@tanstack/react-query';

const useAdmin = () => {
    const { user } = useAuth();

    const axiosSecure = useAxiosSecure(); // Ensure axiosSecure is configured to include the token

    const { data: isAdmin } = useQuery({
        queryKey: [user?.email, 'isAdmin'],
        queryFn: async () => {
            const res = await axiosSecure.get(`users/admin/${user.email}`);
            console.log(res.data);
            return res.data?.admin;
        },
    });
    return [isAdmin];
};

export default useAdmin;