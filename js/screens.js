// Screen renderers. Each takes the #app container and the current saved
// state, paints its markup, and wires its own listeners.

import { ZONES, ZONE_LABELS, PLAYER_BASE, AVATARS, getAvatar, getOpponent } from './data.js';
import { updateState, clearState } from './storage.js';
import { createBattle, resolveTurn } from './battle.js';
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

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export function renderSettings(app, state) {
  app.innerHTML = `
    <section class="screen screen--settings">
      <h1>Settings</h1>
      <form id="settings-form" class="stack panel" novalidate>
        <label class="field-label" for="settings-name">Fighter name</label>
        <input
          id="settings-name"
          type="text"
          maxlength="24"
          autocomplete="off"
          value="${esc(state.name)}"
          aria-describedby="settings-error"
          required
        />
        <p class="field-error" id="settings-error" role="alert" hidden>A fighter needs a name — two characters or more.</p>
        <button type="submit" class="btn btn--blood">Save name</button>
        <p class="form-note" id="settings-saved" role="status" hidden>Saved. The Continent will learn it.</p>
      </form>
      <div class="danger panel">
        <h2 class="panel-title">Break the contract</h2>
        <p class="muted">Wipes your name, your record, and any fight in progress.</p>
        <button type="button" id="reset-progress" class="btn btn--ghost">Reset everything</button>
      </div>
    </section>
  `;

  const form = document.getElementById('settings-form');
  const input = document.getElementById('settings-name');
  const error = document.getElementById('settings-error');
  const saved = document.getElementById('settings-saved');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = input.value.trim();
    if (name.length < 2) {
      error.hidden = false;
      saved.hidden = true;
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    const next = updateState({ name });
    updateChrome(next, 'settings');
    error.hidden = true;
    input.removeAttribute('aria-invalid');
    saved.hidden = false;
  });

  input.addEventListener('input', () => {
    error.hidden = true;
    input.removeAttribute('aria-invalid');
    saved.hidden = true;
  });

  document.getElementById('reset-progress').addEventListener('click', () => {
    const sure = window.confirm('Break the contract? Name, record, and current fight are gone for good.');
    if (!sure) return;
    clearState();
    go('#/');
  });
}

/* ------------------------------------------------------------------ */
/* Fight                                                               */
/* ------------------------------------------------------------------ */

function pctWidth(hp, maxHp) {
  return `${Math.max(0, Math.min(100, (hp / maxHp) * 100))}%`;
}

// The zone picker that lives on a fighter card. `panel` is 'attack' (the
// enemy card — pick 1 to strike) or 'defense' (your card — pick 2 to guard).
// It reveals on hover on pointer devices and stays put on touch/keyboard.
function zoneOverlay(panel) {
  const label =
    panel === 'attack'
      ? 'Choose a zone to strike — pick 1'
      : 'Choose a zone to guard — pick 2';
  const hits = ZONES.map(
    (z) => `
        <button type="button" class="zone-hit" data-zone="${z.id}" aria-pressed="false">
          <span class="zone-hit-label">${z.label}</span>
        </button>`
  ).join('');
  return `
    <div class="zone-overlay zone-overlay--${panel}" data-panel="${panel}" role="group" aria-label="${label}">
      ${hits}
    </div>`;
}

function fighterCard({ side, name, src, tag, hp, maxHp, interactive, panel }) {
  const low = hp / maxHp <= 0.3;
  return `
    <article class="fighter fighter--${side}">
      <div class="card-frame${interactive ? ' is-interactive' : ''}">
        <img class="fighter-avatar card-img" src="${src}" alt="" width="200" height="300" />
        ${interactive ? zoneOverlay(panel) : ''}
      </div>
      <div class="fighter-info">
        <h2 class="fighter-name">${esc(name)}</h2>
        <p class="fighter-tag">${esc(tag)}</p>
        <div class="hp" role="img" aria-label="${esc(name)}: ${hp} of ${maxHp} health">
          <div class="hp-fill${low ? ' hp-fill--low' : ''}" style="width:${pctWidth(hp, maxHp)}"></div>
        </div>
        <p class="hp-num"><b>${hp}</b> / ${maxHp}</p>
      </div>
    </article>
  `;
}

