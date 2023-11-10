import Joi from "joi";

export const joiSchemaSignup = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required().lowercase(),
  password: Joi.string().min(2),
});

export const joiSchemaLogin = Joi.object({
  email: Joi.string().email().required().lowercase(),
  password: Joi.string().min(2),
});
