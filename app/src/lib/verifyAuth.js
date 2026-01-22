import jwt from 'jsonwebtoken';
import User from '@/models/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Verify JWT token from Authorization header and return user data
 * @param {Request} request - The incoming request object
 * @param {string} [requiredRole] - Optional required role ('admin', 'staff', 'student')
 * @returns {Promise<{user: Object, error?: string, status?: number}>}
 */
export async function verifyAuth(request, requiredRole = null) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        error: 'Unauthorized - No token provided',
        status: 401
      };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return {
        error: 'Unauthorized - Invalid token',
        status: 401
      };
    }

    // Get user from database
    // Support both 'userId' and 'id' for backwards compatibility
    const userId = decoded.userId || decoded.id;
    const user = await User.findById(userId).select('-passwordHash');
    
    if (!user) {
      return {
        error: 'Unauthorized - User not found',
        status: 401
      };
    }

    // Check account status only for students
    // Admins and staff don't need approval
    if (user.role === 'student') {
      if (user.accountStatus === 'pending') {
        return {
          error: 'Account pending approval. Please wait for admin approval.',
          status: 403
        };
      }
      if (user.accountStatus === 'rejected') {
        return {
          error: 'Account has been rejected. Please contact support.',
          status: 403
        };
      }
      if (user.accountStatus === 'blocked') {
        return {
          error: 'Account has been blocked. Please contact support.',
          status: 403
        };
      }
    }

    // Check role if required
    if (requiredRole) {
      if (requiredRole === 'admin') {
        // Check if user is admin or owner
        if (!(user.role === 'admin' || user.role === 'owner')) {
          return {
            error: 'Forbidden - Admin access required',
            status: 403
          };
        }
      }
      if (requiredRole === 'staff') {
        // Check if user is staff, admin, or owner
        if (!(user.role === 'admin' || user.role === 'owner' || user.role === 'staff')) {
          return {
            error: 'Forbidden - Staff access required',
            status: 403
          };
        }
      }
    }

    return { user };
  } catch (error) {
    // Log the specific error for debugging
    console.error('Auth verification error:', error.message || error);
    
    // Provide more specific error messages
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      return {
        error: 'Database connection error',
        status: 500
      };
    }
    
    // For other unexpected errors, return a generic message
    // but log the details for debugging
    return {
      error: 'Authentication verification failed',
      status: 500
    };
  }
}

/**
 * Verify if user has admin role
 * @param {Object} user - User object from verifyAuth
 * @returns {boolean}
 */
export function isAdmin(user) {
  return user && (user.role === 'admin' || user.role === 'owner');
}

/**
 * Verify if user has staff role (includes admin)
 * @param {Object} user - User object from verifyAuth
 * @returns {boolean}
 */
export function isStaff(user) {
  return user && (user.role === 'admin' || user.role === 'owner' || user.role === 'staff');
}
