import Counter from "@/models/Counter";
import { connectToDatabase } from "@/lib/db";

export async function getNextStudentCode() {
  await connectToDatabase();

  const counter = await Counter.findOneAndUpdate(
    { _id: "student" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const nextValue = counter.seq ?? 1;
  return `STU_${String(nextValue).padStart(4, "0")}`;
}
