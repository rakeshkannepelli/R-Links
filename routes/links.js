const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const router = new express.Router();

// GET all links for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Sort links by date descending
    const links = req.user.links.sort((a, b) => b.date - a.date);
    res.send(links);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch links' });
  }
});

// POST a new link
router.post('/', authMiddleware, async (req, res) => {
  try {
    const linkData = { ...req.body };
    if (!linkData.icon && linkData.url) {
      try {
        const domain = new URL(linkData.url).hostname.replace('www.', '');
        linkData.icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      } catch {
        linkData.icon = '';
      }
    }
    req.user.links.push(linkData);
    await req.user.save();
    
    // Get the newly added link
    const newLink = req.user.links[req.user.links.length - 1];
    res.status(201).send(newLink);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// PATCH (update) a link
router.patch('/:id', authMiddleware, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['title', 'url', 'category', 'description', 'tags', 'pinned', 'icon'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const link = req.user.links.id(req.params.id);

    if (!link) {
      return res.status(404).send({ error: 'Link not found' });
    }

    updates.forEach((update) => link[update] = req.body[update]);
    await req.user.save();
    
    res.send(link);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// DELETE a link
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const link = req.user.links.id(req.params.id);

    if (!link) {
      return res.status(404).send({ error: 'Link not found' });
    }

    req.user.links.pull(req.params.id);
    await req.user.save();

    res.send(link);
  } catch (error) {
    res.status(500).send({ error: 'Failed to delete link' });
  }
});

module.exports = router;
