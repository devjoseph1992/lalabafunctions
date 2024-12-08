import { Request, Response, NextFunction } from "express";
import { admin } from "../utils/firebase"; // Assuming admin is exported from firebase.ts

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
    res.status(401).send({ message: "Unauthorized: Missing or invalid token" });
    return; // Exit function
  }

  const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

  try {
    // Verify the token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Attach the decoded token to the request object
    req.user = decodedToken;

    // Optionally log the decoded token for debugging
    console.log("Decoded Token:", decodedToken);

    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    console.error("Error verifying token:", error); // Log the error for debugging
    res.status(401).send({ message: "Unauthorized: Invalid or expired token" });
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

    if (!user || !roles.includes(user.role)) {
      res.status(403).send({ message: "Forbidden: Insufficient permissions" });
      return;
    }

    next(); // Pass control to the next middleware or route handler
  };
