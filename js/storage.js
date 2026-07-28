// Single namespaced localStorage blob. Everything the game knows lives here,
// so a reload restores the character and any bout in progress.

import { DEFAULT_AVATAR_ID } from './data.js';


const KEY = 'not-fight-club:v3';

function defaults() {
  return {
    name: null,
    avatarId: DEFAULT_AVATAR_ID,
    record: { wins: 0, losses: 0, draws: 0 },
    battle: null,
    // On by default. Browsers still block autoplay, so the track starts at the
    // player's first click or keypress.
    musicOn: true,
  };
}

export function loadState() {
  const base = defaults();
  let raw = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return base;
  }
  if (!raw) return base;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return base;
    return {
      ...base,
      ...parsed,
      record: { ...base.record, ...(parsed.record || {}) },
    };
  } catch {
    return base;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — the game still works for this session.
  }
}

export function updateState(patch) {
  const state = { ...loadState(), ...patch };
  saveState(state);
  return state;
}

export function clearState() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to do — a failed clear just leaves the old character around.
  }
}

