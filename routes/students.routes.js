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
  .route("/reset-password/:id")
  .patch(joiValidation(deleteStudentSchema), resetPassword);

router
  .route("/:id")
  .get(joiValidation(deleteStudentSchema), getSingleStudent)
  .patch(joiValidation(updateStudentSchema), updateStudent)
  .delete(joiValidation(deleteStudentSchema), deleteStudent);

export { router };
