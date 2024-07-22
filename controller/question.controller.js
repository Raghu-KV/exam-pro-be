import asyncHandler from "express-async-handler";

import Question from "../models/Qestion.model.js";

// @desc add a question
// @route POST /questions
// @access private
export const addQuestion = asyncHandler(async (req, res) => {
  const {
    question,
    options,
    answerId,
    chapterId,
    subjectId,
    examTypeId,
    explanation,
  } = req.body;

  const result = await Question.create({
    question,
    options,
    answerId,
    chapterId,
    subjectId,
    examTypeId,
    explanation,
  });

  res.json(result);
});

// @desc edit a question
// @route POST /questions/:id
// @access private
export const editQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    question,
    options,
    answerId,
    chapterId,
    subjectId,
    examTypeId,
    explanation,
  } = req.body;

  const questionData = await Question.findById(id);

  if (!questionData)
    return res.status(404).json({ message: "Could not find the Question" });

  questionData.question = question;
  questionData.options = options;
  questionData.answerId = answerId;
  questionData.chapterId = chapterId;
  questionData.examTypeId = examTypeId;
  questionData.subjectId = subjectId;
  questionData.explanation = explanation;
  const updatedQuestion = await questionData.save();

  res.json(updatedQuestion);
});

// @desc delete a Question
// @route DELETE /questions/:id
// @access private
export const deleteQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const question = await Question.findById(id);

  if (!question)
    return res.status(404).json({ message: "Could not find Qyestion" });

  const deleteQuestion = await question.deleteOne();

  res.json(deleteQuestion);
});

// @desc get a question
// @route GET /questions/:id
// @access private
export const getSingleQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const populate = [
    // { path: "enrolledExamType", options: { withDeleted: true } },
    { path: "examType" },
    { path: "subject" },
    { path: "chapter" },
  ];
  const chapter = await Question.findById(id).populate(populate).lean();

  if (!chapter) return res.status(404).json({ message: "No chapter found" });

  res.json(chapter);
});

// @desc get all question
// @route GET /questions
// @access privatete
export const getAllQuestions = asyncHandler(async (req, res) => {
  const page = +req.query.page || 1;
  const limit = 10;

  const searchAndFilterQuery = [];

  const search = req.query.search || "";

  const isFilter = req.query.filter;

  if (search) {
    searchAndFilterQuery.push({
      question: { $regex: search, $options: "i" },
    });
  } else {
    searchAndFilterQuery.push({ question: { $regex: "", $options: "i" } });
  }

  if (isFilter) {
    const examTypeId = req.query.exam_type || "";
    const subjectId = req.query.subject || "";
    const chapterId = req.query.chapter || "";
    const startDate = req.query.start_date || "";
    const endDate = req.query.end_date || "";

    if (examTypeId) {
      searchAndFilterQuery.push({ examTypeId: examTypeId });
    }

    if (subjectId) {
      searchAndFilterQuery.push({ subjectId: subjectId });
    }

    if (chapterId) {
      searchAndFilterQuery.push({ chapterId: chapterId });
    }
    if (startDate && endDate) {
      const a = endDate;
      const date = +a.split("-")[2] + 1;
      const monthYear = a.split("-").splice(0, 2);
      monthYear.push(date);
      const addedOneDay = monthYear.join("-");

      searchAndFilterQuery.push({
        createdAt: { $gte: new Date(startDate), $lt: new Date(addedOneDay) },
      });
    }
  }

  const totalFilteredDoc = await Question.find({
    $and: [
      ...searchAndFilterQuery,
      // { examType: { $regex: search, $options: "i" } },
      //   { examTypeId: { $regex: "", $options: "i" } },
      //   { createdAt: { $gte: new Date("2024-07-14"), $lte: new Date() } },
    ],
  }).countDocuments();

  const totalDoc = await Question.countDocuments();

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  console.log("startIndex :", startIndex, "endIndex :", endIndex);

  const hasPrevPage = startIndex > 0 ? true : false;
  const hasNextPage = endIndex < totalFilteredDoc ? true : false;

  const populate = [
    // { path: "enrolledExamType", options: { withDeleted: true } },
    { path: "examType", options: { select: { examType: 1 } } },
    { path: "subject", options: { select: { subjectName: 1 } } },
    { path: "chapter", options: { select: { chapterName: 1 } } },
  ];

  const questionData = await Question.find({
    $and: [
      ...searchAndFilterQuery,
      //   { examType: { $regex: search, $options: "i" } },
      //   { examTypeId: { $regex: "", $options: "i" } },
      //   { createdAt: { $gte: new Date("2024-07-14"), $lte: new Date() } },
    ],
  })
    .skip(startIndex)
    .limit(limit)
    .populate(populate)
    .sort({ createdAt: -1 })
    .lean();

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
    docsInThisPage: questionData.length,
    docs: questionData,
    paginateOptions,
  };

  res.json(prepareJson);
});
