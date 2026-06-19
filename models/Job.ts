import mongoose, { Schema, models } from "mongoose";

const JobSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: String,
  location: String,
  salary: String,
  url: { type: String, required: true },
  source: { type: String, enum: ["remoteok", "jsearch", "adzuna", "arbeitnow"] },
  postedAt: String,
  tags: [String],
  score: { type: Number, default: 0 },
  reasons: [String],
  searchQuery: String,
  createdAt: { type: Date, default: Date.now },
});

JobSchema.index({ userId: 1, title: 1, company: 1 }, { unique: true });

export const Job = models.Job || mongoose.model("Job", JobSchema);
