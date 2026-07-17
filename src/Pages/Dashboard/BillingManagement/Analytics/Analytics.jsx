import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiMapPin, FiTrendingUp, FiPieChart, FiBarChart2 } from "react-icons/fi";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import useAxiosPublic from "../../../../hooks/useAxiosPublic";

const Analytics = () => {
    const axiosPublic = useAxiosPublic();
    const [metric, setMetric] = useState('count'); // 'count' or 'revenue'

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
                if (!destinations[destKey]) {
                    destinations[destKey] = { count: 0, revenue: 0 };
                }
                destinations[destKey].count += 1;
                destinations[destKey].revenue += parseFloat(booking.totalCost || 0);
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
                .map(([name, data]) => ({
                    name,
                    count: data.count,
                    revenue: data.revenue
                }))
                .sort((a, b) => b[metric] - a[metric])
                .slice(0, 5),
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
    const COLORS = ['#FF2056', '#FF6B8B', '#f87171', '#fb7185', '#fda4af'];

    // Fallback data if empty to ensure the dashboard is always visible and informative
    const displayDestinations = topDestinations.length > 0 ? topDestinations : [
        { name: "Cox's Bazar", count: 15, revenue: 180000 },
        { name: "Sajek Valley", count: 12, revenue: 144000 },
        { name: "Saint Martin", count: 10, revenue: 130000 },
        { name: "Sreemangal", count: 8, revenue: 88000 },
        { name: "Sylhet", count: 5, revenue: 65000 }
    ].sort((a, b) => b[metric] - a[metric]);

    const displayTransports = topTransports.length > 0 ? topTransports : [
        { name: "Green Line Bus", value: 25 },
        { name: "Parabat Express Train", value: 18 },
        { name: "Silkcity Train", value: 12 }
    ];

    const displayHotels = topHotels.length > 0 ? topHotels : [
        { name: "Ocean Paradise Hotel", count: 14 },
        { name: "Sayeman Beach Resort", count: 10 },
        { name: "Grand Sultan Resort", count: 7 }
    ];

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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                        <div className="flex items-center">
                            <FiMapPin className="text-[#FF2056] mr-3" size={20} />
                            <h3 className="text-lg font-semibold text-gray-800">
                                Top Destinations {topDestinations.length === 0 && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded ml-2 font-normal animate-pulse">Demo</span>}
                            </h3>
                        </div>
                        <div className="flex bg-gray-100 p-1 rounded-lg self-start">
                            <button
                                onClick={() => setMetric('count')}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                    metric === 'count'
                                        ? 'bg-white text-gray-800 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                Bookings Count
                            </button>
                            <button
                                onClick={() => setMetric('revenue')}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                    metric === 'revenue'
                                        ? 'bg-white text-gray-800 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                Revenue (৳)
                            </button>
                        </div>
                    </div>
                    <div className="h-64 w-full relative">
                        {displayDestinations.length > 0 ? (
                            <ResponsiveContainer width="99%" height="100%">
                                <BarChart
                                    data={displayDestinations}
                                    margin={{ top: 20, right: 30, left: -10, bottom: 5 }}
                                >
                                    <XAxis
                                        dataKey="name"
                                        interval={0}
                                        tick={{ fontSize: 11 }}
                                        angle={-25}
                                        textAnchor="end"
                                        height={65}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value) => [
                                            metric === 'count' ? `${value} bookings` : `৳${value.toLocaleString()}`,
                                            metric === 'count' ? 'Count' : 'Revenue'
                                        ]}
                                        labelFormatter={(label) => `Destination: ${label}`}
                                    />
                                    <Bar
                                        dataKey={metric}
                                        name={metric === 'count' ? 'Bookings' : 'Revenue'}
                                        fill="#FF2056"
                                        radius={[4, 4, 0, 0]}
                                        barSize={30}
                                    />
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
                        {displayDestinations.map((item, i) => (
                            <div key={item.name} className="flex justify-between items-center py-1 px-2 hover:bg-gray-50 rounded">
                                <div className="flex items-center">
                                    <span
                                        className="w-3 h-3 rounded-full mr-3"
                                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                    ></span>
                                    <span className="text-gray-700">{item.name}</span>
                                </div>
                                <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded text-sm font-medium">
                                    {metric === 'count'
                                        ? `${item.count} ${item.count === 1 ? 'booking' : 'bookings'}`
                                        : `৳${item.revenue.toLocaleString()}`
                                    }
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Transport vs Hotel Popularity */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <div className="flex items-center mb-4">
                            <FiTrendingUp className="text-[#FF2056] mr-3" size={20} />
                            <h3 className="text-lg font-semibold text-gray-800">
                                Popular Transports {topTransports.length === 0 && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded ml-2 font-normal animate-pulse">Demo</span>}
                            </h3>
                        </div>
                        <div className="h-48 w-full relative">
                            {displayTransports.length > 0 ? (
                                <ResponsiveContainer width="99%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={displayTransports}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={60}
                                            fill="#8884d8"
                                            dataKey="value"
                                            nameKey="name"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {displayTransports.map((_, i) => (
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
                            <FiBarChart2 className="text-[#FF2056] mr-3" size={20} />
                            <h3 className="text-lg font-semibold text-gray-800">
                                Popular Hotels {topHotels.length === 0 && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded ml-2 font-normal animate-pulse">Demo</span>}
                            </h3>
                        </div>
                        <div className="space-y-2">
                            {displayHotels.length > 0 ? (
                                displayHotels.map((hotel, i) => (
                                    <div key={hotel.name} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                                        <div className="flex items-center min-w-0">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full mr-2.5 flex-shrink-0"
                                                style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                            ></span>
                                            <span className="text-gray-700 truncate">{hotel.name}</span>
                                        </div>
                                        <span className="text-gray-500 text-sm font-semibold ml-2">{hotel.count} bookings</span>
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