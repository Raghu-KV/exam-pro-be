import mongoose from "mongoose";
import { randomUUID } from "crypto";

const groupSchema = mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
    },
    groupId: {
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

groupSchema.virtual("examType", {
  ref: "ExamType",
  localField: "examTypeId",
  foreignField: "examTypeId",
  justOne: true,
});

const Group = mongoose.model("Group", groupSchema);

export default Group;
