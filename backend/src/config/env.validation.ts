import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required().min(32),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  FRONTEND_URL: Joi.string().uri().required(),
  RESEND_API_KEY: Joi.string().optional(),
  EMAIL_FROM: Joi.string().email().optional(),
  COOKIE_SECRET: Joi.string().optional(),
});

