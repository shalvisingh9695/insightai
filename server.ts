import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db.js";

import uploadRouter, { uploadMiddleware } from "./uploadRoute.js";
import { register, login } from "./authController.js";
import { authMiddleware, optionalAuthMiddleware } from "./authMiddleware.js";

import {
  uploadResume,
  getLatestResume,
  handleChatQuery,
  handleATSScore,
  handleResumeRewrite,
  handleKeywordGap,
} from "./resumeController.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middlewares
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ✅ Connect DB
connectDB();

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "InsightAI Backend",
    time: new Date().toISOString(),
  });
});

// ================= AUTH =================
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);

// ================= RESUME =================
app.post(
  "/api/resume/upload",
  optionalAuthMiddleware,
  uploadMiddleware,
  uploadResume
);

app.get("/api/resume/latest", optionalAuthMiddleware, getLatestResume);

// ================= CHAT (RAG) =================
app.post("/api/chat", optionalAuthMiddleware, handleChatQuery);

// ================= ATS =================
app.post("/api/ats/score", handleATSScore);

// ================= REWRITE =================
app.post("/api/resume/rewrite", handleResumeRewrite);

// ================= KEYWORD GAP =================
app.post("/api/resume/keyword-gap", handleKeywordGap);

// ================= ROUTER =================
app.use("/api/resume", uploadRouter);

// ✅ START SERVER
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});