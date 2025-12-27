import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/order.model';
import MenuItem from '@/models/menuItem.model'; // Needed to fetch real prices
import AdminSettings from '@/models/adminSettings.model';
import { verifyAuth } from '@/lib/verifyAuth';

// Helper function to check if current time is within operating hours
function isWithinOperatingHours(startTime, endTime) {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // Format: "HH:MM"
  
  // Handle overnight shifts (e.g., 22:00 to 02:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime;
  }
  
  return currentTime >= startTime && currentTime <= endTime;
}

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
    // 2. CHECK CAFE STATUS & OPERATING HOURS
    let settings = await AdminSettings.findOne({ settingId: 'global_settings' });
    
    // Create default settings if none exist
    if (!settings) {
      settings = new AdminSettings({
        settingId: 'global_settings',
        isCafeOpen: true,
        operatingHours: { start: '08:00', end: '22:00' }
      });
      await settings.save();
    }

    // Check if cafe is manually closed
    if (!settings.isCafeOpen) {
      return NextResponse.json({ 
        error: 'The café is currently closed. Please try again later.',
        isCafeOpen: false
      }, { status: 403 });
    }

    // Check if current time is within operating hours
    const { start, end } = settings.operatingHours;
    if (!isWithinOperatingHours(start, end)) {
      return NextResponse.json({ 
        error: `The café is outside operating hours. We're open from ${start} to ${end}.`,
        isCafeOpen: false,
        operatingHours: { start, end }
      }, { status: 403 });
    }

    const { items } = await request.json();

    // 3. Validation: Ensure items array exists and is not empty
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item.' }, { status: 400 });
    }

    // 4. Calculate Total & Build Order Items securely
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

    // 5. Create the Order
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
    // Import Feedback model
    const Feedback = (await import('@/models/feedback.model')).default;
    
    // 2. Find orders belonging to the logged-in user
    const orders = await Order.find({ userId: auth.user._id })
      .sort({ createdAt: -1 });

    // 3. For each order, check which items have feedback
    const ordersWithFeedback = await Promise.all(
      orders.map(async (order) => {
        const orderObj = order.toObject();
        
        // Check feedback for each item in the order
        const itemsWithFeedback = await Promise.all(
          orderObj.items.map(async (item) => {
            const feedback = await Feedback.findOne({
              orderId: order._id,
              itemId: item.itemId,
              userId: auth.user._id
            });
            
            return {
              ...item,
              feedbackSubmitted: !!feedback,
              feedback: feedback || null
            };
          })
        );
        
        return {
          ...orderObj,
          items: itemsWithFeedback
        };
      })
    );

    return NextResponse.json(ordersWithFeedback, { status: 200 });

  } catch (error) {
    console.error('My Orders GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
