import mongoose from "mongoose";
import { randomUUID } from "crypto";

// const questionSchema = mongoose.Schema({
//   questionId: {
//     type: String,
//     required: true,
//   },
// });

const testSchema = mongoose.Schema(
  {
    testName: {
      type: String,
      required: true,
      unique: true,
    },
    testId: {
      type: String,
      default: () => randomUUID(),
      immutable: true,
    },
    testTiming: {
      type: Number,
      default: 0,
    },
    examTypeId: {
      type: String,
      required: true,
    },
    questionsId: {
      type: [String],
      default: [],
    },
    attendedStudentsId: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

testSchema.virtual("questions", {
  ref: "Question",
  localField: "questionsId.questionId",
  foreignField: "questionId",
});

testSchema.virtual("examType", {
  ref: "ExamType",
  localField: "examTypeId",
  foreignField: "examTypeId",
  justOne: true,
});

const Test = mongoose.model("Test", testSchema);

export default Test;
