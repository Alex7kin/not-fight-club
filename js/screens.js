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

/* ------------------------------------------------------------------ */
/* Home                                                                */
/* ------------------------------------------------------------------ */

export function renderHome(app, state) {
  const { wins, losses, draws } = state.record;
  const battle = state.battle;
  const inProgress = Boolean(battle && !battle.finished);
  const opponent = inProgress ? getOpponent(battle.opponentId) : null;
  const hero = getAvatar(state.avatarId);

  app.innerHTML = `
    <section class="screen screen--home">
      <div class="home-grid">
        <div class="home-copy">
          <h1 class="mega">${esc(state.name)} <em>vs</em> ${inProgress ? esc(opponent.name) : 'whatever crawls out'}</h1>
          <p class="lede">
            Pick one zone to strike and two to guard. A critical hits harder and
            cuts straight through a guard. Last one standing walks away.
          </p>
          <div class="home-actions">
            <button id="start-fight" class="btn-fight">${inProgress ? 'Return to the fight' : 'Fight'}</button>
            ${
              inProgress
                ? `<p class="note">Contract in progress — round ${battle.round} against
                   <b>${esc(opponent.name)}</b>.</p>`
                : ''
            }
          </div>
          <p class="record-line">
            Record: <b>${wins}</b> ${wins === 1 ? 'win' : 'wins'} ·
            <b>${losses}</b> ${losses === 1 ? 'loss' : 'losses'}${
              draws ? ` · <b>${draws}</b> ${draws === 1 ? 'draw' : 'draws'}` : ''
            }
          </p>
        </div>
        <figure class="home-hero">
          <img class="card-img" src="${hero.src}" alt="Your hero: ${esc(hero.label)}" width="220" height="330" />
        </figure>
      </div>
    </section>
  `;

  document.getElementById('start-fight').addEventListener('click', () => {
    const current = state.battle;
    if (current && current.finished) {
      updateState({ battle: null });
    }
    go('#/fight');
  });
}

