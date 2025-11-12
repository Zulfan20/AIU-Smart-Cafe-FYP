import mongoose from 'mongoose';

/**
 * This is the schema for the items *inside* an order.
 * We define it here but DO NOT create a separate model.
 * It will be embedded directly into the OrderSchema.
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
    type: Number, // Price *at the time of purchase*
    required: true,
  },
});

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Here we embed the items array.
  // This is the core of our NoSQL design for orders.
  items: [OrderItemSchema],

  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  staffId: {
    // ID of the staff member who prepared/handled the order
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  },
  timePrepared: {
    type: Date,
  },
  timeCompleted: {
    type: Date,
  },
}, {
  timestamps: true // Adds createdAt (when order was placed)
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
