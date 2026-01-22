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
  // Account approval status (only applies to students)
  accountStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'blocked'],
    default: function() {
      // Admins and staff are automatically approved
      return (this.role === 'admin' || this.role === 'staff') ? 'approved' : 'pending';
    },
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  approvedAt: {
    type: Date,
    required: false,
  },
  rejectionReason: {
    type: String,
    required: false,
  },
  // Additional profile fields
  studentId: {
    type: String,
    required: false,
  },
  bio: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    required: false,
  },
  birthday: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  profilePic: {
    type: String,
    required: false,
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