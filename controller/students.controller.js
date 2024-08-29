import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";

import Student from "../models/Student.model.js";
import Test from "../models/Test.model.js";
import Answer from "../models/Answer.model.js";
import Question from "../models/Question.model.js";

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

  // DELETING ALL ANSWERS GIVEN BY THE STUDENT
  await Answer.deleteMany({ studentId: student.studentId });

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

// @desc get Student performance like aveargr percentage
// @route GET /students/view/:id
// @access privatete
export const getStudentDeatilView = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const foundStudent = await Student.findById(id)
    .populate([
      {
        path: "group",
      },
      { path: "enrolledExamType" },
    ])
    .lean();

  if (!foundStudent) {
    return res.status(404).json({ message: "Student not found!!" });
  }

  const studentId = foundStudent.studentId;
  const examTypeId = foundStudent.enrolledExamTypeId;
  const groupId = foundStudent.groupId;

  // const studentData = await Student.findOne({ studentId })
  //   .populate({
  //     path: "group",
  //   })
  //   .lean();

  const attendedTestsNo = await Test.find({
    attendedStudentsId: { $in: [studentId] },
    isPublished: true,
    groupsId: { $in: [groupId] },
  }).countDocuments();

  const notAttendedTestNo = await Test.find({
    examTypeId: examTypeId,
    isPublished: true,
    groupsId: { $in: [groupId] },
    attendedStudentsId: { $nin: [studentId] },
  }).countDocuments();

  const pipeline = [
    {
      $match: {
        studentId: studentId, // Replace <current_student_id> with the actual student ID
      },
    },
    {
      $group: {
        _id: "$studentId",
        count: { $count: {} },
        avgAccuracyPercent: { $avg: "$accuracyPercent" },
        avgMistakePercent: { $avg: "$mistakePercent" },
        avgUnattendedPercent: { $avg: "$unattendedPercentage" },
      },
    },
  ];

  const insightData = await Answer.aggregate(pipeline);

  const latestAnswersData = await Answer.find({
    studentId: studentId,
  })
    .sort({ createdAt: -1 })
    .select("accuracyPercent mistakePercent unattendedPercentage testId")
    .populate({ path: "testInfo", select: "testName" })
    .limit(5)
    .lean();

  const prepareJson = {
    studentData: foundStudent,
    attendedTestsNo: attendedTestsNo,
    notAttendedTestNo: notAttendedTestNo,
    insightData,
    latestAnswersData,
  };

  res.json(prepareJson);
});

// @desc get Student incompleteTests
// @route GET /students/incompleteTests/:id
// @access privatete
export const getStudentIncompleteTests = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const foundStudent = await Student.findById(id)
    .populate({
      path: "group",
    })
    .lean();

  if (!foundStudent) {
    return res.status(404).json({ message: "Student not found!!" });
  }

  const page = +req.query.page || 1;
  const limit = 10;

  const examTypeId = foundStudent.enrolledExamTypeId;
  const studentId = foundStudent.studentId;
  const groupId = foundStudent.groupId;

  console.log(groupId, studentId);

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
    groupsId: { $in: [groupId] },
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
    groupsId: { $in: [groupId] },
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

  const testData = await Test.find({
    examTypeId: examTypeId,
    isPublished: true,
    attendedStudentsId: { $nin: [studentId] },
    groupsId: { $in: [groupId] },
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
    .select("-attendedStudentsId -questionsId  -groupsId")
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
    docsInThisPage: testData.length,
    docs: testData,
    paginateOptions,
  };

  res.json(prepareJson);
});

// @desc get Student Completed Tests
// @route GET /students/completedTests/:id
// @access privatete
export const getStudentCompletedTests = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const foundStudent = await Student.findById(id)
    .populate({
      path: "group",
    })
    .lean();

  if (!foundStudent) {
    return res.status(404).json({ message: "Student not found!!" });
  }

  const page = +req.query.page || 1;
  const limit = 10;

  const examTypeId = foundStudent.enrolledExamTypeId;
  const studentId = foundStudent.studentId;
  const groupId = foundStudent.groupId;

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
    attendedStudentsId: { $in: [studentId] },
    groupsId: { $in: [groupId] },
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
    attendedStudentsId: { $in: [studentId] },
    groupsId: { $in: [groupId] },
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
    attendedStudentsId: { $in: [studentId] },
    groupsId: { $in: [groupId] },
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
    .select("-attendedStudentsId -questionsId -groupsId")
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

