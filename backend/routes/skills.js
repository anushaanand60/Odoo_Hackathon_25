const express = require('express');
const { PrismaClient } = require('@prisma/client');
const z = require('zod');
const authenticate = require('../utils/authmiddleware');

const router = express.Router();
const prisma = new PrismaClient();

const skillSchema = z.object({
    name: z.string(),
    type: z.enum(['OFFERED', 'WANTED']),
});

router.post('/add', authenticate, async (req, res) => {
    try {
        const { name, type } = skillSchema.parse(req.body);
        const skill = await prisma.skill.create({
            data: { name, type, userId: req.userId },
        });
        res.json(skill);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', authenticate, async (req, res) => {
    try {
        // First check if the skill belongs to the authenticated user
        const skill = await prisma.skill.findUnique({
            where: { id: req.params.id }
        });

        if (!skill) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        if (skill.userId !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized to delete this skill' });
        }

        // Delete the skill
        await prisma.skill.delete({
            where: {
                id: req.params.id,
                userId: req.userId  // Double-check ownership
            }
        });

        res.json({ message: 'Skill removed successfully' });
    } catch (error) {
        console.error('Error removing skill:', error);
        res.status(400).json({ error: error.message });
    }
});

router.get('/', authenticate, async (req, res) => {
    const skills = await prisma.skill.findMany({ where: { userId: req.userId } });
    res.json(skills);
});

router.get('/offered', authenticate, async (req, res) => {
    const skills = await prisma.skill.findMany({
        where: { userId: req.userId, type: 'OFFERED' },
    });
    res.json(skills);
});

router.get('/wanted', authenticate, async (req, res) => {
    const skills = await prisma.skill.findMany({
        where: { userId: req.userId, type: 'WANTED' },
    });
    res.json(skills);
});

module.exports = router;