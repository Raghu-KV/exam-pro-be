import { Router } from "express";
import { joiValidation } from "../middleware/joiValidation.js";
import {
  deleteStudentSchema,
  postStudentSchema,
  updateStudentSchema,
} from "../validations/students.validation.js";
import {
  addStudent,
  deleteStudent,
  getAllStudents,
  getSingleStudent,
  getStudentCompletedTestInsight,
  getStudentCompletedTests,
  getStudentDeatilView,
  getStudentIncompleteTests,
  resetPassword,
  updateStudent,
} from "../controller/students.controller.js";

import { verifyJwt } from "./../middleware/verifyJwt.js";

const router = Router();

router.use(verifyJwt);

router
  .route("/")
  .get(getAllStudents)
  .post(joiValidation(postStudentSchema), addStudent);

router
  .route("/resetPassword/:id")
  .patch(joiValidation(deleteStudentSchema), resetPassword);

router
  .route("/view/:id")
  .get(joiValidation(deleteStudentSchema), getStudentDeatilView);

router
  .route("/incompleteTests/:id")
  .get(joiValidation(deleteStudentSchema), getStudentIncompleteTests);

router
  .route("/completedTests/:id")
  .get(joiValidation(deleteStudentSchema), getStudentCompletedTests);

router
  .route("/completedTests/:id/insight/:testId")
  .get(getStudentCompletedTestInsight);

router
  .route("/:id")
  .get(joiValidation(deleteStudentSchema), getSingleStudent)
  .patch(joiValidation(updateStudentSchema), updateStudent)
  .delete(joiValidation(deleteStudentSchema), deleteStudent);

export { router };
