// /models/user.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
