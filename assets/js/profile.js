import {
  observeAuthState,
  registerUser,
  loginUser,
  handleForgotPassword,
  logoutUser
} from './common.js';

function switchAuthTab(type) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  if (!loginForm || !registerForm || !tabLogin || !tabRegister) return;
  if (type === 'login') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
  }
}

function setProfileState(userDoc) {
  const authContainer = document.getElementById('authContainer');
  const userProfileDisplay = document.getElementById('userProfileDisplay');
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const adminSection = document.getElementById('adminSection');
  if (!authContainer || !userProfileDisplay || !profileName || !profileEmail || !adminSection) return;
  if (userDoc) {
    authContainer.hidden = true;
    userProfileDisplay.hidden = false;
    profileName.textContent = userDoc.name || userDoc.email || 'Utilisateur';
    profileEmail.textContent = userDoc.email || 'email@example.com';
    adminSection.hidden = userDoc.role !== 'admin';
  } else {
    authContainer.hidden = false;
    userProfileDisplay.hidden = true;
  }
}

function initAuthForms() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotLink = document.getElementById('forgotPasswordLink');
  const authLogout = document.getElementById('logoutButton');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = loginForm.querySelector('#loginEmail').value;
      const password = loginForm.querySelector('#loginPassword').value;
      try {
        await loginUser(email, password);
        alert('Connexion réussie.');
      } catch (error) {
        alert('Email ou mot de passe invalide.');
      }
    });
  }
  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = registerForm.querySelector('#regName').value;
      const email = registerForm.querySelector('#regEmail').value;
      const password = registerForm.querySelector('#regPassword').value;
      try {
        await registerUser(email, password, name);
        alert('Compte créé.');
      } catch (error) {
        alert('Erreur : ' + error.message);
      }
    });
  }
  if (forgotLink) {
    forgotLink.addEventListener('click', async (event) => {
      event.preventDefault();
      const email = document.getElementById('loginEmail').value;
      if (!email) {
        alert('Veuillez entrer votre email.');
        return;
      }
      try {
        await handleForgotPassword(email);
        alert('Email de réinitialisation envoyé.');
      } catch (error) {
        alert('Erreur : ' + error.message);
      }
    });
  }
  if (authLogout) {
    authLogout.addEventListener('click', async () => {
      try {
        await logoutUser();
        alert('Déconnecté.');
      } catch (error) {
        alert('Erreur de déconnexion.');
      }
    });
  }
}

function initProfilePage() {
  const loginTab = document.getElementById('tabLogin');
  const registerTab = document.getElementById('tabRegister');
  if (loginTab) {
    loginTab.addEventListener('click', () => switchAuthTab('login'));
  }
  if (registerTab) {
    registerTab.addEventListener('click', () => switchAuthTab('register'));
  }
  switchAuthTab('login');
  initAuthForms();
  observeAuthState(setProfileState);
}

document.addEventListener('DOMContentLoaded', initProfilePage);
