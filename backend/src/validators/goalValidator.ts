import { z } from "zod";

export const createGoalSchema = z.object({
  goalTitle: z.string().min(3, "Goal title must be at least 3 characters").max(200),
  targetAmount: z.number().positive("Target amount must be greater than 0"),
  deadline: z.string().datetime("Deadline must be a valid date"),
  currentSavings: z.number().min(0, "Current savings cannot be negative").optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