// @desc get Student Completed Tests insight
// @route GET /students/completedTests/:id/insight/:testId
// @access privatete
export const getStudentCompletedTestInsight = asyncHandler(async (req, res) => {
  const { id, testId } = req.params;

  const foundStudent = await Student.findById(id)
    .populate({
      path: "group",
    })
    .lean();

  if (!foundStudent) {
    return res.status(404).json({ message: "Student not found!!" });
  }

  const groupId = foundStudent.groupId;
  const studentId = foundStudent.studentId;

  // 1. Find the test to ensure it exists and the student attended
  const foundTest = await Test.findOne({
    _id: testId,
    attendedStudentsId: { $in: [studentId] },
    groupsId: { $in: [groupId] },
  });

  if (!foundTest) {
    return res.status(404).json({
      message:
        "Test not found or you have not attended the test or the test is nor for your group!!",
    });
  }

  // 2. Set pagination parameters
  const page = +req.query.page || 1;
  const limit = 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // 3. Build the query for Answer documents
  let query = {
    studentId: studentId,
    testId: foundTest.testId,
  };

  const populate = [
    {
      path: "answers.question",
      options: {
        populate: [
          { path: "subject", select: "subjectName" },
          { path: "chapter", select: "chapterName" },
        ],
      },
    },
    { path: "testInfo", select: "testName" },
  ];

  // 4. Fetch answers for the student
  const result = await Answer.findOne(query).populate(populate).lean();

  if (!result) {
    return res.json({
      status: "success",
      totalDocs: 0,
      docsInThisPage: 0,
      docs: [],
      paginateOptions: {
        currentPage: page,
        totalPage: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
  }

  let filteredAnswers = result.answers;

  // 5. Apply `isCorrect` filter if provided
  const isCorrect = req.query.isCorrect || "";
  if (isCorrect === "yes") {
    filteredAnswers = filteredAnswers.filter((answer) => answer.isCorrect);
  } else if (isCorrect === "no") {
    filteredAnswers = filteredAnswers.filter((answer) => !answer.isCorrect);
  }

  // 6. Apply search and other filters
  const search = req.query.search || "";
  const examTypeId = req.query.exam_type || "";
  const subjectId = req.query.subject || "";
  const chapterId = req.query.chapter || "";

  if (search || examTypeId || subjectId || chapterId) {
    const questionIds = new Set(
      filteredAnswers.map((answer) => answer.questionId)
    );

    // Fetch questions with the given filters
    const questionsDocs = await Question.find({
      questionId: { $in: Array.from(questionIds) },
      ...(search ? { question: { $regex: search, $options: "i" } } : {}),
      ...(examTypeId ? { examTypeId: examTypeId } : {}),
      ...(subjectId ? { subjectId: subjectId } : {}),
      ...(chapterId ? { chapterId: chapterId } : {}),
    }).lean();

    const validQuestionIds = new Set(
      questionsDocs.map((doc) => doc.questionId)
    );

    filteredAnswers = filteredAnswers.filter((answer) =>
      validQuestionIds.has(answer.questionId)
    );
  }

  // Pagination
  const totalDocs = filteredAnswers.length;
  const hasPrevPage = startIndex > 0;
  const hasNextPage = endIndex < totalDocs;
  const totalPage = Math.ceil(totalDocs / limit);

  // Slice results for pagination
  const paginatedAnswers = filteredAnswers.slice(startIndex, endIndex);

  // Prepare the response
  const prepareJson = {
    status: "success",
    totalDocs: totalDocs,
    docsInThisPage: paginatedAnswers.length,
    docs: { ...result, answers: paginatedAnswers },
    paginateOptions: {
      currentPage: page,
      totalPage,
      hasNextPage,
      hasPrevPage,
    },
  };

  res.json(prepareJson);
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
