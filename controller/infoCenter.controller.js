import asyncHandler from "express-async-handler";
import InfoCenter from "../models/InfoCenter.model.js";

// @desc add a Info
// @route POST /infos
// @access private
export const addInfos = asyncHandler(async (req, res) => {
  const { infoTitle, description, examTypeId } = req.body;

  const addInfo = await InfoCenter.create({
    infoTitle,
    description,
    examTypeId,
  });

  res.json(addInfo);
});

// @desc edit a Info
// @route POST /infos/:id
// @access private
export const editInfo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { infoTitle, description, examTypeId } = req.body;

  const info = await InfoCenter.findById(id);

  if (!info)
    return res.status(404).json({ message: "Could not find the info" });

  info.infoTitle = infoTitle;
  info.description = description;
  info.examTypeId = examTypeId;
  const updatedInfo = await info.save();

  res.json(updatedInfo);
});

// @desc delete a Info
// @route DELETE /infos/:id
// @access private
export const deleteInfo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const info = await InfoCenter.findById(id);

  if (!info)
    return res.status(404).json({ message: "Could not find Informanation" });

  const deleteInfo = await info.deleteOne();

  res.json(deleteInfo);
});

// @desc get a Info
// @route GET /infos/:id
// @access private
export const getSingleInfo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const populate = [
    // { path: "enrolledExamType", options: { withDeleted: true } },
    { path: "examType" },
  ];
  const info = await InfoCenter.findById(id).populate(populate).lean();

  if (!info) return res.status(404).json({ message: "No info found" });

  res.json(info);
});

// @desc get all infos
// @route GET /infos
// @access privatete
export const getAllInfos = asyncHandler(async (req, res) => {
  const page = +req.query.page || 1;
  const limit = 10;

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
    const startDate = req.query.start_date || "";
    const endDate = req.query.end_date || "";
    if (examTypeId) {
      searchAndFilterQuery.push({ examTypeId: examTypeId });
    }

    if (startDate && endDate) {
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
    $and: [
      ...searchAndFilterQuery,
      // { examType: { $regex: search, $options: "i" } },
      //   { examTypeId: { $regex: "", $options: "i" } },
      //   { createdAt: { $gte: new Date("2024-07-14"), $lte: new Date() } },
    ],
  }).countDocuments();

  const totalDoc = await InfoCenter.countDocuments();

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  console.log("startIndex :", startIndex, "endIndex :", endIndex);

  const hasPrevPage = startIndex > 0 ? true : false;
  const hasNextPage = endIndex < totalFilteredDoc ? true : false;

  const populate = [
    // { path: "enrolledExamType", options: { withDeleted: true } },
    { path: "examType", options: { select: { examType: 1 } } },
  ];

  const infoData = await InfoCenter.find({
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
    docsInThisPage: infoData.length,
    docs: infoData,
    paginateOptions,
  };

  res.json(prepareJson);
});
