import mongoose, { Schema } from "mongoose";
import { districtList } from "@/lib/validators/student";

const NameSchema = new Schema(
  {
    first: { type: String, required: true, trim: true },
    middle: { type: String, trim: true },
    last: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, enum: districtList, required: true }
  },
  { _id: false }
);

const StudentSchema = new Schema(
  {
    studentCode: { type: String, required: true, unique: true },
    name: { type: NameSchema, required: true },
    birthDate: { type: Date, required: true },
    address: { type: AddressSchema, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

StudentSchema.index({ studentCode: 1 }, { unique: true });
StudentSchema.index({ email: 1 }, { unique: true, sparse: true });
StudentSchema.index({ "address.district": 1 });
StudentSchema.index({ deletedAt: 1 });
StudentSchema.index({
  "name.first": "text",
  "name.last": "text",
  studentCode: "text",
  "address.city": "text"
});

export type StudentDocument = mongoose.InferSchemaType<typeof StudentSchema>;

const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);

export default Student;
