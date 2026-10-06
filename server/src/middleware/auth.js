import jwt from 'jsonwebtoken';
import { User, RefreshToken } from '../models/index.js';
import crypto from 'crypto';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'reposense_jwt_access_secret_2026';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'reposense_jwt_refresh_secret_2026';

export async function protect(req, res, next) {
  try {
    let token = null;

    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please sign in.' }
      });
    }

    try {
      const decoded = jwt.verify(token, ACCESS_SECRET);
      const user = await User.findById(decoded.id).select('-passwordHash');

      if (!user || !user.isVerified) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Account not found or unverified.' }
        });
      }

      req.user = user;
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Vary', 'Cookie');
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: 'Access token expired.' }
      });
    }
  } catch (error) {
    next(error);
  }
}

export function generateAccessToken(userId) {
  return jwt.sign({ id: userId }, ACCESS_SECRET, { expiresIn: '15m' });
}

export async function generateRefreshToken(userId) {
  const rawToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const family = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    userId,
    tokenHash,
    family,
    expiresAt
  });

  return rawToken;
}

export function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000
  });

  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
  }
}

export function clearAuthCookies(res) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
}
