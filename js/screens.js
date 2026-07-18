// Screen renderers. Each takes the #app container and the current saved
// state, paints its markup, and wires its own listeners.

import { updateState } from './storage.js';
import { esc, go } from './ui.js';

/* ------------------------------------------------------------------ */
/* Registration                                                        */
/* ------------------------------------------------------------------ */

export function renderRegister(app) {
  app.innerHTML = `
    <section class="screen screen--register">
      <h1 class="mega">Witcher<br />Fight<br />Club</h1>
      <p class="lede">
        A turn-based fight. Pick a hero, choose one zone to
        strike and two to guard. Sign your name to step down into the pit.
      </p>
      <form id="register-form" class="stack" novalidate>
        <label class="field-label" for="fighter-name">Fighter name</label>
        <input
          id="fighter-name"
          name="name"
          type="text"
          maxlength="24"
          autocomplete="off"
          placeholder="e.g. Miserable Peasant"
          aria-describedby="name-error"
          required
        />
        <p class="field-error" id="name-error" role="alert" hidden>A fighter needs a name — two characters or more.</p>
        <button type="submit" class="btn btn--blood">Try your luck</button>
      </form>
    </section>
  `;

  const form = document.getElementById('register-form');
  const input = document.getElementById('fighter-name');
  const error = document.getElementById('name-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = input.value.trim();
    if (name.length < 2) {
      error.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    updateState({ name });
    go('#/');
  });

  input.addEventListener('input', () => {
    error.hidden = true;
    input.removeAttribute('aria-invalid');
  });

  input.focus();
}

