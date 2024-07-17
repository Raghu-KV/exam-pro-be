import mongoose from "mongoose";
import { randomUUID } from "crypto";

const subjectScheme = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
    },
    subjectId: {
      type: String,
      default: () => randomUUID(),
      immutable: true,
    },
    examTypeId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

subjectScheme.virtual("examType", {
  ref: "ExamType",
  localField: "examTypeId",
  foreignField: "examTypeId",
  justOne: true,
});

const Subject = mongoose.model("Subject", subjectScheme);

export default Subject;
