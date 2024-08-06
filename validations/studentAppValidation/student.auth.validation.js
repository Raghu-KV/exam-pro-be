import Joi from "joi";

export const studentLoginSchema = Joi.object({
  rollNo: Joi.string().required(),
  password: Joi.string().required(),
});
