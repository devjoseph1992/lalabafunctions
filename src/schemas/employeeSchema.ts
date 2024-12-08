import { z } from "zod";

// Base Schema for Common Fields
const userBaseSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().nonempty("First name is required"),
  lastName: z.string().nonempty("Last name is required"),
  profilePicture: z
    .string()
    .url("Profile picture must be a valid URL")
    .optional(),
  address: z.string().nonempty("Address is required"),
  phoneNumber: z
    .string()
    .regex(/^\d{10,11}$/, "Phone number must be 10-11 digits"),
});

// Employee Schema
export const addEmployeeSchema = userBaseSchema.extend({
  sssNumber: z.string().nonempty("SSS number is required"),
  tinNumber: z.string().nonempty("TIN number is required"),
  philhealthNumber: z.string().nonempty("PhilHealth number is required"),
});

// Rider Schema
export const addRiderSchema = userBaseSchema
  .extend({
    sssNumber: z.string().nonempty("SSS number is required"),
    tinNumber: z.string().nonempty("TIN number is required"),
    philhealthNumber: z.string().nonempty("PhilHealth number is required"),
    driverLicenseNumber: z.string().optional(), // Make driver license optional
    plateNumber: z.string().nonempty("Plate number is required"),
    vehicleUnit: z.enum(["motor", "l3", "car", "ebike"]), // Removed invalid second argument
    barangayClearance: z.string().optional(), // Make barangay clearance optional
  })
  .refine(
    (data) => data.driverLicenseNumber || data.barangayClearance, // At least one must be provided
    {
      message:
        "Either 'driverLicenseNumber' or 'barangayClearance' must be provided.",
      path: ["barangayClearance"], // Attach error to barangayClearance
    }
  );

// Shop Owner Schema
export const addShopOwnerSchema = userBaseSchema.extend({
  tinNumber: z.string().nonempty("TIN number is required"),
  dtiSec: z.string().nonempty("DTI/SEC is required"),
});
