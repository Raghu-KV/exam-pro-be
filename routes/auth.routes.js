import { Router } from "express";
import { loginLimitter } from "../middleware/loginLimiter.js";
import { login, logout, refersh } from "../controller/auth.controller.js";
import { joiValidation } from "../middleware/joiValidation.js";
import { userLoginSchema } from "../validations/auth.validation.js";

const router = Router();

router.route("/").post(loginLimitter, joiValidation(userLoginSchema), login);

router.route("/refresh").get(refersh);

router.route("/logout").post(logout);

export { router };
