import { Router } from "express";
import {
  getAllTestsForStudent,
  getSingleTest,
} from "../../controller/studentAppController/student.tests.controller.js";
import { verifyJwt } from "../../middleware/verifyStudentJwt.js";
import { joiValidation } from "./../../middleware/joiValidation.js";
import { getSingleTestSchema } from "./../../validations/studentAppValidation/student.tests.validation.js";

const router = Router();

router.use(verifyJwt);

router.route("/upcomingTests").get(getAllTestsForStudent);

router
  .route("/upcomingTests/:id")
  .get(joiValidation(getSingleTestSchema), getSingleTest);

export { router };
