import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user ID"],
    },
    type: {
      type: String,
      enum: {
        values: ["income", "expense"],
        message: "Type must be either 'income' or 'expense'",
      },
      required: [true, "Please specify transaction type"],
    },
    amount: {
      type: Number,
      required: [true, "Please provide an amount"],
      min: [0, "Amount must be greater than 0"],
    },
    category: {
      type: String,
      required: [true, "Please provide a category"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>("Transaction", transactionSchema);
