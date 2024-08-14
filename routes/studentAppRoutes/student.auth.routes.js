import { Router } from "express";
import { loginLimitter } from "../../middleware/loginLimiter.js";
import { joiValidation } from "../../middleware/joiValidation.js";
import {
  changePasswordScheme,
  studentLoginSchema,
} from "./../../validations/studentAppValidation/student.auth.validation.js";
import {
  changePassword,
  studentLogin,
  studentLogout,
  studentRefresh,
} from "./../../controller/studentAppController/student.auth.controller.js";
import { verifyJwt } from "./../../middleware/verifyStudentJwt.js";

const router = Router();

router
  .route("/")
  .post(loginLimitter, joiValidation(studentLoginSchema), studentLogin);

router.route("/refresh").get(studentRefresh);

router.route("/logout").post(studentLogout);

router
  .route("/changePassword")
  .post(verifyJwt, joiValidation(changePasswordScheme), changePassword);

export { router };
