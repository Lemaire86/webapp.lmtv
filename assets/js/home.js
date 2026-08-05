import {
  CHANNELS,
  getChannelById,
  getFavoriteIds,
  getStoredFavorites,
  toggleFavorite,
  observeAuthState,
  registerUser,
  loginUser,
  handleForgotPassword,
  logoutUser
} from './common.js';

const HERO_SLIDES = [
  { label: 'LMTV', title: 'Le meilleur du divertissement', desc: 'En direct · Partout · Pour vous', image: 'assets/images/lmtv.png', logo: 'assets/images/lmtv.png', accent: '#ff2f5e' },
  { label: 'Trace Ayiti', title: 'Musique et culture haïtienne', desc: 'Les hits du moment et l’actualité locale', image: 'assets/images/traceayiti.png', logo: 'assets/images/traceayiti.png', accent: '#2b6bff' },
  { label: 'Trace Caribbean', title: 'Les rythmes des Caraïbes', desc: 'Musiques, spectacles et énergie non-stop', image: 'assets/images/tracecaribbean.png', logo: 'assets/images/tracecaribbean.png', accent: '#ffb32f' },
  { label: 'Trace Latina', title: 'La vibe latine', desc: 'Séries, clips et émissions latino-américaines', image: 'assets/images/tracelatina.png', logo: 'assets/images/tracelatina.png', accent: '#ff2fd1' },
  { label: 'C Star', title: 'Nouveautés cinéma et séries', desc: 'Votre catalogue en replay et à la demande', image: 'assets/images/cstar.png', logo: 'assets/images/cstar.png', accent: '#ffd400' },
  { label: 'HMI Promz News', title: 'Infos en continu', desc: 'Dernières nouvelles d’Haïti et de la région', image: 'assets/images/hmiprodz.png', logo: 'assets/images/hmiprodz.png', accent: '#ff2f3d' }
];

function setHeroSlide(index) {
  const slide = HERO_SLIDES[index];
  const title = document.getElementById('heroTitle');
  const desc = document.getElementById('heroDesc');
  const eyebrow = document.getElementById('heroEyebrowText');
  const cta = document.getElementById('heroCtaText');
  const heroBg = document.getElementById('heroBg');
  const heroLogo = document.getElementById('heroLogo');
  const heroSection = document.getElementById('heroSection');
  if (title) title.innerHTML = `Le meilleur<br><span>${slide.label}</span>`;
  if (desc) desc.textContent = slide.desc;
  if (eyebrow) eyebrow.textContent = slide.label;
  if (cta) cta.textContent = 'Regarder en direct';
  if (heroBg) heroBg.src = slide.image || 'assets/hero-art.jpg';
  if (heroLogo) heroLogo.src = slide.logo || 'assets/logo.png';
  if (heroSection && slide.accent) {
    heroSection.style.setProperty('--hero-accent', slide.accent);
  }
  document.querySelectorAll('.hero-dots button').forEach((btn, btnIndex) => {
    btn.classList.toggle('active', btnIndex === index);
    btn.setAttribute('aria-selected', btnIndex === index ? 'true' : 'false');
  });
}

function createChannelCard(channel) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'channel-card';
  const favorited = getFavoriteIds().has(channel.id);
  card.innerHTML = `
    <div class="channel-card-media" style="border-color:${channel.accent}">
      <img src="${channel.logo}" alt="${channel.name}">
      <button class="favorite-btn${favorited ? ' active' : ''}" type="button" aria-label="${favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}">${favorited ? '♥' : '♡'}</button>
    </div>
    <div class="channel-card-body">
      <strong>${channel.name}</strong>
      <span>${channel.country} · ${channel.category}</span>
    </div>
  `;
  card.addEventListener('click', () => {
    window.location.href = `player.html?channel=${encodeURIComponent(channel.id)}`;
  });
  const favBtn = card.querySelector('.favorite-btn');
  if (favBtn) {
    favBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleFavorite(channel.id);
      renderHomeChannels();
      renderFavorites();
    });
  }
  return card;
}

function renderGrid(containerId, channels) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  if (!channels || channels.length === 0) {
    container.innerHTML = '<p style="color:var(--text-faint);">Aucune chaîne disponible.</p>';
    return;
  }
  channels.forEach((channel) => container.appendChild(createChannelCard(channel)));
}

function renderHomeChannels() {
  renderGrid('homeChannelsGrid', CHANNELS);
}

