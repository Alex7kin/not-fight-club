# Not Fight Club — the Continent's cut

A turn-based browser fight pit for the [RS School Bootcamp task](https://github.com/rolling-scopes-school/tasks/blob/master/stage0.5%20Bootcamp/tasks/notFightClub/README.md),
skinned to the world of the Witcher. Pure HTML/CSS/vanilla JS — no frameworks, no build step, no backend.

## How it plays

- **Register** — pick a fighter name. It sticks across reloads.
- **Hero** — choose Geralt, Ciri, Triss or Yennefer; the card follows you everywhere.
- **Settings** — rename your fighter or wipe your progress.
- **Fight** — hover your card to set **2 guards**, the monster's card to pick **1 strike**, then swing.
  Both sides trade blows simultaneously.

## The ladder

Monsters are fought in order, easiest first. A win moves you up a rung; a loss or draw keeps you
where you are. Clear all five and the last one repeats.

| # | Monster  | HP  | Damage | Hits/turn | Guards |
|---|----------|-----|--------|-----------|--------|
| 1 | Griffin  | 60  | 9      | 1         | 1      |
| 2 | Werewolf | 80  | 7      | 2         | 2      |
| 3 | Katakan  | 95  | 9      | 2         | 2      |
| 4 | Fiend    | 115 | 22     | 1         | 2      |
| 5 | Leshen   | 120 | 11     | 2         | 3      |

### Rules

- Damage lands only where the attack isn't guarded; a guarded zone is parried for 0.
- **Criticals** deal ×1.5 and cut straight through a guard.
- Every fighter's HP is at least 3× their base damage, so no bout ends in one turn.
- Every blow is written to the **contract** with who / whom / where / how much.

## Persistence

Everything lives in `localStorage`: name, hero, record, music preference **and the bout in
progress** — reload mid-fight and you resume at the same HP, round and log.

## Run locally

```bash
npx http-server -p 8080 .
```

Then open `http://localhost:8080`.

## Structure

```
index.html          shell + header/footer chrome
css/styles.css      all styling
js/main.js          hash router + boot
js/screens.js       screen renderers
js/battle.js        battle engine (turn resolution, crits, blocks)
js/data.js          zones, player stats, heroes, monster ladder
js/storage.js       localStorage persistence
js/audio.js         background music toggle
assets/             hero + monster card art, cursors, music
```

## Art credits

Hero and monster portraits are Gwent cards from [matt77hias/Gwent](https://github.com/matt77hias/Gwent)
(artwork © CD Projekt Red), used here for a personal, non-commercial learning project only.
