import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/user.model';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  // 1. Connect to the database
  await dbConnect();

  try {
    // 2. Parse the request body
    const { email, password } = await request.json();

    // 3. Basic Validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // 4. Find the user by email
    // CRITICAL: We must .select('+passwordHash') because our model hides it by default.
    // We need it here to perform the comparison.
    // Also select accountStatus and rejectionReason for approval check
    const user = await User.findOne({ email }).select('+passwordHash accountStatus rejectionReason');

    if (!user) {
      // Security Best Practice: Use generic error messages to prevent email enumeration
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 5. Compare the provided password with the stored hash
    // This uses the helper method we defined in user.model.js
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 5.5. Check if account is approved
    console.log('User account status:', user.accountStatus);
    
    if (user.accountStatus === 'pending') {
      return NextResponse.json({ 
        error: 'Your account is pending approval. Please wait for admin approval.' 
      }, { status: 403 });
    }

    if (user.accountStatus === 'rejected') {
      return NextResponse.json({ 
        error: `Your account has been rejected. ${user.rejectionReason ? 'Reason: ' + user.rejectionReason : ''}` 
      }, { status: 403 });
    }

    // 6. Generate JWT Token
    // This token proves who the user is for future requests
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET, // Make sure this is in your .env.local
      { expiresIn: '1d' }     // Token expires in 1 day
    );

    // 7. Prepare User Response (Exclude passwordHash)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // 8. Send Success Response
    return NextResponse.json({
      message: 'Login successful',
      token,
      user: userResponse
    }, { status: 200 });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}