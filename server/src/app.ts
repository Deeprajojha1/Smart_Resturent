import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

const app = express();

// Allow our React frontend to talk to this backend
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Convert incoming JSON requests to JavaScript objects
app.use(express.json());
app.use(cookieParser());

// Mount all API routes under /api
app.use("/api", routes);

// Handle errors
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
