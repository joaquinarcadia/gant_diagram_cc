import { z } from "zod";

export const StoryFormSchema = z
    .object({
        title: z.string().min(2).max(100),
        epic: z.preprocess((val) => val || undefined, z.string().min(2).max(100).optional()),
        minSP: z.coerce.number().min(1, "SP must be at least 1").max(8, "SP must be at most 8"),
        maxSP: z.coerce.number().min(1, "SP must be at least 1").max(8, "SP must be at most 8"),
        dependencies: z.array(z.string()).optional(),
        priority: z.enum(["Low", "Medium", "High"]).optional(),
    })
    .refine((data) => data.minSP <= data.maxSP, {
        message: "Max SP must be greater than or equal to Min SP",
        path: ["maxSP"],
    });

export type StoryFormValues = z.infer<typeof StoryFormSchema>;
