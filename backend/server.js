const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { ensureUploadDirs, cleanupTempFiles } = require('./utils/fileUtils');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const skillsRoutes = require('./routes/skills');

const app = express();
const prisma = new PrismaClient();

// Initialize upload directories
ensureUploadDirs();

// Clean up temp files on startup
cleanupTempFiles();

// Schedule cleanup every 24 hours
setInterval(cleanupTempFiles, 24 * 60 * 60 * 1000);

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/skills', skillsRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    if (error.message.includes('Only image files')) {
        return res.status(400).json({ error: error.message });
    }
    console.error('Server error:', error);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Upload directory: ${path.join(__dirname, 'uploads')}`);
});