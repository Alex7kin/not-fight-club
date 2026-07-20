// Screen renderers. Each takes the #app container and the current saved
// state, paints its markup, and wires its own listeners.

import { PLAYER_BASE, AVATARS, getAvatar } from './data.js';
import { updateState } from './storage.js';
import { esc, go, updateChrome } from './ui.js';

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

/* ------------------------------------------------------------------ */
/* Character                                                           */
/* ------------------------------------------------------------------ */

export function renderCharacter(app, state) {
  const avatar = getAvatar(state.avatarId);
  const { wins, losses, draws } = state.record;
  const critPct = Math.round(PLAYER_BASE.critChance * 100);

  app.innerHTML = `
    <section class="screen screen--character">
      <h1>Hero</h1>
      <div class="character-grid">
        <article class="char-card panel">
          <img
            id="char-portrait"
            class="char-portrait card-img"
            src="${avatar.src}"
            alt="Your hero: ${esc(avatar.label)}"
            width="240"
            height="360"
          />
          <h2 id="char-name" class="char-name">${esc(state.name)}</h2>
          <p class="char-record">
            <span><b>${wins}</b> ${wins === 1 ? 'win' : 'wins'}</span>
            <span><b>${losses}</b> ${losses === 1 ? 'loss' : 'losses'}</span>
            ${draws ? `<span><b>${draws}</b> ${draws === 1 ? 'draw' : 'draws'}</span>` : ''}
          </p>
          <p class="char-stats">
            HP ${PLAYER_BASE.maxHp} · DMG ${PLAYER_BASE.damage} ·
            CRIT ${critPct}% ×${PLAYER_BASE.critMultiplier}
          </p>
        </article>
        <div class="avatar-picker panel">
          <h2 class="panel-title">Choose your hero</h2>
          <div class="avatar-grid" id="avatar-grid" role="group" aria-label="Hero choices">
            ${AVATARS.map(
              (a) => `
                <button
                  type="button"
                  class="avatar-option${a.id === state.avatarId ? ' is-selected' : ''}"
                  data-avatar="${a.id}"
                  aria-pressed="${a.id === state.avatarId}"
                >
                  <img class="card-img" src="${a.src}" alt="" width="150" height="225" />
                  <span>${esc(a.label)}</span>
                </button>`
            ).join('')}
          </div>
        </div>
      </div>
    </section>
  `;

  document.getElementById('avatar-grid').addEventListener('click', (e) => {
    const button = e.target.closest('.avatar-option');
    if (!button) return;
    const chosen = getAvatar(button.dataset.avatar);
    const next = updateState({ avatarId: chosen.id });

    app.querySelectorAll('.avatar-option').forEach((b) => {
      const selected = b === button;
      b.classList.toggle('is-selected', selected);
      b.setAttribute('aria-pressed', String(selected));
    });
    const portrait = document.getElementById('char-portrait');
    portrait.src = chosen.src;
    portrait.alt = `Your hero: ${chosen.label}`;
    updateChrome(next, 'character');
  });
}

