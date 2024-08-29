import asyncHandler from "express-async-handler";
import Test from "../../models/Test.model.js";
import Answer from "./../../models/Answer.model.js";
import Question from "./../../models/Question.model.js";

// @desc get all upcoming tests
// @route GET /student/tests/upcomingTests
// @access private
export const getAllUpcomingTestsForStudent = asyncHandler(async (req, res) => {
  const page = +req.query.page || 1;
  const limit = 10;

  const examTypeId = req.examTypeId;
  const studentId = req.studentId;
  const groupId = req.groupId;

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

  const questionData = await Test.find({
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
  const groupId = req.groupId;

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
    docsInThisPage: questionData.length,
    docs: questionData,
    paginateOptions,
  };

  res.json(prepareJson);
});

// @desc get single test with all question with no pagination
// @route GET /student/tests/upcomingTests/:id
// @access private
export const getSingleTest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const studentId = req.studentId;
  const groupId = req.groupId;

  const populate = [
    {
      path: "questions",
      select: "question options imageFullUrl imageShortUrl",
    },
  ];

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
      .json({ message: "You have already attended this test!! or This yest" });
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
  const { studentId, groupId } = req;

  // Fetch the test by ID
  const foundTest = await Test.findById(id)
    .select("questionsId attendedStudentsId testId groupsId examTypeId")
    .lean();
  if (!foundTest) return res.status(404).json({ message: "Test not found" });

  // Check if the student has already attended the test
  if (foundTest.attendedStudentsId.includes(studentId)) {
    return res
      .status(400)
      .json({ message: "You have already attended this test" });
  }

  // Check if this test is for the spefic group
  if (!foundTest.groupsId.includes(groupId)) {
    return res.status(400).json({ message: "This test is not for your group" });
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
    examTypeId: foundTest.examTypeId,
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

// ❗❗ DONT DELETE THE BELOW CODE
// export const getInsight = asyncHandler(async (req, res) => {
//   const { testId } = req.params;
//   const studentId = req.studentId;

//   const foundTest = await Test.findOne({
//     _id: testId,
//     attendedStudentsId: { $in: [studentId] },
//   });

//   if (!foundTest) {
//     return res
//       .status(404)
//       .json({ message: "Test not found or you have not attended the test!!" });
//   }

//   // PAGINATION
//   const page = +req.query.page || 1;
//   const limit = 10;

//   const startIndex = (page - 1) * limit;
//   const endIndex = page * limit;

//   const isFilter = req.query.filter;

//   const populate = [
//     {
//       path: "answers.question",
//       options: {
//         populate: [
//           { path: "subject", select: "subjectName" },
//           { path: "chapter", select: "chapterName" },
//         ],
//       },
//     },
//   ];

//   const result = await Answer.findOne({
//     studentId: studentId,
//     testId: foundTest.testId,
//   })
//     .populate(populate)
//     .lean();

//   let hasPrevPage = 0;
//   let hasNextPage = 0;

//   let totalDocs = 0;
//   let totalPage = 0;

//   if (result) {
//     const query_params = req.query["query-params"];

//     if (query_params) {
//       const searchAndFilterQuery = [];
//       const search = req.query.search || "";

//       if (search) {
//         searchAndFilterQuery.push({
//           question: { $regex: search, $options: "i" },
//         });
//       } else {
//         searchAndFilterQuery.push({ question: { $regex: "", $options: "i" } });
//       }

//       if (isFilter) {
//         const examTypeId = req.query.exam_type || "";
//         const subjectId = req.query.subject || "";
//         const chapterId = req.query.chapter || "";
//         const isCorrect = req.query.isCorrect || "";

//         if (isCorrect === "yes") {
//           const correctAns = result.answers.filter(
//             (answer) => answer.isCorrect
//           );
//           result.answers = correctAns;
//         } else if (isCorrect === "no") {
//           const wrongAns = result.answers.filter((answer) => !answer.isCorrect);
//           result.answers = wrongAns;
//         }

//         if (examTypeId) {
//           searchAndFilterQuery.push({ examTypeId: examTypeId });
//         }

//         if (subjectId) {
//           searchAndFilterQuery.push({ subjectId: subjectId });
//         }

//         if (chapterId) {
//           searchAndFilterQuery.push({ chapterId: chapterId });
//         }
//       }

//       const questionsDocs = await Question.find({
//         questionId: { $in: foundTest.questionsId },
//         $and: [...searchAndFilterQuery],
//       });

//       const includesArray = questionsDocs.map((item) => {
//         return item.questionId;
//       });

//       result.answers = result.answers.filter((answer) =>
//         includesArray.includes(answer.questionId)
//       );
//     }

//     hasPrevPage = startIndex > 0 ? true : false;
//     hasNextPage = endIndex < result.answers.length ? true : false;

//     totalDocs = result.answers.length;
//     totalPage = Math.ceil(result.answers.length / limit);

//     result.answers = result.answers.slice(startIndex, endIndex);
//   }

//   const paginateOptions = {
//     currentPage: page,
//     totalPage,
//     hasNextPage,
//     hasPrevPage,
//   };

//   const prepareJson = {
//     status: "success",
//     totalDocs: totalDocs,
//     docsInThisPage: result.answers.length,
//     docs: result,
//     paginateOptions,
//   };

//   res.json(prepareJson);
// });

export const getInsight = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const studentId = req.studentId;
  const groupId = req.groupId;

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
