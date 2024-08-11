import asyncHandler from "express-async-handler";
import Test from "../../models/Test.model.js";
import Answer from "./../../models/Answer.model.js";
import Question from "../../models/Question.model.js";

// @desc get all upcoming tests
// @route GET /student/tests/upcomingTests
// @access private
export const getAllUpcomingTestsForStudent = asyncHandler(async (req, res) => {
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

// @desc get all completed tests
// @route GET /student/tests/completedTest
// @access private
export const getAllCompletedTestsForStudent = asyncHandler(async (req, res) => {
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
    attendedStudentsId: { $in: [studentId] },
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

  const studentId = req.studentId;

  const populate = [{ path: "questions", select: "question options" }];

  const test = await Test.findById(id)
    .populate(populate)
    .select("-attendedStudentsId")
    .lean();

  if (!test) {
    return res.status(404).json({ message: "Test not found" });
  }

  const isAttended = await Test.findOne({
    _id: id,
    attendedStudentsId: { $in: [studentId] },
  }).countDocuments();

  if (isAttended) {
    return res
      .status(404)
      .json({ message: "You have already attended this test!!" });
  }

  res.json(test);
});

// @desc post answers for test
// @route GET /student/tests/submitAnswers/:id
// @access private
// export const postAnswer = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { answers: submittedAnsPayload } = req.body;

//   const examTypeId = req.examTypeId;
//   const studentId = req.studentId;

//   // Fetch the test by ID
//   const foundTest = await Test.findById(id).lean().exec();

//   if (!foundTest) return res.status(404).json({ message: "Test not found" });

//   const isAlreadyAttended = foundTest.attendedStudentsId.includes(studentId);

//   if (isAlreadyAttended)
//     return res
//       .status(404)
//       .json({ message: "You have already attended this test" });

//   // REMOVE DUPLICATE FROM PAYLOAD
//   function removeDuplicates(answers) {
//     const uniqueAnswersMap = new Map();

//     answers.forEach((answer) => {
//       uniqueAnswersMap.set(answer.questionId, answer.answerId);
//     });

//     return Array.from(uniqueAnswersMap, ([questionId, answerId]) => ({
//       questionId,
//       answerId,
//     }));
//   }

//   const submittedAnsRemovedDup = removeDuplicates(submittedAnsPayload);

//   // Fetch all questions for the test
//   const allQuestions = await Question.find({
//     questionId: { $in: foundTest.questionsId },
//   })
//     .select("questionId answerId")
//     .lean();

//   // Convert allQuestions to a Set of unique questionIds
//   const allQuestionsSet = new Set(allQuestions.map((q) => q.questionId));

//   // Filter the answers to include only those with valid questionIds
//   const submittedAns = submittedAnsRemovedDup.filter((answer) =>
//     allQuestionsSet.has(answer.questionId)
//   );

//   // Convert allQuestions to a Map for quick lookup of correct answers
//   const correctAnswersMap = new Map(
//     allQuestions.map((q) => [q.questionId, q.answerId])
//   );

//   // Calculate unanswered questions
//   const answeredQuestionsSet = new Set(
//     submittedAns
//       .filter((answer) => allQuestionsSet.has(answer.questionId)) // Only consider answers for valid questions
//       .map((answer) => answer.questionId)
//   );

//   //DATAS------>
//   const unansweredQuestionsCount =
//     allQuestionsSet.size - answeredQuestionsSet.size;

//   const totalAttendedQu = answeredQuestionsSet.size;

//   // Initialize counters
//   let correctCount = 0;
//   let wrongCount = 0;

//   // Iterate over answers and count correct/wrong ones
//   submittedAns.forEach((answer) => {
//     const correctAnswerId = correctAnswersMap.get(answer.questionId);
//     if (correctAnswerId !== undefined) {
//       // Check if the questionId is valid
//       if (correctAnswerId === answer.answerId) {
//         correctCount++;
//       } else {
//         wrongCount++;
//       }
//     }
//   });

//   // PERCENTAGE
//   const accuracy = ((correctCount / totalAttendedQu) * 100).toFixed(2);
//   const mistake = ((wrongCount / totalAttendedQu) * 100).toFixed(2);
//   const unAttended = (
//     (unansweredQuestionsCount / foundTest.questionsId.length) *
//     100
//   ).toFixed(2);

//   // UPDATING TEST --> to make student attend test successfully
//   await Test.findByIdAndUpdate(id, {
//     $push: { attendedStudentsId: studentId },
//   });

//   // Creating an obj for Answer model
//   const prepareObj = {
//     studentId,
//     testId: foundTest.testId,
//     answers: submittedAns,
//     totalQuestions: foundTest.questionsId.length,
//     totalCorrectAnswers: correctCount,
//     totalWrongAnswers: wrongCount,
//     totalAttendedQuestions: correctCount + wrongCount,
//     totalNotAttendedQuestions: unansweredQuestionsCount,
//     accuracyPercent: accuracy,
//     mistakePercent: mistake,
//     unattendedPercentage: unAttended,
//   };

//   await Answer.create(prepareObj);

//   res.json({
//     totalCorrectAnswers: correctCount,
//     totalQuestions: foundTest.questionsId.length,
//   });
// });

// ⬇⬇DONT DELET THE BELOW CODE HAS A LOGIC TO SAVE ALL THE QUESTION IDS THAT IS TO SAVE ATTENDED QUESTION AND ALSO THE UNATTENDED QUESTION

export const postAnswer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { answers: submittedAnsPayload } = req.body;
  const { studentId } = req;

  // Fetch the test by ID
  const foundTest = await Test.findById(id)
    .select("questionsId attendedStudentsId testId")
    .lean();
  if (!foundTest) return res.status(404).json({ message: "Test not found" });

  // Check if the student has already attended the test
  if (foundTest.attendedStudentsId.includes(studentId)) {
    return res
      .status(400)
      .json({ message: "You have already attended this test" });
  }

  // Function to remove duplicates from the answers payload
  const removeDuplicates = (answers) => {
    const uniqueAnswers = new Map();
    answers.forEach((answer) =>
      uniqueAnswers.set(answer.questionId, answer.answerId)
    );
    return Array.from(uniqueAnswers, ([questionId, answerId]) => ({
      questionId,
      answerId,
    }));
  };

  // Remove duplicates from submitted answers
  const submittedAnsRemovedDup = removeDuplicates(submittedAnsPayload);

  // Fetch all questions for the test with their correct answer IDs
  const allQuestions = await Question.find({
    questionId: { $in: foundTest.questionsId },
  })
    .select("questionId answerId")
    .lean();

  const correctAnswersMap = new Map(
    allQuestions.map((q) => [q.questionId, q.answerId])
  );

  // Filter out invalid answers
  const submittedAns = submittedAnsRemovedDup.filter((answer) =>
    correctAnswersMap.has(answer.questionId)
  );

  // Calculate statistics
  const answeredQuestionsSet = new Set(
    submittedAns.map((answer) => answer.questionId)
  );
  const allQuestionsSet = new Set(foundTest.questionsId);
  const unansweredQuestionsSet = new Set(
    [...allQuestionsSet].filter((qid) => !answeredQuestionsSet.has(qid))
  );

  const unansweredQuestions = Array.from(unansweredQuestionsSet).map((qid) => ({
    questionId: qid,
    isCorrect: false, // For unanswered questions, isCorrect is false
  }));

  const unansweredQuestionsCount = unansweredQuestions.length;
  const totalAttendedQu = answeredQuestionsSet.size;

  let correctCount = 0;
  let wrongCount = 0;

  // Add isCorrect to submitted answers
  const detailedSubmittedAns = submittedAns.map((answer) => {
    const correctAnswerId = correctAnswersMap.get(answer.questionId);
    const isCorrect = correctAnswerId === answer.answerId;
    if (isCorrect) {
      correctCount++;
    } else {
      wrongCount++;
    }
    return { ...answer, isCorrect: isCorrect };
  });

  const accuracy =
    totalAttendedQu > 0
      ? ((correctCount / totalAttendedQu) * 100).toFixed(2)
      : "0.00";
  const mistake =
    totalAttendedQu > 0
      ? ((wrongCount / totalAttendedQu) * 100).toFixed(2)
      : "0.00";

  const unAttended =
    unansweredQuestionsCount > 0
      ? (
          (unansweredQuestionsCount / foundTest.questionsId.length) *
          100
        ).toFixed(2)
      : "0.00";

  // Prepare answer data for storing
  const prepareObj = {
    studentId,
    testId: foundTest.testId,
    answers: [...detailedSubmittedAns, ...unansweredQuestions],
    totalQuestions: foundTest.questionsId.length,
    totalCorrectAnswers: correctCount,
    totalWrongAnswers: wrongCount,
    totalAttendedQuestions: correctCount + wrongCount,
    totalNotAttendedQuestions: unansweredQuestionsCount,
    accuracyPercent: accuracy,
    mistakePercent: mistake,
    unattendedPercentage: unAttended,
  };

  // Create the answer record
  await Answer.create(prepareObj);

  // Update test to mark it as attended by the student
  await Test.findByIdAndUpdate(id, {
    $push: { attendedStudentsId: studentId },
  });

  res.json({
    totalCorrectAnswers: correctCount,
    totalQuestions: foundTest.questionsId.length,
  });
});

