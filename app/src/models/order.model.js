import mongoose from 'mongoose';

/**
 * Schema for the items *inside* an order (Embedded Document).
 */
const OrderItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number, // Price at the time of purchase
    required: true,
  },
});

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Mandatory
  },
  items: [OrderItemSchema], // Embedded items array

  totalAmount: {
    type: Number, // The final price of the entire order
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Ready for pick up', 'Rejected'], //
    default: 'Pending',
    required: true,
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // ID of the staff who prepared the order
    required: false,
  },
  // --- Removed: timePrepared and timeCompleted ---
  // The 'timestamps: true' field will manage 'createdAt' and 'updatedAt'.
  // The 'status' field will be updated to track preparation time.
}, {
  timestamps: true // Includes createdAt (when order was placed) and updatedAt
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);