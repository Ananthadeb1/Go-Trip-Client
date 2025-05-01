import { useState, useEffect } from "react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import HotelDetails from "./HotelDetails/HotelDetails";
import { Link } from "react-router-dom";

const Booking = () => {
    const axioxPublic = useAxiosPublic();
    const [hotels, setHotels] = useState(null);

    useEffect(() => {
        axioxPublic.get("/hotels")
            .then((res) => {
                setHotels(res.data.hotels);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [axioxPublic]);

    const [showHotels, setShowHotels] = useState(true);
    const [showHotelText, setShowHotelText] = useState("Hide Hotels");

    const handleShowHotels = () => {
        setShowHotels(!showHotels);
        setShowHotelText(showHotels ? "Show Hotels" : "Hide Hotels");
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const handleNextPage = () => {
        if (currentPage < Math.ceil(hotels?.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const paginatedHotels = hotels?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="p-4 mx-4">
            <button
                onClick={handleShowHotels}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
                {showHotelText}
            </button>
            {showHotels && (
                <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                        {paginatedHotels?.flatMap((hotel, index) =>
                            Array.from({ length: 3 }).map((_, roomIndex) => (
                                <div
                                    key={`${index}-${roomIndex}`}
                                    className="border border-gray-300 rounded-lg p-4 text-center shadow-md"
                                >
                                    <img
                                        src={hotel.hotelImages[0]}
                                        alt={hotel.name}
                                        className="w-full h-40 object-cover rounded-lg"
                                    />
                                    <h2 className="text-lg font-semibold mt-4">{hotel.name}</h2>
                                    <p className="text-gray-600">Room Type: {hotel.rooms[roomIndex].type}</p>
                                    <p className="text-gray-800 font-bold">Price: BDT{hotel.rooms[roomIndex].pricePerNight}</p>
                                    <p className="text-gray-500 mb-4">Ocupacy: {hotel.rooms[roomIndex].maxOccupancy}</p>
                                    <Link
                                        to={`/hotelDetails/${hotel.id}`}
                                        state={{ hotel, roomIndex }}
                                        className="bg-green-500 text-white  px-4 py-2 rounded hover:bg-green-600 transition"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="flex justify-center items-center mt-6">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 mx-2 rounded ${currentPage === 1
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                                }`}
                        >
                            Previous
                        </button>
                        <span className="text-gray-700">
                            Page {currentPage} of {Math.ceil(hotels?.length / itemsPerPage)}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === Math.ceil(hotels?.length / itemsPerPage)}
                            className={`px-4 py-2 mx-2 rounded ${currentPage === Math.ceil(hotels?.length / itemsPerPage)
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                                }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Booking;