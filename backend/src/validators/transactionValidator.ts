import { z } from "zod";

export const createTransactionSchema = z.object({
  type: z.enum(["income", "expense"], {
    errorMap: () => ({ message: "Type must be either 'income' or 'expense'" }),
  }),
  amount: z.number().positive("Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
