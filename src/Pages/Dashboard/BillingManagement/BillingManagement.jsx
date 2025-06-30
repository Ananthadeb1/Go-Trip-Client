import { useQuery } from "@tanstack/react-query";
import { FiDollarSign, FiCreditCard, FiPieChart, FiUsers, FiXCircle } from "react-icons/fi";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import useAxiosPublic from "../../../hooks/useAxiosPublic";

const BillingManagement = () => {
    const axiosPublic = useAxiosPublic();

    const { data: bookings = [], isLoading } = useQuery({
        queryKey: ['bookings'],
        queryFn: async () => {
            const res = await axiosPublic.get('/bookings');
            return res.data;
        }
    });

    // Calculate payment method counts
    const paymentMethodCounts = bookings.reduce(
        (acc, booking) => {
            const method = booking.paymentMethod?.toLowerCase().replace('_', '').replace(/\s+/g, '');
            if (method === 'bkash') acc.Bkash += 1;
            else if (method === 'nagad') acc.Nagad += 1;
            else if (method === 'creditcard') acc.CreditCard += 1;
            return acc;
        },
        { Bkash: 0, Nagad: 0, CreditCard: 0 }
    );

    // Calculate financial metrics
    const billingData = {
        paymentMethods: paymentMethodCounts,
        totalRevenue: bookings.reduce((sum, b) => sum + (b.totalCost || 0), 0),
        paidAmount: bookings.filter(b => b.status?.toLowerCase() === 'confirmed').reduce((sum, b) => sum + (b.totalCost || 0), 0),
        canceledAmount: bookings.filter(b => b.status?.toLowerCase() === 'cancelled').reduce((sum, b) => sum + (b.totalCost || 0), 0),
        payingUsers: new Set(bookings.filter(b => b.status?.toLowerCase() === 'confirmed').map(b => b.userId)).size,
        recentTransactions: bookings
            .sort((a, b) => new Date(b.bookingTime) - new Date(a.bookingTime))
            .slice(0, 5)
            .map(b => ({
                _id: b._id,
                userName: b.userName || 'N/A',
                method: b.paymentMethod || 'Unknown',
                date: b.bookingTime,
                amount: b.totalCost || 0,
                status: b.status?.toLowerCase() === 'confirmed' ? 'success' : 'Canclled'
            }))
    };

    // Prepare payment methods data for the pie chart
    const paymentMethodsData = [
        { name: 'Credit Card', value: billingData.paymentMethods?.CreditCard || 0 },
        { name: 'Nagad', value: billingData.paymentMethods?.Nagad || 0 },
        { name: 'Bkash', value: billingData.paymentMethods?.Bkash || 0 },
    ];

    const COLORS = ['#4f46e5', '#6366f1', '#a5b4fc'];

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <span className="loader border-4 border-indigo-200 border-t-indigo-600 rounded-full w-12 h-12 animate-spin"></span>
            <span className="ml-4 text-indigo-600 font-medium">Loading billing data...</span>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-gray-50">
                <h2 className="text-2xl font-bold text-gray-800">Billing Overview</h2>
                <p className="text-gray-600 mt-2">Track payments, refunds, and financial metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border-b border-gray-200">
                <div className="bg-indigo-50 rounded-lg p-5">
                    <div className="flex items-center">
                        <FiDollarSign className="text-indigo-600" size={24} />
                        <span className="ml-3 text-gray-600">Total Revenue</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mt-2">৳{billingData.totalRevenue?.toLocaleString() || '0'}</h3>
                </div>

                <div className="bg-green-50 rounded-lg p-5">
                    <div className="flex items-center">
                        <FiCreditCard className="text-green-600" size={24} />
                        <span className="ml-3 text-gray-600">Paid Amount</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mt-2">৳{billingData.paidAmount?.toLocaleString() || '0'}</h3>
                </div>

                <div className="bg-amber-50 rounded-lg p-5">
                    <div className="flex items-center">
                        <FiXCircle className="text-amber-600" size={24} />
                        <span className="ml-3 text-gray-600">Canceled Amount</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mt-2">৳{billingData.canceledAmount?.toLocaleString() || '0'}</h3>
                </div>

                <div className="bg-purple-50 rounded-lg p-5">
                    <div className="flex items-center">
                        <FiUsers className="text-purple-600" size={24} />
                        <span className="ml-3 text-gray-600">Paying Users</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mt-2">{billingData.payingUsers?.toLocaleString() || '0'}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center mb-4">
                        <FiPieChart className="text-indigo-600 mr-3" size={20} />
                        <h3 className="text-lg font-semibold text-gray-800">Payment Methods</h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={paymentMethodsData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {paymentMethodsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center mb-4">
                        <FiCreditCard className="text-indigo-600 mr-3" size={20} />
                        <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
                    </div>
                    <div className="space-y-4">
                        {billingData.recentTransactions?.map((transaction) => (
                            <div key={transaction._id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-800">{transaction.userName}</p>
                                    <p className="text-sm text-gray-500">
                                        {transaction.method} • {new Date(transaction.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-semibold ${transaction.status === 'success' ? 'text-green-600' : 'text-amber-600'}`}>
                                        ৳{transaction.amount}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">{transaction.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-8 py-5 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                    Last updated: {new Date().toLocaleString()}
                </div>
            </div>
        </div>
    );
};

export default BillingManagement;