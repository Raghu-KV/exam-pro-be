import asyncHandler from "express-async-handler";
import Subject from "../models/Subject.model.js";
import Chapter from "../models/Chapter.model.js";

// @desc add a Subject
// @route POST /subjects
// @access private
export const addSubject = asyncHandler(async (req, res) => {
  const { subjectName, examTypeId } = req.body;

  const addSubject = await Subject.create({ subjectName, examTypeId });

  res.json(addSubject);
});

// @desc edit a Subject
// @route POST /subjects/:id
// @access private
export const editSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { examTypeId, subjectName } = req.body;

  const subject = await Subject.findById(id);

  if (!subject)
    return res.status(404).json({ message: "Could not find the subject" });

  subject.examTypeId = examTypeId;
  subject.subjectName = subjectName;
  const updatedSubject = await subject.save();

  res.json(updatedSubject);
});

// @desc delete a Subject
// @route DELETE /subjects/:id
// @access private
export const deleteSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const subject = await Subject.findById(id);

  if (!subject)
    return res.status(404).json({ message: "Could not find Subjects" });

  const isChapter = await Chapter.find({
    subjectId: subject?.subjectId,
  }).countDocuments();

  if (isChapter)
    return res.status(404).json({
      message:
        "Could not delete since exam type has students, subject, chapter  mapped",
    });

  const deleteSubject = await subject.deleteOne();

  res.json(deleteSubject);
});

// @desc get a Subject
// @route GET /subjects/:id
// @access private
export const getSingleSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const populate = [
    // { path: "enrolledExamType", options: { withDeleted: true } },
    { path: "examType" },
  ];
  const subject = await Subject.findById(id).populate(populate).lean();

  if (!subject) return res.status(404).json({ message: "No subject found" });

  res.json(subject);
});

// @desc get all subject with no pagination for drop down
// @route GET /subjects/all
// @access private
export const getAllSubjectsWithNoPagination = asyncHandler(async (req, res) => {
  const allSubject = await Subject.find({})
    .select("subjectName subjectId")
    .sort({ createdAt: -1 });
  res.json(allSubject);
});

// @desc get all Subject
// @route GET /subjects
// @access privatete
export const getAllSubjects = asyncHandler(async (req, res) => {
  const page = +req.query.page || 1;
  const limit = 10;

  const searchAndFilterQuery = [];

  const search = req.query.search || "";

  const isFilter = req.query.filter;

  if (search) {
    searchAndFilterQuery.push({
      subjectName: { $regex: search, $options: "i" },
    });
  } else {
    searchAndFilterQuery.push({ subjectName: { $regex: "", $options: "i" } });
  }

  if (isFilter) {
    const examTypeId = req.query.exam_type || "";
    const startDate = req.query.start_date || "";
    const endDate = req.query.end_date || "";
    if (examTypeId) {
      searchAndFilterQuery.push({ examTypeId: examTypeId });
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

  const totalFilteredDoc = await Subject.find({
    $and: [
      ...searchAndFilterQuery,
      // { examType: { $regex: search, $options: "i" } },
      //   { examTypeId: { $regex: "", $options: "i" } },
      //   { createdAt: { $gte: new Date("2024-07-14"), $lte: new Date() } },
    ],
  }).countDocuments();

  const totalDoc = await Subject.countDocuments();

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  console.log("startIndex :", startIndex, "endIndex :", endIndex);

  const hasPrevPage = startIndex > 0 ? true : false;
  const hasNextPage = endIndex < totalFilteredDoc ? true : false;

  const populate = [
    // { path: "enrolledExamType", options: { withDeleted: true } },
    { path: "examType", options: { select: { examType: 1 } } },
  ];

  const subjectData = await Subject.find({
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
    docsInThisPage: subjectData.length,
    docs: subjectData,
    paginateOptions,
  };

  res.json(prepareJson);
});
