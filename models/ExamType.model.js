import mongoose from "mongoose";
import { randomUUID } from "crypto";

const examTypeSchema = new mongoose.Schema(
  {
    examType: {
      type: String,
      required: true,
      unique: true,
    },
    examTypeId: {
      type: String,
      default: () => randomUUID(),
      immutable: true,
    },
  },
  { timestamps: true }
);

const ExamType = mongoose.model("ExamType", examTypeSchema);

export default ExamType;
