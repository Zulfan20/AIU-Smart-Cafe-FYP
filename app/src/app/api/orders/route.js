import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/order.model';
import MenuItem from '@/models/menuItem.model'; // Needed to fetch real prices
import { verifyAuth } from '@/lib/verifyAuth';

// POST: Place a new order (Requires Login)
export async function POST(request) {
  // ---=== 1. SECURITY CHECK ===---
  // Any logged-in user (Student/Staff/Admin) can place an order
  const auth = await verifyAuth(request); 
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  // ---========================---

  await dbConnect();

  try {
    const { items } = await request.json();

    // Validation: Ensure items array exists and is not empty
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item.' }, { status: 400 });
    }

    // 2. Calculate Total & Build Order Items securely
    // We DO NOT trust the price sent from the frontend.
    // We fetch the real items from the DB to get the current price and availability.
    
    let totalAmount = 0;
    const finalOrderItems = [];

    for (const itemRequest of items) {
      const { itemId, quantity } = itemRequest;

      // Fetch the real item
      const dbItem = await MenuItem.findById(itemId);

      if (!dbItem) {
        return NextResponse.json({ error: `Item not found: ${itemId}` }, { status: 404 });
      }

      if (!dbItem.isAvailable) {
        return NextResponse.json({ error: `Item is currently unavailable: ${dbItem.name}` }, { status: 400 });
      }

      // Calculate cost
      const lineTotal = dbItem.price * quantity;
      totalAmount += lineTotal;

      // Add to our verified list
      finalOrderItems.push({
        itemId: dbItem._id,
        name: dbItem.name,
        quantity: quantity,
        price: dbItem.price, // Using the REAL DB price
      });
    }

    // 3. Create the Order
    const newOrder = new Order({
      userId: auth.user._id, // Link to the logged-in user
      items: finalOrderItems,
      totalAmount: totalAmount,
      status: 'Pending',
    });

    await newOrder.save();

    return NextResponse.json({ 
      message: 'Order placed successfully', 
      order: newOrder 
    }, { status: 201 });

  } catch (error) {
    console.error('Order Placement Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ... (Your existing imports and POST function are above here) ...

// GET: Fetch "My Orders" (The logged-in user's history)
export async function GET(request) {
  // ---=== 1. SECURITY CHECK ===---
  const auth = await verifyAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  // ---========================---

  await dbConnect();

  try {
    // 2. Find orders belonging to the logged-in user
    // We filter by { userId: auth.user._id } so they can't see other people's orders.
    // .sort({ createdAt: -1 }) means "Newest orders first".
    const orders = await Order.find({ userId: auth.user._id })
      .sort({ createdAt: -1 });

    return NextResponse.json(orders, { status: 200 });

  } catch (error) {
    console.error('My Orders GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
