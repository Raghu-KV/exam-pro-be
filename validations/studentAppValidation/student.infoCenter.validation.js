import Joi from "joi";

export const getInfoSchema = Joi.object({
  //on params
  id: Joi.string().required(),
  // on body
});
