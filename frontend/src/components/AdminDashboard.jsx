import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    BarChart3,
    Users,
    User,
    Shield,
    Flag,
    MessageSquare,
    Activity,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    Download,
    Eye,
    Settings,
    Bell,
    Search,
    Filter,
    MoreVertical,
    RefreshCw,
    Calendar,
    UserCheck,
    UserX,
    Loader2,
    Plus,
    MapPin,
    Star,
    MessageCircle,
    X
} from 'lucide-react';
import adminApi from '../services/adminApi';
import { MainContent } from './Layout';
import Navbar from './Navbar';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dashboardData, setDashboardData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const navigate = useNavigate();

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'content', label: 'Content', icon: Shield },
        { id: 'reports', label: 'Reports', icon: Flag },
        { id: 'requests', label: 'Swap Requests', icon: MessageSquare },
        { id: 'messages', label: 'Platform Messages', icon: Bell },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp }
    ];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await adminApi.getDashboard(token);
            setDashboardData(response.data);
        } catch (err) {
            console.error('Dashboard error:', err);
            if (err.response?.status === 403) {
                setError('Access denied. Admin privileges required.');
                setTimeout(() => navigate('/profile'), 2000);
            } else {
                setError('Failed to load dashboard data');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-3 text-white"
                >
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-xl">Loading admin dashboard...</span>
                </motion.div>
            </div>
        );
    }

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
                            <div className="w-12 h-12 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-red-200 to-orange-200 bg-clip-text text-transparent">
                                    Admin Dashboard
                                </h1>
                                <p className="text-gray-400">Platform management and monitoring</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <motion.button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-800/20 hover:bg-gray-700/30 text-gray-400 rounded-xl transition-all duration-300 border border-gray-600/30 disabled:opacity-50"
                                whileHover={{ scale: refreshing ? 1 : 1.05 }}
                                whileTap={{ scale: refreshing ? 1 : 0.95 }}
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </motion.button>
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
                            <AlertTriangle className="w-5 h-5" />
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
                            <CheckCircle className="w-5 h-5" />
                            <span>{success}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="max-w-7xl mx-auto">
                    {/* Tabs Navigation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 mb-8"
                    >
                        <div className="flex items-center space-x-2 overflow-x-auto">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <motion.button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                            ? 'bg-red-600/30 text-red-400 border border-red-600/30'
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
                    </motion.div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && dashboardData && (
                            <OverviewTab data={dashboardData} />
                        )}
                        {activeTab === 'users' && (
                            <UsersTab setError={setError} setSuccess={setSuccess} />
                        )}
                        {activeTab === 'content' && (
                            <ContentTab setError={setError} setSuccess={setSuccess} />
                        )}
                        {activeTab === 'reports' && (
                            <ReportsTab setError={setError} setSuccess={setSuccess} />
                        )}
                        {activeTab === 'requests' && (
                            <RequestsTab setError={setError} setSuccess={setSuccess} />
                        )}
                        {activeTab === 'messages' && (
                            <MessagesTab setError={setError} setSuccess={setSuccess} />
                        )}
                        {activeTab === 'analytics' && (
                            <AnalyticsTab setError={setError} setSuccess={setSuccess} />
                        )}
                    </AnimatePresence>
                </div>
            </MainContent>
        </div>
    );
};

// Overview Tab Component
const OverviewTab = ({ data }) => {
    const statsCards = [
        {
            title: 'Total Users',
            value: data.overview.totalUsers,
            change: `+${data.recentActivity.newUsers} this week`,
            icon: Users,
            color: 'blue',
            trend: 'up'
        },
        {
            title: 'Active Users',
            value: data.overview.activeUsers,
            change: `${data.overview.bannedUsers} banned`,
            icon: UserCheck,
            color: 'green',
            trend: 'stable'
        },
        {
            title: 'Total Skills',
            value: data.overview.totalSkills,
            change: `${data.overview.flaggedSkills} flagged`,
            icon: Activity,
            color: 'purple',
            trend: 'up'
        },
        {
            title: 'Swap Requests',
            value: data.overview.totalRequests,
            change: `+${data.recentActivity.newRequests} this week`,
            icon: MessageSquare,
            color: 'cyan',
            trend: 'up'
        },
        {
            title: 'Pending Reports',
            value: data.overview.pendingReports,
            change: `+${data.recentActivity.newReports} this week`,
            icon: AlertTriangle,
            color: 'orange',
            trend: data.overview.pendingReports > 0 ? 'up' : 'stable'
        },
        {
            title: 'Platform Messages',
            value: data.overview.activeMessages,
            change: 'Active announcements',
            icon: Bell,
            color: 'yellow',
            trend: 'stable'
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
            green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
            purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
            cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-400',
            orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400',
            yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400'
        };
        return colors[color];
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
        >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statsCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`bg-gradient-to-r ${getColorClasses(stat.color)} backdrop-blur-xl rounded-2xl p-6 border`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                                    <div className="text-sm opacity-75">{stat.title}</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm opacity-75">
                                <TrendingUp className={`w-4 h-4 ${stat.trend === 'up' ? 'text-green-400' : 'text-gray-400'}`} />
                                <span>{stat.change}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30"
            >
                <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-red-400" />
                    <span>Quick Actions</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.button
                        className="flex flex-col items-center space-y-2 p-4 bg-gray-800/20 hover:bg-gray-700/30 rounded-xl border border-gray-600/30 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Flag className="w-6 h-6 text-orange-400" />
                        <span className="text-sm text-gray-300">Review Reports</span>
                    </motion.button>
                    <motion.button
                        className="flex flex-col items-center space-y-2 p-4 bg-gray-800/20 hover:bg-gray-700/30 rounded-xl border border-gray-600/30 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <UserX className="w-6 h-6 text-red-400" />
                        <span className="text-sm text-gray-300">Manage Users</span>
                    </motion.button>
                    <motion.button
                        className="flex flex-col items-center space-y-2 p-4 bg-gray-800/20 hover:bg-gray-700/30 rounded-xl border border-gray-600/30 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Bell className="w-6 h-6 text-yellow-400" />
                        <span className="text-sm text-gray-300">Send Message</span>
                    </motion.button>
                    <motion.button
                        className="flex flex-col items-center space-y-2 p-4 bg-gray-800/20 hover:bg-gray-700/30 rounded-xl border border-gray-600/30 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Download className="w-6 h-6 text-green-400" />
                        <span className="text-sm text-gray-300">Export Data</span>
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// User Management Tab
const UsersTab = ({ setError, setSuccess }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showBanModal, setShowBanModal] = useState(false);
    const [banReason, setBanReason] = useState('');
    const [banDuration, setBanDuration] = useState('permanent');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [searchTerm, statusFilter, roleFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (statusFilter !== 'all') params.status = statusFilter;
            if (roleFilter !== 'all') params.role = roleFilter;

            console.log('Fetching users with params:', params);
            const response = await adminApi.getUsers(params, token);
            console.log('Users response:', response.data);
            setUsers(response.data.users || []);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.response?.data?.error || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleBanUser = async () => {
        if (!selectedUser || !banReason.trim()) return;

        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await adminApi.banUser(selectedUser.id, {
                reason: banReason,
                duration: banDuration
            }, token);
            setSuccess(`User ${selectedUser.name} has been banned`);
            setShowBanModal(false);
            setShowUserModal(false);
            setBanReason('');
            fetchUsers();
        } catch (err) {
            setError('Failed to ban user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnbanUser = async (userId) => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await adminApi.unbanUser(userId, token);
            setSuccess('User has been unbanned');
            fetchUsers();
        } catch (err) {
            setError('Failed to unban user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await adminApi.updateUserRole(userId, newRole, token);
            setSuccess('User role updated successfully');
            fetchUsers();
        } catch (err) {
            setError('Failed to update user role');
        } finally {
            setActionLoading(false);
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'ADMIN': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
            case 'USER': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
        }
    };

    const getStatusColor = (user) => {
        if (user.bannedAt) return 'text-red-400 bg-red-500/10 border-red-500/20';
        if (user.isActive) return 'text-green-400 bg-green-500/10 border-green-500/20';
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    };

    const getStatusText = (user) => {
        if (user.bannedAt) return 'Banned';
        if (user.isActive) return 'Active';
        return 'Inactive';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            {/* Search and Filters */}
            <div className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Search Users</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full px-4 py-2 bg-gray-800/20 text-white rounded-lg border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800/20 text-white rounded-lg border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="banned">Banned</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800/20 text-white rounded-lg border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        >
                            <option value="all">All Roles</option>
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users List */}
            <div className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                <h3 className="text-xl font-bold text-white mb-6">Users ({users.length})</h3>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-red-400" />
                        <span className="ml-2 text-gray-400">Loading users...</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {users.map((user) => (
                            <div key={user.id} className="bg-gray-800/20 rounded-xl p-4 border border-gray-600/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 flex items-center justify-center">
                                            {user.profilePhoto ? (
                                                <img
                                                    src={user.profilePhoto}
                                                    alt={user.name}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold">{user.name || 'Unnamed User'}</h4>
                                            <p className="text-gray-400 text-sm">{user.email}</p>
                                            {user.location && (
                                                <p className="text-gray-500 text-xs flex items-center">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    {user.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className={`px-3 py-1 rounded-lg border text-sm ${getRoleColor(user.role)}`}>
                                            {user.role}
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg border text-sm ${getStatusColor(user)}`}>
                                            {getStatusText(user)}
                                        </div>
                                        <motion.button
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setShowUserModal(true);
                                            }}
                                            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all duration-300"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Manage
                                        </motion.button>
                                    </div>
                                </div>

                                {user.bannedAt && (
                                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                        <p className="text-red-400 text-sm">
                                            <strong>Banned:</strong> {user.bannedReason || 'No reason provided'}
                                        </p>
                                        <p className="text-red-400/70 text-xs mt-1">
                                            Since: {new Date(user.bannedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* User Management Modal */}
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
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Manage User</h3>
                                <button
                                    onClick={() => setShowUserModal(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-white font-semibold">{selectedUser.name}</h4>
                                    <p className="text-gray-400 text-sm">{selectedUser.email}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                                    <select
                                        value={selectedUser.role}
                                        onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-800/20 text-white rounded-lg border border-gray-600/30"
                                        disabled={actionLoading}
                                    >
                                        <option value="USER">User</option>
                                        <option value="ADMIN">Admin</option>
                                        <option value="SUPER_ADMIN">Super Admin</option>
                                    </select>
                                </div>

                                <div className="flex space-x-3">
                                    {selectedUser.bannedAt ? (
                                        <motion.button
                                            onClick={() => handleUnbanUser(selectedUser.id)}
                                            disabled={actionLoading}
                                            className="flex-1 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-all duration-300 disabled:opacity-50"
                                            whileHover={{ scale: actionLoading ? 1 : 1.05 }}
                                            whileTap={{ scale: actionLoading ? 1 : 0.95 }}
                                        >
                                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Unban User'}
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            onClick={() => setShowBanModal(true)}
                                            className="flex-1 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all duration-300"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Ban User
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ban User Modal */}
            <AnimatePresence>
                {showBanModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowBanModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Ban User</h3>
                                <button
                                    onClick={() => setShowBanModal(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Reason for Ban</label>
                                    <textarea
                                        value={banReason}
                                        onChange={(e) => setBanReason(e.target.value)}
                                        placeholder="Enter reason for banning this user..."
                                        className="w-full px-4 py-2 bg-gray-800/20 text-white rounded-lg border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                                    <select
                                        value={banDuration}
                                        onChange={(e) => setBanDuration(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-800/20 text-white rounded-lg border border-gray-600/30"
                                    >
                                        <option value="permanent">Permanent</option>
                                        <option value="7d">7 Days</option>
                                        <option value="30d">30 Days</option>
                                        <option value="90d">90 Days</option>
                                    </select>
                                </div>

                                <div className="flex space-x-3">
                                    <motion.button
                                        onClick={() => setShowBanModal(false)}
                                        className="flex-1 px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 rounded-lg transition-all duration-300"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        onClick={handleBanUser}
                                        disabled={actionLoading || !banReason.trim()}
                                        className="flex-1 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all duration-300 disabled:opacity-50"
                                        whileHover={{ scale: actionLoading || !banReason.trim() ? 1 : 1.05 }}
                                        whileTap={{ scale: actionLoading || !banReason.trim() ? 1 : 0.95 }}
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Ban User'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Content Moderation Tab
const ContentTab = ({ setError, setSuccess }) => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchFlaggedContent();
    }, [filter]);

    const fetchFlaggedContent = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = {};
            if (filter !== 'all') params.status = filter;

            const response = await adminApi.getFlaggedContent(params, token);
            setSkills(response.data.flaggedContent || []);
        } catch (err) {
            setError('Failed to fetch content');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveSkill = async (skillId) => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await adminApi.approveSkill(skillId, token);
            setSuccess('Skill approved successfully');
            fetchFlaggedContent();
        } catch (err) {
            setError('Failed to approve skill');
        } finally {
            setActionLoading(false);
        }
    };

    const handleFlagSkill = async (skillId, reason) => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await adminApi.flagSkill(skillId, reason, token);
            setSuccess('Skill flagged successfully');
            fetchFlaggedContent();
        } catch (err) {
            setError('Failed to flag skill');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteSkill = async (skillId) => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await adminApi.deleteSkill(skillId, token);
            setSuccess('Skill deleted successfully');
            fetchFlaggedContent();
        } catch (err) {
            setError('Failed to delete skill');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            {/* Filters */}
            <div className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                <div className="flex items-center space-x-4">
                    <label className="text-white font-medium">Filter:</label>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-800/20 text-white rounded-lg border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                        <option value="all">All Skills</option>
                        <option value="flagged">Flagged</option>
                        <option value="pending">Pending Review</option>
                        <option value="approved">Approved</option>
                    </select>
                </div>
            </div>

            {/* Skills List */}
            <div className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                <h3 className="text-xl font-bold text-white mb-6">Skills for Review ({skills.length})</h3>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-red-400" />
                        <span className="ml-2 text-gray-400">Loading content...</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {skills.map((skill) => (
                            <div key={skill.id} className="bg-gray-800/20 rounded-xl p-4 border border-gray-600/30">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h4 className="text-white font-semibold">{skill.name}</h4>
                                            <span className={`px-2 py-1 rounded text-xs ${skill.type === 'OFFERED'
                                                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                }`}>
                                                {skill.type}
                                            </span>
                                            {skill.isFlagged && (
                                                <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs border border-red-500/20">
                                                    Flagged
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-gray-400 text-sm mb-2">
                                            <span>By: {skill.user?.name || 'Unknown'} ({skill.user?.email})</span>
                                        </div>

                                        {skill.flagReason && (
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-3">
                                                <p className="text-red-400 text-sm">
                                                    <strong>Flag Reason:</strong> {skill.flagReason}
                                                </p>
                                            </div>
                                        )}

                                        <div className="text-gray-500 text-xs">
                                            Created: {new Date(skill.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {!skill.isApproved && (
                                            <motion.button
                                                onClick={() => handleApproveSkill(skill.id)}
                                                disabled={actionLoading}
                                                className="px-3 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-all duration-300 text-sm disabled:opacity-50"
                                                whileHover={{ scale: actionLoading ? 1 : 1.05 }}
                                                whileTap={{ scale: actionLoading ? 1 : 0.95 }}
                                            >
                                                Approve
                                            </motion.button>
                                        )}

                                        {!skill.isFlagged && (
                                            <motion.button
                                                onClick={() => handleFlagSkill(skill.id, 'Inappropriate content')}
                                                disabled={actionLoading}
                                                className="px-3 py-1 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 rounded-lg transition-all duration-300 text-sm disabled:opacity-50"
                                                whileHover={{ scale: actionLoading ? 1 : 1.05 }}
                                                whileTap={{ scale: actionLoading ? 1 : 0.95 }}
                                            >
                                                Flag
                                            </motion.button>
                                        )}

                                        <motion.button
                                            onClick={() => handleDeleteSkill(skill.id)}
                                            disabled={actionLoading}
                                            className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all duration-300 text-sm disabled:opacity-50"
                                            whileHover={{ scale: actionLoading ? 1 : 1.05 }}
                                            whileTap={{ scale: actionLoading ? 1 : 0.95 }}
                                        >
                                            Delete
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Reports Management Tab
const ReportsTab = ({ setError, setSuccess }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedReport, setSelectedReport] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [resolution, setResolution] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchReports();
    }, [statusFilter, typeFilter]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (typeFilter !== 'all') params.type = typeFilter;

            const response = await adminApi.getReports(params, token);
            setReports(response.data.reports || []);
        } catch (err) {
            setError('Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    };

    const handleReportAction = async (reportId, status, resolution) => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await adminApi.updateReport(reportId, { status, resolution }, token);
            setSuccess(`Report ${status.toLowerCase()} successfully`);
            setShowReportModal(false);
            fetchReports();
        } catch (err) {
            setError('Failed to update report');
        } finally {
            setActionLoading(false);
        }
    };

    const getReportTypeColor = (type) => {
        const colors = {
            'INAPPROPRIATE_SKILL': 'text-red-400 bg-red-500/10 border-red-500/20',
            'SPAM_CONTENT': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
            'HARASSMENT': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
            'FAKE_PROFILE': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
            'OTHER': 'text-gray-400 bg-gray-500/10 border-gray-500/20'
        };
        return colors[type] || colors.OTHER;
    };

    const getStatusColor = (status) => {
        const colors = {
            'PENDING': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
            'REVIEWED': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
            'RESOLVED': 'text-green-400 bg-green-500/10 border-green-500/20',
            'DISMISSED': 'text-gray-400 bg-gray-500/10 border-gray-500/20'
        };
        return colors[status] || colors.PENDING;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            {/* Filters */}
            <div className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800/20 text-white rounded-lg border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        >
                            <option value="all">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="REVIEWED">Reviewed</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="DISMISSED">Dismissed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800/20 text-white rounded-lg border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        >
                            <option value="all">All Types</option>
                            <option value="INAPPROPRIATE_SKILL">Inappropriate Skill</option>
                            <option value="SPAM_CONTENT">Spam Content</option>
                            <option value="HARASSMENT">Harassment</option>
                            <option value="FAKE_PROFILE">Fake Profile</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Reports List */}
            <div className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                <h3 className="text-xl font-bold text-white mb-6">Reports ({reports.length})</h3>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-red-400" />
                        <span className="ml-2 text-gray-400">Loading reports...</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reports.map((report) => (
                            <div key={report.id} className="bg-gray-800/20 rounded-xl p-4 border border-gray-600/30">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <span className={`px-2 py-1 rounded text-xs border ${getReportTypeColor(report.type)}`}>
                                                {report.type.replace('_', ' ')}
                                            </span>
                                            <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(report.status)}`}>
                                                {report.status}
                                            </span>
                                        </div>

                                        <h4 className="text-white font-semibold mb-2">{report.reason}</h4>

                                        {report.description && (
                                            <p className="text-gray-400 text-sm mb-2">{report.description}</p>
                                        )}

                                        <div className="text-gray-500 text-xs space-y-1">
                                            <div>Reported by: {report.reporter?.name || 'Unknown'}</div>
                                            <div>Reported: {new Date(report.createdAt).toLocaleDateString()}</div>
                                            {report.reportedUser && (
                                                <div>Target User: {report.reportedUser.name} ({report.reportedUser.email})</div>
                                            )}
                                            {report.reportedSkill && (
                                                <div>Target Skill: {report.reportedSkill.name}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <motion.button
                                            onClick={() => {
                                                setSelectedReport(report);
                                                setShowReportModal(true);
                                            }}
                                            className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all duration-300 text-sm"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Review
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Report Review Modal */}
            <AnimatePresence>
                {showReportModal && selectedReport && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowReportModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Review Report</h3>
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-white font-semibold">{selectedReport.reason}</h4>
                                    <p className="text-gray-400 text-sm">{selectedReport.description}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Resolution Notes</label>
                                    <textarea
                                        value={resolution}
                                        onChange={(e) => setResolution(e.target.value)}
                                        placeholder="Enter resolution notes..."
                                        className="w-full px-4 py-2 bg-gray-800/20 text-white rounded-lg border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex space-x-3">
                                    <motion.button
                                        onClick={() => handleReportAction(selectedReport.id, 'RESOLVED', resolution)}
                                        disabled={actionLoading}
                                        className="flex-1 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-all duration-300 disabled:opacity-50"
                                        whileHover={{ scale: actionLoading ? 1 : 1.05 }}
                                        whileTap={{ scale: actionLoading ? 1 : 0.95 }}
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Resolve'}
                                    </motion.button>
                                    <motion.button
                                        onClick={() => handleReportAction(selectedReport.id, 'DISMISSED', resolution)}
                                        disabled={actionLoading}
                                        className="flex-1 px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 rounded-lg transition-all duration-300 disabled:opacity-50"
                                        whileHover={{ scale: actionLoading ? 1 : 1.05 }}
                                        whileTap={{ scale: actionLoading ? 1 : 0.95 }}
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Dismiss'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Swap Requests Monitoring Tab
const RequestsTab = ({ setError, setSuccess }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchSwapRequests();
    }, [statusFilter]);

    const fetchSwapRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;

            const response = await adminApi.getSwapRequests(params, token);
            setRequests(response.data.requests || []);
        } catch (err) {
            setError('Failed to fetch swap requests');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'PENDING': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
            'ACCEPTED': 'text-green-400 bg-green-500/10 border-green-500/20',
            'REJECTED': 'text-red-400 bg-red-500/10 border-red-500/20',
            'CANCELLED': 'text-gray-400 bg-gray-500/10 border-gray-500/20'
        };
        return colors[status] || colors.PENDING;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            {/* Filters */}
            <div className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                <div className="flex items-center space-x-4">
                    <label className="text-white font-medium">Status:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-800/20 text-white rounded-lg border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                        <option value="all">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Requests List */}
            <div className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                <h3 className="text-xl font-bold text-white mb-6">Swap Requests ({requests.length})</h3>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-red-400" />
                        <span className="ml-2 text-gray-400">Loading requests...</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <div key={request.id} className="bg-gray-800/20 rounded-xl p-4 border border-gray-600/30">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <h5 className="text-white font-medium">Sender</h5>
                                                <p className="text-gray-400 text-sm">{request.sender?.name || 'Unknown'}</p>
                                                <p className="text-gray-500 text-xs">{request.sender?.email}</p>
                                            </div>
                                            <div>
                                                <h5 className="text-white font-medium">Receiver</h5>
                                                <p className="text-gray-400 text-sm">{request.receiver?.name || 'Unknown'}</p>
                                                <p className="text-gray-500 text-xs">{request.receiver?.email}</p>
                                            </div>
                                        </div>

                                        {request.message && (
                                            <div className="bg-gray-700/20 rounded-lg p-3 mb-3">
                                                <p className="text-gray-300 text-sm italic">"{request.message}"</p>
                                            </div>
                                        )}

                                        <div className="text-gray-500 text-xs">
                                            Created: {new Date(request.createdAt).toLocaleDateString()}
                                            {request.updatedAt !== request.createdAt && (
                                                <span className="ml-4">
                                                    Updated: {new Date(request.updatedAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Platform Messages Tab
const MessagesTab = ({ setError, setSuccess }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [newMessage, setNewMessage] = useState({
        title: '',
        content: '',
        type: 'ANNOUNCEMENT',
        priority: 'NORMAL',
        targetRole: null,
        expiresAt: ''
    });

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await adminApi.getPlatformMessages({}, token);
            setMessages(response.data.messages || []);
        } catch (err) {
            setError('Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMessage = async () => {
        if (!newMessage.title.trim() || !newMessage.content.trim()) {
            setError('Title and content are required');
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await adminApi.createPlatformMessage(newMessage, token);
            setSuccess('Message created successfully');
            setShowCreateModal(false);
            setNewMessage({
                title: '',
                content: '',
                type: 'ANNOUNCEMENT',
                priority: 'NORMAL',
                targetRole: null,
                expiresAt: ''
            });
            fetchMessages();
        } catch (err) {
            setError('Failed to create message');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleMessage = async (messageId, isActive) => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await adminApi.updatePlatformMessage(messageId, { isActive: !isActive }, token);
            setSuccess(`Message ${!isActive ? 'activated' : 'deactivated'} successfully`);
            fetchMessages();
        } catch (err) {
            setError('Failed to update message');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await adminApi.deletePlatformMessage(messageId, token);
            setSuccess('Message deleted successfully');
            fetchMessages();
        } catch (err) {
            setError('Failed to delete message');
        } finally {
            setActionLoading(false);
        }
    };

    const getTypeColor = (type) => {
        const colors = {
            'ANNOUNCEMENT': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
            'UPDATE': 'text-green-400 bg-green-500/10 border-green-500/20',
            'WARNING': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
            'MAINTENANCE': 'text-red-400 bg-red-500/10 border-red-500/20'
        };
        return colors[type] || colors.ANNOUNCEMENT;
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'LOW': 'text-gray-400 bg-gray-500/10 border-gray-500/20',
            'NORMAL': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
            'HIGH': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
            'URGENT': 'text-red-400 bg-red-500/10 border-red-500/20'
        };
        return colors[priority] || colors.NORMAL;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            {/* Create Message Button */}
            <div className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Platform Messages</h3>
                    <motion.button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all duration-300 border border-red-600/30"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Message</span>
                    </motion.button>
                </div>
            </div>

            {/* Messages List */}
            <div className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                <h3 className="text-xl font-bold text-white mb-6">Messages ({messages.length})</h3>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-red-400" />
                        <span className="ml-2 text-gray-400">Loading messages...</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div key={message.id} className="bg-gray-800/20 rounded-xl p-4 border border-gray-600/30">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h4 className="text-white font-semibold">{message.title}</h4>
                                            <span className={`px-2 py-1 rounded text-xs border ${getTypeColor(message.type)}`}>
                                                {message.type}
                                            </span>
                                            <span className={`px-2 py-1 rounded text-xs border ${getPriorityColor(message.priority)}`}>
                                                {message.priority}
                                            </span>
                                            {!message.isActive && (
                                                <span className="px-2 py-1 bg-gray-500/10 text-gray-400 rounded text-xs border border-gray-500/20">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-gray-400 text-sm mb-3">{message.content}</p>

                                        <div className="text-gray-500 text-xs space-y-1">
                                            <div>Created: {new Date(message.createdAt).toLocaleDateString()}</div>
                                            {message.targetRole && (
                                                <div>Target: {message.targetRole} users</div>
                                            )}
                                            {message.expiresAt && (
                                                <div>Expires: {new Date(message.expiresAt).toLocaleDateString()}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <motion.button
                                            onClick={() => handleToggleMessage(message.id, message.isActive)}
                                            disabled={actionLoading}
                                            className={`px-3 py-1 rounded-lg transition-all duration-300 text-sm disabled:opacity-50 ${message.isActive
                                                ? 'bg-orange-600/20 hover:bg-orange-600/30 text-orange-400'
                                                : 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
                                                }`}
                                            whileHover={{ scale: actionLoading ? 1 : 1.05 }}
                                            whileTap={{ scale: actionLoading ? 1 : 0.95 }}
                                        >
                                            {message.isActive ? 'Deactivate' : 'Activate'}
                                        </motion.button>

                                        <motion.button
                                            onClick={() => handleDeleteMessage(message.id)}
                                            disabled={actionLoading}
                                            className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all duration-300 text-sm disabled:opacity-50"
                                            whileHover={{ scale: actionLoading ? 1 : 1.05 }}
                                            whileTap={{ scale: actionLoading ? 1 : 0.95 }}
                                        >
                                            Delete
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Message Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Create Platform Message</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={newMessage.title}
                                        onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Enter message title..."
                                        className="w-full px-4 py-2 bg-gray-800/20 text-white rounded-lg border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                                    <textarea
                                        value={newMessage.content}
                                        onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                                        placeholder="Enter message content..."
                                        className="w-full px-4 py-2 bg-gray-800/20 text-white rounded-lg border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                                        <select
                                            value={newMessage.type}
                                            onChange={(e) => setNewMessage(prev => ({ ...prev, type: e.target.value }))}
                                            className="w-full px-4 py-2 bg-gray-800/20 text-white rounded-lg border border-gray-600/30"
                                        >
                                            <option value="ANNOUNCEMENT">Announcement</option>
                                            <option value="UPDATE">Update</option>
                                            <option value="WARNING">Warning</option>
                                            <option value="MAINTENANCE">Maintenance</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                                        <select
                                            value={newMessage.priority}
                                            onChange={(e) => setNewMessage(prev => ({ ...prev, priority: e.target.value }))}
                                            className="w-full px-4 py-2 bg-gray-800/20 text-white rounded-lg border border-gray-600/30"
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="NORMAL">Normal</option>
                                            <option value="HIGH">High</option>
                                            <option value="URGENT">Urgent</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Target Role (Optional)</label>
                                    <select
                                        value={newMessage.targetRole || ''}
                                        onChange={(e) => setNewMessage(prev => ({ ...prev, targetRole: e.target.value || null }))}
                                        className="w-full px-4 py-2 bg-gray-800/20 text-white rounded-lg border border-gray-600/30"
                                    >
                                        <option value="">All Users</option>
                                        <option value="USER">Users Only</option>
                                        <option value="ADMIN">Admins Only</option>
                                        <option value="SUPER_ADMIN">Super Admins Only</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Expires At (Optional)</label>
                                    <input
                                        type="datetime-local"
                                        value={newMessage.expiresAt}
                                        onChange={(e) => setNewMessage(prev => ({ ...prev, expiresAt: e.target.value }))}
                                        className="w-full px-4 py-2 bg-gray-800/20 text-white rounded-lg border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                    />
                                </div>

                                <div className="flex space-x-3">
                                    <motion.button
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 rounded-lg transition-all duration-300"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        onClick={handleCreateMessage}
                                        disabled={actionLoading || !newMessage.title.trim() || !newMessage.content.trim()}
                                        className="flex-1 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all duration-300 disabled:opacity-50"
                                        whileHover={{ scale: actionLoading || !newMessage.title.trim() || !newMessage.content.trim() ? 1 : 1.05 }}
                                        whileTap={{ scale: actionLoading || !newMessage.title.trim() || !newMessage.content.trim() ? 1 : 0.95 }}
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Create Message'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Analytics & Reporting Tab
const AnalyticsTab = ({ setError, setSuccess }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [timePeriod, setTimePeriod] = useState('30d');
    const [exportLoading, setExportLoading] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, [timePeriod]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await adminApi.getAnalytics({ period: timePeriod }, token);
            setAnalytics(response.data);
        } catch (err) {
            setError('Failed to fetch analytics');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type, format) => {
        setExportLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await adminApi.exportData(type, format, token);

            if (format === 'csv') {
                const blob = new Blob([response.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${type}_report.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${type}_report.json`;
                a.click();
                window.URL.revokeObjectURL(url);
            }

            setSuccess(`${type} report exported successfully`);
        } catch (err) {
            setError('Failed to export data');
        } finally {
            setExportLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            {/* Time Period Filter */}
            <div className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Analytics & Reports</h3>
                    <select
                        value={timePeriod}
                        onChange={(e) => setTimePeriod(e.target.value)}
                        className="px-4 py-2 bg-gray-800/20 text-white rounded-lg border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="1y">Last Year</option>
                    </select>
                </div>
            </div>

            {/* Analytics Overview */}
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-red-400" />
                    <span className="ml-2 text-gray-400">Loading analytics...</span>
                </div>
            ) : analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-blue-400 font-semibold">User Growth</p>
                                <p className="text-2xl font-bold text-white">{analytics.userGrowth || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                <Activity className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <p className="text-green-400 font-semibold">Active Users</p>
                                <p className="text-2xl font-bold text-white">{analytics.activeUsers || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                <MessageCircle className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-purple-400 font-semibold">Swap Requests</p>
                                <p className="text-2xl font-bold text-white">{analytics.swapRequests || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                                <Star className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-yellow-400 font-semibold">Skills Added</p>
                                <p className="text-2xl font-bold text-white">{analytics.skillsGrowth || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Options */}
            <div className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                <h3 className="text-xl font-bold text-white mb-6">Export Reports</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-white font-semibold mb-4">User Activity Reports</h4>
                        <div className="space-y-3">
                            <div className="flex space-x-3">
                                <motion.button
                                    onClick={() => handleExport('users', 'csv')}
                                    disabled={exportLoading}
                                    className="flex-1 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-all duration-300 disabled:opacity-50"
                                    whileHover={{ scale: exportLoading ? 1 : 1.05 }}
                                    whileTap={{ scale: exportLoading ? 1 : 0.95 }}
                                >
                                    {exportLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Export Users (CSV)'}
                                </motion.button>
                                <motion.button
                                    onClick={() => handleExport('users', 'json')}
                                    disabled={exportLoading}
                                    className="flex-1 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all duration-300 disabled:opacity-50"
                                    whileHover={{ scale: exportLoading ? 1 : 1.05 }}
                                    whileTap={{ scale: exportLoading ? 1 : 0.95 }}
                                >
                                    {exportLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Export Users (JSON)'}
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Swap Statistics</h4>
                        <div className="space-y-3">
                            <div className="flex space-x-3">
                                <motion.button
                                    onClick={() => handleExport('requests', 'csv')}
                                    disabled={exportLoading}
                                    className="flex-1 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-all duration-300 disabled:opacity-50"
                                    whileHover={{ scale: exportLoading ? 1 : 1.05 }}
                                    whileTap={{ scale: exportLoading ? 1 : 0.95 }}
                                >
                                    {exportLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Export Requests (CSV)'}
                                </motion.button>
                                <motion.button
                                    onClick={() => handleExport('requests', 'json')}
                                    disabled={exportLoading}
                                    className="flex-1 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all duration-300 disabled:opacity-50"
                                    whileHover={{ scale: exportLoading ? 1 : 1.05 }}
                                    whileTap={{ scale: exportLoading ? 1 : 0.95 }}
                                >
                                    {exportLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Export Requests (JSON)'}
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
