const express = require('express');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const z = require('zod');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authenticate = require('../utils/authmiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/profiles';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp and random number
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, `profile-${uniqueSuffix}${fileExtension}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed'));
        }
    }
});

const profileSchema = z.object({
    name: z.string().optional(),
    location: z.string().optional(),
    profilePhoto: z.string().optional(),
    availability: z.string().optional(),
    isPublic: z.boolean().optional(),
});

// Photo upload endpoint
router.post('/upload-photo', authenticate, upload.single('profilePhoto'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Create the URL path for the uploaded file
        const photoUrl = `/uploads/profiles/${req.file.filename}`;

        // Optionally update the user's profile photo in the database immediately
        await prisma.user.update({
            where: { id: req.userId },
            data: { profilePhoto: photoUrl }
        });

        res.json({
            message: 'Photo uploaded successfully',
            photoUrl: photoUrl,
            filename: req.file.filename,
            size: req.file.size
        });
    } catch (error) {
        console.error('Photo upload error:', error);

        // Clean up uploaded file if database update fails
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ error: 'Failed to upload photo' });
    }
});

// Delete photo endpoint
router.delete('/delete-photo', authenticate, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { profilePhoto: true }
        });

        if (user && user.profilePhoto) {
            // Remove file from filesystem
            const filePath = path.join(__dirname, '..', user.profilePhoto);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            // Update database
            await prisma.user.update({
                where: { id: req.userId },
                data: { profilePhoto: null }
            });
        }

        res.json({ message: 'Photo deleted successfully' });
    } catch (error) {
        console.error('Photo deletion error:', error);
        res.status(500).json({ error: 'Failed to delete photo' });
    }
});

router.put('/update', authenticate, async (req, res) => {
    try {
        const data = profileSchema.parse(req.body);
        const user = await prisma.user.update({
            where: { id: req.userId },
            data,
        });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/', authenticate, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: {
                skills: true,
                projects: { include: { skills: true } }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

module.exports = router;