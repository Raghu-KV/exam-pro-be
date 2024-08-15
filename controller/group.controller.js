import asyncHandler from "express-async-handler";

import Group from "./../models/Group.model.js";

import Student from "./../models/Student.model.js";

// @desc add a group
// @route POST /groups
// @access private
export const addGroup = asyncHandler(async (req, res) => {
  const { groupName, examTypeId } = req.body;

  const result = await Group.create({ groupName, examTypeId });

  res.json(result);
});

// @desc edit a group
// @route POST /groups/:id
// @access private
export const editGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { groupName, examTypeId } = req.body;

  const group = await Group.findById(id);

  if (!group)
    return res.status(404).json({ message: "Could not find the group" });

  group.examTypeId = examTypeId;
  group.groupName = groupName;

  const updatedGroup = await group.save();

  res.json(updatedGroup);
});

// @desc delete a group
// @route DELETE /groups/:id
// @access private
export const deleteGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const group = await Group.findById(id);

  if (!group) return res.status(404).json({ message: "Could not find group" });

  const deleteGroupMsg = await group.deleteOne();

  res.json(deleteGroupMsg);
});

// @desc get a groups -- use this for prefill
// @route GET /groups/:id
// @access private
export const getSinglGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const populate = [
    // { path: "enrolledExamType", options: { withDeleted: true } },
    { path: "examType" },
  ];
  const group = await Group.findById(id).populate(populate).lean();

  if (!group) return res.status(404).json({ message: "No group found" });

  res.json(group);
});

// @desc get all groups with no pagination for drop down
// @route GET /groups/all
// @access private
export const getAllGroupsWithNoPagination = asyncHandler(async (req, res) => {
  const allGroup = await Group.find({})
    .select("groupName groupId")
    .sort({ createdAt: -1 });
  res.json(allGroup);
});

// @desc view a group --> see all student in the spefic group
// @route GET /groups/view/:id
// @access private
export const getSingleGroupView = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const populate = [
    // { path: "enrolledExamType", options: { withDeleted: true } },
    { path: "examType" },
  ];
  const group = await Group.findById(id).populate(populate).lean();

  if (!group) return res.status(404).json({ message: "No group found" });

  // res.json(chapter);

  const page = +req.query.page || 1;
  const limit = 10;

  const searchAndFilterQuery = [];

  const search = req.query.search || "";

  const isFilter = req.query.filter;

  if (search) {
    searchAndFilterQuery.push({
      studentName: { $regex: search, $options: "i" },
    });
  } else {
    searchAndFilterQuery.push({ studentName: { $regex: "", $options: "i" } });
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

  const totalFilteredDoc = await Student.find({
    enrolledExamTypeId: group.examTypeId,
    groupId: group.groupId,
    $and: [
      ...searchAndFilterQuery,
      // { examType: { $regex: search, $options: "i" } },
      //   { examTypeId: { $regex: "", $options: "i" } },
      //   { createdAt: { $gte: new Date("2024-07-14"), $lte: new Date() } },
    ],
  }).countDocuments();

  const totalDoc = await Student.find({
    enrolledExamTypeId: group.examTypeId,
    groupId: group.groupId,
  }).countDocuments();

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  console.log("startIndex :", startIndex, "endIndex :", endIndex);

  const hasPrevPage = startIndex > 0 ? true : false;
  const hasNextPage = endIndex < totalFilteredDoc ? true : false;

  const populateForStudent = [
    { path: "enrolledExamType", options: { withDeleted: true } },
    // { path: "examType", options: { select: { examType: 1 } } },
  ];

  const studentData = await Student.find({
    enrolledExamTypeId: group.examTypeId,
    groupId: group.groupId,
    $and: [
      ...searchAndFilterQuery,
      //   { examType: { $regex: search, $options: "i" } },
      //   { examTypeId: { $regex: "", $options: "i" } },
      //   { createdAt: { $gte: new Date("2024-07-14"), $lte: new Date() } },
    ],
  })
    .skip(startIndex)
    .limit(limit)
    .populate(populateForStudent)
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
    groupDoc: group,
    totalDocs: totalDoc,
    docsInThisPage: studentData.length,
    docs: studentData,
    paginateOptions,
  };

  res.json(prepareJson);
});

// @desc get all groups
// @route GET /groups
// @access privatete
export const getAllGroups = asyncHandler(async (req, res) => {
  const page = +req.query.page || 1;
  const limit = 10;

  const searchAndFilterQuery = [];

  const search = req.query.search || "";

  const isFilter = req.query.filter;

  if (search) {
    searchAndFilterQuery.push({
      groupName: { $regex: search, $options: "i" },
    });
  } else {
    searchAndFilterQuery.push({ groupName: { $regex: "", $options: "i" } });
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

  const totalFilteredDoc = await Group.find({
    $and: [
      ...searchAndFilterQuery,
      // { examType: { $regex: search, $options: "i" } },
      //   { examTypeId: { $regex: "", $options: "i" } },
      //   { createdAt: { $gte: new Date("2024-07-14"), $lte: new Date() } },
    ],
  }).countDocuments();

  const totalDoc = await Group.countDocuments();

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  console.log("startIndex :", startIndex, "endIndex :", endIndex);

  const hasPrevPage = startIndex > 0 ? true : false;
  const hasNextPage = endIndex < totalFilteredDoc ? true : false;

  const populate = [
    // { path: "enrolledExamType", options: { withDeleted: true } },
    { path: "examType", options: { select: { examType: 1 } } },
  ];

  const groupData = await Group.find({
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
    docsInThisPage: groupData.length,
    docs: groupData,
    paginateOptions,
  };

  res.json(prepareJson);
});
