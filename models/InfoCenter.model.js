import mongoose from "mongoose";
import { randomUUID } from "crypto";

export const infoCenterSchema = new mongoose.Schema(
  {
    infoTitle: {
      type: String,
      required: true,
      unique: true,
    },
    infoId: {
      type: String,
      default: () => randomUUID(),
      immutable: true,
    },
    description: {
      type: String,
      required: true,
    },
    examTypeId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

infoCenterSchema.virtual("examType", {
  ref: "ExamType",
  localField: "examTypeId",
  foreignField: "examTypeId",
  justOne: true,
});

const InfoCenter = mongoose.model("InfoCenter", infoCenterSchema);

export default InfoCenter;