function renderReplay() {
  const replayChannels = CHANNELS.slice(0, 6);
  const container = document.getElementById('channelGridReplay');
  if (!container) return;
  container.innerHTML = '';
  if (!replayChannels.length) {
    container.innerHTML = '<div class="section-empty-state"><p>Aucune chaîne de replay n’est disponible pour le moment.</p><a href="player.html" class="pill-btn pill-btn-accent">Voir les chaînes en direct</a></div>';
    return;
  }
  replayChannels.forEach((channel) => container.appendChild(createChannelCard(channel)));
}

function renderFavorites() {
  const favorites = getStoredFavorites().map(getChannelById).filter(Boolean);
  const container = document.getElementById('channelGridFavoris');
  if (!container) return;
  container.innerHTML = '';
  if (!favorites.length) {
    container.innerHTML = '<div class="section-empty-state"><p>Vous n’avez pas encore enregistré de favoris.</p><a href="player.html" class="pill-btn pill-btn-accent">Ajouter une chaîne</a></div>';
    return;
  }
  favorites.forEach((channel) => container.appendChild(createChannelCard(channel)));
}

function searchChannels(query) {
  if (!query) return [];
  const normalized = query.trim().toLowerCase();
  return CHANNELS.filter(channel => channel.name.toLowerCase().includes(normalized) || channel.category.toLowerCase().includes(normalized) || channel.country.toLowerCase().includes(normalized));
}

function createSearchResultRow(channel) {
  const row = document.createElement('button');
  row.type = 'button';
  row.className = 'search-result-row';
  row.innerHTML = `
    <div class="search-result-logo"><img src="${channel.logo}" alt="${channel.name}"></div>
    <div class="search-result-info">
      <div class="search-result-name">${channel.name}</div>
      <div class="search-result-meta">${channel.category} · ${channel.country}</div>
    </div>
  `;
  row.addEventListener('click', () => {
    window.location.href = `player.html?channel=${encodeURIComponent(channel.id)}`;
  });
  return row;
}

function renderSearchDropdown(results) {
  const dropdown = document.getElementById('searchResultsDesktop');
  if (!dropdown) return;
  dropdown.innerHTML = '';
  if (!results.length) {
    dropdown.innerHTML = '<div class="search-empty-row">Aucun résultat trouvé.</div>';
    dropdown.hidden = false;
    return;
  }
  results.slice(0, 6).forEach(channel => dropdown.appendChild(createSearchResultRow(channel)));
  dropdown.hidden = false;
}

function renderModalSearchResults(results) {
  const modalResults = document.getElementById('searchModalResults');
  if (!modalResults) return;
  modalResults.innerHTML = '';
  if (!results.length) {
    modalResults.innerHTML = '<div class="search-empty-row">Aucun résultat trouvé.</div>';
    return;
  }
  results.slice(0, 12).forEach(channel => modalResults.appendChild(createSearchResultRow(channel)));
}

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

function initSearch() {
  const searchInputDesktop = document.getElementById('searchInputDesktop');
  const searchInputModal = document.getElementById('searchInputModal');
  const searchModal = document.getElementById('searchModal');
  const searchMobileBtn = document.getElementById('searchMobileBtn');
  const searchModalClose = document.getElementById('searchModalClose');
  if (searchInputDesktop) {
    searchInputDesktop.addEventListener('input', () => renderSearchDropdown(searchChannels(searchInputDesktop.value)));
  }
  if (searchInputModal) {
    searchInputModal.addEventListener('input', () => renderModalSearchResults(searchChannels(searchInputModal.value)));
  }
  if (searchMobileBtn && searchModal) {
    searchMobileBtn.addEventListener('click', () => {
      searchModal.hidden = false;
      searchInputModal?.focus();
    });
  }
  if (searchModalClose && searchModal) {
    searchModalClose.addEventListener('click', () => {
      searchModal.hidden = true;
    });
  }
  if (searchModal) {
    searchModal.addEventListener('click', (event) => {
      if (event.target === searchModal) {
        searchModal.hidden = true;
      }
    });
  }
}

