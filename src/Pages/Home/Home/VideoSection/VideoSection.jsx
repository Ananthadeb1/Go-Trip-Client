/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    PlayIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowRightIcon,
    StarIcon
} from '@heroicons/react/24/solid';

const VideoSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            "id": 0,
            "videoId": "YPxfs_hYOnw",
            "title": "Cox's Bazar Beach Paradise",
            "description": "Experience the world's longest natural sea beach stretching over 120 kilometers. Golden sands, gentle waves, and breathtaking sunsets make this UNESCO World Heritage site a must-visit destination.",
            "location": "Cox's Bazar, Bangladesh"
        },
        {
            "id": 1,
            "videoId": "YAuMCIdWjHE",
            "title": "Sundarbans Mangrove Adventure",
            "description": "Explore the largest mangrove forest in the world, home to the majestic Royal Bengal Tiger. Navigate through winding waterways and discover incredible biodiversity in this UNESCO World Heritage site.",
            "location": "Sundarbans Mangrove Forest, Bangladesh"
        },
        {
            "id": 2,
            "videoId": "QHhGeWyxntI",
            "title": "Jaflong Stone Collection",
            "description": "Witness the unique stone collection process along the Piyain River. Crystal clear waters, rolling hills, and the fascinating sight of stone collectors make this a photographer's paradise.",
            "location": "Jaflong, Sylhet, Bangladesh"
        },
        {
            "id": 3,
            "videoId": "k9UZl3F35qY",
            "title": "Tanguar Haor Wetland Wonder",
            "description": "Discover Bangladesh's second largest freshwater wetland, known as the 'Swamp Forest'. During monsoon, it transforms into a vast water body dotted with small islands and rich wildlife.",
            "location": "Tanguar Haor, Sunamganj, Bangladesh"
        },
        {
            "id": 4,
            "videoId": "JaDXA_xgSUo",
            "title": "Kuakata Panoramic Sea Beach",
            "description": "The only beach in Bangladesh where you can see both sunrise and sunset over the Bay of Bengal. Experience the unique blend of sea, forest, and local Rakhine culture.",
            "location": "Kuakata, Barishal, Bangladesh"
        },
        {
            "id": 5,
            "videoId": "ePMHvmE9oKM",
            "title": "Sajek Valley Cloud Kingdom",
            "description": "Known as the 'Queen of Hills', Sajek offers breathtaking views above the clouds. Experience indigenous culture, misty mornings, and panoramic valley views from Bangladesh's highest peak.",
            "location": "Sajek, Bangladesh"
        },
        {
            "id": 6,
            "videoId": "w7RiJuePDu4",
            "title": "Rangamati Lake District",
            "description": "Explore the largest artificial lake in Bangladesh surrounded by hills and forests. Enjoy boat rides, visit indigenous communities, and experience the serene beauty of the Chittagong Hill Tracts.",
            "location": "Rangamati, Bangladesh"
        },
        {
            "id": 7,
            "videoId": "_GgW2Lv-hYQ",
            "title": "Khagrachhari Hill Paradise",
            "description": "Discover the land of hills, waterfalls, and diverse indigenous cultures. Trek through lush green hills, visit traditional villages, and enjoy the cool mountain climate.",
            "location": "Khagrachhari, Bangladesh"
        },
        {
            "id": 8,
            "videoId": "94zx-kCBVoI",
            "title": "Sitakunda Eco Park",
            "description": "Experience the botanical garden and eco-park with diverse flora and fauna. Home to the Chandranath Temple and offering hiking trails through tropical forests.",
            "location": "Sitakunda, Bangladesh"
        },
        {
            "id": 9,
            "videoId": "Dh9-DMxZdA0",
            "title": "Saint Martin's Coral Island",
            "description": "Bangladesh's only coral island offering pristine beaches, crystal clear waters, and vibrant marine life. Perfect for snorkeling, diving, and experiencing untouched natural beauty.",
            "location": "Saint Martin, Bangladesh"
        },
        {
            "id": 10,
            "videoId": "vueBUA2wpFw",
            "title": "Sreemangal Tea Capital",
            "description": "Known as the 'Tea Capital of Bangladesh', explore endless tea gardens, experience tea processing, and visit the Lawachara National Park with its diverse wildlife.",
            "location": "Sreemangal, Bangladesh"
        },
        {
            "id": 11,
            "videoId": "Kvaz8UW0XsQ",
            "title": "Kaptai Lake Serenity",
            "description": "The largest man-made lake in Bangladesh, surrounded by hills and forests. Enjoy boat cruises, visit floating restaurants, and experience the tranquil beauty of this reservoir.",
            "location": "Kaptai Lake, Bangladesh"
        },
        {
            "id": 12,
            "videoId": "n7iX5A7z1ms",
            "title": "Comilla Archaeological Heritage",
            "description": "Explore ancient Buddhist ruins, archaeological sites, and historical monuments. Discover the rich cultural heritage and ancient civilization remnants of this historic region.",
            "location": "Comilla, Bangladesh"
        }
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    return (
        <section className="py-20 px-6 bg-gradient-to-br from-rose-50 to-pink-50 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-12 items-center">
                    {/* Video Carousel Section */}
                    <div className="w-full lg:w-1/2 relative group">
                        {/* Video Player with Floating Play Button */}
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black">
                            <iframe
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${slides[currentSlide].videoId}?autoplay=0&rel=0`}
                                title="Travel Video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>

                        {/* Video Navigation */}
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-[#FF2056]">Featured Adventures</h3>
                                <span className="text-sm font-medium text-[#FF2056] bg-[#FFEAEE] px-3 py-1 rounded-full">
                                    {slides[currentSlide].location}
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={prevSlide}
                                    className="bg-white hover:bg-[#FFEAEE] text-[#FF2056] p-3 rounded-full shadow-lg transition-all transform hover:scale-110"
                                >
                                    <ChevronLeftIcon className="w-6 h-6" />
                                </button>

                                <div className="flex-1 flex gap-3 overflow-x-auto py-2">
                                    {slides.map((slide, index) => (
                                        <div
                                            key={slide.id}
                                            className={`relative flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${currentSlide === index ? 'ring-4 ring-[#FF2056] scale-105' : 'opacity-80 hover:opacity-100'}`}
                                            onClick={() => setCurrentSlide(index)}
                                        >
                                            <img
                                                src={`https://i.ytimg.com/vi/${slide.videoId}/hqdefault.jpg`}
                                                alt={`Video ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                <PlayIcon className={`w-6 h-6 text-white ${currentSlide === index ? 'scale-125' : ''}`} />
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                                <p className="text-xs text-white font-medium truncate">{slide.location}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={nextSlide}
                                    className="bg-white hover:bg-[#FFEAEE] text-[#FF2056] p-3 rounded-full shadow-lg transition-all transform hover:scale-110"
                                >
                                    <ChevronRightIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Text Content Section */}
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full lg:w-1/2"
                    >
                        <div className="space-y-8">
                            <div>
                                <span className="inline-block mb-4 text-[#FF2056] font-medium bg-[#FFEAEE] px-4 py-1 rounded-full">
                                    Featured Destination
                                </span>
                                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight tracking-tight">
                                    {slides[currentSlide].title.split('\n').map((line, i) => (
                                        <React.Fragment key={i}>
                                            {line}
                                            <br />
                                        </React.Fragment>
                                    ))}
                                </h2>
                            </div>

                            <p className="text-lg text-gray-600 leading-relaxed">
                                {slides[currentSlide].description}
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <motion.button
                                    className="flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-[#FFEAEE]"
                                    style={{
                                        backgroundColor: '#FF2056',
                                        color: '#fff'
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span className="font-medium">Explore Package</span>
                                    <ArrowRightIcon className="w-5 h-5" />
                                </motion.button>

                                <button className="flex items-center gap-2 text-[#FF2056] hover:text-[#E61C4D] transition-colors group">
                                    <span className="font-medium underline decoration-2 underline-offset-4">Watch Full Series</span>
                                    <PlayIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon key={i} className="w-5 h-5 text-amber-400" />
                                ))}
                                <span className="text-sm text-gray-500">4.9 (128 reviews)</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default VideoSection;