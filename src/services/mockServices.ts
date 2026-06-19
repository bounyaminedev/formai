import type { GeneratedForm } from '../types/formSchema.js';

export function generateMockFormStructure(description: string): GeneratedForm {
  return {
    title: 'Formulaire généré en mode mock',
    description: `Structure simulée pour: ${description}`,
    questions: [
      { title: 'Nom complet', type: 'TEXT', required: true, options: [] },
      { title: 'Email', type: 'TEXT', required: true, options: [] },
      {
        title: 'Quel est votre niveau de satisfaction ?',
        type: 'SCALE',
        required: true,
        options: [],
      },
      {
        title: 'Quels sujets vous intéressent ?',
        type: 'CHECKBOX',
        required: false,
        options: ['Organisation', 'Contenu', 'Logistique', 'Autre'],
      },
      { title: 'Commentaires', type: 'PARAGRAPH_TEXT', required: false, options: [] },
    ],
  };
}

export function createMockFormResponse(structure: GeneratedForm) {
  const mockFormId = `mock-${Date.now()}`;

  return {
    title: structure.title,
    editUrl: `https://docs.google.com/forms/d/${mockFormId}/edit`,
    formUrl: `https://docs.google.com/forms/d/${mockFormId}/viewform`,
  };
}
