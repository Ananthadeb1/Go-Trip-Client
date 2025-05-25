const HotelPolicies = () => {
    return (
        <ul className="space-y-3 text-sm">
            <li className="flex items-start">
                <svg
                    className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                </svg>
                <span>
                    <strong>Cancellation:</strong> Free cancellation up to 24 hours before check-in.
                </span>
            </li>
            <li className="flex items-start">
                <svg
                    className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                </svg>
                <span>
                    <strong>Check-in:</strong> From 2:00 PM. Early check-in subject to availability.
                </span>
            </li>
            <li className="flex items-start">
                <svg
                    className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                </svg>
                <span>
                    <strong>Check-out:</strong> Until 12:00 PM. Late check-out may incur additional charges.
                </span>
            </li>
            <li className="flex items-start">
                <svg
                    className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    ></path>
                </svg>
                <span>
                    <strong>Payment:</strong> Credit card required to guarantee reservation.
                </span>
            </li>
        </ul>
    );
};

export default HotelPolicies;
