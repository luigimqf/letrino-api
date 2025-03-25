import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  user_id: String,
  token: String,
  refresh_token: String,
})

export const Session = mongoose.model("Session", sessionSchema);

