import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/order.model';
import { verifyAuth } from '@/lib/verifyAuth';

// PUT: Update Order Status (Requires Staff/Admin Role)
export async function PUT(request, { params }) {
  // ---=== 1. SECURITY CHECK ===---
  // Only staff or admins can change order status
  const auth = await verifyAuth(request, 'staff');
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  // ---========================---

  await dbConnect();
  const { id } = params; // Get Order ID from URL

  try {
    const { status } = await request.json();

    // 2. Validate the new status
    const validStatuses = ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      }, { status: 400 });
    }

    // 3. Find and Update the Order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status: status },
      { new: true } // Return the updated document
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Order status updated successfully', 
      order: updatedOrder 
    }, { status: 200 });

  } catch (error) {
    console.error('Admin Order PUT Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
