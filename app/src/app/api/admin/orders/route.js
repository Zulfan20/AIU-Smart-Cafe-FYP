import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/order.model';
import { verifyAuth } from '@/lib/verifyAuth';

// GET: Fetch ALL Orders (Requires Staff or Admin Role)
export async function GET(request) {
  // ---=== 1. SECURITY CHECK ===---
  // We accept 'staff' role here (which usually includes admins too in our logic)
  const auth = await verifyAuth(request, 'staff');
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  // ---========================---

  await dbConnect();

  try {
    // Parse query params to filter by status (optional)
    // e.g., /api/admin/orders?status=Pending
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query = {};
    if (status && status !== 'All') {
      query.status = status;
    }

    // Fetch orders, populate user details so staff knows WHO ordered it
    const orders = await Order.find(query)
      .populate('userId', 'name email') // Get the student's name
      .sort({ createdAt: -1 }); // Newest first

    return NextResponse.json(orders, { status: 200 });

  } catch (error) {
    console.error('Admin Orders GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
