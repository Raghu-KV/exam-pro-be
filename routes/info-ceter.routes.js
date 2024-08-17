import { Router } from "express";
import { verifyJwt } from "../middleware/verifyJwt.js";
import {
  deleteInfoSchema,
  postInfoSchema,
  updateInfoSchema,
} from "./../validations/infoCenter.validation.js";
import { joiValidation } from "../middleware/joiValidation.js";
import {
  addInfos,
  deleteInfo,
  editInfo,
  getAllInfos,
  getSingleInfo,
} from "../controller/infoCenter.controller.js";

const router = Router();

router.use(verifyJwt);

router
  .route("/")
  .get(getAllInfos)
  .post(joiValidation(postInfoSchema), addInfos);

router
  .route("/:id")
  .get(joiValidation(deleteInfoSchema), getSingleInfo)
  .patch(joiValidation(updateInfoSchema), editInfo)
  .delete(joiValidation(deleteInfoSchema), deleteInfo);

export { router };
