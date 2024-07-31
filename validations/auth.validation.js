import Joi from "joi";

export const userLoginSchema = Joi.object({
  phoneNo: Joi.string().required(),
  password: Joi.string().required(),
});
