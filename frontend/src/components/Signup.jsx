import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { register } from '../services/api';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    // Different skill cards for signup page
    const skillCards = [
        {
            id: 1,
            fromSkill: "Digital Art",
            toSkill: "Music Theory",
            fromUser: "Luna",
            toUser: "Jazz",
            fromColor: "from-indigo-500/20 to-purple-500/20",
            toColor: "from-green-500/20 to-emerald-500/20",
            fromIcon: "🎨",
            toIcon: "🎵"
        },
        {
            id: 2,
            fromSkill: "Python",
            toSkill: "Japanese",
            fromUser: "Dev",
            toUser: "Yuki",
            fromColor: "from-blue-500/20 to-cyan-500/20",
            toColor: "from-red-500/20 to-pink-500/20",
            fromIcon: "🐍",
            toIcon: "🇯🇵"
        },
        {
            id: 3,
            fromSkill: "Pottery",
            toSkill: "Coding",
            fromUser: "Clay",
            toUser: "Tech",
            fromColor: "from-amber-500/20 to-orange-500/20",
            toColor: "from-purple-500/20 to-indigo-500/20",
            fromIcon: "🏺",
            toIcon: "💻"
        },
        {
            id: 4,
            fromSkill: "Violin",
            toSkill: "Chess",
            fromUser: "Melody",
            toUser: "Knight",
            fromColor: "from-pink-500/20 to-rose-500/20",
            toColor: "from-gray-500/20 to-slate-500/20",
            fromIcon: "🎻",
            toIcon: "♟️"
        },
        {
            id: 5,
            fromSkill: "Gardening",
            toSkill: "Writing",
            fromUser: "Green",
            toUser: "Pen",
            fromColor: "from-emerald-500/20 to-teal-500/20",
            toColor: "from-yellow-500/20 to-amber-500/20",
            fromIcon: "🌱",
            toIcon: "✍️"
        },
        {
            id: 6,
            fromSkill: "Fitness",
            toSkill: "Drawing",
            fromUser: "Fit",
            toUser: "Art",
            fromColor: "from-red-500/20 to-orange-500/20",
            toColor: "from-blue-500/20 to-cyan-500/20",
            fromIcon: "💪",
            toIcon: "✏️"
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        // Validation
        if (!name.trim()) {
            setError('Please enter your name');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            await register({ email, password, name });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Enhanced animation variants
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.8,
                ease: [0.6, -0.05, 0.01, 0.99]
            }
        }
    };

    const slideVariants = {
        hidden: { x: -100, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                delay: 0.2,
                ease: [0.6, -0.05, 0.01, 0.99]
            }
        }
    };

    const formVariants = {
        hidden: { x: 100, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                delay: 0.3,
                ease: [0.6, -0.05, 0.01, 0.99]
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Subtle animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-indigo-500/5 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.1, 0.2],
                        rotate: [360, 0],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 6
                    }}
                />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 w-full max-w-6xl h-[750px] bg-gray-900/20 backdrop-blur-2xl rounded-3xl border border-gray-700/30 shadow-2xl overflow-hidden"
            >
                <div className="flex h-full">
                    {/* Left Side - Flowing Skill Swap Animation */}
                    <motion.div
                        variants={slideVariants}
                        className="w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900/60 via-gray-800/60 to-gray-900/60 border-r border-gray-700/20"
                    >
                        {/* Fade overlays */}
                        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-gray-900/90 via-gray-900/50 to-transparent z-10 rounded-tl-3xl"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent z-10 rounded-bl-3xl"></div>

                        {/* Flowing skill cards */}
                        <motion.div
                            className="flex flex-col space-y-6 p-6 pt-12"
                            animate={{
                                y: [0, -(skillCards.length * 140)]
                            }}
                            transition={{
                                duration: skillCards.length * 4,
                                repeat: Infinity,
                                ease: "linear",
                                repeatType: "loop"
                            }}
                        >
                            {/* Render cards twice for seamless loop */}
                            {[...skillCards, ...skillCards].map((card, index) => (
                                <motion.div
                                    key={`${card.id}-${index}`}
                                    className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-4 border border-gray-600/30 min-h-[120px]"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="flex items-center justify-between h-full">
                                        {/* From User/Skill */}
                                        <div className="flex-1">
                                            <div className={`bg-gradient-to-r ${card.fromColor} rounded-xl p-3 border border-white/10`}>
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-2xl">{card.fromIcon}</span>
                                                    <div>
                                                        <h3 className="text-white font-semibold text-sm">{card.fromSkill}</h3>
                                                        <p className="text-gray-300 text-xs">by {card.fromUser}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Swap Arrow */}
                                        <div className="flex-shrink-0 mx-4">
                                            <motion.div
                                                className="flex flex-col items-center"
                                                animate={{
                                                    x: [0, 10, -10, 0],
                                                    opacity: [0.7, 1, 0.7, 1],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                    delay: index * 0.2
                                                }}
                                            >
                                                <ArrowRight className="w-6 h-6 text-gray-400" />
                                                <div className="flex space-x-1 mt-1">
                                                    <motion.div
                                                        className="w-1.5 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                                                        animate={{ scale: [1, 1.3, 1] }}
                                                        transition={{ duration: 1, repeat: Infinity, delay: index * 0.1 }}
                                                    />
                                                    <motion.div
                                                        className="w-1.5 h-1.5 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"
                                                        animate={{ scale: [1, 1.3, 1] }}
                                                        transition={{ duration: 1, repeat: Infinity, delay: index * 0.1 + 0.2 }}
                                                    />
                                                </div>
                                            </motion.div>
                                        </div>

                                        {/* To User/Skill */}
                                        <div className="flex-1">
                                            <div className={`bg-gradient-to-r ${card.toColor} rounded-xl p-3 border border-white/10`}>
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-2xl">{card.toIcon}</span>
                                                    <div>
                                                        <h3 className="text-white font-semibold text-sm">{card.toSkill}</h3>
                                                        <p className="text-gray-300 text-xs">by {card.toUser}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right Side - Signup Form */}
                    <motion.div
                        variants={formVariants}
                        className="w-1/2 flex flex-col bg-gray-900/10 backdrop-blur-sm relative"
                    >
                        {/* Header Section */}
                        <div className="flex-shrink-0 px-12 pt-12 pb-4">
                            <motion.div
                                className="text-center"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                            >
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-emerald-200 to-teal-200 bg-clip-text text-transparent mb-6">
                                    Skill Swap
                                </h2>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6, duration: 0.8 }}
                                >
                                    <h1 className="text-3xl font-bold text-white mb-3">
                                        Join the Community
                                    </h1>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        Start your skill-swapping journey today
                                    </p>
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Form Section */}
                        <div className="flex-1 flex flex-col justify-center px-12 py-4">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 backdrop-blur-sm text-sm"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl mb-4 backdrop-blur-sm text-sm flex items-center space-x-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Account created successfully! Redirecting to login...</span>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8, duration: 0.6 }}
                                >
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your full name"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-gray-800/20 backdrop-blur-sm text-white rounded-xl border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 placeholder-gray-500 text-sm"
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.9, duration: 0.6 }}
                                >
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-gray-800/20 backdrop-blur-sm text-white rounded-xl border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 placeholder-gray-500 text-sm"
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1, duration: 0.6 }}
                                >
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Create a password"
                                            required
                                            className="w-full pl-10 pr-12 py-3 bg-gray-800/20 backdrop-blur-sm text-white rounded-xl border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 placeholder-gray-500 text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.1, duration: 0.6 }}
                                >
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm your password"
                                            required
                                            className="w-full pl-10 pr-12 py-3 bg-gray-800/20 backdrop-blur-sm text-white rounded-xl border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 placeholder-gray-500 text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-300 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </motion.div>

                                <motion.button
                                    type="submit"
                                    disabled={loading || success}
                                    className="w-full bg-gradient-to-r from-emerald-600/80 to-teal-600/80 text-white py-3 rounded-xl font-medium hover:from-emerald-700/80 hover:to-teal-700/80 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/10 border border-emerald-600/20 hover:border-emerald-500/30 text-sm"
                                    whileHover={{ scale: loading || success ? 1 : 1.02, y: loading || success ? 0 : -2 }}
                                    whileTap={{ scale: loading || success ? 1 : 0.98 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2, duration: 0.6 }}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center space-x-3">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Creating Account...</span>
                                        </div>
                                    ) : success ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Account Created! Redirecting...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center space-x-2">
                                            <span>Create Account</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    )}
                                </motion.button>
                            </form>
                        </div>

                        {/* Footer Section */}
                        <div className="flex-shrink-0 px-12 pb-12 pt-4">
                            <motion.div
                                className="text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.4, duration: 0.6 }}
                            >
                                <p className="text-gray-400 text-sm">
                                    Already have an account?{' '}
                                    <motion.button
                                        onClick={() => navigate('/login')}
                                        className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors duration-300 inline-flex items-center space-x-1"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <span>Sign in</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </motion.button>
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;