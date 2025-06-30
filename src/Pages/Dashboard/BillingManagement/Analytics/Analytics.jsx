import { useQuery } from "@tanstack/react-query";
import { FiMapPin, FiTrendingUp, FiPieChart, FiBarChart2 } from "react-icons/fi";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import useAxiosPublic from "../../../../hooks/useAxiosPublic";

const Analytics = () => {
    const axiosPublic = useAxiosPublic();
    const { data: bookings = [], isLoading } = useQuery({
        queryKey: ['bookings'],
        queryFn: async () => {
            const res = await axiosPublic.get('/bookings');
            return res.data;
        }
    });

    // Process data with proper checks
    const getPopularData = () => {
        const destinations = {};
        const transports = {};
        const hotels = {};

        bookings.forEach(booking => {
            // Popular destinations
            const destKey = booking.dest || booking.hotelLocation;
            if (destKey) {
                destinations[destKey] = (destinations[destKey] || 0) + 1;
            }

            // Transport popularity
            if (booking.type === 'train' || booking.type === 'bus') {
                const transportName = booking.vehicleName || `Unknown ${booking.type}`;
                transports[transportName] = (transports[transportName] || 0) + 1;
            }

            // Hotel popularity
            if (booking.type === 'hotel' && booking.hotelName) {
                hotels[booking.hotelName] = (hotels[booking.hotelName] || 0) + 1;
            }
        });

        return {
            topDestinations: Object.entries(destinations)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, count]) => ({ name, count })),
            topTransports: Object.entries(transports)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([name, value]) => ({ name, value })),
            topHotels: Object.entries(hotels)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([name, count]) => ({ name, count }))
        };
    };

    const { topDestinations, topTransports, topHotels } = getPopularData();
    const COLORS = ['#4f46e5', '#6366f1', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-gray-50">
                <h2 className="text-2xl font-bold text-gray-800">Travel Analytics</h2>
                <p className="text-gray-600 mt-2">Popular destinations and services</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {/* Popular Destinations - Fixed Bar Chart */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center mb-4">
                        <FiMapPin className="text-indigo-600 mr-3" size={20} />
                        <h3 className="text-lg font-semibold text-gray-800">Top Destinations</h3>
                    </div>
                    <div className="h-64">
                        {topDestinations.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={topDestinations}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <XAxis
                                        dataKey="name"
                                        interval={0}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value) => [`${value} bookings`, 'Count']}
                                        labelFormatter={(label) => `Destination: ${label}`}
                                    />
                                    <Bar
                                        dataKey="count"
                                        name="Bookings"
                                        fill="#4f46e5"
                                        radius={[4, 4, 0, 0]}
                                        barSize={30}
                                    >
                                        {topDestinations.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                No destination data available
                            </div>
                        )}
                    </div>
                    {/* Additional destination list */}
                    <div className="mt-4 space-y-2">
                        {topDestinations.map((item, i) => (
                            <div key={item.name} className="flex justify-between items-center py-1 px-2 hover:bg-gray-50 rounded">
                                <div className="flex items-center">
                                    <span
                                        className="w-3 h-3 rounded-full mr-3"
                                        style={{ backgroundColor: COLORS[i] }}
                                    ></span>
                                    <span className="text-gray-700">{item.name}</span>
                                </div>
                                <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded text-sm">
                                    {item.count} {item.count === 1 ? 'booking' : 'bookings'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Transport vs Hotel Popularity (unchanged) */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <div className="flex items-center mb-4">
                            <FiTrendingUp className="text-indigo-600 mr-3" size={20} />
                            <h3 className="text-lg font-semibold text-gray-800">Popular Transports</h3>
                        </div>
                        <div className="h-48">
                            {topTransports.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={topTransports}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={60}
                                            fill="#8884d8"
                                            dataKey="value"
                                            nameKey="name"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {topTransports.map((_, i) => (
                                                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    No transport data available
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <div className="flex items-center mb-4">
                            <FiBarChart2 className="text-indigo-600 mr-3" size={20} />
                            <h3 className="text-lg font-semibold text-gray-800">Popular Hotels</h3>
                        </div>
                        <div className="space-y-2">
                            {topHotels.length > 0 ? (
                                topHotels.map((hotel, i) => (
                                    <div key={hotel.name} className="flex items-center">
                                        <span
                                            className="w-2 h-2 rounded-full mr-2"
                                            style={{ backgroundColor: COLORS[i] }}
                                        ></span>
                                        <span className="text-gray-700 flex-1 truncate">{hotel.name}</span>
                                        <span className="text-gray-500 text-sm">{hotel.count} bookings</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500 text-center py-4">
                                    No hotel bookings available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;