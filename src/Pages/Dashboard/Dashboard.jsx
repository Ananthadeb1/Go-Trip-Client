import { useState } from 'react';
import UserManagement from './UserManagement/UserManagement';
import Service from './Service/Service';

const Dashboard = () => {
    const [selected, setSelected] = useState('User Management');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex flex-col md:flex-row h-screen">
            {/* Sidebar */}
            <div
                className={`fixed md:static z-10 bg-gray-100 p-4 w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0 transition-transform duration-300 ease-in-out`}
            >
                <button
                    className="md:hidden mb-4 text-gray-700"
                    onClick={() => setIsSidebarOpen(false)}
                >
                    Close
                </button>
                <ul className="space-y-4">
                    {['User Management', 'Service'].map((item, index) => (
                        <li key={index}>
                            <button
                                className={`w-full text-left p-2 rounded ${selected === item
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-200'
                                    }`}
                                onClick={() => {
                                    setSelected(item);
                                    setIsSidebarOpen(false);
                                }}
                            >
                                {item}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Hamburger Menu */}
            <button
                className="md:hidden p-4 text-gray-700"
                onClick={() => setIsSidebarOpen(true)}
            >
                Menu
            </button>

            {/* Main Content */}
            <div className="flex-1 p-4 overflow-y-auto">
                {selected === 'User Management' && <UserManagement />}
                {selected === 'Service' && <Service />}
            </div>
        </div>
    );
};

export default Dashboard;