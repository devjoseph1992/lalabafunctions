import { Request } from "express";
import { DecodedIdToken } from "firebase-admin/auth";

declare module "express-serve-static-core" {
  interface Request {
    user?: DecodedIdToken; // Extend the Request type with the user property
  }
}