// @desc get insight for a completed test
// @route GET /student/tests/completedTests/:testId/insight
// @access private

export const getInsight = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const examTypeId = req.examTypeId;
  const studentId = req.studentId;

  const foundTest = await Test.findById(testId).select("testId questionsId");

  if (!foundTest)
    return res.status(404).res.json({ message: "Test not found" });

  const foundAsnwersForTest = await Answer.findOne({
    testId: foundTest.testId,
    studentId: studentId,
  }).select("-answers");

  if (!foundAsnwersForTest)
    return res.status(404).res.json({ message: "Answer not found" });

  // FOR PAGINATION QUESTIONS

  const page = +req.query.page || 1;
  const limit = 10;

  const searchAndFilterQuery = [];

  const search = req.query.search || "";

  const isFilter = req.query.filter;

  if (search) {
    searchAndFilterQuery.push({
      question: { $regex: search, $options: "i" },
    });
  } else {
    searchAndFilterQuery.push({ question: { $regex: "", $options: "i" } });
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

  const totalFilteredDoc = await Question.find({
    questionId: { $in: foundTest.questionsId },
    $and: [
      ...searchAndFilterQuery,
      // { examType: { $regex: search, $options: "i" } },
      //   { examTypeId: { $regex: "", $options: "i" } },
      //   { createdAt: { $gte: new Date("2024-07-14"), $lte: new Date() } },
    ],
  }).countDocuments();

  const totalDoc = await Question.find({
    questionId: { $in: foundTest.questionsId },
  }).countDocuments();

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  console.log("startIndex :", startIndex, "endIndex :", endIndex);

  const hasPrevPage = startIndex > 0 ? true : false;
  const hasNextPage = endIndex < totalFilteredDoc ? true : false;

  const populate = [
    {
      path: "answer",
      options: {
        withDeleted: true,
        match: { answerId: foundAsnwersForTest.answerId },
        select: { answers: 1 },
      },
    },
    //   { path: "examType", options: { select: { examType: 1 } } },
    // { path: "subject", options: { select: { subjectName: 1 } } },
    // { path: "chapter", options: { select: { chapterName: 1 } } },
  ];

  console.log(foundAsnwersForTest.answerId, "KKKKK");

  // const questionData = await Question.find({
  //   questionId: { $in: foundTest.questionsId },
  //   $and: [
  //     ...searchAndFilterQuery,
  //     //   { examType: { $regex: search, $options: "i" } },
  //     //   { examTypeId: { $regex: "", $options: "i" } },
  //     //   { createdAt: { $gte: new Date("2024-07-14"), $lte: new Date() } },
  //   ],
  // })
  //   .skip(startIndex)
  //   .limit(limit)
  //   .populate(populate)
  //   .select("-attendedStudentsId -questionsId")
  //   .lean();

  const questionData = await Question.aggregate([
    {
      $match: {
        questionId: { $in: foundTest.questionsId },
        ...searchAndFilterQuery.reduce(
          (acc, query) => ({ ...acc, ...query }),
          {}
        ),
      },
    },
    {
      $lookup: {
        from: "answers",
        localField: "answer",
        foreignField: "_id",
        as: "answer",
      },
    },
    {
      $unwind: {
        path: "$answer",
        preserveNullAndEmptyArrays: true,
      },
    },
    // {
    //   $match: {
    //     "answer.answerId": foundAsnwersForTest.answerId,
    //   },
    // },
    {
      $skip: startIndex,
    },
    {
      $limit: limit,
    },
    {
      $project: {
        attendedStudentsId: 0,
        questionsId: 0,
      },
    },
  ]);

  console.log("Filtered question data:", questionData);

  // Step 1: Preprocess answers into a lookup map
  const answerLookup = new Map();
  questionData.forEach((question) => {
    if (question.answer?.answers) {
      question.answer.answers.forEach((answer) => {
        answerLookup.set(answer.questionId, answer);
      });
    }
  });

  // Step 2: Map over questions and use the lookup map
  const filteredQuestionData = questionData.map((question) => {
    const specificAnswer = answerLookup.get(question.questionId) || null;
    question.answer = specificAnswer;
    return question;
  });

  const totalPage = Math.ceil(totalFilteredDoc / limit);

  const paginateOptions = {
    currentPage: page,
    totalPage,
    hasNextPage,
    hasPrevPage,
  };

  const prepareJson = {
    status: "success",
    insight: foundAsnwersForTest,
    totalDocs: totalDoc,
    docsInThisPage: questionData.length,
    docs: questionData,
    paginateOptions,
  };

  res.json(prepareJson);
});
