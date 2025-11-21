import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MenuItem from '@/models/menuItem.model';
import { verifyAuth } from '@/lib/verifyAuth'; // The security helper from Step 11

// POST: Add a new menu item (REQUIRES ADMIN ROLE)
export async function POST(request) {
  // ---=== 1. SECURITY CHECK (Admin Only) ===---
  const auth = await verifyAuth(request, 'admin'); // Check for 'admin' role
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  // ---===================================---
  
  await dbConnect();

  try {
    const { 
      name, 
      description, 
      price, 
      category, 
      imageUrl, 
      isAvailable 
    } = await request.json();

    // Basic validation to ensure required fields (name, price, category) are present
    if (!name || !price || !category) {
      return NextResponse.json({ error: 'Missing required fields: name, price, and category' }, { status: 400 });
    }

    // Create a new menu item document
    const newItem = new MenuItem({
      name,
      description,
      price,
      category,
      imageUrl,
      isAvailable,
      lastUpdatedBy: auth.user.id, // Log the ID of the admin who created it
    });

    await newItem.save();
    
    return NextResponse.json({ 
      message: 'Menu item added successfully', 
      item: newItem 
    }, { status: 201 });

  } catch (error) {
    // Handle Mongoose duplicate key error (code 11000)
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Menu item name already exists.' }, { status: 409 });
    }
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error while creating item.' }, { status: 500 });
  }
}

// ... (The import statements and POST function from Step 12 are already here) ...

// GET: Fetch all menu items (REQUIRES ADMIN ROLE)
export async function GET(request) {
  // ---=== 1. SECURITY CHECK (Admin Only) ===---
  const auth = await verifyAuth(request, 'admin'); 
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  // ---===================================---
  
  await dbConnect();

  try {
    // Fetch all items. The select('-__v') removes Mongoose metadata, making the output cleaner.
    // The .populate() function replaces the 'lastUpdatedBy' ID with the actual user's name.
    const items = await MenuItem.find({})
      .select('-__v') 
      .populate('lastUpdatedBy', 'name'); // Only fetch the 'name' field of the user

    return NextResponse.json(items, { status: 200 });

  } catch (error) {
    console.error('Admin Menu GET Error:', error);
    return NextResponse.json({ error: 'Internal server error while fetching items.' }, { status: 500 });
  }
}