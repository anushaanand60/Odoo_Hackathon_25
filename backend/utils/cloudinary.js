const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'skillswap/profile-photos', // Folder in Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
        ],
        public_id: (req, file) => {
            // Generate unique filename with user ID and timestamp
            const userId = req.user?.id || 'temp';
            const timestamp = Date.now();
            return `profile_${userId}_${timestamp}`;
        }
    },
});

// Create multer upload middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
        }
    }
});

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw error;
    }
};

// Helper function to extract public ID from Cloudinary URL
const extractPublicId = (url) => {
    if (!url || !url.includes('cloudinary.com')) return null;

    try {
        // Extract public ID from Cloudinary URL
        // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.ext
        const parts = url.split('/');
        const uploadIndex = parts.findIndex(part => part === 'upload');
        if (uploadIndex === -1) return null;

        // Get everything after 'upload/v{version}/' or 'upload/'
        let publicIdParts = parts.slice(uploadIndex + 1);

        // Remove version if present (starts with 'v' followed by numbers)
        if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
            publicIdParts = publicIdParts.slice(1);
        }

        // Join the remaining parts and remove file extension
        const publicIdWithExt = publicIdParts.join('/');
        const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ''); // Remove extension

        return publicId;
    } catch (error) {
        console.error('Error extracting public ID from URL:', error);
        return null;
    }
};

// Helper function to upload image from buffer or file path
const uploadImage = async (file, options = {}) => {
    try {
        const uploadOptions = {
            folder: 'skillswap/profile-photos',
            transformation: [
                { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                { quality: 'auto', fetch_format: 'auto' }
            ],
            ...options
        };

        let result;
        if (typeof file === 'string') {
            // File path
            result = await cloudinary.uploader.upload(file, uploadOptions);
        } else if (file.buffer) {
            // Buffer (from multer memory storage)
            result = await cloudinary.uploader.upload(
                `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
                uploadOptions
            );
        } else {
            throw new Error('Invalid file format');
        }

        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format
        };
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw error;
    }
};

module.exports = {
    cloudinary,
    upload,
    deleteImage,
    extractPublicId,
    uploadImage
}; 