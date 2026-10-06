import express from 'express';
import { protect } from '../middleware/auth.js';
import { Notification } from '../models/Notification.js';
import { addSseClient, removeSseClient } from '../services/notificationService.js';

const router = express.Router();

router.use(protect);

// GET /api/v1/notifications - List user notifications with cursor pagination
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const { cursor, unreadOnly, limit = 20 } = req.query;

    const query = { userId };
    if (unreadOnly === 'true') {
      query.readAt = null;
    }
    if (cursor) {
      query._id = { $lt: cursor };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) + 1);

    let nextCursor = null;
    if (notifications.length > Number(limit)) {
      const nextItem = notifications.pop();
      nextCursor = nextItem._id;
    }

    res.json({
      notifications,
      nextCursor,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// GET /api/v1/notifications/unread-count
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.countDocuments({ userId, readAt: null });
    res.json({ unreadCount: count });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
});

// POST /api/v1/notifications/:id/read - Mark single notification read
router.post('/:id/read', async (req, res) => {
  try {
    const userId = req.user._id;
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: { readAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ notification });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notification read' });
  }
});

// POST /api/v1/notifications/read-all - Mark all read
router.post('/read-all', async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany(
      { userId, readAt: null },
      { $set: { readAt: new Date() } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark all notifications read' });
  }
});

// DELETE /api/v1/notifications/:id - Delete single notification
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await Notification.findOneAndDelete({ _id: req.params.id, userId });
    if (!result) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete notification' });
  }
});

// DELETE /api/v1/notifications - Clear all notifications
router.delete('/', async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear notifications' });
  }
});

// GET /api/v1/notifications/stream - Realtime SSE stream
router.get('/stream', (req, res) => {
  const userId = req.user._id;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // Send initial connection event
  res.write(`event: connected\ndata: ${JSON.stringify({ userId })}\n\n`);

  addSseClient(userId, res);

  // Heartbeat ping every 25 seconds
  const heartbeatTimer = setInterval(() => {
    try {
      res.write(': heartbeat ping\n\n');
    } catch (err) {
      clearInterval(heartbeatTimer);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeatTimer);
    removeSseClient(userId, res);
  });
});

export default router;
