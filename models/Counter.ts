import mongoose, { Schema } from "mongoose";

const CounterSchema = new Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
  },
  { timestamps: false }
);

export type CounterDocument = mongoose.InferSchemaType<typeof CounterSchema>;

const Counter = mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

export default Counter;
