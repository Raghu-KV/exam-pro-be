import asyncHandler from "express-async-handler";
import InfoCenter from "../../models/InfoCenter.model.js";

// @desc get all infos
// @route GET /student/infoCenter/
// @access private
export const getAllInfosForStudent = asyncHandler(async (req, res) => {
  const page = +req.query.page || 1;
  const limit = 10;

  const examTypeId = req.examTypeId;
  const studentId = req.studentId;
  const groupId = req.groupId;

  const searchAndFilterQuery = [];

  const search = req.query.search || "";

  const isFilter = req.query.filter;

  if (search) {
    searchAndFilterQuery.push({
      infoTitle: { $regex: search, $options: "i" },
    });
  } else {
    searchAndFilterQuery.push({ infoTitle: { $regex: "", $options: "i" } });
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
        createdAt: { $gte: new Date(startDate), $lt: new Date(addedOneDay) },
      });
    }
  }

  const totalFilteredDoc = await InfoCenter.find({
    examTypeId: examTypeId,
    $and: [
      ...searchAndFilterQuery,
      // { examType: { $regex: search, $options: "i" } },
      //   { examTypeId: { $regex: "", $options: "i" } },
      //   { createdAt: { $gte: new Date("2024-07-14"), $lte: new Date() } },
    ],
  }).countDocuments();

  const totalDoc = await InfoCenter.find({
    examTypeId: examTypeId,
  }).countDocuments();

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

  const infoData = await InfoCenter.find({
    examTypeId: examTypeId,
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
    docsInThisPage: infoData.length,
    docs: infoData,
    paginateOptions,
  };

  res.json(prepareJson);
});

// @desc get all infos
// @route GET /student/infoCenter/:id
// @access private
export const getSingleInfoForStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const populate = [
    // { path: "enrolledExamType", options: { withDeleted: true } },
    { path: "examType" },
  ];
  const info = await InfoCenter.findById(id).populate(populate).lean();

  if (!info) return res.status(404).json({ message: "No info found" });

  res.json(info);
});
