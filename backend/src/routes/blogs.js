const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

/** GET /api/blogs — list all published blogs (status = 1), newest first */
router.get('/', async (req, res) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { status: 1 },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        metaTitle: true,
        metaDescription: true,
        image: true,
        createdAt: true,
      },
    });
    res.json(blogs);
  } catch (err) {
    console.error('[blogs GET /]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** GET /api/blogs/:slug — single blog by slug (published only) */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug || slug.trim() === '') {
      return res.status(400).json({ error: 'Slug is required' });
    }
    const blog = await prisma.blog.findFirst({
      where: { slug: slug.trim(), status: 1 },
    });
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    console.error('[blogs GET /:slug]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
