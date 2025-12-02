import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Mandatory 
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true, // Mandatory 
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true, // Mandatory 
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Rating is mandatory'], // Mandatory (1-5) 
  },
  textReview: {
    type: String,
    trim: true,
    required: false, // Optional   
  },
  sentimentScore: {
    type: Number, // (ML Output) Precision score 
    required: false,
  },
  sentimentCategory: {
    type: String, // (ML Output) Simple label [cite: 754]
    enum: ['Positive', 'Negative', 'Neutral', null],
    default: null,
    required: false,
  }
}, {
  timestamps: true
});

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);