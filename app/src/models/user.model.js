import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  passwordHash: {
    type: String,
    required: [true, 'Please provide a password'],
    select: false,
  },
  role: {
    type: String,
    enum: ['student', 'staff', 'admin'],
    default: 'student',
  },
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Helper to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  const user = await this.constructor.findOne({ _id: this._id }).select('+passwordHash');
  return bcrypt.compare(candidatePassword, user.passwordHash);
};

// Export the USER model, not MenuItem
export default mongoose.models.User || mongoose.model('User', UserSchema);