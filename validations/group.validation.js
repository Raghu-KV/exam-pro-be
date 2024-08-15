import Joi from "joi";

export const postGroupSchema = Joi.object({
  groupName: Joi.string().required(),
  examTypeId: Joi.string().required(),
});

export const patchGroupSchema = Joi.object({
  //on URl - params
  id: Joi.string().required(),
  // on body
  groupName: Joi.string().required(),
  examTypeId: Joi.string().required(),
});

export const deleteGroupSchema = Joi.object({
  //on URl - params
  id: Joi.string().required(),
  // on body
});
