// Home.jsx
import {motion, AnimatePresence } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import VideoSection from './VideoSection/VideoSection';
import Banner from './Banner/Banner';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import { useEffect, useState } from 'react';
import useAuth from '../../../hooks/useAuth';

// Clean, decoupled configuration data 
const destinations = [
    {
        name: "Sundarbans",
        tagline: "Invitable landscapes",
        image: "https://media.istockphoto.com/id/2170474187/photo/a-canal-in-sundarbans.jpg?s=2048x2048&w=is&k=20&c=KFshxr5xfEZqfGLdlEcbV1eCVyKKBjLv_mwxJRkHOxQ="
    },
    {
        name: "Cox's Bazar",
        tagline: "Sea view beauty",
        image: "https://images.unsplash.com/photo-1503803548695-c2a7b4a5b875?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        name: "Gazipur",
        tagline: "Forest Street Escape",
        image: "https://media.istockphoto.com/id/1077237952/photo/road-in-the-forest-moody-style-image.jpg?s=2048x2048&w=is&k=20&c=kdSvIMme7xp5_1XPlmuNt4rXsL2E5huGf8WeO9d1Drw="
    },
    {
        name: "Puran Dhaka",
        tagline: "History and Culture",
        image: "https://images.unsplash.com/photo-1616458050653-0f365d14e93b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        name: "Bandarban",
        tagline: "Rocky Mountain & Clouds",
        image: "https://images.unsplash.com/photo-1501761095094-94d36f57edbb?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        name: "Sylhet",
        tagline: "Enjoy Wholesome Waterfalls",
        image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
    }
];

const Home = () => {
    const axiosPublic = useAxiosPublic();
    const { loggedUser } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);

    // Architectural fix: Confine log side effects strictly to a lifecycle wrapper
    useEffect(() => {
        if (loggedUser) {
            console.log("Logged user:", loggedUser.email);
        } else {
            console.log("No current active user session status monitored.");
        }
    }, [loggedUser]);

    useEffect(() => {
        let isMounted = true;
        axiosPublic.get('/reviews')
            .then(res => {
                if (isMounted) setReviews(res.data);
            })
            .catch(() => {
                if (isMounted) setReviews([]);
            });
        return () => { isMounted = false; };
    }, [axiosPublic]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 antialiased selection:bg-rose-500 selection:text-white">
            <Banner />

            {/* Trending Destinations */}
            <section className="py-20 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-14">
                    <motion.h2
                        className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        Trending Destinations
                    </motion.h2>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">Handpicked local escapes tailored for your next itinerary venture.</p>
                </div>

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                    initial="hidden"
                    whileInView="visible"
                    variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.08 } }
                    }}
                    viewport={{ once: true, margin: "-50px" }}
                >
                    {destinations.map((destination, index) => (
                        <motion.div
                            key={index}
                            className="group relative aspect-[4/3] overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 bg-gray-200"
                            variants={{
                                hidden: { opacity: 0, y: 25 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                            }}
                            whileHover={{ y: -4 }}
                        >
                            <img
                                src={destination.image}
                                alt={destination.name}
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                                <div className="text-white transform transition-transform duration-300 group-hover:translate-y-[-2px]">
                                    <h3 className="text-xl md:text-2xl font-bold tracking-tight">{destination.name}</h3>
                                    <p className="text-gray-200 text-xs md:text-sm mt-0.5 opacity-90">{destination.tagline}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            <VideoSection />

            {/* Testimonials Section */}
            <section className="py-24 px-4 max-w-4xl mx-auto overflow-hidden">
                <div className="text-center mb-12">
                    <h2 className="text-xs font-bold tracking-widest text-rose-500 uppercase">Testimonials</h2>
                    <p className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1">What Explorers Say</p>
                </div>

                {reviews.length > 0 && (
                    <div className="relative min-h-[220px] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex}
                                className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 w-full text-center"
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                <div className="flex justify-center items-center gap-1 mb-5">
                                    {[...Array(5)].map((_, i) => (
                                        <StarIcon key={i} className={`w-5 h-5 ${i < Math.round(reviews[activeIndex].rating || 5) ? 'text-amber-400' : 'text-gray-200'}`} />
                                    ))}
                                </div>
                                <blockquote className="text-base md:text-lg text-gray-600 mb-6 italic leading-relaxed font-medium">
                                    "{reviews[activeIndex].comment}"
                                </blockquote>
                                <cite className="block not-italic font-bold text-gray-900 text-sm md:text-base">
                                    — {reviews[activeIndex].name}
                                </cite>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )}

                {/* Pagination Dots */}
                {reviews.length > 1 && (
                    <div className="flex justify-center mt-8 gap-2.5">
                        {reviews.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveIndex(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${activeIndex === index ? 'w-6 bg-rose-500' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;