import { useState } from 'react';
import {
    faBars, faTimes, faUsers, faConciergeBell,
    faChartLine, faHotel, faCalendarAlt, faCog,
    faBox, faDollarSign, faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UserManagement from './UserManagement/UserManagement';
import ServiceManagement from './ServiceManagement/ServiceManagement';

const Dashboard = () => {
    const [selected, setSelected] = useState('User Management');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const menuItems = [
        { name: 'User Management', icon: faUsers },
        { name: 'Service Management', icon: faConciergeBell },
        { name: 'Analytics', icon: faChartLine },
        { name: 'Bookings', icon: faCalendarAlt },
        { name: 'Inventory', icon: faBox },
        { name: 'Billing', icon: faDollarSign },
        { name: 'Reports', icon: faFileAlt },
        { name: 'Settings', icon: faCog }
    ];

    const renderComponent = () => {
        switch (selected) {
            case 'User Management': return <UserManagement />;
            case 'Service Management': return <ServiceManagement />;
            default: return <UserManagement />;
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-r from-rose-50 to-indigo-50">
            {/* Mobile Sidebar Toggle */}
            <button
                className="md:hidden fixed top-4 left-4 z-30 p-3 rounded-lg bg-[#FF2056] text-white shadow-lg"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} size="lg" />
            </button>

            {/* Sidebar */}
            <div
                className={`fixed md:relative z-20 bg-white p-6 w-72 h-full border-r border-[#FFEAEE] transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0 transition-transform duration-300 ease-in-out shadow-xl md:shadow-none flex flex-col`}
            >
                <div className="flex-1 overflow-y-auto">
                    <h2 className="text-2xl font-bold text-[#FF2056] mb-8 pl-2 flex items-center">
                        <FontAwesomeIcon icon={faHotel} className="mr-3" />
                        Admin Panel
                    </h2>
                    <ul className="space-y-2">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <button
                                    className={`w-full text-left p-4 rounded-xl flex items-center transition-all ${selected === item.name
                                        ? 'bg-gradient-to-r from-[#FF2056] to-[#FF6B8B] text-white shadow-md'
                                        : 'bg-white text-gray-700 hover:bg-[#FFEAEE]'
                                        }`}
                                    onClick={() => {
                                        setSelected(item.name);
                                        setIsSidebarOpen(false);
                                    }}
                                >
                                    <FontAwesomeIcon
                                        icon={item.icon}
                                        className={`mr-3 ${selected === item.name ? 'text-white' : 'text-[#FF2056]'}`}
                                    />
                                    <span className="font-medium">{item.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* User Profile & Logout */}
                <div className="border-t border-[#FFEAEE] pt-4 mt-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-[#FF2056] flex items-center justify-center text-white mr-3">
                                <span>AD</span>
                            </div>
                            <div>
                                <p className="font-medium">Admin User</p>
                                <p className="text-xs text-gray-500">Super Admin</p>
                            </div>
                        </div>
                        <button className="text-[#FF2056] hover:text-[#E61C4D]">
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Navigation */}
                <div className="p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                            <FontAwesomeIcon
                                icon={menuItems.find(item => item.name === selected)?.icon || faUsers}
                                className="text-[#FF2056] mr-3"
                            />
                            {selected}
                        </h1>

                    </div>
                </div>

                {/* Content Area */}
                <div className="px-6 md:px-8 pb-8 flex-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-[#FFEAEE] p-6 h-full">
                        {renderComponent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;