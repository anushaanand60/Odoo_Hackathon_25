const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const skillsRoutes = require('./routes/skills');
const searchRoutes = require('./routes/search');
const requestsRoutes = require('./routes/requests');
const ratingsRoutes = require('./routes/ratings');
const adminRoutes = require('./routes/admin');
const projectsRoutes = require('./routes/projects');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectsRoutes);

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

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Using Cloudinary for image storage`);
});