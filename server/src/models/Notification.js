import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      default: '',
      trim: true,
    },
    link: {
      type: String,
      default: '',
      trim: true,
    },
    severity: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info',
    },
    readAt: {
      type: Date,
      default: null,
    },
    dedupeKey: {
      type: String,
      default: null,
    },
    meta: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user notifications sorted by recency
notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });

// Deduplication unique index (scoped per user)
notificationSchema.index(
  { userId: 1, dedupeKey: 1 },
  { unique: true, partialFilterExpression: { dedupeKey: { $type: 'string' } } }
);

// TTL Indexes: read notifications expire in 90 days, unread expire in 180 days
notificationSchema.index({ readAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60, partialFilterExpression: { readAt: { $ne: null } } });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60, partialFilterExpression: { readAt: null } });

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
