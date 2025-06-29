// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
    StarIcon,
    ChevronRightIcon
} from '@heroicons/react/24/solid';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import VideoSection from './VideoSection/VideoSection';
import Banner from './Banner/Banner';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import { useEffect, useState } from 'react';

// const fadeInUp = {
//     hidden: { opacity: 0, y: 40 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
// };

// const staggerContainer = {
//     visible: {
//         transition: {
//             staggerChildren: 0.2
//         }
//     }
// };
const destinations = [
    {
        name: "Surumban",
        tagline: "Invitable landscapes",
        image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
    },
    {
        name: "Coverman",
        tagline: "Coastal paradise",
        image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
    },
    {
        name: "Montavia",
        tagline: "Mountain retreat",
        image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
    },
    {
        name: "Urbanis",
        tagline: "Metropolitan charm",
        image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
    },
    {
        name: "Tropica",
        tagline: "Island getaway",
        image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
    },
    {
        name: "Nordica",
        tagline: "Northern lights",
        image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
    }
];
const Home = () => {
    const axiosPublic = useAxiosPublic();

    const [reviews, setReviews] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        axiosPublic.get('/reviews')
            .then(res => setReviews(res.data))
            .catch(() => setReviews([]));
    }, [axiosPublic]);


    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Enhanced Hero Carousel Section */}
            <Banner />
            {/* Trending Destinations */}
            <section className="py-16 px-6 max-w-7xl mx-auto">
                <motion.h2
                    className="text-4xl font-bold text-center mb-16 text-gray-800"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    Trending Destinations
                </motion.h2>

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="hidden"
                    whileInView="visible"
                    variants={{
                        hidden: {},
                        visible: {
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {destinations.map((destination, index) => (
                        <motion.div
                            key={index}
                            className="group relative aspect-square overflow-hidden rounded-xl shadow-lg"
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: { duration: 0.5 }
                                }
                            }}
                            whileHover={{ scale: 1.03 }}
                        >
                            <img
                                src={destination.image}
                                alt={destination.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                                <div className="text-white">
                                    <h3 className="text-2xl font-bold">{destination.name}</h3>
                                    <p className="text-gray-200">{destination.tagline}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Discovery Section */}
            <VideoSection />

            {/* Testimonials Section */}
            <section className="py-20 px-6 max-w-4xl mx-auto">
                <motion.h2
                    className="text-4xl font-bold text-center mb-16 text-gray-800"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    TESTIMONIALS
                </motion.h2>

                <div className="relative min-h-[300px]">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={index}
                            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 absolute top-0 left-0 w-full"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{
                                opacity: activeIndex === index ? 1 : 0,
                                scale: activeIndex === index ? 1 : 0.95,
                                zIndex: activeIndex === index ? 1 : 0
                            }}
                            transition={{ duration: 0.6 }}
                            whileHover={{ y: activeIndex === index ? -5 : 0 }}
                        >
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon key={i} className="w-6 h-6 text-amber-400" />
                                ))}
                                <span className="ml-2 text-gray-600">{review.rating}</span>
                            </div>
                            <motion.p
                                className="text-lg text-gray-600 mb-6 italic leading-relaxed"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: activeIndex === index ? 1 : 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                {review.comment}
                            </motion.p>
                            <motion.p
                                className="font-bold text-gray-800 text-right"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: activeIndex === index ? 1 : 0, x: activeIndex === index ? 0 : 20 }}
                                transition={{ delay: 0.4 }}
                            >
                                {review.name}
                            </motion.p>
                        </motion.div>
                    ))}
                </div>

                <div className="flex justify-center mt-12 gap-2">
                    {reviews.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={`w-3 h-3 rounded-full ${activeIndex === index ? 'bg-rose-500' : 'bg-gray-300'}`}
                            aria-label={`Go to testimonial ${index + 1}`}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;