function statTag(f) {
  return `DMG ${f.damage} · CRIT ${Math.round(f.critChance * 100)}%`;
}

function entryHtml(e) {
  if (e.t === 'sys') {
    return `<li class="report-entry report-entry--sys">${esc(e.text)}</li>`;
  }
  const who = `<b class="log-who">${esc(e.who)}</b>`;
  const whom = `<b class="log-whom">${esc(e.whom)}</b>`;
  const where = `<span class="log-where">${esc(ZONE_LABELS[e.zone].toLowerCase())}</span>`;
  if (e.t === 'block') {
    return `
      <li class="report-entry report-entry--block">
        ${who} swings at ${whom} · ${where} ·
        <span class="log-dmg log-dmg--zero">0 dmg</span>
        <span class="stamp stamp--block">parried</span>
      </li>`;
  }
  const stamp = e.t === 'crit' ? '<span class="stamp stamp--crit">critical</span>' : '';
  const note = e.brokeGuard ? '<span class="log-note">— straight through the guard</span>' : '';
  return `
    <li class="report-entry${e.t === 'crit' ? ' report-entry--crit' : ''}">
      ${who} hits ${whom} · ${where} ·
      <span class="log-dmg">${e.dmg} dmg</span>
      ${stamp}${note}
    </li>`;
}

function reportHtml(battle, state) {
  const { wins, losses, draws } = state.record;
  const boutNo = wins + losses + draws + (battle.finished ? 0 : 1);

  const groups = new Map();
  for (const e of battle.log) {
    if (!groups.has(e.round)) groups.set(e.round, []);
    groups.get(e.round).push(e);
  }
  const rounds = [...groups.keys()].sort((a, b) => b - a);
  const entries = rounds
    .map((r) => {
      const marker = r === 0 ? '' : `<li class="report-round" aria-hidden="true">· round ${r} ·</li>`;
      return marker + groups.get(r).map(entryHtml).join('');
    })
    .join('');

  return `
    <section class="report" aria-label="Contract log">
      <header class="report-head">
        <span class="report-title">Contract</span>
        <span class="report-no">№ ${boutNo}</span>
      </header>
      <ol class="report-list" aria-live="polite">
        ${entries}
      </ol>
    </section>
  `;
}

function verdictHtml(battle) {
  const word = { win: 'Contract fulfilled', loss: 'You died', draw: 'Both died' }[battle.result];
  const note = {
    win: 'Toss a coin to your Witcher.',
    loss: 'The Witcher never dies in his bed.',
    draw: 'In the end, death always wins.',
  }[battle.result];
  return `
    <div class="verdict verdict--${battle.result}">
      <p class="verdict-word">${word}</p>
      <p class="verdict-note">${note}</p>
      <div class="verdict-actions">
        <button type="button" id="rematch-btn" class="btn btn--blood">Fight again</button>
        <a href="#/" class="btn btn--ghost">Back to the Contract</a>
      </div>
    </div>
  `;
}

function commitBarHtml() {
  return `
    <div class="commit-bar">
      <button type="button" id="swing-btn" class="btn-fight" disabled>Swing</button>
      <p class="commit-hint" id="commit-hint" aria-live="polite">Strike 0/1 · Guard 0/2</p>
    </div>
  `;
}

