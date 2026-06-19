import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { generateFormStructure } from '../services/geminiService.js';
import { authorizedClientForUser } from '../services/googleAuthService.js';
import { createGoogleForm } from '../services/googleFormsService.js';

export const formsRoutes = Router();

const bodySchema = z.object({
  description: z.string().min(10),
  userId: z.string().min(1),
});

formsRoutes.post('/generate', async (req, res, next) => {
  try {
    const body = bodySchema.parse(req.body);
    const auth = env.MOCK_EXTERNAL_APIS ? null : await authorizedClientForUser(body.userId);
    const structure = await generateFormStructure(body.description);
    const result = await createGoogleForm(auth, structure);

    res.json(result);
  } catch (error) {
    next(error);
  }
});
