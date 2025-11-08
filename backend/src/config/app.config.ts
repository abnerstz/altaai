export const appConfig = () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cookie: {
    secret: process.env.COOKIE_SECRET,
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
  },
});

