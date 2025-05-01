
import { useLocation } from 'react-router-dom';
import "keen-slider/keen-slider.min.css"
// import "./styles.css"

const HotelDetails = () => {
    const location = useLocation();
    const { hotel, roomIndex } = location.state || {};
    const room = hotel?.rooms?.[roomIndex] || {};
    console.log("Hotel Details:", room);


    return (
        <div className="flex flex-row p-5">
            {/* Image Slider */}
            <div className="w-8/12 keen-slider">
                {room.roomImages?.map((image, index) => (
                    <div key={index} className="keen-slider__slide">
                        <img
                            src={image}
                            alt={`Room Image ${index + 1}`}
                            className="w-full h-64 object-cover transition-transform duration-300 hover:scale-110"
                        />
                    </div>
                ))}
            </div>

            {/* Information Bar */}
            <div className="w-4/12 p-4 border border-gray-300 rounded shadow">
                <h2 className="text-xl font-semibold mb-2">{room.name || 'Room Name'}</h2>
                <p className="mb-2"><strong>Price:</strong> ${room.pricePerNight || 'N/A'}</p>
                <p className="mb-2"><strong>Description:</strong> {room.description || 'No description available'}</p>
                <p className="mb-2"><strong>Capacity:</strong> {room.capacity || 'N/A'} guests</p>
                <p><strong>Facilities:</strong> {room.facilities?.join(', ') || 'No facilities listed'}</p>
            </div>
        </div >
    );
};

export default HotelDetails;
