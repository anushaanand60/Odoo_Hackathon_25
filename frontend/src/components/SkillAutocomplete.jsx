import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, TrendingUp, Star, Settings, X } from 'lucide-react';

const SkillAutocomplete = ({
    value,
    onChange,
    onAdd,
    placeholder,
    type = 'OFFERED', // 'OFFERED' or 'WANTED'
    existingSkills = [],
    trendingSkills = [],
    disabled = false,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredSkills, setFilteredSkills] = useState([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Get skills of the correct type
    const relevantSkills = existingSkills[type] || [];
    const relevantTrending = trendingSkills.slice(0, 5);

    useEffect(() => {
        if (value.trim()) {
            // Filter skills based on input
            const filtered = relevantSkills.filter(skill =>
                skill.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredSkills(filtered);
        } else {
            // Show trending skills when no input
            setFilteredSkills(relevantTrending.map(skill => skill.name));
        }
        setHighlightedIndex(-1);
    }, [value, relevantSkills, relevantTrending]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        onChange(e.target.value);
        setIsOpen(true);
    };

    const handleInputFocus = () => {
        setIsOpen(true);
    };

    const handleSkillSelect = (skill) => {
        onChange(skill);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredSkills.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredSkills[highlightedIndex]) {
                    handleSkillSelect(filteredSkills[highlightedIndex]);
                } else if (value.trim()) {
                    handleAdd();
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
        }
    };

    const handleAdd = () => {
        if (value.trim() && onAdd) {
            onAdd(value.trim());
        }
    };

    const getColorClasses = () => {
        return type === 'OFFERED'
            ? 'focus:ring-yellow-500/50 focus:border-yellow-500/50'
            : 'focus:ring-emerald-500/50 focus:border-emerald-500/50';
    };

    const getButtonColorClasses = () => {
        return type === 'OFFERED'
            ? 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border-yellow-600/30'
            : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border-emerald-600/30';
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div className="flex space-x-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-800/20 backdrop-blur-sm text-white rounded-xl border border-gray-600/30 focus:outline-none focus:ring-2 transition-all duration-300 placeholder-gray-500 disabled:opacity-50 ${getColorClasses()}`}
                    />
                </div>
                <motion.button
                    type="button"
                    onClick={handleAdd}
                    disabled={disabled || !value.trim()}
                    className={`px-4 py-3 rounded-xl transition-all duration-300 border disabled:opacity-50 ${getButtonColorClasses()}`}
                    whileHover={{ scale: disabled || !value.trim() ? 1 : 1.05 }}
                    whileTap={{ scale: disabled || !value.trim() ? 1 : 0.95 }}
                >
                    <Plus className="w-5 h-5" />
                </motion.button>
            </div>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && filteredSkills.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-gray-700/30 shadow-2xl max-h-60 overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="px-4 py-2 border-b border-gray-700/30">
                            <div className="flex items-center space-x-2">
                                {value.trim() ? (
                                    <>
                                        <Search className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-400 text-sm">Matching skills</span>
                                    </>
                                ) : (
                                    <>
                                        <TrendingUp className="w-4 h-4 text-orange-400" />
                                        <span className="text-orange-400 text-sm">Trending skills</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Skills List */}
                        <div className="py-2">
                            {filteredSkills.map((skill, index) => {
                                const isHighlighted = index === highlightedIndex;
                                const isExisting = relevantSkills.includes(skill);

                                return (
                                    <motion.button
                                        key={skill}
                                        onClick={() => handleSkillSelect(skill)}
                                        className={`w-full px-4 py-3 text-left transition-all duration-200 flex items-center justify-between ${isHighlighted
                                                ? 'bg-gray-700/50 text-white'
                                                : 'text-gray-300 hover:bg-gray-800/30'
                                            }`}
                                        whileHover={{ x: 2 }}
                                    >
                                        <div className="flex items-center space-x-3">
                                            {type === 'OFFERED' ? (
                                                <Star className="w-4 h-4 text-yellow-400" />
                                            ) : (
                                                <Settings className="w-4 h-4 text-emerald-400" />
                                            )}
                                            <span>{skill}</span>
                                        </div>
                                        {isExisting && (
                                            <span className="text-xs text-gray-500 bg-gray-700/30 px-2 py-1 rounded">
                                                Popular
                                            </span>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Add new skill option */}
                        {value.trim() && !filteredSkills.includes(value.trim()) && (
                            <>
                                <div className="border-t border-gray-700/30"></div>
                                <motion.button
                                    onClick={handleAdd}
                                    className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-800/30 transition-all duration-200 flex items-center space-x-3"
                                    whileHover={{ x: 2 }}
                                >
                                    <Plus className="w-4 h-4 text-gray-400" />
                                    <span>Add "{value.trim()}" as new skill</span>
                                </motion.button>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SkillAutocomplete; 