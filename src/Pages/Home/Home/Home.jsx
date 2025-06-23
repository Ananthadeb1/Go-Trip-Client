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

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
    visible: {
        transition: {
            staggerChildren: 0.2
        }
    }
};

const Home = () => {


    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Enhanced Hero Carousel Section */}
            <Banner />
            {/* Trending Destinations */}
            <section className="py-10 px-6 max-w-7xl mx-auto">
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
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    initial="hidden"
                    whileInView="visible"
                    variants={staggerContainer}
                    viewport={{ once: true }}
                >
                    <motion.div
                        className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                        variants={fadeInUp}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div
                            className="h-80 bg-cover bg-center flex items-center justify-center"
                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80')" }}
                        >
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-500" />
                            <h3 className="text-4xl font-bold text-white relative z-10">SURUMBAN</h3>
                        </div>
                        <p className="p-6 text-lg text-gray-600">INVITABLE</p>
                    </motion.div>

                    <motion.div
                        className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                        variants={fadeInUp}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div
                            className="h-80 bg-cover bg-center flex items-center justify-center"
                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80')" }}
                        >
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-500" />
                            <h3 className="text-4xl font-bold text-white relative z-10">COVERMAN</h3>
                        </div>
                        <button className="w-full py-4 flex items-center justify-center gap-2 text-rose-500 hover:text-rose-600 transition-colors">
                            See More <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </motion.div>
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

                <motion.div
                    className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                >
                    <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className="w-6 h-6 text-amber-400" />
                        ))}
                        <span className="ml-2 text-gray-600">66</span>
                    </div>
                    <motion.p
                        className="text-lg text-gray-600 mb-6 italic leading-relaxed"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        viewport={{ once: true }}
                    >
                        When sometimes asked over by yoga, contact us by school, exercises or exams applied a large set to find,
                        in a storyteller's first two words—all that is true for my mother online? A step-throwing 5-10 days.
                    </motion.p>
                    <motion.p
                        className="font-bold text-gray-800 text-right"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        viewport={{ once: true }}
                    >
                        JANE DOE
                    </motion.p>
                </motion.div>

                <motion.div
                    className="flex justify-center mt-12"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    viewport={{ once: true }}
                >
                    <motion.button
                        className="border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white px-8 py-3 rounded-full transition-all duration-300 flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        SEE MORE
                        <ChevronRightIcon className="w-5 h-5" />
                    </motion.button>
                </motion.div>
            </section>
        </div>
    );
};

export default Home;