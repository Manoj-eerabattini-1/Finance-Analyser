import mongoose, { Document, Schema } from "mongoose";

export interface IReport extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  period: {
    start: string;
    end: string;
  };
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  goalProgress: number;
  scenarios: {
    period: string;
    amount: number;
    projectedSavings: number;
    timeToGoal: string;
  }[];
  insights: string[];
  createdAt: Date;
}

const ReportSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    period: {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
    totalIncome: { type: Number, required: true },
    totalExpenses: { type: Number, required: true },
    netSavings: { type: Number, required: true },
    goalProgress: { type: Number, required: true },
    scenarios: [{
      period: String,
      amount: Number,
      projectedSavings: Number,
      timeToGoal: String,
    }],
    insights: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IReport>("Report", ReportSchema);
