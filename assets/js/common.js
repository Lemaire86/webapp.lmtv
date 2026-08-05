// Shared application data and helpers for LMTV
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCg2CaY3SatxUPPTpW5hauaPD_Agm3V9rk",
  authDomain: "lmtv-3de97.firebaseapp.com",
  projectId: "lmtv-3de97",
  storageBucket: "lmtv-3de97.firebasestorage.app",
  messagingSenderId: "584807647008",
  appId: "1:584807647008:web:7c3891b9dbf34eef177945",
  measurementId: "G-GV4CW8DN8P"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export const CHANNELS = [
  {
    id: 'lmtv',
    name: 'LMTV',
    logo: 'assets/images/lmtv.png',
    category: 'Actualités',
    country: 'Haïti',
    accent: '#ff2f5e',
    streams: ['https://lmtv.lemairetv.uk/hls/stream.m3u8'],
    curated: true
  },
  {
    id: 'traceayiti',
    name: 'Trace Ayiti',
    logo: 'assets/images/traceayiti.png',
    category: 'Musique',
    country: 'Haïti',
    accent: '#2b6bff',
    streams: ['https://channels.trace.plus/Traceprod/AYITI_hd/index.m3u8'],
    curated: true
  },
  {
    id: 'tracecaribbean',
    name: 'Trace Caribbean',
    logo: 'assets/images/tracecaribbean.png',
    category: 'Musique',
    country: 'Caraïbes',
    accent: '#ffb32f',
    streams: ['https://channels.trace.plus/Traceprod/CARIBBEAN_hd/index.m3u8'],
    curated: true
  },
  {
    id: 'tracelatina',
    name: 'Trace Latina',
    logo: 'assets/images/tracelatina.png',
    category: 'Musique',
    country: 'Amérique Latine',
    accent: '#ff2fd1',
    streams: ['https://channels.trace.plus/Traceprod/LATINA_hd/index.m3u8'],
    curated: true
  },
  {
    id: 'cstar',
    name: 'C Star',
    logo: 'assets/images/cstar.png',
    category: 'Musique',
    country: 'France',
    accent: '#ffd400',
    streams: ['http://145.239.5.177/361/index.m3u8'],
    curated: true
  },
  {
    id: 'hmiprodz',
    name: 'HMI Promz News',
    logo: 'assets/images/hmiprodz.png',
    category: 'Actualités',
    country: 'Haïti',
    accent: '#ff2f3d',
    streams: ['https://video1.getstreamhosting.com:1936/8326/8326/playlist.m3u8'],
    curated: true
  }
];

export const EXTRA_PLAYLISTS = [
  'https://raw.githubusercontent.com/Lemaire86/Le-Maire-TV/refs/heads/main/CODE%20IPTV/lmtv.m3u',
  'https://iptv-org.github.io/iptv/categories/music.m3u',
  'https://iptv-org.github.io/iptv/categories/entertainment.m3u',
  'https://iptv-org.github.io/iptv/categories/movies.m3u',
  'https://iptv-org.github.io/iptv/categories/classic.m3u',
  'https://iptv-org.github.io/iptv/categories/series.m3u',
  'https://iptv-org.github.io/iptv/categories/kids.m3u',
  'https://iptv-org.github.io/iptv/categories/family.m3u',
  'https://iptv-org.github.io/iptv/categories/animation.m3u',
  'https://iptv-org.github.io/iptv/categories/comedy.m3u',
  'https://iptv-org.github.io/iptv/categories/news.m3u',
  'https://iptv-org.github.io/iptv/categories/business.m3u',
  'https://iptv-org.github.io/iptv/categories/general.m3u',
  'https://iptv-org.github.io/iptv/categories/culture.m3u',
  'https://iptv-org.github.io/iptv/countries/fr.m3u',
  'https://iptv-org.github.io/iptv/countries/ht.m3u'
];

function categorizeUrl(url) {
  if (url.includes('Le-Maire-TV')) return { category: 'Haïti', country: 'Haïti' };
  if (url.includes('/music') || url.includes('/entertainment')) return { category: 'Musique', country: 'France' };
  if (url.includes('/movies') || url.includes('/classic') || url.includes('/series')) return { category: 'Films', country: 'France' };
  if (url.includes('/kids') || url.includes('/family')) return { category: 'Enfants', country: 'France' };
  if (url.includes('/animation') || url.includes('/comedy')) return { category: 'Dessins animés', country: 'France' };
  if (url.includes('/news') || url.includes('/business') || url.includes('/general')) return { category: 'Actualités', country: 'France' };
  if (url.includes('/culture')) return { category: 'Culture', country: 'France' };
  if (url.includes('/fr') || url.includes('France')) return { category: 'France', country: 'France' };
  if (url.includes('/ht') || url.includes('Haiti')) return { category: 'Haïti', country: 'Haïti' };
  return { category: 'Général', country: 'International' };
}

