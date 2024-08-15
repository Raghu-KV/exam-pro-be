import { Router } from "express";
import { verifyJwt } from "./../middleware/verifyJwt.js";
import { joiValidation } from "../middleware/joiValidation.js";
import {
  deleteGroupSchema,
  patchGroupSchema,
  postGroupSchema,
} from "./../validations/group.validation.js";
import {
  addGroup,
  deleteGroup,
  editGroup,
  getAllGroups,
  getAllGroupsWithNoPagination,
  getSingleGroupView,
  getSinglGroup,
} from "../controller/group.controller.js";

const router = Router();

router.use(verifyJwt);

router
  .route("/")
  .get(getAllGroups)
  .post(joiValidation(postGroupSchema), addGroup);

router.route("/all").get(getAllGroupsWithNoPagination);

router
  .route("/view/:id")
  .get(joiValidation(deleteGroupSchema), getSingleGroupView);

router
  .route("/:id")
  .get(getSinglGroup)
  .patch(joiValidation(patchGroupSchema), editGroup)
  .delete(joiValidation(deleteGroupSchema), deleteGroup);

export { router };
