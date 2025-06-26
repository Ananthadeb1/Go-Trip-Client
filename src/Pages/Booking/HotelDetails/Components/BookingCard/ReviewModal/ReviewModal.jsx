import { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faTimes } from "@fortawesome/free-solid-svg-icons";
import useAxiosPublic from '../../../../../../hooks/useAxiosPublic';
import useAuth from '../../../../../../hooks/useAuth';

const ReviewModal = ({ setReviewModalOpen }) => {
    const [review, setReview] = useState({ rating: 5, comment: '' });
    const AxiosPublic = useAxiosPublic();
    const { loggedUser } = useAuth();
    console.log("review loggedUser", loggedUser.uid);

    return (
        <div className="fixed inset-0 z-[99]  bg-opacity-50 backdrop-blur-xl shadow-lg">
            <div className='fixed inset-0 z-[100] flex items-center justify-center'>
                <div className="bg-gradient-to-r from-[#FEF0F2] to-[#EEF2FF] rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Share Your Experience</h3>
                        <button
                            onClick={() => setReviewModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    <div className="text-center mb-6">
                        <p className="text-gray-600 mb-4">
                            How was your experience with our website?
                        </p>
                        <div className="flex justify-center space-x-2 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setReview({ ...review, rating: star })}
                                    className="focus:outline-none transform hover:scale-110 transition-transform"
                                >
                                    <FontAwesomeIcon
                                        icon={faStar}
                                        className={`text-3xl ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400">
                            {review.rating} star{review.rating !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <textarea
                        value={review.comment}
                        onChange={(e) => setReview({ ...review, comment: e.target.value })}
                        placeholder="Tell us more about your experience (optional)..."
                        rows="4"
                        className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:ring-[#FF2056] focus:border-[#FF2056] resize-none"
                    />

                    <div className="flex space-x-3">
                        <button
                            onClick={() => setReviewModalOpen(false)}
                            className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Skip
                        </button>
                        <button
                            onClick={async () => {
                                await AxiosPublic.patch(`/reviews/${loggedUser.uid}`, {
                                    userId: loggedUser?.uid,
                                    userName: loggedUser?.name,
                                    rating: review.rating,
                                    comment: review.comment,
                                });
                                setReviewModalOpen(false);
                                import('sweetalert2').then(Swal => {
                                    Swal.default.fire({
                                        position: 'top',
                                        icon: 'success',
                                        title: 'Thank you for your review!',
                                        showConfirmButton: false,
                                        timer: 2000,
                                        timerProgressBar: true,
                                        toast: true,
                                        background: '#fff',
                                        color: '#333'
                                    });
                                });
                            }}
                            className="flex-1 py-2 bg-[#FF2056] text-white rounded-lg hover:bg-[#E61C4D] transition-colors font-medium"
                        >
                            Submit Review
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;