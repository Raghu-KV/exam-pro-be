import mongoose from "mongoose";
import { randomUUID } from "crypto";

const studentSchema = mongoose.Schema(
  {
    studentId: {
      type: String,
      default: () => randomUUID(),
      immutable: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    rollNo: {
      type: String,
      required: true,
      unique: [
        true,
        "Roll no must be unique for all the students - modelError",
      ],
    },
    phoneNo: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: Date,
    },
    enrolledExamTypeId: {
      type: String, // Assuming enrolledExamType stores examTypeId
      required: true,
    },
    password: {
      type: String,
      select: false,
    },
    rawPassword: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

// populate

studentSchema.virtual("enrolledExamType", {
  ref: "ExamType",
  localField: "enrolledExamTypeId",
  foreignField: "examTypeId",
  justOne: true, // Assuming each student is enrolled in only one exam type
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
