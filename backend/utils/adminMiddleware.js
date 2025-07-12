const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Basic admin authentication
const requireAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, role: true, isActive: true, bannedAt: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid token. User not found.' });
        }

        if (!user.isActive || user.bannedAt) {
            return res.status(403).json({ error: 'Account is inactive or banned.' });
        }

        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }

        req.userId = user.id;
        req.userRole = user.role;
        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(401).json({ error: 'Invalid token.' });
    }
};

// Super admin only
const requireSuperAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, role: true, isActive: true, bannedAt: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid token. User not found.' });
        }

        if (!user.isActive || user.bannedAt) {
            return res.status(403).json({ error: 'Account is inactive or banned.' });
        }

        if (user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Access denied. Super admin privileges required.' });
        }

        req.userId = user.id;
        req.userRole = user.role;
        next();
    } catch (error) {
        console.error('Super admin auth error:', error);
        res.status(401).json({ error: 'Invalid token.' });
    }
};

// Log admin actions
const logAdminAction = async (adminId, action, targetType = null, targetId = null, details = null, ipAddress = null) => {
    try {
        await prisma.adminLog.create({
            data: {
                adminId,
                action,
                targetType,
                targetId,
                details,
                ipAddress
            }
        });
    } catch (error) {
        console.error('Error logging admin action:', error);
    }
};

// Middleware to automatically log admin actions
const logAction = (action) => {
    return (req, res, next) => {
        const originalSend = res.send;
        res.send = function (data) {
            // Log successful actions (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const ipAddress = req.ip || req.connection.remoteAddress;
                const targetId = req.params.id || req.body.targetId || null;
                const targetType = req.params.type || req.body.targetType || null;
                const details = req.body.details || null;

                logAdminAction(req.userId, action, targetType, targetId, details, ipAddress);
            }
            originalSend.call(this, data);
        };
        next();
    };
};

module.exports = {
    requireAdmin,
    requireSuperAdmin,
    logAdminAction,
    logAction
}; 