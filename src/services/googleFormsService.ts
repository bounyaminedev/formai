import { forms_v1, google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import type { GeneratedForm } from '../types/formSchema.js';
import { logger } from '../utils/logger.js';

const BATCH_SIZE = 50;

function choiceType(type: GeneratedForm['questions'][number]['type']) {
  if (type === 'CHECKBOX') return 'CHECKBOX';
  if (type === 'DROPDOWN') return 'DROP_DOWN';
  return 'RADIO';
}

function toFormsQuestion(question: GeneratedForm['questions'][number]): forms_v1.Schema$Question {
  const formsQuestion: forms_v1.Schema$Question = { required: question.required };

  if (question.type === 'TEXT' || question.type === 'PARAGRAPH_TEXT') {
    formsQuestion.textQuestion = { paragraph: question.type === 'PARAGRAPH_TEXT' };
  }

  if (['MULTIPLE_CHOICE', 'CHECKBOX', 'DROPDOWN'].includes(question.type)) {
    formsQuestion.choiceQuestion = {
      type: choiceType(question.type),
      options: question.options.map((value) => ({ value })),
      shuffle: false,
    };
  }

  if (question.type === 'SCALE') {
    formsQuestion.scaleQuestion = { low: 1, high: 5, lowLabel: '1', highLabel: '5' };
  }

  if (question.type === 'DATE') {
    formsQuestion.dateQuestion = { includeTime: false, includeYear: true };
  }

  return formsQuestion;
}

function createQuestionRequest(question: GeneratedForm['questions'][number], index: number): forms_v1.Schema$Request {
  return {
    createItem: {
      item: {
        title: question.title,
        questionItem: { question: toFormsQuestion(question) },
      },
      location: { index },
    },
  };
}

export async function createGoogleForm(auth: OAuth2Client, structure: GeneratedForm) {
  const forms = google.forms({ version: 'v1', auth });
  logger.info({ title: structure.title, questions: structure.questions.length }, 'Creating Google Form');

  const created = await forms.forms.create({ requestBody: { info: { title: structure.title } } });
  const formId = created.data.formId;
  if (!formId) {
    throw new Error('Google Forms API did not return formId');
  }

  await forms.forms.batchUpdate({
    formId,
    requestBody: {
      requests: [
        {
          updateFormInfo: {
            info: { description: structure.description },
            updateMask: 'description',
          },
        },
      ],
    },
  });

  for (let start = 0; start < structure.questions.length; start += BATCH_SIZE) {
    const questionsBatch = structure.questions.slice(start, start + BATCH_SIZE);
    await forms.forms.batchUpdate({
      formId,
      requestBody: {
        requests: questionsBatch.map((question, index) => createQuestionRequest(question, start + index)),
      },
    });
  }

  // Required for Forms created via API after 2026-06-30 per Google Forms API changes.
  await forms.forms.setPublishSettings({
    formId,
    requestBody: {
      publishSettings: {
        publishState: { isPublished: true, isAcceptingResponses: true },
      },
      updateMask: 'publishSettings.publishState',
    },
  });

  const finalForm = await forms.forms.get({ formId });

  return {
    title: structure.title,
    editUrl: `https://docs.google.com/forms/d/${formId}/edit`,
    formUrl: finalForm.data.responderUri ?? `https://docs.google.com/forms/d/${formId}/viewform`,
  };
}
