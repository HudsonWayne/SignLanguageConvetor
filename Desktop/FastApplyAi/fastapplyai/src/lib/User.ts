import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  image: { type: String },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
