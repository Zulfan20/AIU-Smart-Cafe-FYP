import mongoose from 'mongoose';

const OperatingHoursSchema = new mongoose.Schema({
  start: { type: String, default: '08:00' }, 
  end: { type: String, default: '22:00' },
}, { _id: false }); // Prevent Mongoose from creating an _id for the embedded schema

const AdminSettingsSchema = new mongoose.Schema({
  // Use a different field name to store the fixed ID value
  settingId: {
    type: String,
    required: true,
    unique: true, // This ensures only ONE document with this ID can exist
    default: 'global_settings', // The fixed value for easy retrieval
  },
  isCafeOpen: {
    type: Boolean,
    required: true, 
    default: true,
  },
  orderCutoffTime: {
    type: String,
    required: true,
    default: '11:30',
  },
  operatingHours: OperatingHoursSchema, // Embedded Document

  forecastModelParams: {
    lookbackDays: { type: Number, default: 30 },
  },
  
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
}, {
  timestamps: true
});

export default mongoose.models.AdminSettings || mongoose.model('AdminSettings', AdminSettingsSchema);