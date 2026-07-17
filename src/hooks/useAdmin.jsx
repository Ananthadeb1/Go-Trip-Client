
import useAuth from './useAuth';
import useAxiosSecure from './useAxiosSecure';
import { useQuery } from '@tanstack/react-query';

const useAdmin = () => {
    const { user, loading, dbUserLoading } = useAuth();
    const axiosSecure = useAxiosSecure(); // Ensure axiosSecure is configured to include the token

    const { data: isAdmin, isLoading: isAdminLoading } = useQuery({
        queryKey: [user?.email, 'isAdmin'],
        queryFn: async () => {
            const token = localStorage.getItem('access-token');
            if (!token) return false;
            const res = await axiosSecure.get(`users/admin/${user.email}`);
            console.log(res.data);
            return res.data?.admin;
        },
        enabled: !!user?.email && !loading && !dbUserLoading && !!localStorage.getItem('access-token'),
    });
    return [isAdmin, isAdminLoading];
};

export default useAdmin;