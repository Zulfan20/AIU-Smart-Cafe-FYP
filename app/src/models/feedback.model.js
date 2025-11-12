import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Rating is mandatory'], // As you requested
  },
  textReview: {
    type: String,
    trim: true,
    required: false, // As you requested, this is optional
  },
  
  // --- ML MODEL OUTPUTS ---
  // Your ML service will populate these fields *after* submission.
  sentimentScore: {
    type: Number, // e.g., 0.92 (from Logistic Regression/LSTM)
    required: false,
  },
  sentimentCategory: {
    type: String, // e.g., "Positive", "Negative", "Neutral"
    enum: ['Positive', 'Negative', 'Neutral', null],
    default: null,
  }
  // ------------------------

}, {
  timestamps: true // Adds createdAt (when review was submitted)
});

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
