import React from 'react';
import Slider from 'react-slick';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
    ArrowRightIcon
} from '@heroicons/react/24/solid';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
const Banner = () => {
    // Carousel settings
    const settings = {
        dots: true,
        infinite: true,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 6000,
        fade: true,
        cssEase: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
        pauseOnHover: false,
        arrows: false
    };

    // Carousel images
    const carouselImages = [
        {
            id: 1,
            url: 'https://plus.unsplash.com/premium_photo-1712685912274-2483dade540f?q=80&w=2075&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            alt: 'Mountain landscape'
        },
        {
            id: 2,
            url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
            alt: 'Beach sunset'

        },
        {
            id: 3,
            url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
            alt: 'Road trip'
        }
    ];
    return (
        <div>
            <section className="relative h-screen w-full overflow-hidden">
                <Slider {...settings} className="h-full">
                    {carouselImages.map((image) => (
                        <div key={image.id} className="relative h-full">
                            <img
                                src={image.url}
                                alt={image.alt}
                                className="w-full h-screen object-cover brightness-75"
                                style={{ height: "100vh" }}
                            />

                            {/* Overlay Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8 }}
                                    className="max-w-4xl mx-auto space-y-8"
                                >
                                    <motion.h1
                                        className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        Where Every Road Leads to a New Story.
                                    </motion.h1>

                                    <motion.p
                                        className="text-xl text-white/90 max-w-2xl mx-auto"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3, duration: 0.8 }}
                                    >
                                        Discover hidden gems and untold adventures around the world
                                    </motion.p>

                                    <motion.div
                                        className="flex justify-center mt-8"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <motion.button
                                            className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-full flex items-center transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/30"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Explore Destinations
                                            <ArrowRightIcon className="w-5 h-5 ml-2" />
                                        </motion.button>
                                    </motion.div>
                                </motion.div>
                            </div>

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                    ))}
                </Slider>
            </section>
        </div>
    );
};

export default Banner;