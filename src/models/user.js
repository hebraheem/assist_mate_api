import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the Address sub-schema
const addressSchema = new Schema({
  street: { type: String, default: '' },
  city: { type: String, default: '' },
  houseNumber: { type: String, default: '' },
  state: { type: String, default: '' },
  country: { type: String, default: '' },
  coordinate: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
});

// Define the Settings sub-schema
const settingsSchema = new Schema({
  language: { type: String, default: '' },
  occupation: { type: String, default: '' },
  documents: [{ type: String }],
});

// Define the main User schema with validation
const userSchema = new Schema(
  {
    username: {
      type: String,
      default: '',
      unique: true,
      trim: true,
    },
    bio: { type: String, default: '' },
    id: { type: String, default: '' },
    fmcToken: { type: String, default: '' },
    avatar: { type: String, default: '' },
    id: { type: String, default: '' },
    firstName: {
      type: String,
      default: '',
      trim: true,
    },
    lastName: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    nationality: { type: String, default: '' },
    primaryLanguage: { type: String, default: '' },
    mobile: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    otherLanguages: [{ type: String }],
    userType: {
      type: String,
      enum: ['SEEKER', 'PROVIDER'],
      default: 'SEEKER',
    },
    locationAllowed: { type: Boolean, default: true },
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    chats: [{ type: Schema.Types.ObjectId, ref: 'Chat' }],
    requests: [{ type: Schema.Types.ObjectId, ref: 'Request' }],
    hobbies: [{ type: String }],
    address: addressSchema,
    settings: settingsSchema,
  },
  { timestamps: true }, // Automatically adds createdAt and updatedAt
);

userSchema.index({
  username: 'text',
  email: 'text',
  firstName: 'text',
  lastName: 'text',
});

// Pre-save middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Create a Mongoose model from the user schema
const User = model('User', userSchema);

export default User;
