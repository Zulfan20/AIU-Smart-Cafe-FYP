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
    select: false, // This hides the hash by default when you fetch a user
  },
  role: {
    type: String,
    enum: ['student', 'staff', 'admin'], // Only allows these values
    default: 'student',
  },
  dietaryPreferences: [{
    type: String,
  }],
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

/**
 * Mongoose 'pre-save' hook.
 * This function runs automatically *before* a new user is saved.
 * It hashes the password.
 */
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('passwordHash')) {
    return next();
  }

  // We get the plain password in the 'passwordHash' field from the API.
  // We hash it, and then save the *hash* back to the 'passwordHash' field.
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Helper method to compare password for login.
 */
UserSchema.methods.comparePassword = async function(candidatePassword) {
  // We must re-fetch the user *with* the passwordHash selected to compare.
  const user = await this.constructor.findOne({ _id: this._id }).select('+passwordHash');
  if (!user) {
    throw new Error('User not found');
  }
  return bcrypt.compare(candidatePassword, user.passwordHash);
};

/**
 * This line prevents a Mongoose error in Next.js development mode.
 * It checks if the model is already compiled and re-uses it.
 */
export default mongoose.models.User || mongoose.model('User', UserSchema);
