const express = require('express');
const Link = require('../models/Link');
const authMiddleware = require('../middleware/authMiddleware');

const router = new express.Router();

// GET all links for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const links = await Link.find({ user: req.user._id }).sort({ date: -1 });
    res.send(links);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch links' });
  }
});

// POST a new link
router.post('/', authMiddleware, async (req, res) => {
  try {
    const link = new Link({
      ...req.body,
      user: req.user._id
    });
    await link.save();
    res.status(201).send(link);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// PATCH (update) a link
router.patch('/:id', authMiddleware, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['title', 'url', 'category', 'description', 'tags', 'pinned'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const link = await Link.findOne({ _id: req.params.id, user: req.user._id });

    if (!link) {
      return res.status(404).send({ error: 'Link not found' });
    }

    updates.forEach((update) => link[update] = req.body[update]);
    await link.save();
    
    res.send(link);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// DELETE a link
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const link = await Link.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!link) {
      return res.status(404).send({ error: 'Link not found' });
    }

    res.send(link);
  } catch (error) {
    res.status(500).send({ error: 'Failed to delete link' });
  }
});

module.exports = router;
