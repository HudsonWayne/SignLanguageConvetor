import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
});

const User = models.User || model("User", UserSchema);
export default User;
