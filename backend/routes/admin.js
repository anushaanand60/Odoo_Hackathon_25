const express = require('express');
const { PrismaClient } = require('@prisma/client');
const z = require('zod');
const { requireAdmin, requireSuperAdmin, logAction } = require('../utils/adminMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const banUserSchema = z.object({
    reason: z.string().min(1, 'Ban reason is required'),
    duration: z.enum(['permanent', '7d', '30d', '90d']).optional()
});

const platformMessageSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    type: z.enum(['ANNOUNCEMENT', 'UPDATE', 'WARNING', 'MAINTENANCE']),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
    targetRole: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).optional(),
    expiresAt: z.string().datetime().optional()
});

const reportActionSchema = z.object({
    status: z.enum(['REVIEWED', 'RESOLVED', 'DISMISSED']),
    resolution: z.string().optional()
});

// =============================================================================
// DASHBOARD & OVERVIEW
// =============================================================================

// Admin dashboard overview
router.get('/dashboard', requireAdmin, async (req, res) => {
    try {
        const [
            totalUsers,
            activeUsers,
            bannedUsers,
            totalSkills,
            flaggedSkills,
            totalRequests,
            pendingReports,
            activeMessages
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { isActive: true, bannedAt: null } }),
            prisma.user.count({ where: { bannedAt: { not: null } } }),
            prisma.skill.count(),
            prisma.skill.count({ where: { isFlagged: true } }),
            prisma.swapRequest.count(),
            prisma.report.count({ where: { status: 'PENDING' } }),
            prisma.platformMessage.count({ where: { isActive: true } })
        ]);

        // Recent activity (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const [newUsers, newRequests, newReports] = await Promise.all([
            prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
            prisma.swapRequest.count({ where: { createdAt: { gte: weekAgo } } }),
            prisma.report.count({ where: { createdAt: { gte: weekAgo } } })
        ]);

        res.json({
            overview: {
                totalUsers,
                activeUsers,
                bannedUsers,
                totalSkills,
                flaggedSkills,
                totalRequests,
                pendingReports,
                activeMessages
            },
            recentActivity: {
                newUsers,
                newRequests,
                newReports
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// =============================================================================
// USER MANAGEMENT
// =============================================================================

// Get all users with pagination and filters
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search = '',
            role = 'all',
            status = 'all',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const offset = (page - 1) * limit;

        let whereClause = {};

        // Search filter
        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Role filter
        if (role !== 'all') {
            whereClause.role = role.toUpperCase();
        }

        // Status filter
        if (status === 'active') {
            whereClause.isActive = true;
            whereClause.bannedAt = null;
        } else if (status === 'banned') {
            whereClause.bannedAt = { not: null };
        } else if (status === 'inactive') {
            whereClause.isActive = false;
        }

        const [users, totalUsers] = await Promise.all([
            prisma.user.findMany({
                where: whereClause,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    isActive: true,
                    bannedAt: true,
                    bannedReason: true,
                    lastLoginAt: true,
                    createdAt: true,
                    _count: {
                        select: {
                            skills: true,
                            sentRequests: true,
                            receivedRequests: true,
                            createdReports: true,
                            reportedBy: true
                        }
                    }
                },
                skip: offset,
                take: parseInt(limit),
                orderBy: { [sortBy]: sortOrder }
            }),
            prisma.user.count({ where: whereClause })
        ]);

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
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get specific user details
router.get('/users/:id', requireAdmin, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: {
                skills: true,
                sentRequests: {
                    include: {
                        receiver: { select: { id: true, name: true } }
                    },
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                },
                receivedRequests: {
                    include: {
                        sender: { select: { id: true, name: true } }
                    },
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                },
                createdReports: {
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                },
                reportedBy: {
                    include: {
                        reporter: { select: { id: true, name: true } }
                    },
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ error: 'Failed to fetch user details' });
    }
});

