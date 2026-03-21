import mongoose, { Document, Schema } from "mongoose";

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user ID"],
    },
    role: {
      type: String,
      enum: {
        values: ["user", "assistant"],
        message: "Role must be either 'user' or 'assistant'",
      },
      required: [true, "Please specify role"],
    },
    content: {
      type: String,
      required: [true, "Please provide message content"],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IChat>("Chat", chatSchema);
