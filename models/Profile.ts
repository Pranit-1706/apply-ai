import mongoose, { Schema, models } from "mongoose";

const ProfileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  name: { type: String, required: true },
  skills: [String],
  experience: String,
  preferredRoles: [String],
  preferredLocations: [String],
  resumeText: String,
  updatedAt: { type: Date, default: Date.now },
});

export const Profile = models.Profile || mongoose.model("Profile", ProfileSchema);
