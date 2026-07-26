// Background music: one looping track, toggled from the header. Music is on
// by default, but browsers refuse to autoplay sound — so playback waits for
// the player's first click or keypress. An explicit "off" is saved and wins.

import { loadState, updateState } from './storage.js';

const VOLUME = 0.35;

let el = null;
let btn = null;
let armed = false;

function icon(on) {
  // Speaker cone, with sound waves when on and a slash when off.
  const waves = on
    ? '<path d="M12.5 6.2a4.6 4.6 0 0 1 0 7.6M15 3.6a8 8 0 0 1 0 12.8" />'
    : '<path d="M13 7l5 6M18 7l-5 6" />';
  return `
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"
         fill="none" stroke="currentColor" stroke-width="1.6"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 7.5h3L10 4v12L6 12.5H3z" />
      ${waves}
    </svg>`;
}

function paint(on) {
  btn.innerHTML = icon(on);
  btn.setAttribute('aria-pressed', String(on));
  btn.classList.toggle('is-on', on);
  const label = on ? 'Turn music off' : 'Turn music on';
  btn.setAttribute('aria-label', label);
  btn.title = label;
}

// Always hand back a promise so callers can tell success from refusal.
function start() {
  const attempt = el.play();
  return attempt && typeof attempt.then === 'function' ? attempt : Promise.resolve();
}

// One shared reference, so add/removeEventListener actually pair up.
function kick(e) {
  // Let the toggle's own handler decide when it's the thing being clicked.
  if (e.target && e.target.closest && e.target.closest('#music-toggle')) return;
  if (!loadState().musicOn) {
    disarm();
    return;
  }
  // Only stop listening once playback truly starts. If the browser still
  // refuses, stay armed and try again on the next gesture.
  start().then(disarm, () => {});
}

function armResume() {
  if (armed) return;
  armed = true;
  window.addEventListener('pointerdown', kick);
  window.addEventListener('keydown', kick);
}

function disarm() {
  if (!armed) return;
  armed = false;
  window.removeEventListener('pointerdown', kick);
  window.removeEventListener('keydown', kick);
}

export function initAudio() {
  el = document.getElementById('bgm');
  btn = document.getElementById('music-toggle');
  if (!el || !btn) return;

  el.volume = VOLUME;
  const on = loadState().musicOn === true;
  paint(on);
  if (on) armResume();

  btn.addEventListener('click', () => {
    const next = !(loadState().musicOn === true);
    updateState({ musicOn: next });
    paint(next);
    if (next) {
      // Clicking the button is itself a gesture, so this should stick.
      start().then(disarm, () => armResume());
    } else {
      disarm();
      el.pause();
    }
  });
}
