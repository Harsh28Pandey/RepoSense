import { Notification } from '../models/Notification.js';

// In-memory set of SSE client response streams
// Key: userId -> Set of res objects
const sseClients = new Map();

export function addSseClient(userId, res) {
  const userIdStr = String(userId);
  if (!sseClients.has(userIdStr)) {
    sseClients.set(userIdStr, new Set());
  }
  sseClients.get(userIdStr).add(res);
}

export function removeSseClient(userId, res) {
  const userIdStr = String(userId);
  if (sseClients.has(userIdStr)) {
    const set = sseClients.get(userIdStr);
    set.delete(res);
    if (set.size === 0) {
      sseClients.delete(userIdStr);
    }
  }
}

export function broadcastSse(userId, event, data) {
  const userIdStr = String(userId);
  const clients = sseClients.get(userIdStr);
  if (clients && clients.size > 0) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    clients.forEach((res) => {
      try {
        res.write(payload);
      } catch (err) {
        // Client connection closed
      }
    });
  }
}

/**
 * Creates a notification with automatic 10-minute deduplication window if dedupeKey is provided.
 */
export async function createNotification({
  userId,
  type,
  title,
  body = '',
  link = '',
  severity = 'info',
  dedupeKey = null,
  meta = {},
}) {
  if (!userId || !type || !title) return null;

  try {
    let finalDedupeKey = dedupeKey;
    if (dedupeKey) {
      // 10-minute time window rounding to deduplicate identical events within 10m
      const window10m = Math.floor(Date.now() / (10 * 60 * 1000));
      finalDedupeKey = `${type}:${dedupeKey}:${window10m}`;
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      body,
      link,
      severity,
      dedupeKey: finalDedupeKey,
      meta,
    });

    // Broadcast in real-time via SSE
    broadcastSse(userId, 'notification', notification);

    return notification;
  } catch (err) {
    // Handle duplicate key error gracefully (code 11000)
    if (err.code === 11000) {
      return null;
    }
    console.error('Error creating notification:', err);
    return null;
  }
}
