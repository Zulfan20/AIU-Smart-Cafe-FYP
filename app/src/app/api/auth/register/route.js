import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/user.model'; // <--- Make sure this imports USER, not MenuItem

export async function POST(request) {
  await dbConnect();

  try {
    const { name, email, password } = await request.json();

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
    });

    await newUser.save();

    return NextResponse.json({ 
      message: 'User created successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}