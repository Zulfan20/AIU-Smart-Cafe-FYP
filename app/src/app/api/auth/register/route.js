import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/user.model'; // <--- Make sure this imports USER, not MenuItem

export async function POST(request) {
  await dbConnect();

  try {
    const { name, email, password, role } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    // Create User (User model will handle password hashing)
    const newUser = new User({
      name,
      email,
      passwordHash: password,
      role: role || 'student', // Allow role specification, default to student
      accountStatus: (role === 'admin' || role === 'staff') ? 'approved' : 'pending'
    });

    await newUser.save();

    if (role === 'admin' || role === 'staff') {
      return NextResponse.json({ 
        message: 'Admin/Staff account created successfully!',
        status: 'approved'
      }, { status: 201 });
    }

    return NextResponse.json({ 
      message: 'Registration successful! Your account is pending approval. You will be able to login once an admin approves your account.',
      status: 'pending'
    }, { status: 201 });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}