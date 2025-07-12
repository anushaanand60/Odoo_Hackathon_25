const express = require('express');
const { PrismaClient } = require('@prisma/client');
const z = require('zod');
const authenticate = require('../utils/authmiddleware');

const router = express.Router();
const prisma = new PrismaClient();

const projectSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  url: z.string().optional(),
  skillIds: z.array(z.string()).optional(),
});

router.post('/add', authenticate, async (req, res) => {
  try {
    const { title, description, url, skillIds } = projectSchema.parse(req.body);
    const project = await prisma.project.create({
      data: {
        title,
        description,
        url,
        userId: req.userId,
        skills: {
          connect: skillIds ? skillIds.map(id => ({ id })) : [],
        },
      },
    });
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });
    if (!project || project.userId !== req.userId) {
      return res.status(404).json({ error: 'Project not found' });
    }
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', authenticate, async (req, res) => {
  const projects = await prisma.project.findMany({
    where: { userId: req.userId },
    include: { skills: true },
  });
  res.json(projects);
});

module.exports = router; 