import { Router } from "express";

import { verifyJwt } from "./../middleware/verifyJwt.js";
import { payments } from "../controller/payment.controller.js";
const router = Router();

router.use(verifyJwt);

router.route("/").get(payments);

export { router };
