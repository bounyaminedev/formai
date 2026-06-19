const API_BASE_URL = window.FORMAI_API_BASE_URL || 'http://localhost:3000';

const templates = {
  inscription:
    'Crée un formulaire d’inscription professionnel pour un atelier TypeScript avec nom, email, entreprise, niveau actuel, choix de créneau, besoins particuliers et commentaires libres.',
  satisfaction:
    'Crée un sondage de satisfaction client clair avec note globale, qualité du service, rapidité, probabilité de recommandation, points forts et axes d’amélioration.',
  evenement:
    'Crée un questionnaire pour organiser un événement d’équipe avec disponibilités, régime alimentaire, activité préférée, contraintes de transport et remarques logistiques.',
};

const elements = {
  connectGoogle: document.querySelector('#connect-google'),
  heroConnect: document.querySelector('#hero-connect'),
  authAction: document.querySelector('#auth-action'),
  authStatus: document.querySelector('#auth-status'),
  authHelper: document.querySelector('#auth-helper'),
  description: document.querySelector('#description'),
  generateForm: document.querySelector('#generate-form'),
  messageCard: document.querySelector('#message-card'),
};

let currentUserId = localStorage.getItem('formai.userId') || '';

function readAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const auth = params.get('auth');
  const userId = params.get('userId');
  const message = params.get('message');

  if (auth === 'success' && userId) {
    currentUserId = userId;
    localStorage.setItem('formai.userId', userId);
    window.history.replaceState({}, document.title, window.location.pathname);
    showMessage('Vous êtes connecté. Décrivez maintenant le formulaire à créer.', 'success');
  }

  if (auth === 'error') {
    window.history.replaceState({}, document.title, window.location.pathname);
    showMessage(`Connexion Google interrompue : ${message || 'autorisation refusée'}.`, 'error');
  }
}

function updateAuthUi() {
  const isConnected = Boolean(currentUserId);
  elements.authStatus.textContent = isConnected ? 'Connecté avec Google' : 'Non connecté';
  elements.authStatus.classList.toggle('connected', isConnected);
  elements.authHelper.textContent = isConnected
    ? `Votre formulaire sera créé dans le Drive de ${currentUserId}.`
    : 'Connectez-vous avec Google pour créer le formulaire directement dans votre Drive.';
  elements.authAction.textContent = isConnected ? 'Changer de compte' : 'Se connecter';
}

function connectGoogle() {
  window.location.href = `${API_BASE_URL}/auth/google`;
}

function setTemplate(name) {
  elements.description.value = templates[name];
  elements.description.focus();
}

function showMessage(message, type = 'info') {
  elements.messageCard.textContent = message;
  elements.messageCard.className = `message-card ${type}`;
}

function clearMessage() {
  elements.messageCard.className = 'message-card hidden';
  elements.messageCard.textContent = '';
}

function setLoading(isLoading) {
  elements.generateForm.disabled = isLoading;
  elements.generateForm.classList.toggle('loading', isLoading);
  elements.generateForm.querySelector('.button-label').textContent = isLoading
    ? 'Création du formulaire…'
    : 'Créer mon formulaire';
}

async function generateForm() {
  clearMessage();

  if (!currentUserId) {
    showMessage('Connectez-vous avec Google avant de créer votre formulaire.', 'error');
    return;
  }

  const description = elements.description.value.trim();
  if (description.length < 10) {
    showMessage('Décrivez votre besoin en quelques mots supplémentaires.', 'error');
    return;
  }

  setLoading(true);
  showMessage('FormAI prépare votre formulaire. Vous serez redirigé automatiquement dès qu’il sera prêt.', 'info');

  try {
    const response = await fetch(`${API_BASE_URL}/forms/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUserId, description }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || `Impossible de créer le formulaire (${response.status}).`);
    }

    const destination = payload.editUrl || payload.formUrl;
    if (!destination) {
      throw new Error('Le formulaire a été créé, mais aucun lien Google Forms n’a été retourné.');
    }

    showMessage('Formulaire créé. Redirection vers Google Forms…', 'success');
    window.location.href = destination;
  } catch (error) {
    showMessage(error instanceof Error ? error.message : 'Une erreur inattendue est survenue.', 'error');
    setLoading(false);
  }
}

readAuthCallback();
updateAuthUi();
elements.connectGoogle.addEventListener('click', connectGoogle);
elements.heroConnect.addEventListener('click', connectGoogle);
elements.authAction.addEventListener('click', connectGoogle);
elements.generateForm.addEventListener('click', generateForm);
document.querySelectorAll('[data-template]').forEach((button) => {
  button.addEventListener('click', () => setTemplate(button.dataset.template));
});
