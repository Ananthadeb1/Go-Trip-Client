import { faFacebookF, faInstagram, faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Footer = () => {
    return (
        <footer>
            <div className="footer h-72 flex flex-col md:flex-row gap-0 py-0 text-white">
                <div className="w-full h-full md:w-1/2  flex justify-center items-center" style={{ backgroundColor: '#1F2937' }}>
                    <div className="text-center h-max">
                        <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                        <p className="mb-2">Email: contact@codecrafters.com</p>
                        <p className="mb-2">Phone: +1 (123) 456-7890</p>
                        <p className="mb-2">Address: 123 Code Street, Dev City, 45678</p>
                    </div>
                </div>
                <div className="w-full md:w-1/2 h-full flex  justify-center items-center" style={{ backgroundColor: '#111827' }}>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Follow Us</h2>
                        <p>Join us on socials</p>
                        <div className="flex justify-center gap-4 mt-4">
                            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faFacebookF} size="lg" />
                            </a>
                            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faYoutube} size="lg" />
                            </a>
                            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faInstagram} size="lg" />
                            </a>
                            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faTwitter} size="lg" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-2 footer-center text-white text-center" style={{ backgroundColor: '#151515' }}>
                <div>
                    <p>Copyright © 2025 - All right reserved by Code_Crafters</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
