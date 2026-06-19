const API_BASE_URL = window.FORMAI_API_BASE_URL || 'http://localhost:3000';

const elements = {
  connect: document.querySelector('#connect-google'),
  status: document.querySelector('#auth-status'),
  description: document.querySelector('#description'),
  generate: document.querySelector('#generate-form'),
  message: document.querySelector('#message'),
};

let userId = localStorage.getItem('formai.userId') || '';

function readAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const auth = params.get('auth');
  const callbackUserId = params.get('userId');
  const message = params.get('message');

  if (auth === 'success' && callbackUserId) {
    userId = callbackUserId;
    localStorage.setItem('formai.userId', userId);
    window.history.replaceState({}, document.title, window.location.pathname);
    showMessage('Connecté. Vous pouvez créer votre formulaire.', 'success');
  }

  if (auth === 'error') {
    window.history.replaceState({}, document.title, window.location.pathname);
    showMessage(`Connexion annulée : ${message || 'autorisation refusée'}.`, 'error');
  }
}

function updateStatus() {
  elements.status.textContent = userId ? `Connecté : ${userId}` : 'Non connecté';
  elements.status.classList.toggle('connected', Boolean(userId));
}

function showMessage(text, type = '') {
  elements.message.textContent = text;
  elements.message.className = `message ${type}`.trim();
}

function clearMessage() {
  elements.message.textContent = '';
  elements.message.className = 'message hidden';
}

function setLoading(isLoading) {
  elements.generate.disabled = isLoading;
  elements.generate.classList.toggle('loading', isLoading);
  elements.generate.querySelector('.button-label').textContent = isLoading ? 'Création…' : 'Créer le formulaire';
}

async function generateForm() {
  clearMessage();

  if (!userId) {
    showMessage('Connectez-vous avec Google avant de continuer.', 'error');
    return;
  }

  const description = elements.description.value.trim();
  if (description.length < 10) {
    showMessage('Ajoutez une description un peu plus détaillée.', 'error');
    return;
  }

  setLoading(true);
  showMessage('Création du formulaire…');

  try {
    const response = await fetch(`${API_BASE_URL}/forms/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, description }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || 'Impossible de créer le formulaire.');
    }

    window.location.href = payload.editUrl || payload.formUrl;
  } catch (error) {
    showMessage(error instanceof Error ? error.message : 'Erreur inattendue.', 'error');
    setLoading(false);
  }
}

readAuthCallback();
updateStatus();
elements.connect.addEventListener('click', () => {
  window.location.href = `${API_BASE_URL}/auth/google`;
});
elements.generate.addEventListener('click', generateForm);
