import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  collection: 'users',
})
export class User extends Document {
  @Prop({
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  })
  email: string;

  @Prop({
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
  })
  username: string;

  @Prop({
    required: true,
    minlength: 8,
  })
  password: string;

  @Prop({
    default: Date.now,
  })
  lastLogin: Date;

  @Prop({
    default: true,
  })
  isActive: boolean;

  @Prop({
    type: Object,
    default: {},
  })
  profile: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

// Create indexes for performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ createdAt: -1 });
