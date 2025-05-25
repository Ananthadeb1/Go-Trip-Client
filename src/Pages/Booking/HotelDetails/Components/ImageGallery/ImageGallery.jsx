// File: HotelDetails/components/ImageGallery.jsx
const ImageGallery = ({ roomImages, activeImageIndex, setActiveImageIndex, hotel, selectedRoom }) => {
    return (
        <div className="mb-8">
            <div className="relative h-96 w-full rounded-xl overflow-hidden mb-4">
                <img
                    src={roomImages[activeImageIndex]}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                />
                {selectedRoom.isDiscounted && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-lg font-bold text-sm">
                        {selectedRoom.discountPercentage}% OFF
                    </div>
                )}
            </div>
            <div className="grid grid-cols-4 gap-2">
                {roomImages.map((img, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`h-24 rounded-lg overflow-hidden border-2 transition-all ${activeImageIndex === index
                            ? "border-blue-500 scale-105"
                            : "border-transparent hover:border-gray-300"
                            }`}
                    >
                        <img
                            src={img}
                            alt={`${hotel.name} view ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ImageGallery;
