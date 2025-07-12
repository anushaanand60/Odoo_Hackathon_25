import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Search as SearchIcon,
    Filter,
    User,
    MapPin,
    Calendar,
    Star,
    Settings,
    ArrowRight,
    Loader2,
    AlertCircle,
    TrendingUp,
    Users,
    MessageCircle,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { searchUsers, getUserById, getAllSkills, getTrendingSkills, createSwapRequest, getRatingStats } from '../services/api';
import Navbar from './Navbar';
import { MainContent } from './Layout';
import RatingDisplay from './RatingDisplay';

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestMessage, setRequestMessage] = useState('');
    const [sendingRequest, setSendingRequest] = useState(false);
    const [userRatings, setUserRatings] = useState({});

    // Filters
    const [showFilters, setShowFilters] = useState(false);
    const [skillFilter, setSkillFilter] = useState('');
    const [availableSkills, setAvailableSkills] = useState({});
    const [trendingSkills, setTrendingSkills] = useState([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
        fetchSkills();
        fetchTrendingSkills();
    }, [currentPage, skillFilter]);

    useEffect(() => {
        // Fetch ratings for all users when users list changes
        users.forEach(user => {
            fetchUserRatings(user.id);
        });
    }, [users]);

    useEffect(() => {
        if (searchQuery) {
            const timeoutId = setTimeout(() => {
                fetchUsers();
            }, 500);
            return () => clearTimeout(timeoutId);
        } else {
            fetchUsers();
        }
    }, [searchQuery]);

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const params = {
                page: currentPage,
                limit: 12
            };

            if (searchQuery) {
                params.skill = searchQuery;
            }

            if (skillFilter) {
                params.skill = skillFilter;
            }

            const response = await searchUsers(params, token);
            setUsers(response.data.users);
            setTotalPages(response.data.pagination.totalPages);
            setTotalUsers(response.data.pagination.total);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to fetch users');
            if (err.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchSkills = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await getAllSkills(token);
            setAvailableSkills(response.data);
        } catch (err) {
            console.error('Error fetching skills:', err);
        }
    };

    const fetchTrendingSkills = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await getTrendingSkills(token);
            setTrendingSkills(response.data);
        } catch (err) {
            console.error('Error fetching trending skills:', err);
        }
    };

    const handleUserClick = async (userId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await getUserById(userId, token);
            setSelectedUser(response.data);
            setShowUserModal(true);
        } catch (err) {
            console.error('Error fetching user details:', err);
            setError('Failed to fetch user details');
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async () => {
        if (!selectedUser) return;

        setSendingRequest(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            await createSwapRequest({
                receiverId: selectedUser.id,
                message: requestMessage
            }, token);

            setSuccess('Swap request sent successfully!');
            setShowRequestModal(false);
            setShowUserModal(false);
            setRequestMessage('');

            // Update the selected user to show they have an existing request
            setSelectedUser(prev => ({ ...prev, hasExistingRequest: true }));
        } catch (err) {
            console.error('Error sending swap request:', err);
            setError(err.response?.data?.error || 'Failed to send swap request');
        } finally {
            setSendingRequest(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const clearFilters = () => {
        setSkillFilter('');
        setSearchQuery('');
        setCurrentPage(1);
    };

    const fetchUserRatings = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await getRatingStats(userId, token);
            setUserRatings(prev => ({
                ...prev,
                [userId]: response.data
            }));
        } catch (err) {
            // Don't show error for ratings, just log it
            console.error('Error fetching user ratings:', err);
        }
    };

    const formatAvailability = (availability) => {
        if (!availability) return 'Not specified';
        return availability.split(',').join(', ');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
            <Navbar />
            <MainContent className="p-4 pt-16 lg:pt-4">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-7xl mx-auto mb-8"
                >
                    <div className="flex items-center justify-between bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                                Discover Skills
                            </h1>
                            <div className="h-8 w-px bg-gray-600"></div>
                            <div className="flex items-center space-x-2 text-gray-400">
                                <Users className="w-5 h-5" />
                                <span>{totalUsers} users found</span>
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
                            className="max-w-7xl mx-auto mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl backdrop-blur-sm flex items-center space-x-2"
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
                            className="max-w-7xl mx-auto mb-6 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl backdrop-blur-sm flex items-center space-x-2"
                        >
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-2 h-2 bg-white rounded-full"
                                />
                            </div>
                            <span>{success}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="max-w-7xl mx-auto">
                    {/* Search and Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 mb-8"
                    >
                        {/* Search Bar */}
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="flex-1 relative">
                                <SearchIcon className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by skill name (e.g., 'Photography', 'JavaScript', 'Guitar')"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-800/20 backdrop-blur-sm text-white rounded-xl border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 placeholder-gray-500"
                                />
                            </div>
                            <motion.button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center space-x-2 px-6 py-4 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-xl transition-all duration-300 border border-purple-600/30"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Filter className="w-5 h-5" />
                                <span>Filters</span>
                            </motion.button>
                        </div>

                        {/* Trending Skills */}
                        {trendingSkills.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center space-x-2 mb-4">
                                    <TrendingUp className="w-5 h-5 text-orange-400" />
                                    <h3 className="text-white font-semibold">Trending Skills</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {trendingSkills.slice(0, 8).map((skill, index) => (
                                        <motion.button
                                            key={skill.name}
                                            onClick={() => setSkillFilter(skill.name)}
                                            className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg border border-orange-500/20 transition-all duration-300 text-sm"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            {skill.name} ({skill.count})
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Active Filters */}
                        {(skillFilter || searchQuery) && (
                            <div className="flex items-center space-x-2 mb-4">
                                <span className="text-gray-400 text-sm">Active filters:</span>
                                {skillFilter && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center space-x-2 px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20"
                                    >
                                        <span className="text-sm">Skill: {skillFilter}</span>
                                        <button
                                            onClick={() => setSkillFilter('')}
                                            className="text-purple-400 hover:text-purple-300"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </motion.div>
                                )}
                                {searchQuery && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center space-x-2 px-3 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20"
                                    >
                                        <span className="text-sm">Search: {searchQuery}</span>
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="text-cyan-400 hover:text-cyan-300"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </motion.div>
                                )}
                                <motion.button
                                    onClick={clearFilters}
                                    className="text-gray-400 hover:text-gray-300 text-sm underline"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    Clear all
                                </motion.button>
                            </div>
                        )}
                    </motion.div>

                    {/* Users Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center space-x-3 text-white"
                            >
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span className="text-xl">Finding awesome people...</span>
                            </motion.div>
                        </div>
                    ) : users.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20"
                        >
                            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-2">No users found</h3>
                            <p className="text-gray-400 mb-6">
                                Try adjusting your search criteria or explore different skills
                            </p>
                            <motion.button
                                onClick={clearFilters}
                                className="px-6 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-xl transition-all duration-300 border border-purple-600/30"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Clear filters
                            </motion.button>
                        </motion.div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                                {users.map((user, index) => (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 hover:border-purple-500/30 transition-all duration-300 cursor-pointer group"
                                        onClick={() => handleUserClick(user.id)}
                                        whileHover={{ scale: 1.02, y: -5 }}
                                    >
                                        {/* User Avatar */}
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-2 border-gray-600/30 flex items-center justify-center overflow-hidden">
                                                {user.profilePhoto ? (
                                                    <img
                                                        src={user.profilePhoto.startsWith('http') ? user.profilePhoto : `http://localhost:8000${user.profilePhoto}`}
                                                        alt={user.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="w-8 h-8 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-white font-semibold group-hover:text-purple-300 transition-colors">
                                                    {user.name || 'Anonymous User'}
                                                </h3>
                                                {user.location && (
                                                    <div className="flex items-center space-x-1 text-gray-400 text-sm">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>{user.location}</span>
                                                    </div>
                                                )}
                                                {/* Rating Display */}
                                                {userRatings[user.id] && (
                                                    <div className="mt-1">
                                                        <RatingDisplay
                                                            averageRating={userRatings[user.id].averageRating}
                                                            totalRatings={userRatings[user.id].totalRatings}
                                                            showDetails={false}
                                                            size="small"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Skills */}
                                        <div className="space-y-3">
                                            {user.skills.filter(skill => skill.type === 'OFFERED').length > 0 && (
                                                <div>
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <Star className="w-4 h-4 text-yellow-400" />
                                                        <span className="text-yellow-400 text-sm font-medium">Offers</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.skills.filter(skill => skill.type === 'OFFERED').slice(0, 3).map((skill) => (
                                                            <span
                                                                key={skill.id}
                                                                className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-md text-xs border border-yellow-500/20"
                                                            >
                                                                {skill.name}
                                                            </span>
                                                        ))}
                                                        {user.skills.filter(skill => skill.type === 'OFFERED').length > 3 && (
                                                            <span className="px-2 py-1 bg-gray-500/10 text-gray-400 rounded-md text-xs">
                                                                +{user.skills.filter(skill => skill.type === 'OFFERED').length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {user.skills.filter(skill => skill.type === 'WANTED').length > 0 && (
                                                <div>
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <Settings className="w-4 h-4 text-emerald-400" />
                                                        <span className="text-emerald-400 text-sm font-medium">Wants</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.skills.filter(skill => skill.type === 'WANTED').slice(0, 3).map((skill) => (
                                                            <span
                                                                key={skill.id}
                                                                className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-xs border border-emerald-500/20"
                                                            >
                                                                {skill.name}
                                                            </span>
                                                        ))}
                                                        {user.skills.filter(skill => skill.type === 'WANTED').length > 3 && (
                                                            <span className="px-2 py-1 bg-gray-500/10 text-gray-400 rounded-md text-xs">
                                                                +{user.skills.filter(skill => skill.type === 'WANTED').length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* View Profile Button */}
                                        <div className="mt-4 pt-4 border-t border-gray-700/30">
                                            <div className="flex items-center justify-between text-purple-400 group-hover:text-purple-300 transition-colors">
                                                <span className="text-sm">View Profile</span>
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-center space-x-2"
                                >
                                    <motion.button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="flex items-center space-x-2 px-4 py-2 bg-gray-800/20 hover:bg-gray-700/30 text-gray-400 rounded-xl transition-all duration-300 border border-gray-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                        whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                                        whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span>Previous</span>
                                    </motion.button>

                                    <div className="flex items-center space-x-2">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            const pageNum = i + 1;
                                            return (
                                                <motion.button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`w-10 h-10 rounded-xl transition-all duration-300 ${currentPage === pageNum
                                                        ? 'bg-purple-600/30 text-purple-400 border border-purple-600/30'
                                                        : 'bg-gray-800/20 hover:bg-gray-700/30 text-gray-400 border border-gray-600/30'
                                                        }`}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    {pageNum}
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    <motion.button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center space-x-2 px-4 py-2 bg-gray-800/20 hover:bg-gray-700/30 text-gray-400 rounded-xl transition-all duration-300 border border-gray-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                        whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                                        whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
                                    >
                                        <span>Next</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </motion.button>
                                </motion.div>
                            )}
                        </>
                    )}
                </div>

                {/* User Detail Modal */}
                <AnimatePresence>
                    {showUserModal && selectedUser && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setShowUserModal(false)}
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
                                    <h2 className="text-2xl font-bold text-white">User Profile</h2>
                                    <motion.button
                                        onClick={() => setShowUserModal(false)}
                                        className="w-8 h-8 bg-gray-800/20 hover:bg-gray-700/30 text-gray-400 rounded-full flex items-center justify-center transition-all duration-300"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <X className="w-4 h-4" />
                                    </motion.button>
                                </div>

                                {/* User Info */}
                                <div className="flex items-center space-x-6 mb-8">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-2 border-gray-600/30 flex items-center justify-center overflow-hidden">
                                        {selectedUser.profilePhoto ? (
                                            <img
                                                src={selectedUser.profilePhoto.startsWith('http') ? selectedUser.profilePhoto : `http://localhost:8000${selectedUser.profilePhoto}`}
                                                alt={selectedUser.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-10 h-10 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            {selectedUser.name || 'Anonymous User'}
                                        </h3>
                                        {selectedUser.location && (
                                            <div className="flex items-center space-x-2 text-gray-400 mb-2">
                                                <MapPin className="w-4 h-4" />
                                                <span>{selectedUser.location}</span>
                                            </div>
                                        )}
                                        {selectedUser.availability && (
                                            <div className="flex items-center space-x-2 text-gray-400">
                                                <Calendar className="w-4 h-4" />
                                                <span>{formatAvailability(selectedUser.availability)}</span>
                                            </div>
                                        )}
                                        {/* Rating Display in Modal */}
                                        {userRatings[selectedUser.id] && (
                                            <div className="mt-2">
                                                <RatingDisplay
                                                    averageRating={userRatings[selectedUser.id].averageRating}
                                                    totalRatings={userRatings[selectedUser.id].totalRatings}
                                                    showDetails={true}
                                                    size="normal"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Skills */}
                                <div className="space-y-6 mb-8">
                                    {selectedUser.skills.filter(skill => skill.type === 'OFFERED').length > 0 && (
                                        <div>
                                            <div className="flex items-center space-x-2 mb-4">
                                                <Star className="w-5 h-5 text-yellow-400" />
                                                <h4 className="text-xl font-semibold text-white">Skills Offered</h4>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedUser.skills.filter(skill => skill.type === 'OFFERED').map((skill) => (
                                                    <span
                                                        key={skill.id}
                                                        className="px-3 py-2 bg-yellow-500/10 text-yellow-400 rounded-lg border border-yellow-500/20"
                                                    >
                                                        {skill.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedUser.skills.filter(skill => skill.type === 'WANTED').length > 0 && (
                                        <div>
                                            <div className="flex items-center space-x-2 mb-4">
                                                <Settings className="w-5 h-5 text-emerald-400" />
                                                <h4 className="text-xl font-semibold text-white">Skills Wanted</h4>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedUser.skills.filter(skill => skill.type === 'WANTED').map((skill) => (
                                                    <span
                                                        key={skill.id}
                                                        className="px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20"
                                                    >
                                                        {skill.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Send Request Button */}
                                <div className="flex items-center justify-end space-x-4">
                                    <motion.button
                                        onClick={() => setShowUserModal(false)}
                                        className="px-6 py-3 bg-gray-800/20 hover:bg-gray-700/30 text-gray-400 rounded-xl transition-all duration-300 border border-gray-600/30"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Close
                                    </motion.button>

                                    {selectedUser.hasExistingRequest ? (
                                        <div className={`px-6 py-3 rounded-xl border ${selectedUser.requestStatus === 'ACCEPTED'
                                            ? 'bg-green-600/20 text-green-400 border-green-600/30'
                                            : selectedUser.requestStatus === 'PENDING'
                                                ? 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
                                                : 'bg-gray-600/20 text-gray-400 border-gray-600/30'
                                            }`}>
                                            {selectedUser.requestStatus === 'ACCEPTED' ? 'Swap Completed' :
                                                selectedUser.requestStatus === 'PENDING' ? 'Request Pending' :
                                                    'Request Already Sent'}
                                        </div>
                                    ) : (
                                        <motion.button
                                            onClick={() => setShowRequestModal(true)}
                                            className="flex items-center space-x-2 px-6 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-xl transition-all duration-300 border border-purple-600/30"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            <span>Send Swap Request</span>
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Send Request Modal */}
                <AnimatePresence>
                    {showRequestModal && (
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
                                className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/30 max-w-md w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white">Send Swap Request</h3>
                                    <motion.button
                                        onClick={() => setShowRequestModal(false)}
                                        className="w-8 h-8 bg-gray-800/20 hover:bg-gray-700/30 text-gray-400 rounded-full flex items-center justify-center transition-all duration-300"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <X className="w-4 h-4" />
                                    </motion.button>
                                </div>

                                <div className="mb-6">
                                    <p className="text-gray-400 mb-4">
                                        Send a swap request to <span className="text-white font-medium">{selectedUser?.name}</span>
                                    </p>
                                    <textarea
                                        value={requestMessage}
                                        onChange={(e) => setRequestMessage(e.target.value)}
                                        placeholder="Write a message to introduce yourself and explain what you'd like to swap (optional)"
                                        className="w-full px-4 py-3 bg-gray-800/20 backdrop-blur-sm text-white rounded-xl border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 placeholder-gray-500 resize-none"
                                        rows={4}
                                    />
                                </div>

                                <div className="flex items-center justify-end space-x-4">
                                    <motion.button
                                        onClick={() => setShowRequestModal(false)}
                                        className="px-6 py-3 bg-gray-800/20 hover:bg-gray-700/30 text-gray-400 rounded-xl transition-all duration-300 border border-gray-600/30"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        onClick={handleSendRequest}
                                        disabled={sendingRequest}
                                        className="flex items-center space-x-2 px-6 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-xl transition-all duration-300 border border-purple-600/30 disabled:opacity-50"
                                        whileHover={{ scale: sendingRequest ? 1 : 1.05 }}
                                        whileTap={{ scale: sendingRequest ? 1 : 0.95 }}
                                    >
                                        {sendingRequest ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <>
                                                <MessageCircle className="w-4 h-4" />
                                                <span>Send Request</span>
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </MainContent>
        </div>
    );
};

export default Search;
