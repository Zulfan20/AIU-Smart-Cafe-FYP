import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MenuItem from '@/models/menuItem.model';
import { verifyAuth } from '@/lib/verifyAuth';

// PUT: Update a specific menu item (REQUIRES ADMIN ROLE)
export async function PUT(request, { params }) {
  // ---=== 1. SECURITY CHECK ===---
  const auth = await verifyAuth(request, 'admin');
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  // ---========================---

  await dbConnect();
  
  // NEXT.JS 15 FIX: Ensure params are awaited if they are treated as a promise
  // In some versions, params is a promise, in others it's an object. 
  // We handle it safely here.
  const { id } = await params; 

  try {
    const updates = await request.json();

    // Basic validation
    if (updates.name === '') {
       return NextResponse.json({ error: 'Item name cannot be empty' }, { status: 400 });
    }

    updates.lastUpdatedBy = auth.user._id;

    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Item updated successfully',
      item: updatedItem
    }, { status: 200 });

  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Menu item name already exists.' }, { status: 409 });
    }
    console.error('Admin Menu PUT Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// DELETE: Remove a specific menu item (REQUIRES ADMIN ROLE)
export async function DELETE(request, { params }) {
  // ---=== 1. SECURITY CHECK ===---
  const auth = await verifyAuth(request, 'admin');
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  // ---========================---

  await dbConnect();
  
  // NEXT.JS 15 FIX: Await params
  const { id } = await params;

  try {
    const deletedItem = await MenuItem.findByIdAndDelete(id);

    if (!deletedItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Admin Menu DELETE Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}