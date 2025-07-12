import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    User,
    MapPin,
    Camera,
    Clock,
    Eye,
    EyeOff,
    Plus,
    X,
    Edit2,
    Save,
    LogOut,
    Star,
    Award,
    Calendar,
    Settings,
    Loader2,
    CheckCircle,
    AlertCircle,
    Upload,
    Image as ImageIcon,
    Briefcase
} from 'lucide-react';
import { getProfile, updateProfile, addSkill, removeSkill, getRatingStats, getUserRatings, getAllSkills, getTrendingSkills, addProject, removeProject } from '../services/api';
import Navbar from './Navbar';
import { MainContent } from './Layout';
import RatingDisplay, { RatingCard, RatingStats } from './RatingDisplay';
import SkillAutocomplete from './SkillAutocomplete';

const Profile = () => {
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Individual edit modes for each section
    const [editBasicInfo, setEditBasicInfo] = useState(false);
    const [editAvailability, setEditAvailability] = useState(false);
    const [editOfferedSkills, setEditOfferedSkills] = useState(false);
    const [editWantedSkills, setEditWantedSkills] = useState(false);

    // Individual saving states
    const [savingBasicInfo, setSavingBasicInfo] = useState(false);
    const [savingAvailability, setSavingAvailability] = useState(false);
    const [savingOfferedSkills, setSavingOfferedSkills] = useState(false);
    const [savingWantedSkills, setSavingWantedSkills] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // Form states
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [profilePhoto, setProfilePhoto] = useState('');
    const [profilePhotoFile, setProfilePhotoFile] = useState(null);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
    const [availability, setAvailability] = useState([]);
    const [isPublic, setIsPublic] = useState(true);
    const [skillsOffered, setSkillsOffered] = useState([]);
    const [skillsWanted, setSkillsWanted] = useState([]);

    // Track original skills and skills to be removed
    const [originalSkillsOffered, setOriginalSkillsOffered] = useState([]);
    const [originalSkillsWanted, setOriginalSkillsWanted] = useState([]);
    const [skillsToRemove, setSkillsToRemove] = useState([]);

    // New skill input states
    const [newOfferedSkill, setNewOfferedSkill] = useState('');
    const [newWantedSkill, setNewWantedSkill] = useState('');

    // Rating states
    const [ratingStats, setRatingStats] = useState(null);
    const [userRatings, setUserRatings] = useState([]);
    const [showAllRatings, setShowAllRatings] = useState(false);

    // Skills data for autocomplete
    const [availableSkills, setAvailableSkills] = useState({});
    const [trendingSkills, setTrendingSkills] = useState([]);

    // Projects states
    const [projects, setProjects] = useState([]);
    const [editProjects, setEditProjects] = useState(false);
    const [savingProjects, setSavingProjects] = useState(false);
    const [newProject, setNewProject] = useState({ title: '', description: '', url: '', skillIds: [] });
    const [originalProjects, setOriginalProjects] = useState([]);
    const [projectsToRemove, setProjectsToRemove] = useState([]);

    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const availabilityOptions = [
        'Weekends', 'Weekday Evenings', 'Weekday Mornings',
        'Weekday Afternoons', 'Flexible', 'By Appointment'
    ];

    useEffect(() => {
        fetchProfile();
        fetchSkillsData();
    }, []);

    useEffect(() => {
        // Fetch ratings when profile is loaded
        if (profile.id) {
            fetchRatingStats();
            fetchUserRatings();
        }
    }, [profile.id]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const res = await getProfile(token);
            const profileData = res.data;

            console.log('Profile data received:', profileData);

            setProfile(profileData);
            setName(profileData.name || '');
            setLocation(profileData.location || '');
            setProfilePhoto(profileData.profilePhoto || '');

            // Handle photo preview - Cloudinary URLs are already complete
            const photoUrl = profileData.profilePhoto;
            if (photoUrl) {
                setProfilePhotoPreview(photoUrl);
                console.log('Setting photo preview to:', photoUrl);
            } else {
                setProfilePhotoPreview('');
            }

            setAvailability(profileData.availability ? profileData.availability.split(',') : []);
            setIsPublic(profileData.isPublic !== false);

            const offeredSkills = profileData.skills?.filter(skill => skill.type === 'OFFERED') || [];
            const wantedSkills = profileData.skills?.filter(skill => skill.type === 'WANTED') || [];

            setSkillsOffered(offeredSkills);
            setSkillsWanted(wantedSkills);

            // Store original skills for comparison
            setOriginalSkillsOffered(offeredSkills);
            setOriginalSkillsWanted(wantedSkills);

            // Clear skills to remove when fetching fresh data
            setSkillsToRemove([]);

            setProjects(profileData.projects || []);
            setOriginalProjects(profileData.projects || []);
            setProjectsToRemove([]);

        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load profile');
            if (err.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }

        setProfilePhotoFile(file);

        const reader = new FileReader();
        reader.onload = (e) => {
            setProfilePhotoPreview(e.target.result);
        };
        reader.readAsDataURL(file);

        setError('');
    };

    const handleRemovePhoto = () => {
        setProfilePhotoFile(null);
        setProfilePhotoPreview('');
        setProfilePhoto('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploadPhotoToServer = async (file) => {
        const formData = new FormData();
        formData.append('profilePhoto', file);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/profile/upload-photo', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload photo');
            }

            const data = await response.json();
            return data.photoUrl; // Cloudinary URL is already complete
        } catch (error) {
            console.error('Error uploading photo:', error);
            throw error;
        }
    };

    // Handle Basic Info Update
    const handleBasicInfoUpdate = async () => {
        setSavingBasicInfo(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            let photoUrl = profilePhoto;

            if (profilePhotoFile) {
                setUploadingPhoto(true);
                try {
                    photoUrl = await uploadPhotoToServer(profilePhotoFile);
                    setProfilePhotoPreview(photoUrl);
                    setProfilePhoto(photoUrl);
                } catch (uploadError) {
                    setError('Failed to upload photo. Please try again.');
                    return;
                } finally {
                    setUploadingPhoto(false);
                }
            }

            const updateData = {
                name,
                location,
                profilePhoto: photoUrl,
                isPublic
            };

            await updateProfile(updateData, token);
            setSuccess('Basic information updated successfully!');
            setEditBasicInfo(false);
            setProfilePhotoFile(null);
            await fetchProfile();
        } catch (err) {
            console.error('Error updating basic info:', err);
            setError('Failed to update basic information');
        } finally {
            setSavingBasicInfo(false);
        }
    };

    // Handle Availability Update
    const handleAvailabilityUpdate = async () => {
        setSavingAvailability(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const updateData = {
                availability: availability.join(',')
            };

            await updateProfile(updateData, token);
            setSuccess('Availability updated successfully!');
            setEditAvailability(false);
            await fetchProfile();
        } catch (err) {
            console.error('Error updating availability:', err);
            setError('Failed to update availability');
        } finally {
            setSavingAvailability(false);
        }
    };

    const handleAddSkill = async (skillName, type) => {
        if (!skillName.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const newSkill = await addSkill({ name: skillName.trim(), type }, token);

            if (type === 'OFFERED') {
                setSkillsOffered(prev => [...prev, newSkill.data]);
                setNewOfferedSkill('');
            } else {
                setSkillsWanted(prev => [...prev, newSkill.data]);
                setNewWantedSkill('');
            }

            setSuccess(`Skill added successfully!`);
        } catch (err) {
            console.error('Error adding skill:', err);
            setError('Failed to add skill');
        }
    };

    // Remove skill from frontend only
    const handleRemoveSkillFromFrontend = (skillId, type) => {
        if (type === 'OFFERED') {
            setSkillsOffered(prev => prev.filter(skill => skill.id !== skillId));
        } else {
            setSkillsWanted(prev => prev.filter(skill => skill.id !== skillId));
        }

        // Add to removal list if it's an existing skill (has an ID from backend)
        const isExistingSkill = (type === 'OFFERED' ? originalSkillsOffered : originalSkillsWanted)
            .some(skill => skill.id === skillId);

        if (isExistingSkill) {
            setSkillsToRemove(prev => [...prev, skillId]);
        }
    };

    // Save offered skills changes to backend
    const handleSaveOfferedSkills = async () => {
        setSavingOfferedSkills(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');

            // Remove skills that were marked for removal
            const skillsToRemoveOffered = skillsToRemove.filter(skillId =>
                originalSkillsOffered.some(skill => skill.id === skillId)
            );

            for (const skillId of skillsToRemoveOffered) {
                await removeSkill(skillId, token);
            }

            // Clear the removal list for offered skills
            setSkillsToRemove(prev => prev.filter(skillId =>
                !originalSkillsOffered.some(skill => skill.id === skillId)
            ));

            setSuccess('Offered skills updated successfully!');
            setEditOfferedSkills(false);
            await fetchProfile();
        } catch (err) {
            console.error('Error updating offered skills:', err);
            setError('Failed to update offered skills');
        } finally {
            setSavingOfferedSkills(false);
        }
    };

    // Save wanted skills changes to backend
    const handleSaveWantedSkills = async () => {
        setSavingWantedSkills(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');

            // Remove skills that were marked for removal
            const skillsToRemoveWanted = skillsToRemove.filter(skillId =>
                originalSkillsWanted.some(skill => skill.id === skillId)
            );

            for (const skillId of skillsToRemoveWanted) {
                await removeSkill(skillId, token);
            }

            // Clear the removal list for wanted skills
            setSkillsToRemove(prev => prev.filter(skillId =>
                !originalSkillsWanted.some(skill => skill.id === skillId)
            ));

            setSuccess('Wanted skills updated successfully!');
            setEditWantedSkills(false);
            await fetchProfile();
        } catch (err) {
            console.error('Error updating wanted skills:', err);
            setError('Failed to update wanted skills');
        } finally {
            setSavingWantedSkills(false);
        }
    };

    // Cancel skill edits and restore original state
    const handleCancelSkillEdits = (type) => {
        if (type === 'OFFERED') {
            setSkillsOffered(originalSkillsOffered);
            setEditOfferedSkills(false);
        } else {
            setSkillsWanted(originalSkillsWanted);
            setEditWantedSkills(false);
        }

        // Clear skills to remove for this type
        setSkillsToRemove(prev => prev.filter(skillId => {
            const originalSkills = type === 'OFFERED' ? originalSkillsOffered : originalSkillsWanted;
            return !originalSkills.some(skill => skill.id === skillId);
        }));
    };

    const handleAddProject = async () => {
        if (!newProject.title.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const addedProject = await addProject(newProject, token);
            setProjects(prev => [...prev, addedProject.data]);
            setNewProject({ title: '', description: '', url: '', skillIds: [] });
            setSuccess('Project added successfully!');
        } catch (err) {
            setError('Failed to add project');
        }
    };
    const handleRemoveProjectFromFrontend = (projectId) => {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        const isExisting = originalProjects.some(p => p.id === projectId);
        if (isExisting) setProjectsToRemove(prev => [...prev, projectId]);
    };
    const handleSaveProjects = async () => {
        setSavingProjects(true);
        try {
            const token = localStorage.getItem('token');
            for (const id of projectsToRemove) {
                await removeProject(id, token);
            }
            setProjectsToRemove([]);
            setSuccess('Projects updated!');
            setEditProjects(false);
            await fetchProfile();
        } catch (err) {
            setError('Failed to update projects');
        } finally {
            setSavingProjects(false);
        }
    };
    const handleCancelProjects = () => {
        setProjects(originalProjects);
        setEditProjects(false);
        setProjectsToRemove([]);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const fetchRatingStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await getRatingStats(profile.id, token);
            setRatingStats(response.data);
        } catch (err) {
            console.error('Error fetching rating stats:', err);
        }
    };

    const fetchUserRatings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await getUserRatings(profile.id, { limit: 5 }, token);
            setUserRatings(response.data.ratings);
        } catch (err) {
            console.error('Error fetching user ratings:', err);
        }
    };

    const fetchSkillsData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [skillsResponse, trendingResponse] = await Promise.all([
                getAllSkills(token),
                getTrendingSkills(token)
            ]);
            setAvailableSkills(skillsResponse.data);
            setTrendingSkills(trendingResponse.data);
        } catch (err) {
            console.error('Error fetching skills data:', err);
        }
    };

    const toggleAvailability = (option) => {
        setAvailability(prev =>
            prev.includes(option)
                ? prev.filter(item => item !== option)
                : [...prev, option]
        );
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
                    <span className="text-xl">Loading your profile...</span>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
            <Navbar />
            <MainContent className="p-4 pt-16 lg:pt-4">

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

                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Basic Info Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/30"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <User className="w-6 h-6 text-purple-400" />
                                <h3 className="text-2xl font-bold text-white">Basic Information</h3>
                            </div>
                            <motion.button
                                onClick={() => editBasicInfo ? handleBasicInfoUpdate() : setEditBasicInfo(true)}
                                disabled={savingBasicInfo || uploadingPhoto}
                                className="flex items-center space-x-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-xl transition-all duration-300 border border-purple-600/30 disabled:opacity-50"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {savingBasicInfo || uploadingPhoto ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>{uploadingPhoto ? 'Uploading...' : 'Saving...'}</span>
                                    </>
                                ) : editBasicInfo ? (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Save</span>
                                    </>
                                ) : (
                                    <>
                                        <Edit2 className="w-4 h-4" />
                                        <span>Edit</span>
                                    </>
                                )}
                            </motion.button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Profile Photo Upload */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-4">
                                    Profile Photo
                                </label>
                                <div className="flex items-start space-x-6">
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-2 border-gray-600/30 flex items-center justify-center overflow-hidden">
                                            {profilePhotoPreview ? (
                                                <img
                                                    src={profilePhotoPreview}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        console.error('Image failed to load:', e.target.src);
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <User className="w-16 h-16 text-gray-400" />
                                            )}
                                        </div>

                                        {editBasicInfo && (
                                            <motion.button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute -bottom-2 -right-2 w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <Camera className="w-5 h-5" />
                                            </motion.button>
                                        )}

                                        {editBasicInfo && profilePhotoPreview && (
                                            <motion.button
                                                type="button"
                                                onClick={handleRemovePhoto}
                                                className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <X className="w-4 h-4" />
                                            </motion.button>
                                        )}
                                    </div>

                                    {editBasicInfo && (
                                        <div className="flex-1 space-y-4">
                                            <div className="bg-gray-800/20 backdrop-blur-sm rounded-xl p-4 border border-gray-600/30">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <ImageIcon className="w-5 h-5 text-purple-400" />
                                                    <h4 className="text-white font-medium">Upload Guidelines</h4>
                                                </div>
                                                <ul className="text-sm text-gray-400 space-y-1">
                                                    <li>• Supported formats: JPG, PNG, GIF</li>
                                                    <li>• Maximum file size: 5MB</li>
                                                    <li>• Recommended: Square images (1:1 ratio)</li>
                                                    <li>• Minimum resolution: 200x200px</li>
                                                </ul>
                                            </div>

                                            <motion.button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-xl transition-all duration-300 border border-purple-600/30"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <Upload className="w-5 h-5" />
                                                <span>Choose Photo</span>
                                            </motion.button>

                                            {profilePhotoFile && (
                                                <div className="text-sm text-gray-400 bg-gray-800/20 rounded-lg p-3 border border-gray-600/30">
                                                    <span className="font-medium">Selected: </span>
                                                    {profilePhotoFile.name}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">
                                    Full Name *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={!editBasicInfo}
                                        required
                                        className="w-full pl-10 pr-4 py-3.5 bg-gray-800/20 backdrop-blur-sm text-white rounded-xl border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 placeholder-gray-500 disabled:opacity-50"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">
                                    Location
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        disabled={!editBasicInfo}
                                        className="w-full pl-10 pr-4 py-3.5 bg-gray-800/20 backdrop-blur-sm text-white rounded-xl border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 placeholder-gray-500 disabled:opacity-50"
                                        placeholder="e.g., San Francisco, CA"
                                    />
                                </div>
                            </div>

                            {/* Privacy Setting */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-3">
                                    Profile Visibility
                                </label>
                                <div className="flex items-center space-x-4">
                                    <motion.button
                                        type="button"
                                        onClick={() => editBasicInfo && setIsPublic(!isPublic)}
                                        disabled={!editBasicInfo}
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl border transition-all duration-300 ${isPublic
                                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                            : 'bg-gray-800/20 border-gray-600/30 text-gray-400'
                                            } ${editBasicInfo ? 'hover:scale-105' : 'opacity-50'}`}
                                        whileHover={editBasicInfo ? { scale: 1.05 } : {}}
                                        whileTap={editBasicInfo ? { scale: 0.95 } : {}}
                                    >
                                        <Eye className="w-5 h-5" />
                                        <span>Public Profile</span>
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        onClick={() => editBasicInfo && setIsPublic(!isPublic)}
                                        disabled={!editBasicInfo}
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl border transition-all duration-300 ${!isPublic
                                            ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                                            : 'bg-gray-800/20 border-gray-600/30 text-gray-400'
                                            } ${editBasicInfo ? 'hover:scale-105' : 'opacity-50'}`}
                                        whileHover={editBasicInfo ? { scale: 1.05 } : {}}
                                        whileTap={editBasicInfo ? { scale: 0.95 } : {}}
                                    >
                                        <EyeOff className="w-5 h-5" />
                                        <span>Private Profile</span>
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Availability Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/30"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <Clock className="w-6 h-6 text-cyan-400" />
                                <h3 className="text-2xl font-bold text-white">Availability</h3>
                            </div>
                            <motion.button
                                onClick={() => editAvailability ? handleAvailabilityUpdate() : setEditAvailability(true)}
                                disabled={savingAvailability}
                                className="flex items-center space-x-2 px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 rounded-xl transition-all duration-300 border border-cyan-600/30 disabled:opacity-50"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {savingAvailability ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : editAvailability ? (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Save</span>
                                    </>
                                ) : (
                                    <>
                                        <Edit2 className="w-4 h-4" />
                                        <span>Edit</span>
                                    </>
                                )}
                            </motion.button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {availabilityOptions.map((option) => (
                                <motion.button
                                    key={option}
                                    type="button"
                                    onClick={() => editAvailability && toggleAvailability(option)}
                                    disabled={!editAvailability}
                                    className={`p-4 rounded-xl border transition-all duration-300 text-left ${availability.includes(option)
                                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                                        : 'bg-gray-800/20 border-gray-600/30 text-gray-400 hover:bg-gray-700/30'
                                        } ${editAvailability ? 'hover:scale-105' : 'opacity-50'}`}
                                    whileHover={editAvailability ? { scale: 1.05 } : {}}
                                    whileTap={editAvailability ? { scale: 0.95 } : {}}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-4 h-4" />
                                        <span className="font-medium">{option}</span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Skills Offered Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/30"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <Star className="w-6 h-6 text-yellow-400" />
                                <h3 className="text-2xl font-bold text-white">Skills I Offer</h3>
                            </div>
                            <div className="flex items-center space-x-2">
                                {editOfferedSkills && (
                                    <motion.button
                                        onClick={() => handleCancelSkillEdits('OFFERED')}
                                        className="flex items-center space-x-2 px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 rounded-xl transition-all duration-300 border border-gray-600/30"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <X className="w-4 h-4" />
                                        <span>Cancel</span>
                                    </motion.button>
                                )}
                                <motion.button
                                    onClick={() => editOfferedSkills ? handleSaveOfferedSkills() : setEditOfferedSkills(true)}
                                    disabled={savingOfferedSkills}
                                    className="flex items-center space-x-2 px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-xl transition-all duration-300 border border-yellow-600/30 disabled:opacity-50"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {savingOfferedSkills ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : editOfferedSkills ? (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>Done</span>
                                        </>
                                    ) : (
                                        <>
                                            <Edit2 className="w-4 h-4" />
                                            <span>Edit</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {editOfferedSkills && (
                                <SkillAutocomplete
                                    value={newOfferedSkill}
                                    onChange={setNewOfferedSkill}
                                    onAdd={(skill) => handleAddSkill(skill, 'OFFERED')}
                                    placeholder="Search or add a skill you can teach..."
                                    type="OFFERED"
                                    existingSkills={availableSkills}
                                    trendingSkills={trendingSkills}
                                    disabled={false}
                                />
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {skillsOffered.map((skill) => (
                                    <motion.div
                                        key={skill.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-yellow-500/10 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/20 group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Award className="w-5 h-5 text-yellow-400" />
                                                <span className="text-white font-medium">{skill.name}</span>
                                            </div>
                                            {editOfferedSkills && (
                                                <motion.button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleRemoveSkillFromFrontend(skill.id, 'OFFERED');
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 w-6 h-6 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-full flex items-center justify-center transition-all duration-300"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <X className="w-3 h-3" />
                                                </motion.button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {skillsOffered.length === 0 && (
                                <div className="text-center py-8 text-gray-400">
                                    <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No skills offered yet. Add some skills you can teach!</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Projects Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/30"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <Briefcase className="w-6 h-6 text-indigo-400" />
                                <h3 className="text-2xl font-bold text-white">My Projects</h3>
                            </div>
                            <motion.button
                                onClick={() => editProjects ? handleSaveProjects() : setEditProjects(true)}
                                disabled={savingProjects}
                                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-xl transition-all duration-300 border border-indigo-600/30 disabled:opacity-50"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {savingProjects ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : editProjects ? (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Save</span>
                                    </>
                                ) : (
                                    <>
                                        <Edit2 className="w-4 h-4" />
                                        <span>Edit</span>
                                    </>
                                )}
                            </motion.button>
                        </div>

                        <div className="space-y-4">
                            {projects.map(project => (
                                <div key={project.id} className="bg-gray-800/20 p-4 rounded-xl border border-gray-700/20">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-white font-medium">{project.title}</h4>
                                            {project.description && <p className="text-gray-400 text-sm">{project.description}</p>}
                                            {project.url && <a href={project.url} className="text-blue-400 text-sm">{project.url}</a>}
                                            <div className="mt-2">
                                                <span className="text-gray-300 text-sm">Related Skills: </span>
                                                {project.skills.map(skill => skill.name).join(', ')}
                                            </div>
                                        </div>
                                        {editProjects && (
                                            <button onClick={() => handleRemoveProjectFromFrontend(project.id)} className="text-red-400">
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {editProjects && (
                                <div className="bg-gray-800/20 p-4 rounded-xl border border-gray-700/20 space-y-4">
                                    <input
                                        type="text"
                                        value={newProject.title}
                                        onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                                        placeholder="Project Title"
                                        className="w-full px-4 py-3 bg-gray-900/20 text-white rounded-xl border border-gray-600/30 focus:outline-none focus:border-purple-500"
                                    />
                                    <textarea
                                        value={newProject.description}
                                        onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                                        placeholder="Description"
                                        className="w-full px-4 py-3 bg-gray-900/20 text-white rounded-xl border border-gray-600/30 focus:outline-none focus:border-purple-500"
                                    />
                                    <input
                                        type="url"
                                        value={newProject.url}
                                        onChange={e => setNewProject({ ...newProject, url: e.target.value })}
                                        placeholder="Project URL"
                                        className="w-full px-4 py-3 bg-gray-900/20 text-white rounded-xl border border-gray-600/30 focus:outline-none focus:border-purple-500"
                                    />
                                    <select
                                        multiple
                                        value={newProject.skillIds}
                                        onChange={e => setNewProject({ ...newProject, skillIds: Array.from(e.target.selectedOptions, option => option.value) })}
                                        className="w-full px-4 py-3 bg-gray-900/20 text-white rounded-xl border border-gray-600/30 focus:outline-none focus:border-purple-500"
                                    >
                                        {skillsOffered.map(skill => (
                                            <option key={skill.id} value={skill.id}>{skill.name}</option>
                                        ))}
                                    </select>
                                    <button onClick={handleAddProject} className="flex items-center space-x-2 px-4 py-2 bg-green-600/20 text-green-400 rounded-xl">
                                        <Plus className="w-4 h-4" />
                                        <span>Add Project</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Skills Wanted Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/30"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <Settings className="w-6 h-6 text-emerald-400" />
                                <h3 className="text-2xl font-bold text-white">Skills I Want to Learn</h3>
                            </div>
                            <div className="flex items-center space-x-2">
                                {editWantedSkills && (
                                    <motion.button
                                        onClick={() => handleCancelSkillEdits('WANTED')}
                                        className="flex items-center space-x-2 px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 rounded-xl transition-all duration-300 border border-gray-600/30"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <X className="w-4 h-4" />
                                        <span>Cancel</span>
                                    </motion.button>
                                )}
                                <motion.button
                                    onClick={() => editWantedSkills ? handleSaveWantedSkills() : setEditWantedSkills(true)}
                                    disabled={savingWantedSkills}
                                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl transition-all duration-300 border border-emerald-600/30 disabled:opacity-50"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {savingWantedSkills ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : editWantedSkills ? (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>Done</span>
                                        </>
                                    ) : (
                                        <>
                                            <Edit2 className="w-4 h-4" />
                                            <span>Edit</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {editWantedSkills && (
                                <SkillAutocomplete
                                    value={newWantedSkill}
                                    onChange={setNewWantedSkill}
                                    onAdd={(skill) => handleAddSkill(skill, 'WANTED')}
                                    placeholder="Search or add a skill you want to learn..."
                                    type="WANTED"
                                    existingSkills={availableSkills}
                                    trendingSkills={trendingSkills}
                                    disabled={false}
                                />
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {skillsWanted.map((skill) => (
                                    <motion.div
                                        key={skill.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-emerald-500/10 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/20 group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Settings className="w-5 h-5 text-emerald-400" />
                                                <span className="text-white font-medium">{skill.name}</span>
                                            </div>
                                            {editWantedSkills && (
                                                <motion.button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleRemoveSkillFromFrontend(skill.id, 'WANTED');
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 w-6 h-6 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-full flex items-center justify-center transition-all duration-300"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <X className="w-3 h-3" />
                                                </motion.button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {skillsWanted.length === 0 && (
                                <div className="text-center py-8 text-gray-400">
                                    <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No skills wanted yet. Add some skills you'd like to learn!</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Ratings Section */}
                    {ratingStats && ratingStats.totalRatings > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/30"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <Star className="w-6 h-6 text-yellow-400" />
                                    <h3 className="text-2xl font-bold text-white">Ratings & Reviews</h3>
                                </div>
                                {userRatings.length > 0 && (
                                    <motion.button
                                        onClick={() => setShowAllRatings(!showAllRatings)}
                                        className="flex items-center space-x-2 px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-xl transition-all duration-300 border border-yellow-600/30"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>{showAllRatings ? 'Show Less' : 'View All'}</span>
                                    </motion.button>
                                )}
                            </div>

                            {/* Rating Statistics */}
                            <RatingStats stats={ratingStats} />

                            {/* Recent Ratings */}
                            {userRatings.length > 0 && (
                                <div className="mt-8">
                                    <h4 className="text-white font-semibold mb-4">Recent Reviews</h4>
                                    <div className="space-y-4">
                                        {(showAllRatings ? userRatings : userRatings.slice(0, 3)).map((rating) => (
                                            <RatingCard key={rating.id} rating={rating} showRater={true} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </MainContent>
        </div>
    );
};

export default Profile;