import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    MessageCircle,
    Send,
    Inbox,
    CheckCircle,
    XCircle,
    Clock,
    User,
    MapPin,
    Calendar,
    Star,
    Settings,
    Loader2,
    AlertCircle,
    Filter,
    MoreVertical,
    Trash2,
    Eye,
    X,
    ArrowRight
} from 'lucide-react';
import { getMyRequests, respondToRequest, cancelRequest, deleteRequest, getRequestStats, submitRating, getSwapRatings } from '../services/api';
import Navbar from './Navbar';
import { MainContent } from './Layout';
import RatingModal from './RatingModal';

const RequestForm = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [ratingLoading, setRatingLoading] = useState(false);
    const [stats, setStats] = useState({ sent: {}, received: {} });
    const [swapRatings, setSwapRatings] = useState({});

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRequests, setTotalRequests] = useState(0);

    const navigate = useNavigate();

    const tabs = [
        { id: 'all', label: 'All Requests', icon: MessageCircle },
        { id: 'sent', label: 'Sent', icon: Send },
        { id: 'received', label: 'Received', icon: Inbox }
    ];

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'accepted', label: 'Accepted' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    useEffect(() => {
        fetchRequests();
        fetchStats();
    }, [activeTab, statusFilter, currentPage]);

    useEffect(() => {
        // Fetch ratings for accepted requests
        const acceptedRequests = requests.filter(req => req.status === 'ACCEPTED');
        acceptedRequests.forEach(request => {
            fetchSwapRatings(request.id);
        });
    }, [requests]);

    const fetchRequests = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const params = {
                type: activeTab,
                status: statusFilter,
                page: currentPage,
                limit: 10
            };

            const response = await getMyRequests(params, token);
            setRequests(response.data.requests);
            setTotalPages(response.data.pagination.totalPages);
            setTotalRequests(response.data.pagination.total);
        } catch (err) {
            console.error('Error fetching requests:', err);
            setError('Failed to fetch requests');
            if (err.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await getRequestStats(token);
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const handleRequestAction = async (requestId, action, status = null) => {
        setActionLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');

            if (action === 'respond') {
                await respondToRequest(requestId, status, token);
                setSuccess(`Request ${status.toLowerCase()} successfully!`);
            } else if (action === 'cancel') {
                await cancelRequest(requestId, token);
                setSuccess('Request cancelled successfully!');
            } else if (action === 'delete') {
                await deleteRequest(requestId, token);
                setSuccess('Request deleted successfully!');
            }

            // Refresh requests and stats
            await fetchRequests();
            await fetchStats();
            setShowRequestModal(false);

        } catch (err) {
            console.error('Error performing action:', err);
            setError(err.response?.data?.error || `Failed to ${action} request`);
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'ACCEPTED': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'REJECTED': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'CANCELLED': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return Clock;
            case 'ACCEPTED': return CheckCircle;
            case 'REJECTED': return XCircle;
            case 'CANCELLED': return X;
            default: return Clock;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatAvailability = (availability) => {
        if (!availability) return 'Not specified';
        return availability.split(',').join(', ');
    };

    const fetchSwapRatings = async (swapRequestId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await getSwapRatings(swapRequestId, token);
            setSwapRatings(prev => ({
                ...prev,
                [swapRequestId]: response.data
            }));
        } catch (err) {
            console.error('Error fetching swap ratings:', err);
        }
    };

    const handleSubmitRating = async (ratingData) => {
        setRatingLoading(true);
        try {
            const token = localStorage.getItem('token');
            await submitRating(ratingData, token);
            setSuccess('Rating submitted successfully!');
            setShowRatingModal(false);

            // Refresh ratings for this swap
            await fetchSwapRatings(ratingData.swapRequestId);
        } catch (err) {
            console.error('Error submitting rating:', err);
            setError(err.response?.data?.error || 'Failed to submit rating');
        } finally {
            setRatingLoading(false);
        }
    };

    const handleRateUser = (request) => {
        setSelectedRequest(request);
        setShowRatingModal(true);
    };

    const canRateRequest = (request) => {
        if (request.status !== 'ACCEPTED') return false;
        const ratings = swapRatings[request.id];
        if (!ratings) return false;
        return ratings.canRate;
    };

    const getUserRating = (request) => {
        const ratings = swapRatings[request.id];
        if (!ratings) return null;
        return ratings.ratings.find(rating => rating.raterId === request.userId);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
            <Navbar />
            <MainContent className="p-4 pt-16 lg:pt-4">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-6xl mx-auto mb-8"
                >
                    <div className="flex items-center justify-between bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                                Swap Requests
                            </h1>
                            <div className="h-8 w-px bg-gray-600"></div>
                            <div className="flex items-center space-x-2 text-gray-400">
                                <MessageCircle className="w-5 h-5" />
                                <span>{totalRequests} total requests</span>
                            </div>
                        </div>
                    </div>
                </motion.header>

                {/* Notifications */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            className="max-w-6xl mx-auto mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl backdrop-blur-sm flex items-center space-x-2"
                        >
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </motion.div>
                    )}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            className="max-w-6xl mx-auto mb-6 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl backdrop-blur-sm flex items-center space-x-2"
                        >
                            <CheckCircle className="w-5 h-5" />
                            <span>{success}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="max-w-6xl mx-auto">
                    {/* Stats Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                    >
                        <div className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-yellow-400 font-semibold">Pending</p>
                                    <p className="text-2xl font-bold text-white">
                                        {(stats.sent.PENDING || 0) + (stats.received.PENDING || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-green-400 font-semibold">Accepted</p>
                                    <p className="text-2xl font-bold text-white">
                                        {(stats.sent.ACCEPTED || 0) + (stats.received.ACCEPTED || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                    <Send className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-blue-400 font-semibold">Sent</p>
                                    <p className="text-2xl font-bold text-white">
                                        {Object.values(stats.sent).reduce((a, b) => a + b, 0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                    <Inbox className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-purple-400 font-semibold">Received</p>
                                    <p className="text-2xl font-bold text-white">
                                        {Object.values(stats.received).reduce((a, b) => a + b, 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tabs and Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 mb-8"
                    >
                        {/* Tabs */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <motion.button
                                            key={tab.id}
                                            onClick={() => {
                                                setActiveTab(tab.id);
                                                setCurrentPage(1);
                                            }}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${activeTab === tab.id
                                                ? 'bg-purple-600/30 text-purple-400 border border-purple-600/30'
                                                : 'bg-gray-800/20 hover:bg-gray-700/30 text-gray-400 border border-gray-600/30'
                                                }`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span>{tab.label}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <motion.button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-800/20 hover:bg-gray-700/30 text-gray-400 rounded-xl transition-all duration-300 border border-gray-600/30"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Filter className="w-4 h-4" />
                                <span>Filter</span>
                            </motion.button>
                        </div>

                        {/* Filters */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="border-t border-gray-700/30 pt-4"
                                >
                                    <div className="flex items-center space-x-4">
                                        <span className="text-gray-400 text-sm">Status:</span>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => {
                                                setStatusFilter(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="px-3 py-2 bg-gray-800/20 text-white rounded-lg border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        >
                                            {statusOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Requests List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center space-x-3 text-white"
                            >
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span className="text-xl">Loading requests...</span>
                            </motion.div>
                        </div>
                    ) : requests.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20"
                        >
                            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-2">No requests found</h3>
                            <p className="text-gray-400 mb-6">
                                {activeTab === 'sent' ? 'You haven\'t sent any requests yet' :
                                    activeTab === 'received' ? 'You haven\'t received any requests yet' :
                                        'No requests to display'}
                            </p>
                            <motion.button
                                onClick={() => navigate('/search')}
                                className="flex items-center space-x-2 px-6 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-xl transition-all duration-300 border border-purple-600/30 mx-auto"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span>Discover People</span>
                                <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((request, index) => {
                                const StatusIcon = getStatusIcon(request.status);
                                const otherUser = request.isSender ? request.receiver : request.sender;

                                return (
                                    <motion.div
                                        key={request.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 hover:border-purple-500/30 transition-all duration-300"
                                    >
                                        <div className="flex items-start space-x-4">
                                            {/* User Avatar */}
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-2 border-gray-600/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {otherUser.profilePhoto ? (
                                                    <img
                                                        src={otherUser.profilePhoto.startsWith('http') ? otherUser.profilePhoto : `http://localhost:8000${otherUser.profilePhoto}`}
                                                        alt={otherUser.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="w-8 h-8 text-gray-400" />
                                                )}
                                            </div>

                                            {/* Request Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="text-white font-semibold text-lg mb-1">
                                                            {request.isSender ? `Request to ${otherUser.name}` : `Request from ${otherUser.name}`}
                                                        </h3>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                                                            <span>{formatDate(request.createdAt)}</span>
                                                            {otherUser.location && (
                                                                <div className="flex items-center space-x-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    <span>{otherUser.location}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-3">
                                                        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${getStatusColor(request.status)}`}>
                                                            <StatusIcon className="w-4 h-4" />
                                                            <span className="text-sm font-medium">{request.status}</span>
                                                        </div>

                                                        <motion.button
                                                            onClick={() => {
                                                                setSelectedRequest(request);
                                                                setShowRequestModal(true);
                                                            }}
                                                            className="w-8 h-8 bg-gray-800/20 hover:bg-gray-700/30 text-gray-400 rounded-full flex items-center justify-center transition-all duration-300"
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </motion.button>
                                                    </div>
                                                </div>

                                                {/* Message */}
                                                {request.message && (
                                                    <div className="bg-gray-800/20 rounded-xl p-4 mb-4">
                                                        <p className="text-gray-300 text-sm italic">"{request.message}"</p>
                                                    </div>
                                                )}

                                                {/* Skills Preview */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    {otherUser.skills.filter(skill => skill.type === 'OFFERED').length > 0 && (
                                                        <div>
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <Star className="w-4 h-4 text-yellow-400" />
                                                                <span className="text-yellow-400 text-sm font-medium">Offers</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {otherUser.skills.filter(skill => skill.type === 'OFFERED').slice(0, 3).map((skill) => (
                                                                    <span
                                                                        key={skill.id}
                                                                        className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-md text-xs border border-yellow-500/20"
                                                                    >
                                                                        {skill.name}
                                                                    </span>
                                                                ))}
                                                                {otherUser.skills.filter(skill => skill.type === 'OFFERED').length > 3 && (
                                                                    <span className="px-2 py-1 bg-gray-500/10 text-gray-400 rounded-md text-xs">
                                                                        +{otherUser.skills.filter(skill => skill.type === 'OFFERED').length - 3}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {otherUser.skills.filter(skill => skill.type === 'WANTED').length > 0 && (
                                                        <div>
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <Settings className="w-4 h-4 text-emerald-400" />
                                                                <span className="text-emerald-400 text-sm font-medium">Wants</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {otherUser.skills.filter(skill => skill.type === 'WANTED').slice(0, 3).map((skill) => (
                                                                    <span
                                                                        key={skill.id}
                                                                        className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-xs border border-emerald-500/20"
                                                                    >
                                                                        {skill.name}
                                                                    </span>
                                                                ))}
                                                                {otherUser.skills.filter(skill => skill.type === 'WANTED').length > 3 && (
                                                                    <span className="px-2 py-1 bg-gray-500/10 text-gray-400 rounded-md text-xs">
                                                                        +{otherUser.skills.filter(skill => skill.type === 'WANTED').length - 3}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center space-x-3">
                                                    {request.canAccept && (
                                                        <motion.button
                                                            onClick={() => handleRequestAction(request.id, 'respond', 'ACCEPTED')}
                                                            disabled={actionLoading}
                                                            className="flex items-center space-x-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-xl transition-all duration-300 border border-green-600/30 disabled:opacity-50"
                                                            whileHover={{ scale: actionLoading ? 1 : 1.05 }}
                                                            whileTap={{ scale: actionLoading ? 1 : 0.95 }}
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            <span>Accept</span>
                                                        </motion.button>
                                                    )}

                                                    {request.canReject && (
                                                        <motion.button
                                                            onClick={() => handleRequestAction(request.id, 'respond', 'REJECTED')}
                                                            disabled={actionLoading}
                                                            className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition-all duration-300 border border-red-600/30 disabled:opacity-50"
                                                            whileHover={{ scale: actionLoading ? 1 : 1.05 }}
                                                            whileTap={{ scale: actionLoading ? 1 : 0.95 }}
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            <span>Reject</span>
                                                        </motion.button>
                                                    )}

                                                    {request.canCancel && (
                                                        <motion.button
                                                            onClick={() => handleRequestAction(request.id, 'cancel')}
                                                            disabled={actionLoading}
                                                            className="flex items-center space-x-2 px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 rounded-xl transition-all duration-300 border border-orange-600/30 disabled:opacity-50"
                                                            whileHover={{ scale: actionLoading ? 1 : 1.05 }}
                                                            whileTap={{ scale: actionLoading ? 1 : 0.95 }}
                                                        >
                                                            <X className="w-4 h-4" />
                                                            <span>Cancel</span>
                                                        </motion.button>
                                                    )}

                                                    {/* Rating Button for Accepted Swaps */}
                                                    {canRateRequest(request) && (
                                                        <motion.button
                                                            onClick={() => handleRateUser(request)}
                                                            disabled={ratingLoading}
                                                            className="flex items-center space-x-2 px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-xl transition-all duration-300 border border-yellow-600/30 disabled:opacity-50"
                                                            whileHover={{ scale: ratingLoading ? 1 : 1.05 }}
                                                            whileTap={{ scale: ratingLoading ? 1 : 0.95 }}
                                                        >
                                                            <Star className="w-4 h-4" />
                                                            <span>Rate</span>
                                                        </motion.button>
                                                    )}

                                                    {/* Show rating status for accepted swaps */}
                                                    {request.status === 'ACCEPTED' && swapRatings[request.id]?.userHasRated && (
                                                        <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/20">
                                                            <Star className="w-4 h-4 fill-yellow-400" />
                                                            <span>Rated</span>
                                                        </div>
                                                    )}

                                                    {(['CANCELLED', 'REJECTED'].includes(request.status)) && (
                                                        <motion.button
                                                            onClick={() => handleRequestAction(request.id, 'delete')}
                                                            disabled={actionLoading}
                                                            className="flex items-center space-x-2 px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 rounded-xl transition-all duration-300 border border-gray-600/30 disabled:opacity-50"
                                                            whileHover={{ scale: actionLoading ? 1 : 1.05 }}
                                                            whileTap={{ scale: actionLoading ? 1 : 0.95 }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            <span>Delete</span>
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Request Detail Modal */}
                <AnimatePresence>
                    {showRequestModal && selectedRequest && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setShowRequestModal(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Close Button */}
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">Request Details</h2>
                                    <motion.button
                                        onClick={() => setShowRequestModal(false)}
                                        className="w-8 h-8 bg-gray-800/20 hover:bg-gray-700/30 text-gray-400 rounded-full flex items-center justify-center transition-all duration-300"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <X className="w-4 h-4" />
                                    </motion.button>
                                </div>

                                {/* Request details content would go here */}
                                <div className="text-center py-8">
                                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-400">Request details modal content</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Rating Modal */}
                <RatingModal
                    isOpen={showRatingModal}
                    onClose={() => setShowRatingModal(false)}
                    onSubmit={handleSubmitRating}
                    swapRequest={selectedRequest}
                    otherUser={selectedRequest ? (selectedRequest.isSender ? selectedRequest.receiver : selectedRequest.sender) : null}
                    loading={ratingLoading}
                />
            </MainContent>
        </div>
    );
};

export default RequestForm;
