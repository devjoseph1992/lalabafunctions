// src/app.ts

import express from "express";
import cors from "cors"; // Import cors

import adminRoutes from "./routes/admin";
// import riderRoutes from "./routes/riderRoutes";
import shopOwnerRoutes from "./routes/shopOwnerRoutes";
import logger from "./utils/logger";

const app = express();

// List of allowed origins
const allowedOrigins = [
  "http://localhost:5173", // Development frontend
  "https://your-production-frontend.com", // Replace with your production frontend domain
  // Add other allowed origins as needed
];

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      // Origin is allowed
      callback(null, true);
    } else {
      // Origin is not allowed
      callback(new Error("CORS policy violation: Origin not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // Allow cookies and other credentials
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Middleware to parse JSON requests
app.use(express.json());

// Register routes
app.use("/admin", adminRoutes);
// app.use("/riders", riderRoutes);
app.use("/shopOwners", shopOwnerRoutes);

// Error handling middleware for CORS
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err instanceof Error && err.message.includes("CORS policy")) {
      res.status(403).json({ message: "CORS Error: Access Denied" });
    } else {
      next(err);
    }
  }
);

// General error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("Unhandled Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
);

export default app;
