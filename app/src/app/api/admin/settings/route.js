import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AdminSettings from '@/models/adminSettings.model';
import { verifyAuth } from '@/lib/verifyAuth';

// GET: Fetch current settings
export async function GET(request) {
  // Public or Protected? Usually public so the student app knows if cafe is closed.
  // But for full details, let's keep it open or just check basic auth if needed.
  // For now, let's allow it to be public so the Student App can check "isCafeOpen".
  await dbConnect();

  try {
    // Try to find the settings document
    let settings = await AdminSettings.findOne({ settingId: 'global_settings' });

    // If it doesn't exist yet (first run), create default
    if (!settings) {
      settings = new AdminSettings({
        settingId: 'global_settings',
        isCafeOpen: true,
        orderCutoffTime: '11:30',
        operatingHours: { start: '08:00', end: '17:00' }
      });
      await settings.save();
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update settings (ADMIN ONLY)
export async function PUT(request) {
  // 1. Security Check
  const auth = await verifyAuth(request, 'admin');
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  await dbConnect();

  try {
    const updates = await request.json();
    
    // Track who updated it
    updates.lastUpdatedBy = auth.user._id;

    const settings = await AdminSettings.findOneAndUpdate(
      { settingId: 'global_settings' },
      updates,
      { new: true, upsert: true } // Create if doesn't exist
    );

    return NextResponse.json({ message: "Settings updated", settings }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}