// Ban/Unban user
router.put('/users/:id/ban', requireAdmin, logAction('BAN_USER'), async (req, res) => {
    try {
        const { reason, duration } = banUserSchema.parse(req.body);

        let bannedAt = new Date();
        if (duration && duration !== 'permanent') {
            const days = duration === '7d' ? 7 : duration === '30d' ? 30 : 90;
            bannedAt.setDate(bannedAt.getDate() + days);
        }

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: {
                bannedAt: bannedAt,
                bannedReason: reason,
                isActive: false
            }
        });

        res.json({
            message: 'User banned successfully',
            user: {
                id: user.id,
                bannedAt: user.bannedAt,
                bannedReason: user.bannedReason
            }
        });
    } catch (error) {
        console.error('Ban user error:', error);
        res.status(500).json({ error: 'Failed to ban user' });
    }
});

// Unban user
router.put('/users/:id/unban', requireAdmin, logAction('UNBAN_USER'), async (req, res) => {
    try {
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: {
                bannedAt: null,
                bannedReason: null,
                isActive: true
            }
        });

        res.json({
            message: 'User unbanned successfully',
            user: {
                id: user.id,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Unban user error:', error);
        res.status(500).json({ error: 'Failed to unban user' });
    }
});

// Update user role (Super Admin only)
router.put('/users/:id/role', requireSuperAdmin, logAction('UPDATE_USER_ROLE'), async (req, res) => {
    try {
        const { role } = req.body;

        if (!['USER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { role }
        });

        res.json({
            message: 'User role updated successfully',
            user: {
                id: user.id,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

// =============================================================================
// CONTENT MODERATION
// =============================================================================

// Get flagged/reported content
router.get('/content/flagged', requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, type = 'all' } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = {};
        if (type === 'skills') {
            whereClause.isFlagged = true;
        }

        const [flaggedSkills, totalFlagged] = await Promise.all([
            prisma.skill.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    },
                    reports: {
                        include: {
                            reporter: { select: { id: true, name: true } }
                        }
                    }
                },
                skip: offset,
                take: parseInt(limit),
                orderBy: { updatedAt: 'desc' }
            }),
            prisma.skill.count({ where: whereClause })
        ]);

        res.json({
            flaggedContent: flaggedSkills,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalFlagged,
                totalPages: Math.ceil(totalFlagged / limit)
            }
        });
    } catch (error) {
        console.error('Get flagged content error:', error);
        res.status(500).json({ error: 'Failed to fetch flagged content' });
    }
});

// Flag/Unflag skill
router.put('/content/skills/:id/flag', requireAdmin, logAction('FLAG_SKILL'), async (req, res) => {
    try {
        const { reason } = req.body;

        const skill = await prisma.skill.update({
            where: { id: req.params.id },
            data: {
                isFlagged: true,
                flagReason: reason,
                isApproved: false
            }
        });

        res.json({
            message: 'Skill flagged successfully',
            skill
        });
    } catch (error) {
        console.error('Flag skill error:', error);
        res.status(500).json({ error: 'Failed to flag skill' });
    }
});

// Approve skill
router.put('/content/skills/:id/approve', requireAdmin, logAction('APPROVE_SKILL'), async (req, res) => {
    try {
        const skill = await prisma.skill.update({
            where: { id: req.params.id },
            data: {
                isFlagged: false,
                flagReason: null,
                isApproved: true
            }
        });

        res.json({
            message: 'Skill approved successfully',
            skill
        });
    } catch (error) {
        console.error('Approve skill error:', error);
        res.status(500).json({ error: 'Failed to approve skill' });
    }
});

// Delete skill
router.delete('/content/skills/:id', requireAdmin, logAction('DELETE_SKILL'), async (req, res) => {
    try {
        await prisma.skill.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Skill deleted successfully' });
    } catch (error) {
        console.error('Delete skill error:', error);
        res.status(500).json({ error: 'Failed to delete skill' });
    }
});

// =============================================================================
// REPORTS MANAGEMENT
// =============================================================================

