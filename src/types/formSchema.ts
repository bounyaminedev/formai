import { z } from 'zod';

export const questionTypeSchema = z.enum(['TEXT', 'PARAGRAPH_TEXT', 'MULTIPLE_CHOICE', 'CHECKBOX', 'DROPDOWN', 'SCALE', 'DATE']);
export const generatedQuestionSchema = z.object({
  title: z.string().min(1),
  type: questionTypeSchema,
  required: z.boolean().default(false),
  options: z.array(z.string().min(1)).default([]),
}).superRefine((q, ctx) => {
  if (['MULTIPLE_CHOICE', 'CHECKBOX', 'DROPDOWN'].includes(q.type) && q.options.length === 0) ctx.addIssue({ code: 'custom', message: `${q.type} requires options`, path: ['options'] });
});
export const generatedFormSchema = z.object({ title: z.string().min(1), description: z.string().default(''), questions: z.array(generatedQuestionSchema).min(1) });
export type GeneratedForm = z.infer<typeof generatedFormSchema>;
