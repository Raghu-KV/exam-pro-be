import asyncHandler from "express-async-handler";

import ExamType from "../models/ExamType.model.js";
import Student from "../models/Student.model.js";
import Subject from "../models/Subject.model.js";

// @desc add a exam type
// @route POST /exam-type
// @access private
export const addExamType = asyncHandler(async (req, res) => {
  const { examType } = req.body;

  const result = await ExamType.create({ examType: examType.toUpperCase() });

  res.json(result);
});

// @desc edit a exam type
// @route PATCH /exam-type/:id
// @access private
export const editExamType = asyncHandler(async (req, res) => {
  const { examType } = req.body;
  const { id } = req.params;

  const examTypeData = await ExamType.findById(id).exec();

  if (!examTypeData)
    return res.status(404).json({ message: "No exam-type found" });

  examTypeData.examType = examType.toUpperCase();
  await examTypeData.save();

  res.json({ message: "Exam-type edited" });
});

// @desc delete a exam type
// @route PATCH /exam-type/:id
// @access private
export const deleteExamType = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const examTypeData = await ExamType.findById(id).exec();

  const isStudent = await Student.find({
    enrolledExamTypeId: examTypeData?.examTypeId,
  }).countDocuments();

  const isSubject = await Subject.find({
    examTypeId: examTypeData?.examTypeId,
  }).countDocuments();

  if (!examTypeData)
    return res.status(404).json({ message: "No exam-type found" });

  if (isStudent || isSubject)
    return res.status(404).json({
      message:
        "Could not delete since exam type has students or subject mapped",
    });

  await examTypeData.deleteOne();

  res.json({ message: "Deleted successfully" });
});

// @desc get exam type by id
// @route GET /exam-type/:id
// @access private
export const getExamTypeById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const examTypeById = await ExamType.findById(id);

  if (!examTypeById) {
    return res.status(404).json({ message: "Cannot find the exam-type" });
  }

  res.json(examTypeById);
});

// @desc get all exam type with no pagination
// @route GET /exam-type/all
// @access private
export const getExamTypeWithNoPagination = asyncHandler(async (req, res) => {
  const allExamType = await ExamType.find({})
    .select("examType examTypeId")
    .sort({ createdAt: -1 });
  res.json(allExamType);
});

// @desc get all exam type
// @route GET /exam-type
// @access private
export const getAllExamType = asyncHandler(async (req, res) => {
  const page = +req.query.page || 1;
  const limit = 10;

  const searchAndFilterQuery = [];

  const search = req.query.search || "";

  if (search) {
    searchAndFilterQuery.push({ examType: { $regex: search, $options: "i" } });
  } else {
    searchAndFilterQuery.push({ examType: { $regex: "", $options: "i" } });
  }

  const totalFilteredDoc = await ExamType.find({
    $and: [
      ...searchAndFilterQuery,
      // { examType: { $regex: search, $options: "i" } },
      //   { examTypeId: { $regex: "", $options: "i" } },
      //   { createdAt: { $gte: new Date("2024-07-14"), $lte: new Date() } },
    ],
  }).countDocuments();

  const totalDoc = await ExamType.countDocuments();

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  console.log("startIndex :", startIndex, "endIndex :", endIndex);

  const hasPrevPage = startIndex > 0 ? true : false;
  const hasNextPage = endIndex < totalFilteredDoc ? true : false;

  const examTypeData = await ExamType.find({
    $and: [
      ...searchAndFilterQuery,
      //   { examType: { $regex: search, $options: "i" } },
      //   { examTypeId: { $regex: "", $options: "i" } },
      //   { createdAt: { $gte: new Date("2024-07-14"), $lte: new Date() } },
    ],
  })
    .skip(startIndex)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalPage = Math.ceil(totalFilteredDoc / limit);

  const paginateOptions = {
    currentPage: page,
    totalPage,
    hasNextPage,
    hasPrevPage,
  };

  const prepareJson = {
    status: "success",
    totalDocs: totalDoc,
    docsInThisPage: examTypeData.length,
    docs: examTypeData,
    paginateOptions,
  };

  res.json(prepareJson);
});
