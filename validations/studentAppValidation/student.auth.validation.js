import Joi from "joi";

export const studentLoginSchema = Joi.object({
  rollNo: Joi.string().required(),
  password: Joi.string().required(),
});

export const changePasswordScheme = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required().min(8),
});
