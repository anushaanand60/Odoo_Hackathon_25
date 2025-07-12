import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Loader2, MessageCircle, User } from 'lucide-react';

const RatingModal = ({
    isOpen,
    onClose,
    onSubmit,
    swapRequest,
    otherUser,
    loading = false,
    existingRating = null // For editing existing ratings
}) => {
    const [rating, setRating] = useState(existingRating?.rating || 0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [feedback, setFeedback] = useState(existingRating?.feedback || '');
    const [isPublic, setIsPublic] = useState(existingRating?.isPublic ?? true);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) return;

        onSubmit({
            swapRequestId: swapRequest.id,
            ratedUserId: otherUser.id,
            rating,
            feedback: feedback.trim() || undefined,
            isPublic
        });
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
            // Reset form after a brief delay to allow modal to close
            setTimeout(() => {
                if (!existingRating) {
                    setRating(0);
                    setFeedback('');
                    setIsPublic(true);
                }
                setHoveredRating(0);
            }, 300);
        }
    };

    const StarRating = () => {
        return (
            <div className="flex items-center justify-center space-x-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="relative p-1 focus:outline-none"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        disabled={loading}
                    >
                        <Star
                            className={`w-8 h-8 transition-all duration-200 ${star <= (hoveredRating || rating)
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-400'
                                }`}
                        />
                    </motion.button>
                ))}
            </div>
        );
    };

    const getRatingText = (rating) => {
        switch (rating) {
            case 1: return 'Poor';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Very Good';
            case 5: return 'Excellent';
            default: return 'Select a rating';
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/30 max-w-md w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">
                            {existingRating ? 'Update Rating' : 'Rate Your Experience'}
                        </h3>
                        <motion.button
                            onClick={handleClose}
                            disabled={loading}
                            className="w-8 h-8 bg-gray-800/20 hover:bg-gray-700/30 text-gray-400 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50"
                            whileHover={{ scale: loading ? 1 : 1.1 }}
                            whileTap={{ scale: loading ? 1 : 0.9 }}
                        >
                            <X className="w-4 h-4" />
                        </motion.button>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-800/20 rounded-xl border border-gray-600/30">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-2 border-gray-600/30 flex items-center justify-center overflow-hidden">
                            {otherUser.profilePhoto ? (
                                <img
                                    src={otherUser.profilePhoto.startsWith('http') ? otherUser.profilePhoto : `http://localhost:8000${otherUser.profilePhoto}`}
                                    alt={otherUser.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-6 h-6 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <h4 className="text-white font-semibold">{otherUser.name}</h4>
                            <p className="text-gray-400 text-sm">How was your skill swap experience?</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Star Rating */}
                        <div className="text-center">
                            <label className="block text-sm font-medium text-gray-300 mb-4">
                                Your Rating
                            </label>
                            <StarRating />
                            <p className="text-sm text-gray-400 mt-2">
                                {getRatingText(hoveredRating || rating)}
                            </p>
                        </div>

                        {/* Feedback */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                Feedback (Optional)
                            </label>
                            <div className="relative">
                                <MessageCircle className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Share your experience with this skill swap..."
                                    disabled={loading}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800/20 backdrop-blur-sm text-white rounded-xl border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-300 placeholder-gray-500 resize-none disabled:opacity-50"
                                    rows={4}
                                    maxLength={500}
                                />
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-500">
                                    {feedback.length}/500 characters
                                </span>
                            </div>
                        </div>

                        {/* Privacy Setting */}
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="isPublic"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                disabled={loading}
                                className="w-4 h-4 text-yellow-600 bg-gray-800/20 border-gray-600/30 rounded focus:ring-yellow-500/50 focus:ring-2 disabled:opacity-50"
                            />
                            <label htmlFor="isPublic" className="text-sm text-gray-300">
                                Make this rating visible to other users
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end space-x-4 pt-4">
                            <motion.button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                className="px-6 py-3 bg-gray-800/20 hover:bg-gray-700/30 text-gray-400 rounded-xl transition-all duration-300 border border-gray-600/30 disabled:opacity-50"
                                whileHover={{ scale: loading ? 1 : 1.05 }}
                                whileTap={{ scale: loading ? 1 : 0.95 }}
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                type="submit"
                                disabled={loading || rating === 0}
                                className="flex items-center space-x-2 px-6 py-3 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-xl transition-all duration-300 border border-yellow-600/30 disabled:opacity-50"
                                whileHover={{ scale: loading || rating === 0 ? 1 : 1.05 }}
                                whileTap={{ scale: loading || rating === 0 ? 1 : 0.95 }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>{existingRating ? 'Updating...' : 'Submitting...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <Star className="w-4 h-4" />
                                        <span>{existingRating ? 'Update Rating' : 'Submit Rating'}</span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default RatingModal; 