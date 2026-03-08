import mongoose, { Document, Schema } from "mongoose";

export interface IPlan extends Document {
  userId: mongoose.Types.ObjectId;
  goalId: mongoose.Types.ObjectId;
  requiredMonthlySavings: number;
  feasible: boolean;
  currentMonthlyIncome: number;
  currentMonthlyExpenses: number;
  availableAmount: number;
  suggestion: string;
  alternativeScenarios: Array<{
    scenarioName: string;
    monthlySavings: number;
    adjustmentPercent: number;
    description: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = new Schema<IPlan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user ID"],
    },
    goalId: {
      type: Schema.Types.ObjectId,
      ref: "Goal",
      required: [true, "Please provide a goal ID"],
    },
    requiredMonthlySavings: {
      type: Number,
      required: [true, "Please provide monthly savings requirement"],
      min: [0, "Monthly savings cannot be negative"],
    },
    feasible: {
      type: Boolean,
      default: false,
    },
    currentMonthlyIncome: {
      type: Number,
      required: [true, "Please provide monthly income"],
      min: [0, "Income cannot be negative"],
    },
    currentMonthlyExpenses: {
      type: Number,
      required: [true, "Please provide monthly expenses"],
      min: [0, "Expenses cannot be negative"],
    },
    availableAmount: {
      type: Number,
      default: 0,
    },
    suggestion: {
      type: String,
      trim: true,
    },
    alternativeScenarios: [
      {
        scenarioName: {
          type: String,
          required: true,
        },
        monthlySavings: {
          type: Number,
          required: true,
        },
        adjustmentPercent: {
          type: Number,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IPlan>("Plan", planSchema);
