import React from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircle, User } from 'lucide-react';

const RatingDisplay = ({ 
    averageRating = 0, 
    totalRatings = 0, 
    showDetails = false,
    size = 'normal', // 'small', 'normal', 'large'
    className = ''
}) => {
    const formatRating = (rating) => {
        return rating ? rating.toFixed(1) : '0.0';
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'small':
                return {
                    star: 'w-3 h-3',
                    text: 'text-xs',
                    rating: 'text-sm'
                };
            case 'large':
                return {
                    star: 'w-6 h-6',
                    text: 'text-base',
                    rating: 'text-xl'
                };
            default:
                return {
                    star: 'w-4 h-4',
                    text: 'text-sm',
                    rating: 'text-base'
                };
        }
    };

    const sizeClasses = getSizeClasses();

    const StarRating = ({ rating, interactive = false }) => {
        return (
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${sizeClasses.star} transition-all duration-200 ${
                            star <= Math.round(rating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-400'
                        }`}
                    />
                ))}
            </div>
        );
    };

    if (totalRatings === 0) {
        return (
            <div className={`flex items-center space-x-2 text-gray-400 ${className}`}>
                <StarRating rating={0} />
                <span className={sizeClasses.text}>No ratings yet</span>
            </div>
        );
    }

    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <StarRating rating={averageRating} />
            <div className="flex items-center space-x-1">
                <span className={`font-semibold text-yellow-400 ${sizeClasses.rating}`}>
                    {formatRating(averageRating)}
                </span>
                {showDetails && (
                    <span className={`text-gray-400 ${sizeClasses.text}`}>
                        ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
                    </span>
                )}
            </div>
        </div>
    );
};

// Component to display individual rating cards
export const RatingCard = ({ rating, showRater = true }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/20 backdrop-blur-sm rounded-xl p-4 border border-gray-600/30"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                {showRater && (
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-gray-600/30 flex items-center justify-center overflow-hidden">
                            {rating.rater.profilePhoto ? (
                                <img
                                    src={rating.rater.profilePhoto.startsWith('http') ? rating.rater.profilePhoto : `http://localhost:8000${rating.rater.profilePhoto}`}
                                    alt={rating.rater.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-4 h-4 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">{rating.rater.name}</p>
                            <p className="text-gray-400 text-xs">
                                {new Date(rating.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                )}
                <RatingDisplay 
                    averageRating={rating.rating} 
                    totalRatings={1} 
                    size="small"
                />
            </div>

            {/* Feedback */}
            {rating.feedback && (
                <div className="bg-gray-700/20 rounded-lg p-3 border border-gray-600/20">
                    <div className="flex items-start space-x-2">
                        <MessageCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-300 text-sm italic">"{rating.feedback}"</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

// Component to display rating statistics with distribution
export const RatingStats = ({ stats }) => {
    const { averageRating = 0, totalRatings = 0, distribution = {} } = stats;

    const getPercentage = (count) => {
        return totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
    };

    return (
        <div className="bg-gray-800/20 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
            <h4 className="text-white font-semibold mb-4">Rating Overview</h4>
            
            {/* Overall Rating */}
            <div className="flex items-center space-x-4 mb-6">
                <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">
                        {averageRating ? averageRating.toFixed(1) : '0.0'}
                    </div>
                    <RatingDisplay 
                        averageRating={averageRating} 
                        totalRatings={totalRatings}
                        size="normal"
                    />
                    <p className="text-gray-400 text-sm mt-1">
                        {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
                    </p>
                </div>
                
                {/* Distribution */}
                <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center space-x-2 mb-1">
                            <span className="text-gray-400 text-sm w-2">{stars}</span>
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <div className="flex-1 bg-gray-700/30 rounded-full h-2">
                                <div
                                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${getPercentage(distribution[stars] || 0)}%` }}
                                />
                            </div>
                            <span className="text-gray-400 text-xs w-8">
                                {distribution[stars] || 0}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RatingDisplay; 