function slugify(str) {
  return 'ch_' + str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function hashCode(str) {
  let hash = 0;
  for (let index = 0; index < str.length; index += 1) {
    hash = ((hash << 5) - hash) + str.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

function parseTvChannelsM3U(text, sourceUrl) {
  const { category: forceCategory, country: forceCountry } = categorizeUrl(sourceUrl);
  const lines = text.split(/\r?\n/);
  const out = [];
  let name = null;
  let logo = 'assets/logo.png';

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF')) {
      const commaIndex = line.indexOf(',');
      name = commaIndex >= 0 ? line.slice(commaIndex + 1).trim() : 'Chaîne';
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      logo = logoMatch && logoMatch[1] ? logoMatch[1] : 'assets/logo.png';
    } else if (/^https?:\/\//i.test(line)) {
      if (name) {
        out.push({
          id: `${slugify(name)}_${Math.abs(hashCode(line))}`,
          name,
          logo,
          category: forceCategory,
          country: forceCountry,
          accent: '#8b3bf7',
          streams: [line.trim()],
          curated: false
        });
      }
      name = null;
      logo = 'assets/logo.png';
    }
  }

  return out;
}

export const RADIO_PLAYLIST_URL = 'https://raw.githubusercontent.com/Lemaire86/lemairetv/refs/heads/main/assets/data/radio.m3u';

export const DEFAULT_RADIOS = [];

function parseRadioStationsM3U(text, sourceUrl) {
  const lines = text.split(/\r?\n/);
  const stations = [];
  let name = null;
  let logo = 'assets/logo.png';

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF')) {
      const commaIndex = line.indexOf(',');
      name = commaIndex >= 0 ? line.slice(commaIndex + 1).trim() : 'Radio';
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      logo = logoMatch && logoMatch[1] ? logoMatch[1] : 'assets/logo.png';
    } else if (/^https?:\/\//i.test(line)) {
      if (name) {
        stations.push({
          id: `radio_${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)}`,
          name,
          logo,
          stream: line.trim(),
          category: 'Radio',
          country: 'International'
        });
      }
      name = null;
      logo = 'assets/logo.png';
    }
  }

  return stations;
}

export async function loadRadioStations(onProgress) {
  const radios = [...DEFAULT_RADIOS];
  try {
    const response = await fetch(RADIO_PLAYLIST_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    const parsed = parseRadioStationsM3U(text, RADIO_PLAYLIST_URL);
    parsed.forEach((station) => {
      if (!radios.some((existing) => existing.stream === station.stream)) {
        radios.push(station);
      }
    });
    if (onProgress) {
      onProgress(radios);
    }
    return radios;
  } catch (error) {
    if (onProgress) {
      onProgress(radios);
    }
    return radios;
  }
}

export async function loadExtraPlaylists(onProgress) {
  const existingStreams = new Set(CHANNELS.map((channel) => (channel.streams?.[0] || '').toLowerCase()));
  let addedCount = 0;

  const jobs = EXTRA_PLAYLISTS.map((url) => fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then((text) => {
      if (!text.includes('#EXTM3U')) return;
      const parsed = parseTvChannelsM3U(text, url);
      parsed.forEach((channel) => {
        const streamKey = (channel.streams?.[0] || '').toLowerCase();
        if (!streamKey || existingStreams.has(streamKey)) return;
        existingStreams.add(streamKey);
        CHANNELS.push(channel);
        addedCount += 1;
      });
      if (onProgress) {
        onProgress({ total: CHANNELS.length, added: addedCount });
      }
    })
    .catch(() => {}));

  await Promise.allSettled(jobs);
  if (onProgress) {
    onProgress({ total: CHANNELS.length, added: addedCount });
  }
  return CHANNELS;
}

export function getStoredFavorites() {
  try {
    return JSON.parse(localStorage.getItem('lmtvFavorites') || '[]');
  } catch (error) {
    return [];
  }
}

export function saveFavorites(favorites) {
  localStorage.setItem('lmtvFavorites', JSON.stringify(favorites));
}

export function getFavoriteIds() {
  return new Set(getStoredFavorites());
}

export function getChannelById(id) {
  return CHANNELS.find(channel => channel.id === id);
}

export function toggleFavorite(channelId) {
  const favorites = new Set(getStoredFavorites());
  if (favorites.has(channelId)) {
    favorites.delete(channelId);
  } else {
    favorites.add(channelId);
  }
  saveFavorites([...favorites]);
}

export async function registerUser(email, password, fullName) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const userRole = email === 'admin@lemairetv.com' ? 'admin' : 'user';
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    name: fullName,
    email,
    role: userRole,
    createdAt: new Date().toISOString()
  });
  return user;
}

export async function loginUser(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function handleForgotPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export async function logoutUser() {
  await signOut(auth);
}

export function observeAuthState(onChange) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      onChange(null);
      return;
    }
    try {
      const snapshot = await getDoc(doc(db, 'users', user.uid));
      onChange(snapshot.exists() ? snapshot.data() : { email: user.email, role: 'user' });
    } catch (error) {
      onChange({ email: user.email, role: 'user' });
    }
  });
}
