// Entry point: a tiny hash router. Routing isn't required by the task, but it
// keeps every screen linkable and reload-safe on gh-pages.

import { loadState } from './storage.js';
import { updateChrome } from './ui.js';
import {
  renderRegister,
  renderHome,
  renderCharacter,
  renderSettings,
} from './screens.js';

const app = document.getElementById('app');

const routes = {
  '': { name: 'home', render: renderHome },
  character: { name: 'character', render: renderCharacter },
  settings: { name: 'settings', render: renderSettings },
  register: { name: 'register', render: renderRegister },
};

function routeKey() {
  return location.hash.replace(/^#\/?/, '').replace(/\/+$/, '');
}

function render() {
  const state = loadState();
  let key = routeKey();
  if (!state.name) {
    key = 'register'; // no name yet — everything funnels into registration
  } else if (key === 'register') {
    key = ''; // already registered — the book is signed
  }
  const route = routes[key] || routes[''];

  document.body.dataset.screen = route.name;
  updateChrome(state, route.name);
  route.render(app, state);
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', render);
window.addEventListener('app:render', render);
render();

