const express = require('express');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const z = require('zod');
const authenticate = require('../utils/authmiddleware');
const { upload, deleteImage, extractPublicId } = require('../utils/cloudinary');

const router = express.Router();
const prisma = new PrismaClient();

const profileSchema = z.object({
    name: z.string().optional(),
    location: z.string().optional(),
    profilePhoto: z.string().optional(),
    availability: z.string().optional(),
    isPublic: z.boolean().optional(),
});

// Photo upload endpoint with Cloudinary
router.post('/upload-photo', authenticate, upload.single('profilePhoto'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Get the old profile photo to delete it later
        const currentUser = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { profilePhoto: true }
        });

        // The file is already uploaded to Cloudinary by multer-storage-cloudinary
        const photoUrl = req.file.path; // Cloudinary URL
        const publicId = req.file.filename; // Cloudinary public ID

        // Update the user's profile photo in the database
        await prisma.user.update({
            where: { id: req.userId },
            data: { profilePhoto: photoUrl }
        });

        // Delete the old photo from Cloudinary if it exists
        if (currentUser?.profilePhoto && currentUser.profilePhoto.includes('cloudinary.com')) {
            try {
                const oldPublicId = extractPublicId(currentUser.profilePhoto);
                if (oldPublicId) {
                    await deleteImage(oldPublicId);
                }
            } catch (deleteError) {
                console.error('Error deleting old photo from Cloudinary:', deleteError);
                // Don't fail the upload if old photo deletion fails
            }
        }

        res.json({
            message: 'Photo uploaded successfully',
            photoUrl: photoUrl,
            publicId: publicId,
            size: req.file.size
        });
    } catch (error) {
        console.error('Photo upload error:', error);

        // If database update fails, try to delete the uploaded file from Cloudinary
        if (req.file?.filename) {
            try {
                await deleteImage(req.file.filename);
            } catch (deleteError) {
                console.error('Error cleaning up uploaded file:', deleteError);
            }
        }

        res.status(500).json({ error: 'Failed to upload photo' });
    }
});

// Delete photo endpoint with Cloudinary
router.delete('/delete-photo', authenticate, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { profilePhoto: true }
        });

        if (user && user.profilePhoto) {
            // Delete from Cloudinary if it's a Cloudinary URL
            if (user.profilePhoto.includes('cloudinary.com')) {
                try {
                    const publicId = extractPublicId(user.profilePhoto);
                    if (publicId) {
                        await deleteImage(publicId);
                    }
                } catch (deleteError) {
                    console.error('Error deleting photo from Cloudinary:', deleteError);
                    // Continue to update database even if Cloudinary deletion fails
                }
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