// Get all reports
router.get('/reports', requireAdmin, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status = 'all',
            type = 'all',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const offset = (page - 1) * limit;

        let whereClause = {};
        if (status !== 'all') {
            whereClause.status = status.toUpperCase();
        }
        if (type !== 'all') {
            whereClause.type = type.toUpperCase();
        }

        const [reports, totalReports] = await Promise.all([
            prisma.report.findMany({
                where: whereClause,
                include: {
                    reporter: {
                        select: { id: true, name: true, email: true }
                    },
                    reportedUser: {
                        select: { id: true, name: true, email: true }
                    },
                    reportedSkill: {
                        include: {
                            user: { select: { id: true, name: true } }
                        }
                    }
                },
                skip: offset,
                take: parseInt(limit),
                orderBy: { [sortBy]: sortOrder }
            }),
            prisma.report.count({ where: whereClause })
        ]);

        res.json({
            reports,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalReports,
                totalPages: Math.ceil(totalReports / limit)
            }
        });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// Update report status
router.put('/reports/:id', requireAdmin, logAction('UPDATE_REPORT'), async (req, res) => {
    try {
        const { status, resolution } = reportActionSchema.parse(req.body);

        const report = await prisma.report.update({
            where: { id: req.params.id },
            data: {
                status,
                resolution,
                reviewedAt: new Date(),
                reviewedBy: req.userId
            },
            include: {
                reporter: { select: { id: true, name: true } },
                reportedUser: { select: { id: true, name: true } },
                reportedSkill: { select: { id: true, name: true } }
            }
        });

        res.json({
            message: 'Report updated successfully',
            report
        });
    } catch (error) {
        console.error('Update report error:', error);
        res.status(500).json({ error: 'Failed to update report' });
    }
});

// =============================================================================
// SWAP REQUESTS MONITORING
// =============================================================================

