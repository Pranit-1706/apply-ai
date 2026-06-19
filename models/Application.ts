import mongoose, { Schema, models } from "mongoose";

const ApplicationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
  status: {
    type: String,
    enum: ["discovered", "applied", "interviewing", "offered", "rejected"],
    default: "discovered",
  },
  tailoredResume: String,
  coverLetter: String,
  notes: String,
  appliedDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Application = models.Application || mongoose.model("Application", ApplicationSchema);
