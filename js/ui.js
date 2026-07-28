// Shared UI helpers: escaping, navigation, header chrome, and the little
// fighter figure that mirrors zone selection.

import { getAvatar } from './data.js';

export function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// Push a message to the persistent live region so screen readers hear it,
// even though the screen it describes was just re-rendered.
export function announce(message) {
  const region = document.getElementById('sr-status');
  if (!region) return;
  // A live region only re-announces when its text changes, so clear first,
  // then set on the next tick. setTimeout (not rAF) so it still fires when the
  // tab isn't visible.
  region.textContent = '';
  setTimeout(() => {
    region.textContent = message;
  }, 50);
}

// Navigate by hash; if we're already there, ask the app to re-render.
export function go(hash) {
  if (location.hash === hash) {
    window.dispatchEvent(new Event('app:render'));
  } else {
    location.hash = hash;
  }
}

export function updateChrome(state, route) {
  const header = document.getElementById('site-header');
  const footer = document.getElementById('site-footer');
  const chip = document.getElementById('player-chip');
  const signedIn = Boolean(state.name);

  // The header stays up even before registration so the music toggle is
  // always reachable — it just drops back to that one control.
  header.hidden = false;
  header.classList.toggle('site-header--minimal', !signedIn);
  footer.hidden = !signedIn;
  if (!signedIn) return;

  const avatar = getAvatar(state.avatarId);
  chip.innerHTML = `
    <img src="${avatar.src}" alt="" width="28" height="28" />
    <span>${esc(state.name)}</span>
  `;

  document.querySelectorAll('.site-nav a').forEach((link) => {
    if (link.dataset.route === route) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

