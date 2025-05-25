// File: HotelDetails/components/SimilarHotels.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";

const SimilarHotels = ({ similarHotels, location, navigate, startDate, endDate, guests }) => {
    return (
        <div>
            <h3 className="text-xl font-semibold mb-4">Similar Hotels in {location}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {similarHotels.slice(0, 3).map((similarHotel) => (
                    <div
                        key={similarHotel.id}
                        className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() =>
                            navigate(`/hotelDetails/${similarHotel.id}`, {
                                state: {
                                    hotel: similarHotel,
                                    roomIndex: 0,
                                    checkInDate: startDate?.toISOString(),
                                    checkOutDate: endDate?.toISOString(),
                                    totalPersons: guests,
                                },
                            })
                        }
                    >
                        <div className="h-40 overflow-hidden">
                            <img
                                src={similarHotel.hotelImages[0]}
                                alt={similarHotel.name}
                                className="w-full h-full object-cover transition-transform hover:scale-110 duration-300"
                            />
                        </div>
                        <div className="p-3">
                            <h4 className="font-semibold line-clamp-1">{similarHotel.name}</h4>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 text-xs" />
                                <span>{similarHotel.location}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1 text-xs" />
                                    <span className="text-sm font-medium">
                                        {similarHotel.reviews?.length > 0
                                            ? (
                                                similarHotel.reviews.reduce((sum, review) => sum + review.rating, 0) /
                                                similarHotel.reviews.length
                                            ).toFixed(1)
                                            : "New"}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold">
                                        BDT {similarHotel.rooms[0].pricePerNight}
                                    </span>
                                    <div className="text-xs text-gray-500">per night</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SimilarHotels;
