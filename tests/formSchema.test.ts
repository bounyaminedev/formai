import { describe, expect, it } from 'vitest';
import { generatedFormSchema } from '../src/types/formSchema.js';

describe('generatedFormSchema', () => {
  it('accepts a valid form', () => {
    expect(() => generatedFormSchema.parse({
      title: 'Inscription',
      description: 'Atelier',
      questions: [{ title: 'Nom', type: 'TEXT', required: true, options: [] }],
    })).not.toThrow();
  });

  it('rejects choice questions without options', () => {
    expect(() => generatedFormSchema.parse({
      title: 'Sondage',
      description: '',
      questions: [{ title: 'Choix', type: 'MULTIPLE_CHOICE', required: true, options: [] }],
    })).toThrow();
  });
});
