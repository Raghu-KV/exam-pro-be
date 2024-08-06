import Joi from "joi";

export const getSingleTestSchema = Joi.object({
  //on params
  id: Joi.string().required(),
  // on body
});
