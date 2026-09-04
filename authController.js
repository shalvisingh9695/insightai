import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from './db.js';
import { JWT_SECRET } from './authMiddleware.js';

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(req, res) {
  try {
    const { name, email, password } = req.body || {};

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Email is required.'
      });
    }

    if (!password || typeof password !== 'string' || password.length < 4) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 4 characters.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email already exists. Please log in.'
      });
    }

    // Determine displayName
    let displayName = (name && name.trim()) || '';
    if (!displayName) {
      const emailPrefix = normalizedEmail.split('@')[0] || 'User';
      displayName = emailPrefix
        .split(/[._-]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Persist user
    const newUser = await createUser({
      name: displayName,
      email: normalizedEmail,
      password: hashedPassword
    });

    const userId = newUser.id || newUser._id;

    // Generate JWT token
    const token = jwt.sign(
      {
        userId,
        email: normalizedEmail,
        name: displayName
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: userId,
        name: displayName,
        email: normalizedEmail
      }
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error during registration.'
    });
  }
}

/**
 * Login existing user
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password, name } = req.body || {};

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Email is required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await findUserByEmail(normalizedEmail);

    // If user does not exist yet, facilitate seamless onboarding
    if (!user) {
      let displayName = (name && name.trim()) || '';
      if (!displayName) {
        const emailPrefix = normalizedEmail.split('@')[0] || 'User';
        displayName = emailPrefix
          .split(/[._-]/)
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
      }

      const defaultPassword = password || 'user_demo_pass_123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      user = await createUser({
        name: displayName,
        email: normalizedEmail,
        password: hashedPassword
      });
    } else if (password) {
      // If user exists and provided password, verify hash
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid password. Please check your credentials.'
        });
      }
    }

    const userId = user.id || user._id;
    const displayName = user.name || (name && name.trim()) || normalizedEmail.split('@')[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        userId,
        email: normalizedEmail,
        name: displayName
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: userId,
        name: displayName,
        email: normalizedEmail
      }
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error during login.'
    });
  }
}

export default {
  register,
  login
};
