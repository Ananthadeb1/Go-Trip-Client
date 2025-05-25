// File: HotelDetails/components/Breadcrumbs.jsx
const Breadcrumbs = ({ hotel, navigate }) => {
    return (
        <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <button
                        onClick={() => navigate("/booking")}
                        className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                    >
                        Hotels
                    </button>
                </li>
                <li>
                    <div className="flex items-center">
                        <svg
                            className="w-3 h-3 mx-1 text-gray-400"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 6 10"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="m1 9 4-4-4-4"
                            />
                        </svg>
                        <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                            {hotel.name}
                        </span>
                    </div>
                </li>
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
