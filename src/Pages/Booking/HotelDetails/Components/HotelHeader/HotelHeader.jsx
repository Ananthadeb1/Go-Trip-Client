import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faStarHalfAlt, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";

const HotelHeader = ({ hotel, averageRating }) => {
    // Calculate full, half, and empty stars
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating - fullStars >= 0.25 && averageRating - fullStars < 0.75;
    const stars = [];

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars.push(
                <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    className="text-yellow-400 mr-1"
                />
            );
        } else if (i === fullStars && hasHalfStar) {
            stars.push(
                <FontAwesomeIcon
                    key={i}
                    icon={faStarHalfAlt}
                    className="text-yellow-400 mr-1"
                />
            );
        } else {
            stars.push(
                <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    className="text-gray-300 mr-1"
                />
            );
        }
    }

    return (
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
            <div className="flex items-center mb-4">
                <div className="flex items-center mr-4">
                    {stars}
                    <span className="ml-1 text-gray-600">
                        {averageRating} ({hotel.reviews?.length || 0} reviews)
                    </span>
                </div>
                <div className="flex items-center text-gray-600">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                    <span>{hotel.location}</span>
                </div>
            </div>
        </div>
    );
};

export default HotelHeader;
