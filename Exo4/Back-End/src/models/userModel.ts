import { Schema, model, Document, Types } from 'mongoose';

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  role?: string;
  name?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: false, default: 'user' },
  name: { type: String, required: false, default: null }
}, { timestamps: true });

export const UserModel = model<UserDocument>('User', userSchema);
