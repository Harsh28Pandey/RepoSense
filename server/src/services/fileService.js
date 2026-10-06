import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import mongoose from 'mongoose';

const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// In-memory attachment metadata store (also persisted in DB if model exists)
const attachmentStore = new Map();

const ALLOWED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.webp', '.gif',
  '.pdf', '.txt', '.md', '.csv', '.json', '.yaml', '.yml', '.xml',
  '.html', '.css', '.js', '.jsx', '.ts', '.tsx', '.py', '.java',
  '.go', '.rs', '.c', '.cpp', '.rb', '.php', '.sh', '.sql', '.log'
]);

export function validateFile(file) {
  if (!file) return { valid: false, reason: 'No file received' };
  if (file.size === 0) return { valid: false, reason: 'Empty file (0 bytes)' };
  if (file.size > 10 * 1024 * 1024) return { valid: false, reason: 'File exceeds 10 MB limit' };

  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, reason: `File type ${ext} is not allowed` };
  }

  return { valid: true };
}

export function saveUploadedFile(file, userId) {
  const fileId = 'att_' + crypto.randomBytes(12).toString('hex');
  const ext = path.extname(file.originalname).toLowerCase();
  const storageName = `${fileId}${ext}`;
  const userFolder = path.join(uploadDir, String(userId));
  if (!fs.existsSync(userFolder)) {
    fs.mkdirSync(userFolder, { recursive: true });
  }

  const destinationPath = path.join(userFolder, storageName);
  
  if (file.buffer) {
    fs.writeFileSync(destinationPath, file.buffer);
  } else if (file.path) {
    fs.copyFileSync(file.path, destinationPath);
  }

  const isImage = ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext);

  const metadata = {
    id: fileId,
    userId: String(userId),
    name: file.originalname,
    size: file.size,
    mimeType: file.mimetype || 'application/octet-stream',
    kind: isImage ? 'image' : 'document',
    storagePath: destinationPath,
    createdAt: new Date()
  };

  attachmentStore.set(fileId, metadata);
  return metadata;
}

export function getFileMetadata(fileId, userId) {
  const meta = attachmentStore.get(fileId);
  if (!meta) return null;
  if (meta.userId !== String(userId)) return null;
  return meta;
}

export function deleteFile(fileId, userId) {
  const meta = getFileMetadata(fileId, userId);
  if (!meta) return false;
  if (fs.existsSync(meta.storagePath)) {
    try { fs.unlinkSync(meta.storagePath); } catch (e) {}
  }
  attachmentStore.delete(fileId);
  return true;
}
