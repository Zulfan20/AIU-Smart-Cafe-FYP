import mongoose from 'mongoose';

const DemandDataSchema = new mongoose.Schema({
  date: {
    type: Date, // ISODate 
    required: true,
  },
  hour: {
    type: Number, // Storing the hour (0-23) 
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true, // Mandatory 
  },
  actualDemand: {
    type: Number, // Total number of units sold (ML Input) 
    required: true,
  },
  predictedDemand: {
    type: Number, // (ML Output) Stored for comparison 
    required: false,
  },
}, {
  timestamps: true
});

DemandDataSchema.index({ date: 1, hour: 1, itemId: 1 }, { unique: true });

export default mongoose.models.DemandData || mongoose.model('DemandData', DemandDataSchema);