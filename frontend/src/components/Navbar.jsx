import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLayout } from './Layout';
import {
    User,
    Search,
    MessageCircle,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Home,
    Shield
} from 'lucide-react';

const Navbar = () => {
    const { sidebarCollapsed, setSidebarCollapsed, isMobile } = useLayout();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [userRole, setUserRole] = useState('USER');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check user role from token or API call
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                // For now, we'll simulate admin detection
                // In a real app, you'd decode the JWT or make an API call
                setUserRole(payload.role || 'USER');
            } catch (error) {
                console.error('Error parsing token:', error);
            }
        }
    }, []);

    const navItems = [
        {
            path: '/profile',
            icon: User,
            label: 'Profile',
            color: 'purple',
            description: 'Manage your profile'
        },
        {
            path: '/search',
            icon: Search,
            label: 'Discover',
            color: 'cyan',
            description: 'Find skill partners'
        },
        {
            path: '/requests',
            icon: MessageCircle,
            label: 'Requests',
            color: 'emerald',
            description: 'Manage swap requests'
        },
        ...(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' ? [{
            path: '/admin',
            icon: Shield,
            label: 'Admin',
            color: 'red',
            description: 'Platform management'
        }] : [])
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const getColorClasses = (color, isActive) => {
        const colors = {
            purple: isActive
                ? 'bg-purple-600/30 text-purple-400 border-purple-600/50'
                : 'text-gray-400 hover:text-purple-400 hover:bg-purple-600/10',
            cyan: isActive
                ? 'bg-cyan-600/30 text-cyan-400 border-cyan-600/50'
                : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-600/10',
            emerald: isActive
                ? 'bg-emerald-600/30 text-emerald-400 border-emerald-600/50'
                : 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-600/10',
            red: isActive
                ? 'bg-red-600/30 text-red-400 border-red-600/50'
                : 'text-gray-400 hover:text-red-400 hover:bg-red-600/10'
        };
        return colors[color] || colors.purple;
    };

    const sidebarVariants = {
        expanded: {
            width: '280px',
            transition: {
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
                when: "beforeChildren"
            }
        },
        collapsed: {
            width: '80px',
            transition: {
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
                when: "afterChildren"
            }
        }
    };

    const contentVariants = {
        show: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: {
                duration: 0.3,
                delay: 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        },
        hide: {
            opacity: 0,
            x: -10,
            scale: 0.95,
            transition: {
                duration: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <motion.button
                onClick={() => setIsMobileOpen(true)}
                className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 bg-gray-900/80 backdrop-blur-xl text-white rounded-xl border border-gray-700/30 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Menu className="w-5 h-5" />
            </motion.button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.nav
                variants={sidebarVariants}
                animate={sidebarCollapsed ? 'collapsed' : 'expanded'}
                className={`fixed left-0 top-0 h-full bg-gray-900/20 backdrop-blur-xl border-r border-gray-700/30 z-50 flex flex-col overflow-hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    } transition-transform duration-300 lg:transition-none`}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-700/30">
                    <div className="flex items-center justify-between">
                        <AnimatePresence mode="wait">
                            {!sidebarCollapsed && (
                                <motion.div
                                    variants={contentVariants}
                                    initial="hide"
                                    animate="show"
                                    exit="hide"
                                    className="flex items-center space-x-3"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">SS</span>
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                                            Skill Swap
                                        </h1>
                                        <p className="text-xs text-gray-400">Connect & Learn</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Collapse Button - Desktop */}
                        <motion.button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="hidden lg:flex w-8 h-8 bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 rounded-lg items-center justify-center transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <motion.div
                                animate={{ rotate: sidebarCollapsed ? 0 : 180 }}
                                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </motion.div>
                        </motion.button>

                        {/* Close Button - Mobile */}
                        <motion.button
                            onClick={() => setIsMobileOpen(false)}
                            className="lg:hidden w-8 h-8 bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 rounded-lg flex items-center justify-center transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <X className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 p-4 space-y-2">
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <motion.button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    setIsMobileOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${isActive
                                    ? `${getColorClasses(item.color, true)} border shadow-lg`
                                    : `${getColorClasses(item.color, false)} hover:bg-gray-800/20`
                                    }`}
                                whileHover={{ scale: 1.02, x: 2 }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? 'bg-white/10' : 'bg-gray-800/30'
                                    }`}>
                                    <Icon className="w-5 h-5" />
                                </div>

                                <div className="flex-1 text-left overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        {!sidebarCollapsed && (
                                            <motion.div
                                                variants={contentVariants}
                                                initial="hide"
                                                animate="show"
                                                exit="hide"
                                                className="whitespace-nowrap"
                                            >
                                                <div className="font-medium">{item.label}</div>
                                                <div className="text-xs text-gray-500">{item.description}</div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-700/30">
                    <motion.button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 p-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition-all duration-300 border border-red-600/30"
                        whileHover={{ scale: 1.02, x: 2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                            <LogOut className="w-5 h-5" />
                        </div>

                        <div className="flex-1 text-left overflow-hidden">
                            <AnimatePresence mode="wait">
                                {!sidebarCollapsed && (
                                    <motion.div
                                        variants={contentVariants}
                                        initial="hide"
                                        animate="show"
                                        exit="hide"
                                        className="whitespace-nowrap"
                                    >
                                        <div className="font-medium">Logout</div>
                                        <div className="text-xs text-red-400/70">Sign out of account</div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.button>
                </div>
            </motion.nav>
        </>
    );
};

export default Navbar;
