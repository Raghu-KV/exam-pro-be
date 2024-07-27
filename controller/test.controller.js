import asyncHandler from "express-async-handler";
import Test from "../models/Test.model.js";

// @desc add a test
// @route POST /tests
// @access private
export const addTest = asyncHandler(async (req, res) => {
  const { testName, examTypeId } = req.body;

  const testData = await Test.create({ testName, examTypeId });

  res.json(testData);
});

// @desc get a test
// @route GET /test/:id
// @access private
export const getSingleTest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const populate = [
    // { path: "enrolledExamType", options: { withDeleted: true } },
    { path: "questions" },
  ];

  const test = await Test.findById(id).populate(populate).lean();

  if (!test) return res.status(404).json({ message: "No test found" });

  res.json(test);
});

// @desc delete test
// @route DELETE /tests/:id
// @access privatete
export const deleteTest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const testData = await Test.findById(id);

  if (!testData) return res.status(404).json({ message: "No test found!" });

  if (testData.attendedStudentsId.length) {
    return res.status(404).json({
      message: "Could not delete. Students have started attending the test",
    });
  }

  const deleteMessage = await testData.deleteOne();

  res.send(deleteMessage);
});

// @desc delete test
// @route DELETE /tests/:id
// @access privatete
export const updateTest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { testName, examTypeId } = req.body;

  const testData = await Test.findById(id);

  if (!testData) return res.status(404).json({ message: "No test found!" });

  if (testData.attendedStudentsId.length) {
    return res.status(404).json({
      message: "Could not delete. Students have started attending the test",
    });
  }

  testData.testName = testName;
  testData.examTypeId = examTypeId;

  const save = testData.save();

  res.send(save);
});

// @desc get a test as prefill
// @route GET /tests/:id
// @access privatete
export const prefillTest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const testData = await Test.findById(id).select("testName examTypeId");
  if (!testData) return res.status(404).json({ message: "Test not found!" });

  res.json(testData);
});

// @desc get all tests
// @route GET /tests
// @access privatete
export const getAllTests = asyncHandler(async (req, res) => {
  const page = +req.query.page || 1;
  const limit = 10;

  const searchAndFilterQuery = [];

  const search = req.query.search || "";

  const isFilter = req.query.filter;

  if (search) {
    searchAndFilterQuery.push({
      testName: { $regex: search, $options: "i" },
    });
  } else {
    searchAndFilterQuery.push({ testName: { $regex: "", $options: "i" } });
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

  const totalFilteredDoc = await Test.find({
    $and: [
      ...searchAndFilterQuery,
      // { examType: { $regex: search, $options: "i" } },
      //   { examTypeId: { $regex: "", $options: "i" } },
      //   { createdAt: { $gte: new Date("2024-07-14"), $lte: new Date() } },
    ],
  }).countDocuments();

  const totalDoc = await Test.countDocuments();

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  console.log("startIndex :", startIndex, "endIndex :", endIndex);

  const hasPrevPage = startIndex > 0 ? true : false;
  const hasNextPage = endIndex < totalFilteredDoc ? true : false;

  const populate = [
    // { path: "enrolledExamType", options: { withDeleted: true } },
    { path: "examType", options: { select: { examType: 1 } } },
    // { path: "subject", options: { select: { subjectName: 1 } } },
    // { path: "chapter", options: { select: { chapterName: 1 } } },
  ];

  const questionData = await Test.find({
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
    .select("-questionsId -attendedStudentsId")
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
