import { CHANNELS, getChannelById, toggleFavorite, getFavoriteIds, loadExtraPlaylists } from './common.js';

let hlsInstance = null;
let currentChannelIndex = 0;
let activeChannelId = 'lmtv';
const featuredChannelIds = ['lmtv', 'traceayiti', 'tracecaribbean', 'tracelatina', 'cstar', 'hmiprodz'];

function getAllChannels() {
  return CHANNELS;
}

function getFeaturedChannels() {
  return getAllChannels().filter((channel) => featuredChannelIds.includes(channel.id));
}

function getVisibleChannels() {
  return getFeaturedChannels();
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
  card.addEventListener('click', () => playChannel(channel));
  const favBtn = card.querySelector('.favorite-btn');
  if (favBtn) {
    favBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleFavorite(channel.id);
      renderChannelGrid();
    });
  }
  return card;
}

function renderChannelGrid() {
  const container = document.getElementById('channelGridEnDirect');
  if (!container) return;
  container.innerHTML = '';
  const visibleChannels = getVisibleChannels();
  if (!visibleChannels.length) {
    container.innerHTML = '<div class="empty-state"><p>Aucune chaîne disponible pour ce filtre.</p></div>';
    return;
  }
  visibleChannels.forEach(channel => container.appendChild(createChannelCard(channel)));
}

function updatePlaylistStatus(message) {
  const status = document.getElementById('channelsLoadStatus');
  if (status) {
    status.textContent = message;
  }
}

function resolveChannelStreamUrl(channel) {
  return channel?.streams?.[0] || '';
}

function attachHlsToVideo(sourceUrl) {
  const player = document.getElementById('livePlayer');
  if (!player) return;
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
  if (!sourceUrl) {
    showPlayerMessage('Aucune source de lecture disponible.');
    return;
  }
  if (window.Hls && Hls.isSupported()) {
    hlsInstance = new Hls();
    hlsInstance.loadSource(sourceUrl);
    hlsInstance.attachMedia(player);
  } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
    player.src = sourceUrl;
    player.load();
  } else {
    showPlayerMessage('Votre navigateur ne supporte pas HLS.');
  }
}

function showPlayerMessage(message) {
  const playerMessage = document.getElementById('playerMessage');
  if (!playerMessage) return;
  playerMessage.textContent = message;
  playerMessage.hidden = !message;
}

function playChannel(channel) {
  if (!channel) return;
  const playerChannelName = document.getElementById('playerChannelName');
  const playerChannelLogo = document.getElementById('playerChannelLogo');
  const playerChannelLogoSmall = document.getElementById('playerChannelLogoSmall');
  const liveBadge = document.getElementById('playerLiveBadge');
  const playerChannelTitle = document.querySelector('.channel-title');
  const playerChannelSubtitle = document.querySelector('.channel-subtitle');
  activeChannelId = channel.id;
  if (playerChannelName) playerChannelName.textContent = channel.name;
  if (playerChannelLogo) playerChannelLogo.src = channel.logo;
  if (playerChannelLogoSmall) playerChannelLogoSmall.src = channel.logo;
  if (playerChannelTitle) playerChannelTitle.textContent = channel.name;
  if (playerChannelSubtitle) playerChannelSubtitle.textContent = `${channel.country} · ${channel.category}`;
  if (liveBadge) liveBadge.textContent = 'EN DIRECT';
  showPlayerMessage('');
  const streamUrl = resolveChannelStreamUrl(channel);
  attachHlsToVideo(streamUrl);
  currentChannelIndex = getVisibleChannels().findIndex((item) => item.id === channel.id);
  if (currentChannelIndex < 0) currentChannelIndex = 0;
}

function renderChannelPicker() {
  const modalGrid = document.getElementById('channelPickerGrid');
  if (!modalGrid) return;
  modalGrid.innerHTML = '';
  getAllChannels().forEach((channel) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'pill-btn pill-btn-secondary channel-picker-item';
    chip.textContent = channel.name;
    chip.addEventListener('click', () => {
      playChannel(channel);
      closeChannelPicker();
    });
    modalGrid.appendChild(chip);
  });
}

function openChannelPicker() {
  const modal = document.getElementById('channelPickerModal');
  if (modal) {
    modal.hidden = false;
    renderChannelPicker();
  }
}

function closeChannelPicker() {
  const modal = document.getElementById('channelPickerModal');
  if (modal) {
    modal.hidden = true;
  }
}

async function initPlayerPage() {
  renderChannelGrid();
  updatePlaylistStatus('Chargement des chaînes supplémentaires…');
  try {
    await loadExtraPlaylists(({ total }) => {
      updatePlaylistStatus(`${total} chaînes disponibles au total`);
      renderChannelGrid();
      renderModalItems();
    });
  } catch (error) {
    updatePlaylistStatus('Chargement des chaînes terminé avec des sources indisponibles.');
  }
  const params = new URLSearchParams(window.location.search);
  const channelId = params.get('channel');
  const channel = getChannelById(channelId) || getChannelById('lmtv');
  if (channel) {
    playChannel(channel);
  }
  const prevButton = document.getElementById('btnPrev');
  const nextButton = document.getElementById('btnNext');
  const chooseButton = document.getElementById('chooseChannelBtn');
  const closeButton = document.getElementById('channelPickerClose');
  const modal = document.getElementById('channelPickerModal');

  if (chooseButton) {
    chooseButton.addEventListener('click', openChannelPicker);
  }
  if (closeButton) {
    closeButton.addEventListener('click', closeChannelPicker);
  }
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeChannelPicker();
      }
    });
  }

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      const visibleChannels = getVisibleChannels();
      if (!visibleChannels.length) return;
      currentChannelIndex = (currentChannelIndex - 1 + visibleChannels.length) % visibleChannels.length;
      playChannel(visibleChannels[currentChannelIndex]);
    });
  }
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      const visibleChannels = getVisibleChannels();
      if (!visibleChannels.length) return;
      currentChannelIndex = (currentChannelIndex + 1) % visibleChannels.length;
      playChannel(visibleChannels[currentChannelIndex]);
    });
  }
}

document.addEventListener('DOMContentLoaded', initPlayerPage);