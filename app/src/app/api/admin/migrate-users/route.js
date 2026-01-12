import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/user.model';

// This is a one-time migration endpoint to update existing users
export async function POST(request) {
  await dbConnect();

  try {
    // Update all users that don't have accountStatus field
    const result = await User.updateMany(
      { accountStatus: { $exists: false } },
      { $set: { accountStatus: 'pending' } }
    );

    console.log('Migration result:', result);

    return NextResponse.json({
      message: 'Migration completed',
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    }, { status: 200 });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed', details: error.message }, { status: 500 });
  }
}
