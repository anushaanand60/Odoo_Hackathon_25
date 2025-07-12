const express = require('express');
const { PrismaClient } = require('@prisma/client');
const z = require('zod');
const authenticate = require('../utils/authmiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Search users by skill name
router.get('/users', authenticate, async (req, res) => {
    try {
        const { skill, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        // Get users who have accepted swap requests with current user but haven't completed mutual rating
        const acceptedSwapRequests = await prisma.swapRequest.findMany({
            where: {
                OR: [
                    { senderId: req.userId, status: 'ACCEPTED' },
                    { receiverId: req.userId, status: 'ACCEPTED' }
                ]
            },
            select: {
                id: true,
                senderId: true,
                receiverId: true,
                ratings: {
                    select: {
                        raterId: true,
                        ratedUserId: true
                    }
                }
            }
        });

        // Extract user IDs to exclude (users with accepted swaps who haven't completed mutual rating)
        const excludedUserIds = new Set();
        acceptedSwapRequests.forEach(request => {
            const otherUserId = request.senderId === req.userId ? request.receiverId : request.senderId;

            // Check if both users have rated each other for this swap
            const currentUserRated = request.ratings.some(rating =>
                rating.raterId === req.userId && rating.ratedUserId === otherUserId
            );
            const otherUserRated = request.ratings.some(rating =>
                rating.raterId === otherUserId && rating.ratedUserId === req.userId
            );

            // Only exclude if mutual rating is not complete
            if (!currentUserRated || !otherUserRated) {
                excludedUserIds.add(otherUserId);
            }
        });

        let whereClause = {
            isPublic: true,
            NOT: {
                id: {
                    in: [req.userId, ...Array.from(excludedUserIds)] // Exclude current user and users with accepted swaps
                }
            }
        };

        // If skill is provided, filter by skill name
        if (skill) {
            whereClause.skills = {
                some: {
                    name: {
                        contains: skill,
                        mode: 'insensitive'
                    }
                }
            };
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                location: true,
                profilePhoto: true,
                availability: true,
                skills: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                },
                createdAt: true
            },
            skip: offset,
            take: parseInt(limit),
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Get total count for pagination
        const totalUsers = await prisma.user.count({
            where: whereClause
        });

        res.json({
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalUsers,
                totalPages: Math.ceil(totalUsers / limit)
            }
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ error: 'Failed to search users' });
    }
});

// Get user profile by ID
router.get('/users/:id', authenticate, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.params.id,
                isPublic: true
            },
            select: {
                id: true,
                name: true,
                location: true,
                profilePhoto: true,
                availability: true,
                skills: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                },
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found or profile is private' });
        }

        // Check if current user has already sent a swap request to this user
        const existingRequest = await prisma.swapRequest.findFirst({
            where: {
                OR: [
                    { senderId: req.userId, receiverId: req.params.id },
                    { senderId: req.params.id, receiverId: req.userId }
                ],
                status: {
                    in: ['PENDING', 'ACCEPTED']
                }
            },
            include: {
                ratings: {
                    select: {
                        raterId: true,
                        ratedUserId: true
                    }
                }
            }
        });

        let requestStatus = null;
        let hasExistingRequest = false;
        let mutualRatingComplete = false;

        if (existingRequest) {
            if (existingRequest.status === 'PENDING') {
                hasExistingRequest = true;
                requestStatus = 'PENDING';
            } else if (existingRequest.status === 'ACCEPTED') {
                // Check if mutual rating is complete
                const currentUserRated = existingRequest.ratings.some(rating => 
                    rating.raterId === req.userId && rating.ratedUserId === req.params.id
                );
                const otherUserRated = existingRequest.ratings.some(rating => 
                    rating.raterId === req.params.id && rating.ratedUserId === req.userId
                );
                
                mutualRatingComplete = currentUserRated && otherUserRated;
                
                if (!mutualRatingComplete) {
                    hasExistingRequest = true;
                    requestStatus = 'ACCEPTED';
                }
                // If mutual rating is complete, treat as if no existing request (allows new requests)
            }
        }

        res.json({
            ...user,
            hasExistingRequest,
            requestStatus,
            mutualRatingComplete
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// Get all unique skills for filtering
router.get('/skills', authenticate, async (req, res) => {
    try {
        const skills = await prisma.skill.findMany({
            where: {
                user: {
                    isPublic: true
                }
            },
            select: {
                name: true,
                type: true
            },
            distinct: ['name']
        });

        // Group skills by type
        const skillsByType = skills.reduce((acc, skill) => {
            if (!acc[skill.type]) {
                acc[skill.type] = [];
            }
            if (!acc[skill.type].includes(skill.name)) {
                acc[skill.type].push(skill.name);
            }
            return acc;
        }, {});

        res.json(skillsByType);
    } catch (error) {
        console.error('Get skills error:', error);
        res.status(500).json({ error: 'Failed to fetch skills' });
    }
});

// Get trending skills (most popular)
router.get('/trending-skills', authenticate, async (req, res) => {
    try {
        const trendingSkills = await prisma.skill.groupBy({
            by: ['name'],
            where: {
                user: {
                    isPublic: true
                }
            },
            _count: {
                name: true
            },
            orderBy: {
                _count: {
                    name: 'desc'
                }
            },
            take: 10
        });

        res.json(trendingSkills.map(skill => ({
            name: skill.name,
            count: skill._count.name
        })));
    } catch (error) {
        console.error('Get trending skills error:', error);
        res.status(500).json({ error: 'Failed to fetch trending skills' });
    }
});

// Get top 5 users by points
router.get('/top-points', authenticate, async (req, res) => {
    try {
        const top = await prisma.user.findMany({
            where: { isPublic: true },
            orderBy: { points: 'desc' },
            take: 5,
            select: {
                id: true,
                name: true,
                profilePhoto: true,
                points: true
            }
        });
        res.json(top);
    } catch (error) {
        console.error('Get top points error:', error);
        res.status(500).json({ error: 'Failed to fetch top users by points' });
    }
});

// Get top 5 users by average rating
router.get('/top-ratings', authenticate, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { isPublic: true },
            select: {
                id: true,
                name: true,
                profilePhoto: true,
                receivedRatings: {
                    select: { rating: true }
                }
            }
        });
        const top = users
            .map(u => ({
                id: u.id,
                name: u.name,
                profilePhoto: u.profilePhoto,
                averageRating: u.receivedRatings.length > 0 ?
                    u.receivedRatings.reduce((sum, r) => sum + r.rating, 0) / u.receivedRatings.length : 0,
                totalRatings: u.receivedRatings.length
            }))
            .sort((a, b) => b.averageRating - a.averageRating || b.totalRatings - a.totalRatings)
            .slice(0, 5);
        res.json(top);
    } catch (error) {
        console.error('Get top ratings error:', error);
        res.status(500).json({ error: 'Failed to fetch top users by ratings' });
    }
});

module.exports = router;
