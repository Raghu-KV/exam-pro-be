import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";

import Student from "../models/Student.model.js";

// @desc add a Stdent
// @route POST /students
// @access private
export const addStudent = asyncHandler(async (req, res) => {
  const { rollNo, studentName, phoneNo, enrolledExamTypeId, groupId } =
    req.body;

  const autoPass = process.env.AUTO_PASS;

  const hashedPass = await bcrypt.hash(autoPass, 10);

  const addStudent = await Student.create({
    rollNo,
    studentName,
    phoneNo,
    enrolledExamTypeId,
    groupId,
    password: hashedPass,
    rawPassword: autoPass,
  });

  res.json(addStudent);
});

// @desc edit a Stdent
// @route PATCH /students/:id
// @access private
export const updateStudent = asyncHandler(async (req, res) => {
  const { rollNo, studentName, phoneNo, enrolledExamTypeId, groupId } =
    req.body;
  const { id } = req.params;

  const student = await Student.findById(id).exec();

  if (!student) return res.status(404).json({ message: "No student found" });

  student.rollNo = rollNo;
  student.studentName = studentName;
  student.phoneNo = phoneNo;
  student.enrolledExamTypeId = enrolledExamTypeId;
  student.groupId = groupId;

  const saveStudent = await student.save();

  res.json(saveStudent);
});

// @desc delete a Stdent
// @route PATCH /students/:id
// @access privatete
export const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const student = await Student.findById(id).exec();

  if (!student) return res.status(404).json({ message: "No student found" });

  const saveStudent = await student.deleteOne();

  res.json(saveStudent);
});

// @desc get a Stdent
// @route GET /students/:id
// @access privatete
export const getSingleStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const populate = [
    // { path: "enrolledExamType", options: { withDeleted: true } },
    { path: "enrolledExamType" },
    { path: "group" },
  ];
  const student = await Student.findById(id).populate(populate).lean();

  if (!student) return res.status(404).json({ message: "No student found" });

  res.json(student);
});

// @desc reset a student pass
// @route GET /students/reset-password/:id
// @access privatete
export const resetPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const student = await Student.findById(id).exec();

  if (!student) return res.status(404).json({ message: "No student found" });

  const autoPass = process.env.AUTO_PASS;

  const hashedPass = await bcrypt.hash(autoPass, 10);

  student.password = hashedPass;
  student.rawPassword = autoPass;

  await student.save();

  res.json({ message: "password reset successful" });
});

// @desc get all students
// @route GET /students
// @access privatete
export const getAllStudents = asyncHandler(async (req, res) => {
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
    const rollNo = req.query.roll_no || "";
    const phoneNo = +req.query.phone_no || "";
    const startDate = req.query.start_date || "";
    const endDate = req.query.end_date || "";
    const groupId = req.query.group || "";
    if (examTypeId) {
      searchAndFilterQuery.push({ enrolledExamTypeId: examTypeId });
    }
    if (rollNo) {
      searchAndFilterQuery.push({ rollNo: { $regex: rollNo } });
    }
    if (phoneNo) {
      searchAndFilterQuery.push({ phoneNo: { $regex: phoneNo } });
    }
    if (groupId) {
      searchAndFilterQuery.push({ groupId: groupId });
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
    $and: [
      ...searchAndFilterQuery,
      // { examType: { $regex: search, $options: "i" } },
      //   { examTypeId: { $regex: "", $options: "i" } },
      //   { createdAt: { $gte: new Date("2024-07-14"), $lte: new Date() } },
    ],
  }).countDocuments();

  const totalDoc = await Student.countDocuments();

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  console.log("startIndex :", startIndex, "endIndex :", endIndex);

  const hasPrevPage = startIndex > 0 ? true : false;
  const hasNextPage = endIndex < totalFilteredDoc ? true : false;

  const populate = [
    // { path: "enrolledExamType", options: { withDeleted: true } },
    { path: "enrolledExamType", options: { select: { examType: 1 } } },
    { path: "group", options: { select: { groupName: 1 } } },
  ];

  const examTypeData = await Student.find({
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
    docsInThisPage: examTypeData.length,
    docs: examTypeData,
    paginateOptions,
  };

  res.json(prepareJson);
});