export function renderFight(app, state, prevHp) {
  let battle = state.battle;
  if (!battle) {
    battle = createBattle(state.name);
    state = updateState({ battle });
  }
  const opponent = getOpponent(battle.opponentId);

  app.innerHTML = `
    <section class="screen screen--fight">
      <div class="ring">
        ${fighterCard({
          side: 'you',
          name: state.name,
          src: getAvatar(state.avatarId).src,
          tag: statTag(PLAYER_BASE),
          hp: battle.playerHp,
          maxHp: PLAYER_BASE.maxHp,
          interactive: !battle.finished,
          panel: 'defense',
        })}
        <div class="vs">
          <span class="vs-round">Round ${battle.round}</span>
          <span class="vs-mark">vs</span>
        </div>
        ${fighterCard({
          side: 'opp',
          name: opponent.name,
          src: opponent.src,
          tag: statTag(opponent),
          hp: battle.opponentHp,
          maxHp: opponent.maxHp,
          interactive: !battle.finished,
          panel: 'attack',
        })}
      </div>
      ${battle.finished ? verdictHtml(battle) : commitBarHtml()}
      ${reportHtml(battle, state)}
    </section>
  `;

  // Animate HP bars from their pre-turn values, and — since the whole screen
  // was just replaced — announce the outcome and move focus somewhere useful
  // so keyboard and screen-reader users aren't dropped back at the page top.
  if (prevHp) {
    const youFill = app.querySelector('.fighter--you .hp-fill');
    const oppFill = app.querySelector('.fighter--opp .hp-fill');
    youFill.style.width = pctWidth(prevHp.player, PLAYER_BASE.maxHp);
    oppFill.style.width = pctWidth(prevHp.opponent, opponent.maxHp);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        youFill.style.width = pctWidth(battle.playerHp, PLAYER_BASE.maxHp);
        oppFill.style.width = pctWidth(battle.opponentHp, opponent.maxHp);
      });
    });
  }

  if (battle.finished) {
    const rematch = document.getElementById('rematch-btn');
    rematch.addEventListener('click', () => {
      updateState({ battle: null });
      go('#/fight');
    });
    return;
  }

  const attackSel = new Set();
  const defenseSel = new Set();
  const swingBtn = document.getElementById('swing-btn');
  const hint = document.getElementById('commit-hint');

  function syncPanel(panel, selection) {
    app.querySelectorAll(`[data-panel="${panel}"] .zone-hit`).forEach((b) => {
      const on = selection.has(b.dataset.zone);
      b.classList.toggle('is-selected', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }

  function syncControls() {
    syncPanel('attack', attackSel);
    syncPanel('defense', defenseSel);
    const ready = attackSel.size === 1 && defenseSel.size === 2;
    swingBtn.disabled = !ready;
    hint.textContent = ready
      ? 'Ready. Swing when you are.'
      : `Strike ${attackSel.size}/1 · Guard ${defenseSel.size}/2`;
  }

  app.querySelector('[data-panel="attack"]').addEventListener('click', (e) => {
    const btn = e.target.closest('.zone-hit');
    if (!btn) return;
    const zone = btn.dataset.zone;
    if (attackSel.has(zone)) {
      attackSel.delete(zone);
    } else {
      attackSel.clear();
      attackSel.add(zone);
    }
    syncControls();
  });

  app.querySelector('[data-panel="defense"]').addEventListener('click', (e) => {
    const btn = e.target.closest('.zone-hit');
    if (!btn) return;
    const zone = btn.dataset.zone;
    if (defenseSel.has(zone)) {
      defenseSel.delete(zone);
    } else {
      if (defenseSel.size >= 2) {
        const oldest = defenseSel.values().next().value;
        defenseSel.delete(oldest);
      }
      defenseSel.add(zone);
    }
    syncControls();
  });

  swingBtn.addEventListener('click', () => {
    if (attackSel.size !== 1 || defenseSel.size !== 2) return;
    const prev = { player: battle.playerHp, opponent: battle.opponentHp };
    const next = resolveTurn(battle, state.name, [...attackSel][0], [...defenseSel]);

    let record = state.record;
    if (next.finished) {
      record = { ...state.record };
      if (next.result === 'win') record.wins += 1;
      else if (next.result === 'loss') record.losses += 1;
      else record.draws += 1;
    }
    const nextState = updateState({ battle: next, record });
    renderFight(app, nextState, prev);
  });

  syncControls();

  // After a resolved turn the controls are freshly rendered; put keyboard
  // focus on the first strike zone (on the monster's card) so the next move
  // is one keystroke away — and so its overlay reveals via :focus-within.
  if (prevHp) {
    app.querySelector('[data-panel="attack"] .zone-hit')?.focus();
  }
}

