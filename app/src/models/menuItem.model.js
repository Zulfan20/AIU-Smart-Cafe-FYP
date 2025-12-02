import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a menu item name'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    required: false, // Optional [cite: 747]
  },
  price: {
    type: Number, // Price [cite: 747]
    required: [true, 'Please provide a price'],
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
  },
  imageUrl: {
    type: String,
    required: false, // Optional [cite: 747]
  },
  isAvailable: {
    type: Boolean,
    required: true, // Mandatory [cite: 747]
    default: true,
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional [cite: 747]
  },
}, { 
  timestamps: true // Includes lastUpdatedAt [cite: 747]
});

export default mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);