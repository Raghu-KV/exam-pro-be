import asyncHandler from "express-async-handler";
import Test from "../../models/Test.model.js";
import Answer from "./../../models/Answer.model.js";
import Student from "../../models/Student.model.js";

// @desc get all upcoming tests
// @route GET /student/tests/upcomingTests
// @access private
export const studentDashboard = asyncHandler(async (req, res) => {
  const studentId = req.studentId;
  const examTypeId = req.examTypeId;
  const groupId = req.groupId;

  const studentData = await Student.findOne({ studentId })
    .populate({
      path: "group",
    })
    .lean();

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
        examTypeId: examTypeId,
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
    studentData,
    attendedTestsNo: attendedTestsNo,
    notAttendedTestNo: notAttendedTestNo,
    insightData,
    latestAnswersData,
  };

  res.json(prepareJson);
});
