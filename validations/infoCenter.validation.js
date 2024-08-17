import Joi from "joi";

export const postInfoSchema = Joi.object({
  // on body
  infoTitle: Joi.string().required(),
  description: Joi.string().required(),
  examTypeId: Joi.string().required(),
});

export const updateInfoSchema = Joi.object({
  //on params
  id: Joi.string().required(),
  // on body
  infoTitle: Joi.string().required(),
  description: Joi.string().required(),
  examTypeId: Joi.string().required(),
});

export const deleteInfoSchema = Joi.object({
  //on params
  id: Joi.string().required(),
  // on body
});
