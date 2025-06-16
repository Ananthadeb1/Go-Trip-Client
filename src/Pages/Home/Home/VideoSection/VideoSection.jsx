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
            id: 1,
            videoId: 'Cn4G2lZ_g2I',
            title: "A Simply Perfect Place\nTo Get Lost",
            description: "Treat yourself with a journey to your inner self. Visit a mystique Tibet and start your spiritual adventure. We promise, you'll enjoy every step you make.",
            location: " Bangladesh"
        },
        {
            id: 2,
            videoId: 'HZWzn9geEqY',
            title: "Discover Hidden\nWonders",
            description: "Explore breathtaking landscapes and cultural treasures that will transform your perspective on travel.",
            location: "Bandarban, Bangladesh"
        },
        {
            id: 3,
            videoId: 'YPxfs_hYOnw',
            title: "Journey to Inner\nPeace",
            description: "Experience the serenity of ancient monasteries and the wisdom of spiritual guides.",
            location: "Cox's Bazar, Bangladesh"
        }
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    return (
        <section className="py-20 px-6 bg-gradient-to-br from-emerald-50 to-cyan-50 overflow-hidden">
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
                                <h3 className="text-lg font-semibold text-emerald-800">Featured Adventures</h3>
                                <span className="text-sm font-medium text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                                    {slides[currentSlide].location}
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={prevSlide}
                                    className="bg-white hover:bg-emerald-100 text-emerald-600 p-3 rounded-full shadow-lg transition-all transform hover:scale-110"
                                >
                                    <ChevronLeftIcon className="w-6 h-6" />
                                </button>

                                <div className="flex-1 flex gap-3 overflow-x-auto py-2">
                                    {slides.map((slide, index) => (
                                        <div
                                            key={slide.id}
                                            className={`relative flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${currentSlide === index ? 'ring-4 ring-emerald-400 scale-105' : 'opacity-80 hover:opacity-100'}`}
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
                                    className="bg-white hover:bg-emerald-100 text-emerald-600 p-3 rounded-full shadow-lg transition-all transform hover:scale-110"
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
                                <span className="inline-block mb-4 text-emerald-600 font-medium bg-emerald-100 px-4 py-1 rounded-full">
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
                                    className="flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-emerald-200"
                                    style={{
                                        backgroundColor: '#03946D',
                                        color: '#fff'
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span className="font-medium">Explore Package</span>
                                    <ArrowRightIcon className="w-5 h-5" />
                                </motion.button>

                                <button className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors group">
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