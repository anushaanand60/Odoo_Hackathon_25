const express = require('express');
const { PrismaClient } = require('@prisma/client');
const z = require('zod');
const authenticate = require('../utils/authmiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createRequestSchema = z.object({
    receiverId: z.string().uuid(),
    message: z.string().optional()
});

const updateRequestSchema = z.object({
    status: z.enum(['ACCEPTED', 'REJECTED'])
});

// Create a new swap request
router.post('/create', authenticate, async (req, res) => {
    try {
        const { receiverId, message } = createRequestSchema.parse(req.body);

        // Check if user is trying to send request to themselves
        if (receiverId === req.userId) {
            return res.status(400).json({ error: 'Cannot send swap request to yourself' });
        }

        // Check if receiver exists and has public profile
        const receiver = await prisma.user.findUnique({
            where: { id: receiverId },
            select: { id: true, isPublic: true, name: true }
        });

        if (!receiver) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!receiver.isPublic) {
            return res.status(400).json({ error: 'Cannot send request to private profile' });
        }

        // Check if there's already a pending request between these users
        const existingRequest = await prisma.swapRequest.findFirst({
            where: {
                OR: [
                    { senderId: req.userId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: req.userId }
                ],
                status: 'PENDING'
            }
        });

        if (existingRequest) {
            return res.status(400).json({ error: 'There is already a pending swap request between you and this user' });
        }

        // Create the swap request
        const swapRequest = await prisma.swapRequest.create({
            data: {
                senderId: req.userId,
                receiverId: receiverId,
                message: message || null,
                status: 'PENDING'
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true,
                        skills: {
                            select: {
                                id: true,
                                name: true,
                                type: true
                            }
                        }
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true,
                        skills: {
                            select: {
                                id: true,
                                name: true,
                                type: true
                            }
                        }
                    }
                }
            }
        });

        res.status(201).json({
            message: 'Swap request sent successfully',
            request: swapRequest
        });
    } catch (error) {
        console.error('Create swap request error:', error);
        res.status(500).json({ error: 'Failed to create swap request' });
    }
});

// Get all swap requests for the current user (both sent and received)
router.get('/my-requests', authenticate, async (req, res) => {
    try {
        const { type = 'all', status = 'all', page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = {
            OR: [
                { senderId: req.userId },
                { receiverId: req.userId }
            ]
        };

        // Filter by type (sent, received, or all)
        if (type === 'sent') {
            whereClause = { senderId: req.userId };
        } else if (type === 'received') {
            whereClause = { receiverId: req.userId };
        }

        // Filter by status
        if (status !== 'all') {
            whereClause.status = status.toUpperCase();
        }

        const requests = await prisma.swapRequest.findMany({
            where: whereClause,
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true,
                        location: true,
                        skills: {
                            select: {
                                id: true,
                                name: true,
                                type: true
                            }
                        }
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true,
                        location: true,
                        skills: {
                            select: {
                                id: true,
                                name: true,
                                type: true
                            }
                        }
                    }
                }
            },
            skip: offset,
            take: parseInt(limit),
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Get total count for pagination
        const totalRequests = await prisma.swapRequest.count({
            where: whereClause
        });

        // Add metadata to each request
        const requestsWithMetadata = requests.map(request => ({
            ...request,
            isSender: request.senderId === req.userId,
            isReceiver: request.receiverId === req.userId,
            canAccept: request.receiverId === req.userId && request.status === 'PENDING',
            canReject: request.receiverId === req.userId && request.status === 'PENDING',
            canCancel: request.senderId === req.userId && request.status === 'PENDING'
        }));

        res.json({
            requests: requestsWithMetadata,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalRequests,
                totalPages: Math.ceil(totalRequests / limit)
            }
        });
    } catch (error) {
        console.error('Get swap requests error:', error);
        res.status(500).json({ error: 'Failed to fetch swap requests' });
    }
});

