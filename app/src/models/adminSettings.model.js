import mongoose from 'mongoose';

// A small embedded schema for operating hours
const OperatingHoursSchema = new mongoose.Schema({
  start: { type: String, default: '08:00' }, // e.g., "08:00"
  end: { type: String, default: '17:00' },   // e.g., "17:00"
});

const AdminSettingsSchema = new mongoose.Schema({
  // We won't use the default ObjectId.
  // We will force this document to have one, known ID
  // so we can always find it.
  _id: {
    type: String,
    default: 'global_settings',
  },
  isCafeOpen: {
    type: Boolean,
    default: true, // This is the master "on/off" switch for ordering
  },
  orderCutoffTime: {
    type: String,
    default: '11:30', // e.g., "11:30" AM for lunch pre-orders
  },
  operatingHours: OperatingHoursSchema,

  // A place to store parameters for your ML models
  forecastModelParams: {
    lookbackDays: { type: Number, default: 30 },
  },
  
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, {
  timestamps: true
});

export default mongoose.models.AdminSettings || mongoose.model('AdminSettings', AdminSettingsSchema);
