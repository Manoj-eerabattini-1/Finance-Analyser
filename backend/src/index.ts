import "dotenv/config.js";
import "express-async-errors";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import plannerRoutes from "./routes/plannerRoutes.js";
import reportsRoutes from "./routes/reportsRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));

app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/reports", reportsRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
