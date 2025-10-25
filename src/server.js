import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { SERVER_URL, PORT } from "./config/env.config.js";

import countryRoutes from "./routes/countryRoutes.js";
import statusRouter from "./routes/statusRoutes.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: false,
  })
);
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/countries", countryRoutes);
app.use("/status", statusRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Country Currency API",
    endpoints: {
      refresh: `${SERVER_URL}${PORT}/refresh`,
      getCountries: `${SERVER_URL}:${PORT}/countries`,
      getCountry: `${SERVER_URL}:${PORT}/countries/:name`,
      deleteCountry: `${SERVER_URL}:${PORT}/countries/:name`,
      getStatus: `${SERVER_URL}:${PORT}/status`,
      getImage: `${SERVER_URL}:${PORT}/image`,
      health: `${SERVER_URL}:${PORT}/health`,
    },
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler
app.use(/(.*)/, (req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Country Currency API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log("Available routes:");
  console.log("  POST /countries/refresh");
  console.log("  GET  /countries");
  console.log("  GET  /countries/:name");
  console.log("  DELETE /countries/:name");
  console.log("  GET  /status");
  console.log("  GET  /countries/image");
  console.log("  GET  /health");
});

export default app;
