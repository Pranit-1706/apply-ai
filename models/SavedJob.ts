import mongoose, { Schema, models } from "mongoose";

const SavedJobSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  company: String,
  description: String,
  location: String,
  salary: String,
  url: { type: String, required: true },
  source: String,
  postedAt: String,
  tags: [String],
  score: Number,
  reasons: [String],
  savedAt: { type: Date, default: Date.now },
});

SavedJobSchema.index({ userId: 1, url: 1 }, { unique: true });

export const SavedJob = models.SavedJob || mongoose.model("SavedJob", SavedJobSchema);
