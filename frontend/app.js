const templates = {
  inscription:
    'Crée un formulaire d’inscription pour un atelier TypeScript avec nom, email, niveau actuel, préférences horaires, besoins particuliers et commentaires libres.',
  satisfaction:
    'Crée un sondage de satisfaction client après achat avec note globale, qualité du produit, expérience de livraison, probabilité de recommandation et suggestions.',
  evenement:
    'Crée un questionnaire pour organiser un événement d’équipe avec disponibilités, régime alimentaire, activité préférée, taille de groupe et remarques logistiques.',
};

const elements = {
  apiBaseUrl: document.querySelector('#api-base-url'),
  userId: document.querySelector('#user-id'),
  description: document.querySelector('#description'),
  saveSettings: document.querySelector('#save-settings'),
  connectGoogle: document.querySelector('#connect-google'),
  fillDemo: document.querySelector('#fill-demo'),
  generateForm: document.querySelector('#generate-form'),
  resultCard: document.querySelector('#result-card'),
  emptyState: document.querySelector('#empty-state'),
  errorCard: document.querySelector('#error-card'),
  titleValue: document.querySelector('#result-title-value'),
  editLink: document.querySelector('#edit-link'),
  formLink: document.querySelector('#form-link'),
  toast: document.querySelector('#toast'),
};

function loadSettings() {
  elements.apiBaseUrl.value = localStorage.getItem('formai.apiBaseUrl') || elements.apiBaseUrl.value;
  elements.userId.value = localStorage.getItem('formai.userId') || '';
}

function saveSettings() {
  localStorage.setItem('formai.apiBaseUrl', elements.apiBaseUrl.value.trim());
  localStorage.setItem('formai.userId', elements.userId.value.trim());
  showToast('Paramètres sauvegardés.');
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.remove('hidden');
  window.setTimeout(() => elements.toast.classList.add('hidden'), 2800);
}

function setTemplate(name) {
  elements.description.value = templates[name];
  elements.description.focus();
}

function setLoading(isLoading) {
  elements.generateForm.disabled = isLoading;
  elements.generateForm.classList.toggle('loading', isLoading);
  elements.generateForm.querySelector('.button-label').textContent = isLoading
    ? 'Génération en cours…'
    : 'Générer le Google Form';
}

function showError(message) {
  elements.errorCard.textContent = message;
  elements.errorCard.classList.remove('hidden');
}

function clearResult() {
  elements.errorCard.classList.add('hidden');
  elements.resultCard.classList.add('hidden');
  elements.emptyState.classList.remove('hidden');
}

function showResult(result) {
  elements.titleValue.textContent = result.title || 'Formulaire généré';
  elements.editLink.href = result.editUrl;
  elements.formLink.href = result.formUrl;
  elements.emptyState.classList.add('hidden');
  elements.errorCard.classList.add('hidden');
  elements.resultCard.classList.remove('hidden');
}

async function generateForm() {
  const apiBaseUrl = elements.apiBaseUrl.value.trim().replace(/\/$/, '');
  const userId = elements.userId.value.trim();
  const description = elements.description.value.trim();

  clearResult();

  if (!apiBaseUrl || !userId || description.length < 10) {
    showError('Renseignez une URL API, un User ID et une description d’au moins 10 caractères.');
    return;
  }

  saveSettings();
  setLoading(true);

  try {
    const response = await fetch(`${apiBaseUrl}/forms/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, description }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || `Erreur API (${response.status})`);
    }

    showResult(payload);
    showToast('Formulaire créé avec succès.');
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Erreur inconnue pendant la génération.');
  } finally {
    setLoading(false);
  }
}

function connectGoogle() {
  const apiBaseUrl = elements.apiBaseUrl.value.trim().replace(/\/$/, '');
  if (!apiBaseUrl) {
    showError('Renseignez d’abord l’URL de l’API.');
    return;
  }
  saveSettings();
  window.open(`${apiBaseUrl}/auth/google`, '_blank', 'noopener,noreferrer');
}

loadSettings();
elements.saveSettings.addEventListener('click', saveSettings);
elements.connectGoogle.addEventListener('click', connectGoogle);
elements.fillDemo.addEventListener('click', () => setTemplate('inscription'));
elements.generateForm.addEventListener('click', generateForm);
document.querySelectorAll('[data-template]').forEach((button) => {
  button.addEventListener('click', () => setTemplate(button.dataset.template));
});
