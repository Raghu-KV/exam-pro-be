import asyncHandler from "express-async-handler";
import Answer from "../models/Answer.model.js";
import ExamType from "../models/ExamType.model.js";
import Student from "./../models/Student.model.js";

// @desc get admin dashboard
// @route GET /dashboard
// @access private
export const dashboard = asyncHandler(async (req, res) => {
  const pipeline = [
    {
      $group: {
        _id: "$examTypeId",
        count: { $count: {} },
        avgAccuracyPercent: { $avg: "$accuracyPercent" },
        avgMistakePercent: { $avg: "$mistakePercent" },
        avgUnattendedPercent: { $avg: "$unattendedPercentage" },
      },
    },
  ];

  const insightData = await Answer.aggregate(pipeline);

  const allExamTypes = await ExamType.find();

  const totalStudents = await Student.find().countDocuments();

  const studentPipeling = [
    {
      $group: {
        _id: "$enrolledExamTypeId",
        count: { $count: {} },
      },
    },
  ];

  const totalStudentForExamType = await Student.aggregate(studentPipeling);

  const examTypeMap = new Map(
    allExamTypes.map(({ examTypeId, examType }) => [examTypeId, examType])
  );

  const insightMap = new Map(
    insightData.map(
      ({
        _id,
        avgAccuracyPercent,
        avgMistakePercent,
        avgUnattendedPercent,
      }) => [
        _id,
        { avgAccuracyPercent, avgMistakePercent, avgUnattendedPercent },
      ]
    )
  );

  // Combine data
  const insightDataResult = totalStudentForExamType
    .map(({ _id, count }) => {
      const examType = examTypeMap.get(_id);
      const insight = insightMap.get(_id);
      return examType && insight
        ? {
            _id,
            count,
            examType,
            ...insight,
          }
        : null;
    })
    .filter((entry) => entry !== null);

  // Filter and map to the desired output
  const totalStudentForExamTypeResult = totalStudentForExamType
    .map(({ _id, count }) => {
      const examType = examTypeMap.get(_id);
      return examType ? { _id, count, examType } : null;
    })
    .filter((entry) => entry !== null);

  res.json({
    totalStudents: totalStudents,
    totalStudentForExamType: totalStudentForExamTypeResult,
    insightData: insightDataResult,
  });
});
