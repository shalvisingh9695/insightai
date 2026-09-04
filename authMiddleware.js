import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'shalvi_jwt_secret_key_2026';

/**
 * Middleware to authenticate requests using JWT tokens
 */
export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required. Please log in.'
      });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format. Bearer token expected.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.userId = decoded.userId || decoded.id || decoded._id;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token. Please log in again.'
    });
  }
}

/**
 * Optional authentication: attaches user if token is valid, but allows guest access
 */
export function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : authHeader.trim();
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        req.userId = decoded.userId || decoded.id || decoded._id;
      }
    }
  } catch (e) {
    // Ignore invalid tokens for optional auth
  }
  next();
}

export default authMiddleware;
