import mongoose, { Document, Schema } from "mongoose";

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  goalTitle: string;
  targetAmount: number;
  deadline: Date;
  currentSavings: number;
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new Schema<IGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user ID"],
    },
    goalTitle: {
      type: String,
      required: [true, "Please provide a goal title"],
      trim: true,
      minlength: [3, "Goal title must be at least 3 characters"],
      maxlength: [200, "Goal title cannot exceed 200 characters"],
    },
    targetAmount: {
      type: Number,
      required: [true, "Please provide a target amount"],
      min: [0, "Target amount must be greater than 0"],
    },
    deadline: {
      type: Date,
      required: [true, "Please provide a deadline"],
      validate: {
        validator: function (value: Date) {
          return value > new Date();
        },
        message: "Deadline must be in the future",
      },
    },
    currentSavings: {
      type: Number,
      default: 0,
      min: [0, "Current savings cannot be negative"],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IGoal>("Goal", goalSchema);
