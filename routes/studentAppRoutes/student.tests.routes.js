import { Router } from "express";
import {
  getAllCompletedTestsForStudent,
  getAllUpcomingTestsForStudent,
  getInsight,
  getSingleTest,
  postAnswer,
} from "../../controller/studentAppController/student.tests.controller.js";
import { verifyJwt } from "../../middleware/verifyStudentJwt.js";
import { joiValidation } from "./../../middleware/joiValidation.js";
import {
  getSingleTestSchema,
  postAnswerScheme,
} from "./../../validations/studentAppValidation/student.tests.validation.js";

const router = Router();

router.use(verifyJwt);

router.route("/upcomingTests").get(getAllUpcomingTestsForStudent);

router.route("/completedTests").get(getAllCompletedTestsForStudent);

router.route("/completedTests/:testId/insight").get(getInsight);

router
  .route("/upcomingTests/:id")
  .get(joiValidation(getSingleTestSchema), getSingleTest);

router
  .route("/submitAnswers/:id")
  .post(joiValidation(postAnswerScheme), postAnswer);

export { router };
