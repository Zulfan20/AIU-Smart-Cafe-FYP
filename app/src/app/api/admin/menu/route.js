import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MenuItem from '@/models/menuItem.model';
import { verifyAuth } from '@/lib/verifyAuth';

// POST: Add a new menu item (REQUIRES ADMIN ROLE)
export async function POST(request) {
  // 1. Security Check: Ensure user is an Admin
  const auth = await verifyAuth(request, 'admin');
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  await dbConnect();

  try {
    const body = await request.json();

    // 2. Validate required fields
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json({ error: 'Name, price, and category are required' }, { status: 400 });
    }

    // 3. Create the Item
    const newItem = new MenuItem({
      ...body,
      lastUpdatedBy: auth.user._id // Track who added it
    });

    await newItem.save();

    return NextResponse.json({
      message: 'Menu item added successfully',
      item: newItem
    }, { status: 201 });

  } catch (error) {
    // Handle duplicate name error (E11000)
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Item with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: Fetch all items for Admin (Shows everything, even hidden items)
export async function GET(request) {
  const auth = await verifyAuth(request, 'admin');
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  await dbConnect();

  try {
    const items = await MenuItem.find({}).sort({ createdAt: -1 });
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}