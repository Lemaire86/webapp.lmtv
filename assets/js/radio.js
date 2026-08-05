import { DEFAULT_RADIOS, loadRadioStations } from './common.js';

let radioStations = [...DEFAULT_RADIOS];
let currentStationId = '';
const browseState = { mode: 'all', value: 'all' };

function getVisibleStations() {
  if (browseState.mode === 'channel' && browseState.value !== 'all') {
    return radioStations.filter(station => station.id === browseState.value);
  }
  if (browseState.mode === 'category' && browseState.value !== 'all') {
    return radioStations.filter(station => station.category === browseState.value);
  }
  if (browseState.mode === 'country' && browseState.value !== 'all') {
    return radioStations.filter(station => station.country === browseState.value);
  }
  return radioStations;
}

function createStationCard(station) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'channel-card';
  card.innerHTML = `
    <div class="channel-card-media" style="border-color:#17c37b">
      <img src="${station.logo}" alt="${station.name}">
    </div>
    <div class="channel-card-body">
      <strong>${station.name}</strong>
      <span>${station.country} · ${station.category}</span>
    </div>
  `;
  card.addEventListener('click', () => playRadio(station));
  return card;
}

function renderRadioGrid() {
  const radioGrid = document.getElementById('radioGrid');
  if (!radioGrid) return;
  radioGrid.innerHTML = '';
  const visibleStations = getVisibleStations();
  if (!visibleStations.length) {
    radioGrid.innerHTML = '<div class="empty-state"><p>Aucune station disponible pour ce filtre.</p></div>';
    return;
  }
  visibleStations.forEach(station => radioGrid.appendChild(createStationCard(station)));
}

function playRadio(station) {
  const radioPlayer = document.getElementById('radioPlayer');
  const radioStationName = document.getElementById('radioStationName');
  const status = document.getElementById('radioListStatus');
  if (!radioPlayer || !radioStationName) return;
  currentStationId = station.id;
  radioStationName.textContent = station.name;
  if (status) {
    status.textContent = `Lecture de ${station.name}…`;
  }
  radioPlayer.src = station.stream;
  radioPlayer.play().catch(() => {});
}

function updateBrowseButtons() {
  document.querySelectorAll('[data-radio-browse-target]').forEach((button) => {
    const isActive = button.dataset.radioBrowseTarget === browseState.mode && button.dataset.radioBrowseValue === browseState.value;
    button.classList.toggle('active', isActive);
  });
}

function applyBrowseFilter(mode, value) {
  browseState.mode = mode;
  browseState.value = value;
  renderRadioGrid();
  updateBrowseButtons();
  const visibleStations = getVisibleStations();
  const stationToPlay = visibleStations.find((station) => station.id === currentStationId) || visibleStations[0];
  if (stationToPlay) {
    playRadio(stationToPlay);
  }
}

function renderModalItems() {
  const modalGrid = document.getElementById('radioBrowseModalGrid');
  if (!modalGrid) return;
  modalGrid.innerHTML = '';
  document.querySelectorAll('.radio-modal-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.mode === browseState.mode);
  });

  if (browseState.mode === 'all') {
    radioStations.forEach((station) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'pill-btn pill-btn-secondary';
      chip.textContent = station.name;
      chip.addEventListener('click', () => {
        playRadio(station);
        closeRadioBrowseModal();
      });
      modalGrid.appendChild(chip);
    });
    return;
  }

  const values = new Set(radioStations.map((station) => browseState.mode === 'category' ? station.category : station.country));
  [...values].sort().forEach((value) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'pill-btn pill-btn-secondary';
    chip.textContent = value;
    chip.addEventListener('click', () => {
      applyBrowseFilter(browseState.mode, value);
      closeRadioBrowseModal();
    });
    modalGrid.appendChild(chip);
  });
}

function openRadioBrowseModal(mode = 'all') {
  browseState.mode = mode;
  const modal = document.getElementById('radioBrowseModal');
  if (modal) {
    modal.hidden = false;
  }
  renderModalItems();
}

function closeRadioBrowseModal() {
  const modal = document.getElementById('radioBrowseModal');
  if (modal) {
    modal.hidden = true;
  }
}

async function initRadioPage() {
  renderRadioGrid();
  const status = document.getElementById('radioListStatus');
  if (status) {
    status.textContent = 'Chargement des radios…';
  }
  radioStations = await loadRadioStations((stations) => {
    radioStations = stations;
    renderRadioGrid();
    renderModalItems();
    if (status) {
      status.textContent = stations.length ? `${stations.length} radios disponibles` : 'Aucune radio disponible.';
    }
    if (!currentStationId && stations[0]) {
      currentStationId = stations[0].id;
      playRadio(stations[0]);
    }
  });
  if (!radioStations.length && status) {
    status.textContent = 'Aucune radio disponible.';
  }
  const radioBrowseBtn = document.getElementById('openRadioBrowseModal');
  const radioBrowseModalClose = document.getElementById('radioBrowseModalClose');
  const radioBrowseAll = document.getElementById('radioBrowseAll');
  const radioBrowseLmtv = document.getElementById('radioBrowseLmtv');
  const modalTabs = document.querySelectorAll('.radio-modal-tab');
  const modal = document.getElementById('radioBrowseModal');

  if (radioBrowseBtn) {
    radioBrowseBtn.addEventListener('click', () => openRadioBrowseModal('all'));
  }
  if (radioBrowseModalClose) {
    radioBrowseModalClose.addEventListener('click', closeRadioBrowseModal);
  }
  if (radioBrowseAll) {
    radioBrowseAll.addEventListener('click', () => applyBrowseFilter('all', 'all'));
  }
  if (radioBrowseLmtv) {
    radioBrowseLmtv.addEventListener('click', () => applyBrowseFilter('channel', 'radio-lmtv'));
  }
  modalTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      browseState.mode = tab.dataset.mode || 'all';
      renderModalItems();
    });
  });
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeRadioBrowseModal();
      }
    });
  }
  updateBrowseButtons();
}

document.addEventListener('DOMContentLoaded', initRadioPage);
