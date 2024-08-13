import asyncHandler from "express-async-handler";
import Subject from "../../models/Subject.model.js";
import Chapter from "../../models/Chapter.model.js";

// @desc get all subject for a student
// @route GET /student/dropDown/allSubject
// @access private
export const getAllSubjectForDropDown = asyncHandler(async (req, res) => {
  const examTypeId = req.examTypeId;

  const subjects = await Subject.find({ examTypeId }).select(
    "-createdAt -updatedAt"
  );

  if (!subjects) return res.status(404).json({ message: "No subject found!!" });

  res.json(subjects);
});

// @desc get all subject for a student
// @route GET /student/dropDown/allSubject
// @access private
export const getAllChapterForDropDown = asyncHandler(async (req, res) => {
  const examTypeId = req.examTypeId;

  const chapter = await Chapter.find({ examTypeId }).select(
    "-createdAt -updatedAt"
  );

  if (!chapter) return res.status(404).json({ message: "No chapter found!!" });

  res.json(chapter);
});
