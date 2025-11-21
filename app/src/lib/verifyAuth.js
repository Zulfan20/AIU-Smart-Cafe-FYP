import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import User from '@/models/user.model';
import dbConnect from './dbConnect';

/**
 * Verifies the JWT token from the request header and checks the user's role.
 * * @param {Request} request - The Next.js request object.
 * @param {string} requiredRole - The minimum role required ('student', 'staff', or 'admin').
 * @returns {object} { user: object, error: string, status: number }
 */
export async function verifyAuth(request, requiredRole = 'student') {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: 'Authorization header missing or invalid.', status: 401 };
    }

    // Extract the token (skipping "Bearer ")
    const token = authHeader.split(' ')[1]; 
    
    if (!token) {
      return { user: null, error: 'No token provided.', status: 401 };
    }
    
    // 1. Verify the token signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 2. Look up the user in the database
    await dbConnect();
    const user = await User.findById(decoded.id);

    if (!user) {
      return { user: null, error: 'Invalid token - user not found.', status: 401 };
    }

    // 3. Check the role (The Security Logic)
    const userRole = user.role;
    
    if (requiredRole === 'admin' && userRole !== 'admin') {
      return { user: null, error: 'Forbidden. Admin access required.', status: 403 };
    }
    
    if (requiredRole === 'staff' && userRole !== 'staff' && userRole !== 'admin') {
      // Staff-level routes are open to both Staff and Admin
      return { user: null, error: 'Forbidden. Staff access required.', status: 403 };
    }

    // Success: Return the verified user data
    return { user: user.toObject(), error: null, status: 200 };

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
       return { user: null, error: 'Token expired. Please log in again.', status: 401 };
    }
    if (error.name === 'JsonWebTokenError') {
      return { user: null, error: 'Invalid token signature.', status: 401 };
    }
    
    // Log unexpected errors
    console.error('Authentication Error:', error.message);
    return { user: null, error: 'Authentication failed due to server error.', status: 500 };
  }
}