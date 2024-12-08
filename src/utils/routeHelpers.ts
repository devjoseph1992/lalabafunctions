import { Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";
import logger from "./logger";

/**
 * A helper function to handle creation logic for entities like riders and shop owners.
 * @param req - Express request object.
 * @param res - Express response object.
 * @param schema - Zod schema for validating the request body.
 * @param serviceFunction - Service function to handle creation logic.
 * @param entityName - Name of the entity being created (e.g., "Rider", "Shop Owner").
 */
export const handleAddEntity = async (
  req: Request,
  res: Response,
  schema: ZodSchema<any>,
  serviceFunction: (data: any) => Promise<string>,
  entityName: string
): Promise<void> => {
  try {
    // Validate request body using the provided schema
    const validatedData = schema.parse(req.body);
    logger.info(`Validated data for adding ${entityName}:`, validatedData);

    // Pass the validated data to the service layer
    const uid = await serviceFunction(validatedData);

    res.status(201).send({
      message: `${entityName} with UID ${uid} added successfully.`,
      uid,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      // Handle Zod validation errors
      res.status(400).send({
        message: "Validation Error",
        errors: error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    } else if (error instanceof Error) {
      logger.error(`Error adding ${entityName}:`, error);
      res.status(500).send({
        message: error.message,
      });
    } else {
      logger.error(`Unknown error adding ${entityName}:`, error);
      res.status(500).send({
        message: "Unknown error occurred",
      });
    }
  }
};
