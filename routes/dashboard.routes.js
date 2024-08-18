import { Router } from "express";
import { dashboard } from "../controller/dashboard.controller.js";

import { verifyJwt } from "./../middleware/verifyJwt.js";

const router = Router();

router.use(verifyJwt);
router.route("/").get(dashboard);

export { router };
