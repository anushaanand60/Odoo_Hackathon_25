const express = require('express');
const { PrismaClient } = require('@prisma/client');
const z = require('zod');
const authenticate = require('../utils/authmiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createRatingSchema = z.object({
    swapRequestId: z.string().uuid(),
    ratedUserId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    feedback: z.string().optional(),
    isPublic: z.boolean().optional().default(true)
});

const getRatingsSchema = z.object({
    userId: z.string().uuid().optional(),
    swapRequestId: z.string().uuid().optional(),
    page: z.string().transform(val => parseInt(val) || 1).optional(),
    limit: z.string().transform(val => Math.min(parseInt(val) || 10, 50)).optional()
});

// Submit a rating for a completed swap
router.post('/submit', authenticate, async (req, res) => {
    try {
        const validatedData = createRatingSchema.parse(req.body);
        const { swapRequestId, ratedUserId, rating, feedback, isPublic } = validatedData;

        // Check if the swap request exists and is accepted
        const swapRequest = await prisma.swapRequest.findUnique({
            where: { id: swapRequestId },
            include: {
                sender: true,
                receiver: true
            }
        });

        if (!swapRequest) {
            return res.status(404).json({ error: 'Swap request not found' });
        }

        if (swapRequest.status !== 'ACCEPTED') {
            return res.status(400).json({ error: 'Can only rate accepted swaps' });
        }

        // Check if the user is part of this swap
        const isParticipant = swapRequest.senderId === req.userId || swapRequest.receiverId === req.userId;
        if (!isParticipant) {
            return res.status(403).json({ error: 'You can only rate swaps you participated in' });
        }

        // Check if the rated user is the other participant
        const otherUserId = swapRequest.senderId === req.userId ? swapRequest.receiverId : swapRequest.senderId;
        if (ratedUserId !== otherUserId) {
            return res.status(400).json({ error: 'You can only rate the other participant in the swap' });
        }

        // Check if user has already rated this swap
        const existingRating = await prisma.rating.findUnique({
            where: {
                swapRequestId_raterId: {
                    swapRequestId,
                    raterId: req.userId
                }
            }
        });

        if (existingRating) {
            return res.status(400).json({ error: 'You have already rated this swap' });
        }

        // Create the rating
        const newRating = await prisma.rating.create({
            data: {
                swapRequestId,
                raterId: req.userId,
                ratedUserId,
                rating,
                feedback,
                isPublic
            },
            include: {
                rater: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true
                    }
                },
                ratedUser: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true
                    }
                },
                swapRequest: {
                    select: {
                        id: true,
                        status: true,
                        createdAt: true
                    }
                }
            }
        });

        res.status(201).json({
            message: 'Rating submitted successfully',
            rating: newRating
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid input data', details: error.errors });
        }
        console.error('Submit rating error:', error);
        res.status(500).json({ error: 'Failed to submit rating' });
    }
});

// Get ratings for a user (their received ratings)
router.get('/user/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = getRatingsSchema.parse(req.query);
        const offset = (page - 1) * limit;

        // Check if the user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get ratings received by this user
        const ratings = await prisma.rating.findMany({
            where: {
                ratedUserId: userId,
                isPublic: true // Only show public ratings
            },
            include: {
                rater: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true
                    }
                },
                swapRequest: {
                    select: {
                        id: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: offset,
            take: limit
        });

        // Get total count for pagination
        const totalRatings = await prisma.rating.count({
            where: {
                ratedUserId: userId,
                isPublic: true
            }
        });

        // Calculate average rating
        const avgRating = await prisma.rating.aggregate({
            where: {
                ratedUserId: userId,
                isPublic: true
            },
            _avg: {
                rating: true
            },
            _count: {
                rating: true
            }
        });

        res.json({
            ratings,
            pagination: {
                page,
                limit,
                total: totalRatings,
                totalPages: Math.ceil(totalRatings / limit)
            },
            statistics: {
                averageRating: avgRating._avg.rating || 0,
                totalRatings: avgRating._count.rating || 0
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
        }
        console.error('Get user ratings error:', error);
        res.status(500).json({ error: 'Failed to get user ratings' });
    }
});

// Get ratings for a specific swap request
router.get('/swap/:swapRequestId', authenticate, async (req, res) => {
    try {
        const { swapRequestId } = req.params;

        // Check if the swap request exists and user is a participant
        const swapRequest = await prisma.swapRequest.findUnique({
            where: { id: swapRequestId },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true
                    }
                }
            }
        });

        if (!swapRequest) {
            return res.status(404).json({ error: 'Swap request not found' });
        }

        // Check if user is a participant
        const isParticipant = swapRequest.senderId === req.userId || swapRequest.receiverId === req.userId;
        if (!isParticipant) {
            return res.status(403).json({ error: 'You can only view ratings for swaps you participated in' });
        }

        // Get all ratings for this swap
        const ratings = await prisma.rating.findMany({
            where: {
                swapRequestId
            },
            include: {
                rater: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true
                    }
                },
                ratedUser: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Check which users have rated and which haven't
        const userHasRated = ratings.some(rating => rating.raterId === req.userId);
        const otherUserId = swapRequest.senderId === req.userId ? swapRequest.receiverId : swapRequest.senderId;
        const otherUserHasRated = ratings.some(rating => rating.raterId === otherUserId);

        res.json({
            swapRequest,
            ratings,
            canRate: swapRequest.status === 'ACCEPTED' && !userHasRated,
            userHasRated,
            otherUserHasRated
        });

    } catch (error) {
        console.error('Get swap ratings error:', error);
        res.status(500).json({ error: 'Failed to get swap ratings' });
    }
});

