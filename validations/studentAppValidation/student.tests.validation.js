import Joi from "joi";

export const getSingleTestSchema = Joi.object({
  //on params
  id: Joi.string().required(),
  // on body
});

export const postAnswerScheme = Joi.object({
  //on params
  id: Joi.string().required(),
  // on body
  answers: Joi.array()
    .items(
      Joi.object({
        answerId: Joi.number().valid(0, 1, 2, 3).required(),
        questionId: Joi.string().required(),
      })
    )
    .min(0),
});
