import { Router } from "express";

import {
  changePassword,
  getPaymentDetails,
  registerUser,
} from "../controller/user.controller.js";
import { verifyJwt } from "../middleware/verifyJwt.js";
const router = Router();

router.route("/register").post(registerUser);

router.use(verifyJwt);

router.route("/changePassword").post(changePassword);

router.route("/payments").get(getPaymentDetails);

export { router };
