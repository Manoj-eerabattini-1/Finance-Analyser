export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/smart-financial-goal",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "secret",
    expire: process.env.JWT_EXPIRE || "7d",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },
  llm: {
    openaiKey: process.env.OPENAI_API_KEY,
    geminiKey: process.env.GEMINI_API_KEY,
  },
};
