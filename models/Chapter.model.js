import mongoose from "mongoose";
import { randomUUID } from "crypto";

const chapterSchema = mongoose.Schema(
  {
    chapterName: {
      type: String,
      required: true,
    },
    chapterId: {
      type: String,
      default: () => randomUUID(),
      immutable: true,
    },
    subjectId: {
      type: String,
      required: true,
    },
    examTypeId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

chapterSchema.virtual("examType", {
  ref: "ExamType",
  localField: "examTypeId",
  foreignField: "examTypeId",
  justOne: true,
});

chapterSchema.virtual("subject", {
  ref: "Subject",
  localField: "subjectId",
  foreignField: "subjectId",
  justOne: true,
});

const Chapter = mongoose.model("Chapter", chapterSchema);

export default Chapter;
