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
import useAxiosPublic from '../../../../hooks/useAxiosPublic';
import { useQuery } from '@tanstack/react-query';

const VideoSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const axiosPublic = useAxiosPublic();

    const { data: vlog_videos = [], isLoading, isError } = useQuery({
        queryKey: ['vlog_videos'],
        queryFn: async () => {
            const response = await axiosPublic.get("/vlog_videos");
            console.log("Vlog videos fetched:", response.data);
            return response.data;
        }
    });

    const nextSlide = () => {
        if (vlog_videos.length === 0) return;
        setCurrentSlide((prev) => (prev === vlog_videos.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        if (vlog_videos.length === 0) return;
        setCurrentSlide((prev) => (prev === 0 ? vlog_videos.length - 1 : prev - 1));
    };

    if (isLoading) {
        return <div className="py-20 px-6 bg-gradient-to-br from-rose-50 to-pink-50">Loading videos...</div>;
    }

    if (isError) {
        return <div className="py-20 px-6 bg-gradient-to-br from-rose-50 to-pink-50">Error loading videos</div>;
    }

    if (vlog_videos.length === 0) {
        return <div className="py-20 px-6 bg-gradient-to-br from-rose-50 to-pink-50">No videos available</div>;
    }

    const currentVideo = vlog_videos[currentSlide];

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
                                src={`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=0&rel=0`}
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
                                    {currentVideo.location}
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
                                    {vlog_videos.map((slide, index) => (
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
                                    {currentVideo.title.split('\n').map((line, i) => (
                                        <React.Fragment key={i}>
                                            {line}
                                            <br />
                                        </React.Fragment>
                                    ))}
                                </h2>
                            </div>

                            <p className="text-lg text-gray-600 leading-relaxed">
                                {currentVideo.description}
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