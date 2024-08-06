import { Router } from "express";
import { loginLimitter } from "../../middleware/loginLimiter.js";
import { joiValidation } from "../../middleware/joiValidation.js";
import { studentLoginSchema } from "./../../validations/studentAppValidation/student.auth.validation.js";
import {
  studentLogin,
  studentLogout,
  studentRefresh,
} from "./../../controller/studentAppController/student.auth.controller.js";

const router = Router();

router
  .route("/")
  .post(loginLimitter, joiValidation(studentLoginSchema), studentLogin);

router.route("/refresh").get(studentRefresh);

router.route("/logout").post(studentLogout);

export { router };
