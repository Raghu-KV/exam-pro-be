import mongoose from "mongoose";
import { randomUUID } from "crypto";

const studentAnswerScheme = mongoose.Schema({
  answerId: {
    type: Number,
  },
  questionId: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
  },
});

const answerSchema = mongoose.Schema(
  {
    answerId: {
      type: String,
      default: () => randomUUID(),
      immutable: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    testId: {
      type: String,
      required: true,
    },
    examTypeId: {
      type: String,
      required: true,
    },
    answers: {
      type: [studentAnswerScheme],
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    totalCorrectAnswers: {
      type: Number,
    },
    totalWrongAnswers: {
      type: Number,
    },
    totalAttendedQuestions: {
      type: Number,
    },
    totalNotAttendedQuestions: {
      type: Number,
    },
    accuracyPercent: {
      type: Number,
    },
    mistakePercent: {
      type: Number,
    },
    unattendedPercentage: {
      type: Number,
    },
  },
  { timestamps: true }
);

answerSchema.virtual("answers.question", {
  ref: "Question",
  localField: "answers.questionId",
  foreignField: "questionId",
  justOne: true,
});

answerSchema.virtual("testInfo", {
  ref: "Test",
  localField: "testId",
  foreignField: "testId",
  justOne: true,
});

const Answer = mongoose.model("Answer", answerSchema);

export default Answer;
