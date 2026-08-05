import { getStoredFavorites, getChannelById, getFavoriteIds, toggleFavorite } from './common.js';

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
      renderFavoritesGrid();
    });
  }
  return card;
}

function renderFavoritesGrid() {
  const container = document.getElementById('channelGridFavoris');
  if (!container) return;
  const favorites = getStoredFavorites().map(getChannelById).filter(Boolean);
  container.innerHTML = '';
  if (!favorites.length) {
    container.innerHTML = '<div class="section-empty-state"><p>Vous n’avez pas encore de favoris.</p><a href="player.html" class="pill-btn pill-btn-accent">Ajouter une chaîne</a></div>';
    return;
  }
  favorites.forEach((channel) => container.appendChild(createChannelCard(channel)));
}

function initFavorisPage() {
  renderFavoritesGrid();
}

document.addEventListener('DOMContentLoaded', initFavorisPage);
