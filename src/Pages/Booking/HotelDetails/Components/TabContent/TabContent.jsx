// File: HotelDetails/components/TabContent.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faMapMarkerAlt, faConciergeBell, faWifi, faSwimmingPool, faUtensils, faParking, faSnowflake, faDumbbell, faPaw, faSpa } from "@fortawesome/free-solid-svg-icons";
import HotelPolicies from "../HotelPolicies/HotelPolicies";

const getAmenityIcon = (amenity) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi')) return faWifi;
    if (lowerAmenity.includes('pool')) return faSwimmingPool;
    if (lowerAmenity.includes('restaurant') || lowerAmenity.includes('dining')) return faUtensils;
    if (lowerAmenity.includes('parking')) return faParking;
    if (lowerAmenity.includes('ac') || lowerAmenity.includes('air conditioning')) return faSnowflake;
    if (lowerAmenity.includes('gym') || lowerAmenity.includes('fitness')) return faDumbbell;
    if (lowerAmenity.includes('pet')) return faPaw;
    if (lowerAmenity.includes('spa')) return faSpa;
    return faConciergeBell;
};

const TabContent = ({ activeTab, hotel, selectedRoom, averageRating }) => {
    return (
        <div className="mb-8">
            {activeTab === "overview" && (
                <div>
                    <h3 className="text-xl font-semibold mb-4">About {hotel.name}</h3>
                    <p className="text-gray-700 mb-6">{hotel.description}</p>

                    <h4 className="text-lg font-semibold mb-3">Room Details</h4>
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h5 className="font-bold text-lg">{selectedRoom.type}</h5>
                                <p className="text-gray-600 mb-2">
                                    {selectedRoom.size} sqm · Max {selectedRoom.maxOccupancy} guests
                                </p>
                                {selectedRoom.amenities?.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedRoom.amenities.slice(0, 3).map((amenity) => (
                                            <span
                                                key={amenity}
                                                className="bg-white px-3 py-1 rounded-full text-sm flex items-center"
                                            >
                                                <FontAwesomeIcon
                                                    icon={getAmenityIcon(amenity)}
                                                    className="mr-2 text-blue-500"
                                                />
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="text-right">
                                {selectedRoom.isDiscounted ? (
                                    <>
                                        <span className="text-gray-400 line-through mr-2">
                                            BDT {selectedRoom.pricePerNight}
                                        </span>
                                        <span className="text-xl font-bold text-red-600">
                                            BDT {Math.round(selectedRoom.pricePerNight * (1 - selectedRoom.discountPercentage / 100))}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-xl font-bold text-gray-900">
                                        BDT {selectedRoom.pricePerNight}
                                    </span>
                                )}
                                <div className="text-sm text-gray-500">per night</div>
                            </div>
                        </div>
                        <p className="text-gray-700">{selectedRoom.description}</p>
                    </div>
                </div>
            )}

            {activeTab === "amenities" && (
                <div>
                    <h3 className="text-xl font-semibold mb-4">Hotel Amenities</h3>
                    {hotel.amenities?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {hotel.amenities.map((amenity) => (
                                <div key={amenity} className="bg-white p-4 rounded-lg border border-gray-200 flex items-center">
                                    <FontAwesomeIcon icon={getAmenityIcon(amenity)} className="text-blue-500 mr-3 text-xl" />
                                    <span>{amenity}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No hotel amenities listed</p>
                    )}

                    <h3 className="text-xl font-semibold mt-8 mb-4">Room Amenities</h3>
                    {selectedRoom.amenities?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {selectedRoom.amenities.map((amenity) => (
                                <div key={amenity} className="bg-white p-4 rounded-lg border border-gray-200 flex items-center">
                                    <FontAwesomeIcon icon={getAmenityIcon(amenity)} className="text-blue-500 mr-3 text-xl" />
                                    <span>{amenity}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No room amenities listed</p>
                    )}
                </div>
            )}

            {activeTab === "reviews" && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold">
                            Guest Reviews ({hotel.reviews?.length || 0})
                        </h3>
                        <div className="bg-blue-100 px-4 py-2 rounded-full flex items-center">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-2" />
                            <span className="font-bold">{averageRating} out of 5</span>
                        </div>
                    </div>
                    {hotel.reviews?.length > 0 ? (
                        <div className="space-y-6">
                            {hotel.reviews.map((review, index) => (
                                <div key={index} className="border-b pb-6">
                                    <div className="flex justify-between mb-2">
                                        <div>
                                            <h4 className="font-semibold">{review.userName}</h4>
                                            <div className="flex items-center text-sm text-gray-500">
                                                {new Date(review.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <FontAwesomeIcon
                                                    key={i}
                                                    icon={faStar}
                                                    className={`${i < review.rating ? "text-yellow-400" : "text-gray-300"} mr-1`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <h5 className="font-medium mb-2">{review.title}</h5>
                                    <p className="text-gray-700">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            No reviews yet. Be the first to review!
                        </div>
                    )}
                </div>
            )}

            {activeTab === "location" && (
                <div>
                    <h3 className="text-xl font-semibold mb-4">Location</h3>
                    <div className="bg-gray-100 rounded-lg overflow-hidden mb-6 h-64">
                        <div className="w-full h-full flex items-center justify-center bg-blue-50">
                            <div className="text-center">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-red-500 text-4xl mb-2" />
                                <p className="font-semibold">{hotel.name}</p>
                                <p className="text-gray-600">{hotel.address}</p>
                            </div>
                        </div>
                    </div>
                    <h4 className="font-semibold mb-2">Nearby Attractions</h4>
                    {hotel.nearbyAttractions?.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                            {hotel.nearbyAttractions.map((attraction, index) => (
                                <li key={index}>{attraction}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No nearby attractions information available</p>
                    )}
                </div>
            )}
            {activeTab === "policies" && (
                <div>
                    <h3 className="text-xl font-semibold mb-4">Hotel Policies</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        {hotel.policies?.map((policy, index) => (
                            <li key={index}>{policy}</li>
                        ))}
                        <HotelPolicies></HotelPolicies>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TabContent;
