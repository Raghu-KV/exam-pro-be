import asyncHandler from "express-async-handler";
import Test from "../../models/Test.model.js";

// @desc get all upcoming tests
// @route GET /student/tests/upcomingTests
// @access private
export const getAllTestsForStudent = asyncHandler(async (req, res) => {
  const page = +req.query.page || 1;
  const limit = 10;

  const examTypeId = req.examTypeId;
  const studentId = req.studentId;

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
    const publishStatus = req.query.publish_status || "";

    if (publishStatus) {
      if (publishStatus === "published") {
        searchAndFilterQuery.push({ isPublished: true });
      } else if (publishStatus === "notPublished") {
        searchAndFilterQuery.push({ isPublished: false });
      }
    }

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
      // const a = endDate;
      // const date = +a.split("-")[2] + 1;
      // const monthYear = a.split("-").splice(0, 2);
      // monthYear.push(date);
      // const addedOneDay = monthYear.join("-");

      function addDays(date, days) {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() + days);
        return newDate;
      }
      const a = new Date(endDate);
      const addedOneDay = addDays(a, 1);

      searchAndFilterQuery.push({
        publishedAt: { $gte: new Date(startDate), $lt: new Date(addedOneDay) },
      });
    }
  }

  const totalFilteredDoc = await Test.find({
    examTypeId: examTypeId,
    isPublished: true,
    attendedStudentsId: { $nin: [studentId] },
    $and: [
      ...searchAndFilterQuery,
      // { examType: { $regex: search, $options: "i" } },
      //   { examTypeId: { $regex: "", $options: "i" } },
      //   { createdAt: { $gte: new Date("2024-07-14"), $lte: new Date() } },
    ],
  }).countDocuments();

  const totalDoc = await Test.find({
    examTypeId: examTypeId,
    isPublished: true,
    attendedStudentsId: { $nin: [studentId] },
  }).countDocuments();

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  console.log("startIndex :", startIndex, "endIndex :", endIndex);

  const hasPrevPage = startIndex > 0 ? true : false;
  const hasNextPage = endIndex < totalFilteredDoc ? true : false;

  const populate = [
    // { path: "enrolledExamType", options: { withDeleted: true } },
    //   { path: "examType", options: { select: { examType: 1 } } },
    // { path: "subject", options: { select: { subjectName: 1 } } },
    // { path: "chapter", options: { select: { chapterName: 1 } } },
  ];

  const questionData = await Test.find({
    examTypeId: examTypeId,
    isPublished: true,
    attendedStudentsId: { $nin: [studentId] },
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
    .sort({ publishedAt: -1 })
    .select("-attendedStudentsId -questionsId")
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

// @desc get singel test with all question with no pagination
// @route GET /student/tests/upcomingTests/:id
// @access private
export const getSingleTest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const populate = [{ path: "questions", select: "question options" }];

  const test = await Test.findById(id)
    .populate(populate)
    .select("-attendedStudentsId")
    .lean();

  if (!test) {
    return res.status(404).json({ message: "Test not found" });
  }

  res.json(test);
});
