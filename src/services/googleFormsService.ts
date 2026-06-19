import { forms_v1, google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import type { GeneratedForm } from '../types/formSchema.js';
import { logger } from '../utils/logger.js';

const BATCH_SIZE = 50;
function questionItem(q: GeneratedForm['questions'][number], index: number): forms_v1.Schema$Request {
  const base: forms_v1.Schema$Question = { required: q.required };
  if (q.type === 'TEXT' || q.type === 'PARAGRAPH_TEXT') base.textQuestion = { paragraph: q.type === 'PARAGRAPH_TEXT' };
  if (q.type === 'MULTIPLE_CHOICE' || q.type === 'CHECKBOX' || q.type === 'DROPDOWN') base.choiceQuestion = { type: q.type === 'CHECKBOX' ? 'CHECKBOX' : q.type === 'DROPDOWN' ? 'DROP_DOWN' : 'RADIO', options: q.options.map((value) => ({ value })), shuffle: false };
  if (q.type === 'SCALE') base.scaleQuestion = { low: 1, high: 5, lowLabel: '1', highLabel: '5' };
  if (q.type === 'DATE') base.dateQuestion = { includeTime: false, includeYear: true };
  return { createItem: { item: { title: q.title, questionItem: { question: base } }, location: { index } } };
}
export async function createGoogleForm(auth: OAuth2Client, structure: GeneratedForm) {
  const forms = google.forms({ version: 'v1', auth });
  logger.info({ title: structure.title, questions: structure.questions.length }, 'Creating Google Form');
  const created = await forms.forms.create({ requestBody: { info: { title: structure.title } } });
  const formId = created.data.formId;
  if (!formId) throw new Error('Google Forms API did not return formId');
  await forms.forms.batchUpdate({ formId, requestBody: { requests: [{ updateFormInfo: { info: { description: structure.description }, updateMask: 'description' } }] } });
  for (let start = 0; start < structure.questions.length; start += BATCH_SIZE) {
    await forms.forms.batchUpdate({ formId, requestBody: { requests: structure.questions.slice(start, start + BATCH_SIZE).map((q, i) => questionItem(q, start + i)) } });
  }
  // Required for Forms created via API after 2026-06-30 per Google Forms API changes.
  await forms.forms.setPublishSettings({ formId, requestBody: { publishSettings: { publishState: { isPublished: true, isAcceptingResponses: true } }, updateMask: 'publishSettings.publishState' } });
  const finalForm = await forms.forms.get({ formId });
  return { title: structure.title, editUrl: `https://docs.google.com/forms/d/${formId}/edit`, formUrl: finalForm.data.responderUri ?? `https://docs.google.com/forms/d/${formId}/viewform` };
}
