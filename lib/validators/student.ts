import { z } from "zod";

export const districtList = [
  "Central",
  "North",
  "South",
  "East",
  "West",
  "North East",
  "North West",
  "South East",
  "South West",
  "Coastal"
] as const;

export type District = (typeof districtList)[number];

const alphaRegex = /^[A-Za-z]+$/;

const nameSchema = z.object({
  first: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be at most 50 characters")
    .regex(alphaRegex, "Alphabets only"),
  middle: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .regex(alphaRegex, "Alphabets only")
    ])
    .optional(),
  last: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be at most 50 characters")
    .regex(alphaRegex, "Alphabets only")
});

const addressSchema = z.object({
  line1: z
    .string()
    .trim()
    .min(5, "Address line 1 must be at least 5 characters"),
  line2: z.union([z.literal(""), z.string().trim().max(100, "Address line 2 is too long")]).optional(),
  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters")
    .regex(alphaRegex, "Alphabets only"),
  district: z.enum(districtList)
});

const birthDateSchema = z
  .string()
  .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime()), "Invalid birth date")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }, "Birth date must be in the past");

export const studentFormSchema = z.object({
  name: nameSchema,
  birthDate: birthDateSchema,
  address: addressSchema,
  contactNumber: z.string().regex(/^\d{10}$/, "Contact number must be exactly 10 digits"),
  email: z.union([z.literal(""), z.string().trim().email("Invalid email")]).optional()
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
export const studentCreateSchema = studentFormSchema;
export type StudentCreateInput = StudentFormValues;
export const studentUpdateSchema = studentFormSchema.deepPartial();
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;
