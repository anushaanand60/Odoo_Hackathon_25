const fs = require('fs');
const path = require('path');

// Ensure upload directories exist
const ensureUploadDirs = () => {
    const dirs = [
        'uploads',
        'uploads/profiles',
        'uploads/temp'
    ];

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }
    });
};

// Clean up old temporary files
const cleanupTempFiles = () => {
    const tempDir = 'uploads/temp';
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        files.forEach(file => {
            const filePath = path.join(tempDir, file);
            const stats = fs.statSync(filePath);

            if (Date.now() - stats.mtime.getTime() > maxAge) {
                fs.unlinkSync(filePath);
                console.log(`Cleaned up old temp file: ${file}`);
            }
        });
    }
};

// Delete file safely
const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};

module.exports = {
    ensureUploadDirs,
    cleanupTempFiles,
    deleteFile
};