function initHero() {
  const heroSection = document.getElementById('heroSection');
  const heroDots = document.querySelectorAll('.hero-dots button');
  const heroPrev = document.getElementById('heroPrev');
  const heroNext = document.getElementById('heroNext');
  let currentHeroIndex = 0;
  let heroInterval = null;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let pointerDragging = false;

  const startHeroAutoplay = () => {
    if (heroInterval) window.clearInterval(heroInterval);
    heroInterval = window.setInterval(() => {
      currentHeroIndex = (currentHeroIndex + 1) % HERO_SLIDES.length;
      setHeroSlide(currentHeroIndex);
    }, 5000);
  };

  const stopHeroAutoplay = () => {
    if (heroInterval) {
      window.clearInterval(heroInterval);
      heroInterval = null;
    }
  };

  const navigateHero = (index) => {
    currentHeroIndex = (index + HERO_SLIDES.length) % HERO_SLIDES.length;
    setHeroSlide(currentHeroIndex);
    startHeroAutoplay();
  };

  heroDots.forEach((button, index) => {
    const hoverSupported = window.matchMedia('(hover: hover)').matches;
    if (hoverSupported) {
      button.addEventListener('mouseenter', () => {
        currentHeroIndex = index;
        setHeroSlide(index);
      });
    }
    button.addEventListener('click', () => navigateHero(index));
  });

  if (heroPrev) {
    heroPrev.addEventListener('click', () => navigateHero(currentHeroIndex - 1));
  }
  if (heroNext) {
    heroNext.addEventListener('click', () => navigateHero(currentHeroIndex + 1));
  }

  if (heroSection) {
    heroSection.addEventListener('pointerdown', (event) => {
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      pointerDragging = true;
      stopHeroAutoplay();
      heroSection.setPointerCapture(event.pointerId);
    });

    heroSection.addEventListener('pointermove', (event) => {
      if (!pointerDragging) return;
      const deltaX = event.clientX - pointerStartX;
      const deltaY = event.clientY - pointerStartY;
      if (Math.abs(deltaX) > 80 && Math.abs(deltaX) > Math.abs(deltaY)) {
        pointerDragging = false;
        navigateHero(deltaX < 0 ? currentHeroIndex + 1 : currentHeroIndex - 1);
      }
    });

    heroSection.addEventListener('pointerup', () => {
      pointerDragging = false;
      startHeroAutoplay();
    });
    heroSection.addEventListener('pointercancel', () => {
      pointerDragging = false;
      startHeroAutoplay();
    });
  }

  setHeroSlide(0);
  startHeroAutoplay();
}

function initHorizontalSlider(sliderId, prevId, nextId) {
  const slider = document.getElementById(sliderId);
  if (!slider) return;

  const prev = prevId ? document.getElementById(prevId) : null;
  const next = nextId ? document.getElementById(nextId) : null;
  const step = Math.max(slider.clientWidth * 0.75, 220);
  let isPointerDown = false;
  let startX = 0;
  let scrollLeft = 0;

  if (prev) {
    prev.addEventListener('click', () => slider.scrollBy({ left: -step, behavior: 'smooth' }));
  }
  if (next) {
    next.addEventListener('click', () => slider.scrollBy({ left: step, behavior: 'smooth' }));
  }

  slider.addEventListener('pointerdown', (event) => {
    isPointerDown = true;
    startX = event.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
    slider.style.cursor = 'grabbing';
    slider.style.userSelect = 'none';
    slider.setPointerCapture(event.pointerId);
  });

  slider.addEventListener('pointermove', (event) => {
    if (!isPointerDown) return;
    const x = event.pageX - slider.offsetLeft;
    const walk = x - startX;
    slider.scrollLeft = scrollLeft - walk;
  });

  slider.addEventListener('pointerup', () => {
    isPointerDown = false;
    slider.style.cursor = '';
    slider.style.userSelect = '';
  });
  slider.addEventListener('pointerleave', () => {
    isPointerDown = false;
    slider.style.cursor = '';
    slider.style.userSelect = '';
  });
}

function init() {
  renderHomeChannels();
  renderReplay();
  renderFavorites();
  initHero();
  initHorizontalSlider('homeChannelsGrid', 'liveChannelsPrev', 'liveChannelsNext');
  initHorizontalSlider('categoriesGrid', 'categoriesPrev', 'categoriesNext');
  initSearch();
  initAuthForms();
  observeAuthState(setProfileState);
  switchAuthTab('login');
  document.querySelectorAll('.auth-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchAuthTab(btn.id === 'tabLogin' ? 'login' : 'register'));
  });
}

document.addEventListener('DOMContentLoaded', init);
