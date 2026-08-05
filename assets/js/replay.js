import { CHANNELS, getChannelById, getFavoriteIds, toggleFavorite } from './common.js';

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
      renderReplayGrid();
    });
  }
  return card;
}

function renderReplayGrid() {
  const container = document.getElementById('channelGridReplay');
  if (!container) return;
  const channels = CHANNELS.filter((channel) => channel.curated);
  container.innerHTML = '';
  if (!channels.length) {
    container.innerHTML = '<div class="section-empty-state"><p>Aucune émission en replay n’est disponible pour le moment.</p><a href="player.html" class="pill-btn pill-btn-accent">Voir en direct</a></div>';
    return;
  }
  channels.forEach((channel) => container.appendChild(createChannelCard(channel)));
}

function initReplayPage() {
  renderReplayGrid();
}

document.addEventListener('DOMContentLoaded', initReplayPage);