// Get swap requests overview
router.get('/swap-requests', requireAdmin, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status = 'all',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const offset = (page - 1) * limit;

        let whereClause = {};
        if (status !== 'all') {
            whereClause.status = status.toUpperCase();
        }

        const [requests, totalRequests] = await Promise.all([
            prisma.swapRequest.findMany({
                where: whereClause,
                include: {
                    sender: {
                        select: { id: true, name: true, email: true }
                    },
                    receiver: {
                        select: { id: true, name: true, email: true }
                    }
                },
                skip: offset,
                take: parseInt(limit),
                orderBy: { [sortBy]: sortOrder }
            }),
            prisma.swapRequest.count({ where: whereClause })
        ]);

        res.json({
            requests,
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

// =============================================================================
// PLATFORM MESSAGING
// =============================================================================

// Get platform messages
router.get('/messages', requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, active = 'all' } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = {};
        if (active === 'true') {
            whereClause.isActive = true;
        } else if (active === 'false') {
            whereClause.isActive = false;
        }

        const [messages, totalMessages] = await Promise.all([
            prisma.platformMessage.findMany({
                where: whereClause,
                skip: offset,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.platformMessage.count({ where: whereClause })
        ]);

        res.json({
            messages,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalMessages,
                totalPages: Math.ceil(totalMessages / limit)
            }
        });
    } catch (error) {
        console.error('Get platform messages error:', error);
        res.status(500).json({ error: 'Failed to fetch platform messages' });
    }
});

// Create platform message
router.post('/messages', requireAdmin, logAction('CREATE_PLATFORM_MESSAGE'), async (req, res) => {
    try {
        const data = platformMessageSchema.parse(req.body);

        const message = await prisma.platformMessage.create({
            data: {
                ...data,
                createdBy: req.userId,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
            }
        });

        res.status(201).json({
            message: 'Platform message created successfully',
            platformMessage: message
        });
    } catch (error) {
        console.error('Create platform message error:', error);
        res.status(500).json({ error: 'Failed to create platform message' });
    }
});

// Update platform message
router.put('/messages/:id', requireAdmin, logAction('UPDATE_PLATFORM_MESSAGE'), async (req, res) => {
    try {
        const data = platformMessageSchema.partial().parse(req.body);

        const message = await prisma.platformMessage.update({
            where: { id: req.params.id },
            data: {
                ...data,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined
            }
        });

        res.json({
            message: 'Platform message updated successfully',
            platformMessage: message
        });
    } catch (error) {
        console.error('Update platform message error:', error);
        res.status(500).json({ error: 'Failed to update platform message' });
    }
});

// Delete platform message
router.delete('/messages/:id', requireAdmin, logAction('DELETE_PLATFORM_MESSAGE'), async (req, res) => {
    try {
        await prisma.platformMessage.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Platform message deleted successfully' });
    } catch (error) {
        console.error('Delete platform message error:', error);
        res.status(500).json({ error: 'Failed to delete platform message' });
    }
});

// =============================================================================
// REPORTING & ANALYTICS
// =============================================================================

// Get analytics data
router.get('/analytics', requireAdmin, async (req, res) => {
    try {
        const { period = '30d' } = req.query;

        let dateFilter = new Date();
        switch (period) {
            case '7d':
                dateFilter.setDate(dateFilter.getDate() - 7);
                break;
            case '30d':
                dateFilter.setDate(dateFilter.getDate() - 30);
                break;
            case '90d':
                dateFilter.setDate(dateFilter.getDate() - 90);
                break;
            case '1y':
                dateFilter.setFullYear(dateFilter.getFullYear() - 1);
                break;
        }

        const [
            userGrowth,
            skillsGrowth,
            requestsStats,
            topSkills,
            userActivity
        ] = await Promise.all([
            prisma.user.count({
                where: { createdAt: { gte: dateFilter } }
            }),
            prisma.skill.count({
                where: { createdAt: { gte: dateFilter } }
            }),
            prisma.swapRequest.groupBy({
                by: ['status'],
                where: { createdAt: { gte: dateFilter } },
                _count: { status: true }
            }),
            prisma.skill.groupBy({
                by: ['name'],
                _count: { name: true },
                orderBy: { _count: { name: 'desc' } },
                take: 10
            }),
            prisma.user.count({
                where: {
                    lastLoginAt: { gte: dateFilter }
                }
            })
        ]);

        res.json({
            period,
            userGrowth,
            skillsGrowth,
            requestsStats,
            topSkills: topSkills.map(skill => ({
                name: skill.name,
                count: skill._count.name
            })),
            activeUsers: userActivity
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
});

// Export data (CSV format)
router.get('/export/:type', requireAdmin, logAction('EXPORT_DATA'), async (req, res) => {
    try {
        const { type } = req.params;
        const { format = 'json' } = req.query;

        let data = [];
        let filename = '';

        switch (type) {
            case 'users':
                data = await prisma.user.findMany({
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        isActive: true,
                        bannedAt: true,
                        createdAt: true,
                        _count: {
                            select: {
                                skills: true,
                                sentRequests: true,
                                receivedRequests: true
                            }
                        }
                    }
                });
                filename = 'users_export';
                break;

            case 'skills':
                data = await prisma.skill.findMany({
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                });
                filename = 'skills_export';
                break;

            case 'requests':
                data = await prisma.swapRequest.findMany({
                    include: {
                        sender: {
                            select: { id: true, name: true, email: true }
                        },
                        receiver: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                });
                filename = 'swap_requests_export';
                break;

            default:
                return res.status(400).json({ error: 'Invalid export type' });
        }

        if (format === 'csv') {
            // Convert to CSV format
            const csv = convertToCSV(data);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
            res.send(csv);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
            res.json(data);
        }
    } catch (error) {
        console.error('Export data error:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});

// Helper function to convert JSON to CSV
function convertToCSV(data) {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                if (typeof value === 'object' && value !== null) {
                    return JSON.stringify(value);
                }
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(',')
        )
    ].join('\n');

    return csvContent;
}

// =============================================================================
// ADMIN LOGS
// =============================================================================

// Get admin activity logs
router.get('/logs', requireSuperAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 50, adminId, action } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = {};
        if (adminId) whereClause.adminId = adminId;
        if (action) whereClause.action = { contains: action, mode: 'insensitive' };

        const [logs, totalLogs] = await Promise.all([
            prisma.adminLog.findMany({
                where: whereClause,
                skip: offset,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.adminLog.count({ where: whereClause })
        ]);

        res.json({
            logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalLogs,
                totalPages: Math.ceil(totalLogs / limit)
            }
        });
    } catch (error) {
        console.error('Get admin logs error:', error);
        res.status(500).json({ error: 'Failed to fetch admin logs' });
    }
});

module.exports = router;
