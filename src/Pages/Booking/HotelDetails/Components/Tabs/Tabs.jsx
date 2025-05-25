// File: HotelDetails/components/Tabs.jsx
const Tabs = ({ activeTab, setActiveTab }) => {
    return (
        <div className="mb-6 border-b border-gray-200">
            <ul className="flex flex-wrap -mb-px">
                {["overview", "amenities", "reviews", "location", "policies"].map((tab) => (
                    <li key={tab} className="mr-2">
                        <button
                            onClick={() => setActiveTab(tab)}
                            className={`inline-block p-4 border-b-2 rounded-t-lg transition-colors ${activeTab === tab
                                ? "text-blue-600 border-blue-600"
                                : "border-transparent hover:text-gray-600 hover:border-gray-300"
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Tabs;
