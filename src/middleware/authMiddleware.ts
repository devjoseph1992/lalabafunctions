import { Request, Response, NextFunction } from "express";
import { admin } from "../utils/firebase";
import logger from "../utils/logger";

// Extend the Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken; // Attach decoded Firebase token type
    }
  }
}

/**
 * Middleware to verify Firebase ID token
 */
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  // Check if the authorization header exists and has a valid Bearer token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn("Missing or invalid Authorization header");
    res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
    return;
  }

  const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

  try {
    // Verify the token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Log the decoded token for debugging
    logger.info("Decoded Token:", JSON.stringify(decodedToken, null, 2));

    // Attach the decoded token to the request object
    req.user = decodedToken;

    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    logger.error("Error verifying token:", error);

    if (error instanceof Error) {
      if (error.message.includes("auth/id-token-expired")) {
        res.status(401).json({ message: "Unauthorized: Token has expired" });
        return;
      } else if (error.message.includes("auth/argument-error")) {
        res
          .status(400)
          .json({ message: "Unauthorized: Malformed or invalid token" });
        return;
      } else {
        res
          .status(401)
          .json({ message: "Unauthorized: Invalid or expired token" });
        return;
      }
    }

    // Handle non-standard errors
    res.status(401).json({ message: "Unauthorized: Unknown error occurred" });
    return;
  }
};

/**
 * Middleware to restrict access to specific roles
 * @param roles - Allowed roles (e.g., 'admin', 'employee')
 */
export const restrictToRoles =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      logger.warn("No user information found in request");
      res
        .status(403)
        .json({ message: "Forbidden: No user information available" });
      return;
    }

    const userRole = user.role; // Extract role from custom claims

    if (!userRole) {
      logger.warn("User does not have a 'role' field in the token");
      res.status(403).json({
        message: "Forbidden: User role not assigned in custom claims",
      });
      return;
    }

    logger.info(`User role: ${userRole}, Allowed roles: ${roles.join(", ")}`);

    if (!roles.includes(userRole)) {
      logger.warn(`Access denied. User role: ${userRole}`);
      res
        .status(403)
        .json({ message: "Forbidden: You do not have the required access." });
      return;
    }

    next(); // Pass control to the next middleware or route handler
  };