// Get a specific swap request
router.get('/:id', authenticate, async (req, res) => {
    try {
        const request = await prisma.swapRequest.findUnique({
            where: { id: req.params.id },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true,
                        location: true,
                        availability: true,
                        skills: {
                            select: {
                                id: true,
                                name: true,
                                type: true
                            }
                        }
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true,
                        location: true,
                        availability: true,
                        skills: {
                            select: {
                                id: true,
                                name: true,
                                type: true
                            }
                        }
                    }
                }
            }
        });

        if (!request) {
            return res.status(404).json({ error: 'Swap request not found' });
        }

        // Check if user is involved in this request
        if (request.senderId !== req.userId && request.receiverId !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized to view this request' });
        }

        // Add metadata
        const requestWithMetadata = {
            ...request,
            isSender: request.senderId === req.userId,
            isReceiver: request.receiverId === req.userId,
            canAccept: request.receiverId === req.userId && request.status === 'PENDING',
            canReject: request.receiverId === req.userId && request.status === 'PENDING',
            canCancel: request.senderId === req.userId && request.status === 'PENDING'
        };

        res.json(requestWithMetadata);
    } catch (error) {
        console.error('Get swap request error:', error);
        res.status(500).json({ error: 'Failed to fetch swap request' });
    }
});

// Accept or reject a swap request
router.put('/:id/respond', authenticate, async (req, res) => {
    try {
        const { status } = updateRequestSchema.parse(req.body);

        // Find the request and check if user is the receiver
        const request = await prisma.swapRequest.findUnique({
            where: { id: req.params.id },
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

        if (!request) {
            return res.status(404).json({ error: 'Swap request not found' });
        }

        if (request.receiverId !== req.userId) {
            return res.status(403).json({ error: 'Only the receiver can respond to this request' });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({ error: 'This request has already been responded to' });
        }

        // Update the request status
        const updatedRequest = await prisma.swapRequest.update({
            where: { id: req.params.id },
            data: { status },
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

        res.json({
            message: `Swap request ${status.toLowerCase()} successfully`,
            request: updatedRequest
        });
    } catch (error) {
        console.error('Respond to swap request error:', error);
        res.status(500).json({ error: 'Failed to respond to swap request' });
    }
});

// Cancel a swap request (only sender can cancel)
router.put('/:id/cancel', authenticate, async (req, res) => {
    try {
        const request = await prisma.swapRequest.findUnique({
            where: { id: req.params.id },
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

        if (!request) {
            return res.status(404).json({ error: 'Swap request not found' });
        }

        if (request.senderId !== req.userId) {
            return res.status(403).json({ error: 'Only the sender can cancel this request' });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({ error: 'Only pending requests can be cancelled' });
        }

        // Update the request status to cancelled
        const updatedRequest = await prisma.swapRequest.update({
            where: { id: req.params.id },
            data: { status: 'CANCELLED' },
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

        res.json({
            message: 'Swap request cancelled successfully',
            request: updatedRequest
        });
    } catch (error) {
        console.error('Cancel swap request error:', error);
        res.status(500).json({ error: 'Failed to cancel swap request' });
    }
});

// Delete a swap request (only for cancelled or rejected requests)
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const request = await prisma.swapRequest.findUnique({
            where: { id: req.params.id }
        });

        if (!request) {
            return res.status(404).json({ error: 'Swap request not found' });
        }

        // Check if user is involved in this request
        if (request.senderId !== req.userId && request.receiverId !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized to delete this request' });
        }

        // Only allow deletion of cancelled or rejected requests
        if (!['CANCELLED', 'REJECTED'].includes(request.status)) {
            return res.status(400).json({ error: 'Only cancelled or rejected requests can be deleted' });
        }

        await prisma.swapRequest.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Swap request deleted successfully' });
    } catch (error) {
        console.error('Delete swap request error:', error);
        res.status(500).json({ error: 'Failed to delete swap request' });
    }
});

// Get request statistics for the current user
router.get('/stats/summary', authenticate, async (req, res) => {
    try {
        const [sentStats, receivedStats] = await Promise.all([
            prisma.swapRequest.groupBy({
                by: ['status'],
                where: { senderId: req.userId },
                _count: { status: true }
            }),
            prisma.swapRequest.groupBy({
                by: ['status'],
                where: { receiverId: req.userId },
                _count: { status: true }
            })
        ]);

        const formatStats = (stats) => {
            const result = { PENDING: 0, ACCEPTED: 0, REJECTED: 0, CANCELLED: 0 };
            stats.forEach(stat => {
                result[stat.status] = stat._count.status;
            });
            return result;
        };

        res.json({
            sent: formatStats(sentStats),
            received: formatStats(receivedStats)
        });
    } catch (error) {
        console.error('Get request stats error:', error);
        res.status(500).json({ error: 'Failed to fetch request statistics' });
    }
});

module.exports = router;