// Update a rating (only the rater can update their own rating)
router.put('/:ratingId', authenticate, async (req, res) => {
    try {
        const { ratingId } = req.params;
        const updateSchema = z.object({
            rating: z.number().int().min(1).max(5).optional(),
            feedback: z.string().optional(),
            isPublic: z.boolean().optional()
        });

        const validatedData = updateSchema.parse(req.body);

        // Check if the rating exists and belongs to the user
        const existingRating = await prisma.rating.findUnique({
            where: { id: ratingId }
        });

        if (!existingRating) {
            return res.status(404).json({ error: 'Rating not found' });
        }

        if (existingRating.raterId !== req.userId) {
            return res.status(403).json({ error: 'You can only update your own ratings' });
        }

        // Update the rating
        const updatedRating = await prisma.rating.update({
            where: { id: ratingId },
            data: validatedData,
            include: {
                rater: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true
                    }
                },
                ratedUser: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true
                    }
                },
                swapRequest: {
                    select: {
                        id: true,
                        status: true,
                        createdAt: true
                    }
                }
            }
        });

        res.json({
            message: 'Rating updated successfully',
            rating: updatedRating
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid input data', details: error.errors });
        }
        console.error('Update rating error:', error);
        res.status(500).json({ error: 'Failed to update rating' });
    }
});

// Delete a rating (only the rater can delete their own rating)
router.delete('/:ratingId', authenticate, async (req, res) => {
    try {
        const { ratingId } = req.params;

        // Check if the rating exists and belongs to the user
        const existingRating = await prisma.rating.findUnique({
            where: { id: ratingId }
        });

        if (!existingRating) {
            return res.status(404).json({ error: 'Rating not found' });
        }

        if (existingRating.raterId !== req.userId) {
            return res.status(403).json({ error: 'You can only delete your own ratings' });
        }

        // Delete the rating
        await prisma.rating.delete({
            where: { id: ratingId }
        });

        res.json({ message: 'Rating deleted successfully' });

    } catch (error) {
        console.error('Delete rating error:', error);
        res.status(500).json({ error: 'Failed to delete rating' });
    }
});

// Get rating statistics for a user
router.get('/stats/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if the user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get rating statistics
        const stats = await prisma.rating.aggregate({
            where: {
                ratedUserId: userId,
                isPublic: true
            },
            _avg: {
                rating: true
            },
            _count: {
                rating: true
            }
        });

        // Get rating distribution
        const distribution = await prisma.rating.groupBy({
            by: ['rating'],
            where: {
                ratedUserId: userId,
                isPublic: true
            },
            _count: {
                rating: true
            },
            orderBy: {
                rating: 'desc'
            }
        });

        // Format distribution as an object
        const ratingDistribution = {
            5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        };
        distribution.forEach(item => {
            ratingDistribution[item.rating] = item._count.rating;
        });

        res.json({
            averageRating: stats._avg.rating || 0,
            totalRatings: stats._count.rating || 0,
            distribution: ratingDistribution
        });

    } catch (error) {
        console.error('Get rating stats error:', error);
        res.status(500).json({ error: 'Failed to get rating statistics' });
    }
});

module.exports = router; 