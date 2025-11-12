import mongoose from 'mongoose';

const DemandDataSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  hour: {
    type: Number, // Storing the hour (0-23) for granular forecasting
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  actualDemand: {
    type: Number, // The actual number of units sold
    required: true,
  },
  
  // --- ML MODEL OUTPUT ---
  // We store the model's prediction here to compare
  // its accuracy against the actual demand.
  predictedDemand: {
    type: Number,
  }
  // ------------------------

}, {
  timestamps: true // This will log when the data point was created
});

// Create a compound index to prevent duplicate data entries for the same item at the same hour
DemandDataSchema.index({ date: 1, hour: 1, itemId: 1 }, { unique: true });

export default mongoose.models.DemandData || mongoose.model('DemandData', DemandDataSchema);
