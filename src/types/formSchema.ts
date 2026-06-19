import { z } from 'zod';

export const questionTypeSchema = z.enum([
  'TEXT',
  'PARAGRAPH_TEXT',
  'MULTIPLE_CHOICE',
  'CHECKBOX',
  'DROPDOWN',
  'SCALE',
  'DATE',
]);

export const generatedQuestionSchema = z
  .object({
    title: z.string().min(1),
    type: questionTypeSchema,
    required: z.boolean().default(false),
    options: z.array(z.string().min(1)).default([]),
  })
  .superRefine((question, ctx) => {
    if (['MULTIPLE_CHOICE', 'CHECKBOX', 'DROPDOWN'].includes(question.type) && question.options.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: `${question.type} requires options`,
        path: ['options'],
      });
    }
  });

export const generatedFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(''),
  questions: z.array(generatedQuestionSchema).min(1),
});

export type GeneratedForm = z.infer<typeof generatedFormSchema>;
