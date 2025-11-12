import mongoose from 'mongoose';

const NutritionalDataSchema = new mongoose.Schema({
  calories: Number,
  allergens: [String],
});

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  price: {
    type: Number, // Use Number for price in Mongoose
    required: true,
  },
  category: {
    type: String,
    enum: ['Main Course', 'Drink', 'Snack', 'Side'],
    required: true,
  },
  imageUrl: String,
  isAvailable: {
    type: Boolean,
    default: true,
  },
  nutritionalData: NutritionalDataSchema, // Embedded document
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

export default mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);
