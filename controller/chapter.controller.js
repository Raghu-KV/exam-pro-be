import asyncHandler from "express-async-handler";

import Chapter from "../models/Chapter.model.js";

// @desc add a chapter
// @route POST /chapters
// @access private
export const addChapter = asyncHandler(async (req, res) => {
  const { chapterName, subjectId, examTypeId } = req.body;

  const result = await Chapter.create({ chapterName, subjectId, examTypeId });

  res.json(result);
});

// @desc edit a Chapter
// @route POST /chapters/:id
// @access private
export const editChapter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { chapterName, examTypeId, subjectId } = req.body;

  const chapter = await Chapter.findById(id);

  if (!chapter)
    return res.status(404).json({ message: "Could not find the chapter" });

  chapter.examTypeId = examTypeId;
  chapter.chapterName = chapterName;
  chapter.subjectId = subjectId;
  const updatedChapter = await chapter.save();

  res.json(updatedChapter);
});

// @desc delete a chapter
// @route DELETE /chapters/:id
// @access private
export const deleteChapter = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const chapter = await Chapter.findById(id);

  if (!chapter)
    return res.status(404).json({ message: "Could not find Chapter" });

  const deleteChapter = await chapter.deleteOne();

  res.json(deleteChapter);
});

// @desc get a chapter
// @route GET /chapters/:id
// @access private
export const getSingleChapter = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const populate = [
    // { path: "enrolledExamType", options: { withDeleted: true } },
    { path: "examType" },
    { path: "subject" },
  ];
  const chapter = await Chapter.findById(id).populate(populate).lean();

  if (!chapter) return res.status(404).json({ message: "No chapter found" });

  res.json(chapter);
});

// @desc get all chapter with no pagination for drop down
// @route GET /chapters/all
// @access private
export const getAllChaptersWithNoPagination = asyncHandler(async (req, res) => {
  const allChapter = await Chapter.find({})
    .select("chapterName chapterId")
    .sort({ createdAt: -1 });
  res.json(allChapter);
});

// @desc get all chapters
// @route GET /chapters
// @access privatete
export const getAllChapters = asyncHandler(async (req, res) => {
  const page = +req.query.page || 1;
  const limit = 10;

  const searchAndFilterQuery = [];

  const search = req.query.search || "";

  const isFilter = req.query.filter;

  if (search) {
    searchAndFilterQuery.push({
      chapterName: { $regex: search, $options: "i" },
    });
  } else {
    searchAndFilterQuery.push({ chapterName: { $regex: "", $options: "i" } });
  }

  if (isFilter) {
    const examTypeId = req.query.exam_type || "";
    const subjectId = req.query.subject || "";
    const startDate = req.query.start_date || "";
    const endDate = req.query.end_date || "";

    if (examTypeId) {
      searchAndFilterQuery.push({ examTypeId: examTypeId });
    }

    if (subjectId) {
      searchAndFilterQuery.push({ subjectId: subjectId });
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

  const totalFilteredDoc = await Chapter.find({
    $and: [
      ...searchAndFilterQuery,
      // { examType: { $regex: search, $options: "i" } },
      //   { examTypeId: { $regex: "", $options: "i" } },
      //   { createdAt: { $gte: new Date("2024-07-14"), $lte: new Date() } },
    ],
  }).countDocuments();

  const totalDoc = await Chapter.countDocuments();

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  console.log("startIndex :", startIndex, "endIndex :", endIndex);

  const hasPrevPage = startIndex > 0 ? true : false;
  const hasNextPage = endIndex < totalFilteredDoc ? true : false;

  const populate = [
    // { path: "enrolledExamType", options: { withDeleted: true } },
    { path: "examType", options: { select: { examType: 1 } } },
    { path: "subject", options: { select: { subjectName: 1 } } },
  ];

  const subjectData = await Chapter.find({
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
