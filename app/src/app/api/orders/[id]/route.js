import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Order from '@/models/order.model'
import { verifyAuth } from '@/lib/verifyAuth'

// PUT /api/orders/[id] - Student marks order as picked up
export async function PUT(request, { params }) {
  try {
    await dbConnect()

    // Verify student authentication
    const auth = await verifyAuth(request)
    if (auth.error) {
      console.log('Auth failed:', auth.error)
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    console.log('User authenticated:', auth.user._id, 'Role:', auth.user.role)

    // Await params in Next.js 15+
    const { id } = await params
    const { status } = await request.json()

    console.log('Attempting to update order:', id, 'to status:', status)

    // Only allow students to mark orders as Completed (picked up)
    if (status !== 'Completed') {
      return NextResponse.json(
        { error: 'Invalid status. Students can only mark orders as Completed.' },
        { status: 400 }
      )
    }

    // Find order and verify ownership
    const order = await Order.findOne({
      _id: id,
      userId: auth.user._id
    })

    console.log('Order found:', order ? `Yes (status: ${order.status})` : 'No')

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or you do not have permission to update it' },
        { status: 404 }
      )
    }

    // Only allow marking as Completed if order is Ready
    if (order.status !== 'Ready') {
      return NextResponse.json(
        { error: `Cannot mark order as picked up. Current status: ${order.status}` },
        { status: 400 }
      )
    }

    // Update order status
    order.status = 'Completed'
    await order.save()

    console.log('Order updated successfully to Completed')

    return NextResponse.json({
      message: 'Order marked as picked up successfully',
      order
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
