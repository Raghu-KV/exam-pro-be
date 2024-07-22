import mongoose from "mongoose";
import { randomUUID } from "crypto";

const optionScheme = mongoose.Schema({
  optionId: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  option: {
    type: String,
    required: true,
  },
});

const questionSchema = mongoose.Schema(
  {
    questionId: {
      type: String,
      default: () => randomUUID(),
      immutable: true,
    },
    question: {
      type: String,
      required: true,
      unique: true,
    },
    options: {
      type: [optionScheme],
      required: true,
    },
    answerId: {
      type: Number,
      required: true,
    },
    subjectId: {
      type: String,
      required: true,
    },
    chapterId: {
      type: String,
      required: true,
    },
    examTypeId: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

questionSchema.virtual("examType", {
  ref: "ExamType",
  localField: "examTypeId",
  foreignField: "examTypeId",
  justOne: true,
});

questionSchema.virtual("subject", {
  ref: "Subject",
  localField: "subjectId",
  foreignField: "subjectId",
  justOne: true,
});

questionSchema.virtual("chapter", {
  ref: "Chapter",
  localField: "chapterId",
  foreignField: "chapterId",
  justOne: true,
});

const Question = mongoose.model("Question", questionSchema);

export default Question;
