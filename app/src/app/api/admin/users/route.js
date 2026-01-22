import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/user.model';
import { verifyAuth } from '@/lib/verifyAuth';

// GET: Fetch all users with optional status filter
export async function GET(request) {
  await dbConnect();

  try {
    // Verify admin authentication with role check
    const authResult = await verifyAuth(request, 'admin');
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 });
    }

    // Get filter from query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, approved, rejected, or null for all

    console.log('Requested status filter:', status);

    // Build query
    let query = { role: 'student' }; // Only show students, not admins/staff
    if (status && status !== 'all' && ['pending', 'approved', 'rejected'].includes(status)) {
      query.accountStatus = status;
    }

    console.log('Query:', JSON.stringify(query));

    // Fetch users (exclude password)
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 }); // Newest first

    console.log('Found users:', users.length);

    // Get counts for dashboard stats
    const counts = {
      pending: await User.countDocuments({ role: 'student', accountStatus: 'pending' }),
      approved: await User.countDocuments({ role: 'student', accountStatus: 'approved' }),
      rejected: await User.countDocuments({ role: 'student', accountStatus: 'rejected' }),
      total: await User.countDocuments({ role: 'student' })
    };

    return NextResponse.json({ users, counts }, { status: 200 });

  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// PUT: Update user approval status
export async function PUT(request) {
  await dbConnect();

  try {
    // Verify admin authentication with role check
    const authResult = await verifyAuth(request, 'admin');
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 });
    }

    const { userId, action, rejectionReason } = await request.json();

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user status
    if (action === 'approve') {
      user.accountStatus = 'approved';
      user.approvedBy = authResult.user._id;
      user.approvedAt = new Date();
      user.rejectionReason = null; // Clear any previous rejection reason
    } else if (action === 'reject') {
      user.accountStatus = 'rejected';
      user.approvedBy = authResult.user._id;
      user.approvedAt = new Date();
      user.rejectionReason = rejectionReason || 'No reason provided';
    }

    await user.save();

    return NextResponse.json({ 
      message: `User ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountStatus: user.accountStatus
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Update user status error:', error);
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
  }
}

// DELETE: Delete a user
export async function DELETE(request) {
  await dbConnect();

  try {
    // Verify admin authentication with role check
    const authResult = await verifyAuth(request, 'admin');
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deleting admin/staff accounts
    if (['admin', 'staff'].includes(user.role)) {
      return NextResponse.json({ error: 'Cannot delete admin or staff accounts' }, { status: 403 });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    return NextResponse.json({ 
      message: 'User deleted successfully',
      userId: userId
    }, { status: 200 });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
