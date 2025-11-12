import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/user.model';

export async function POST(request) {
  // 1. Connect to the database
  await dbConnect();

  try {
    // 2. Parse the request body
    const { name, email, password } = await request.json();

    // 3. Basic Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 4. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 }); // 409 Conflict
    }

    // 5. Create new user
    // IMPORTANT: We pass the plain password to the 'passwordHash' field.
    // Our 'user.model.js' file (from Step 3) will automatically
    // hash it *before* saving it to the database.
    const newUser = new User({
      name,
      email,
      passwordHash: password, // The model's 'pre-save' hook will hash this
    });

    // 6. Save the user to the database
    await newUser.save();

    // 7. Send a success response
    // We don't send the full user object back, just a success message.
    return NextResponse.json({ 
      message: 'User created successfully' 
    }, { status: 201 }); // 201 Created

  } catch (error) {
    // Handle validation errors or other database errors
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
