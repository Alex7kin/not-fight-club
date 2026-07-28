// Static game data: zones, player base stats, heroes, and monsters.

export const ZONES = [
  { id: 'head', label: 'Head' },
  { id: 'chest', label: 'Chest' },
  { id: 'stomach', label: 'Stomach' },
  { id: 'arms', label: 'Arms' },
  { id: 'legs', label: 'Legs' },
];

export const ZONE_LABELS = Object.fromEntries(ZONES.map((z) => [z.id, z.label]));

// Balance rule: every fighter's HP must be at least 3x their base damage,
// so no fight can end on the first exchange.
export const PLAYER_BASE = {
  maxHp: 120,
  damage: 15,
  critChance: 0.25,
  critMultiplier: 1.5,
  attacksPerTurn: 1,
  defendsPerTurn: 2,
};

// Playable heroes of the Continent. `label` is shown as the character name;
// the card art already carries the full name and a quote.
export const AVATARS = [
  { id: 'geralt', label: 'Geralt of Rivia', src: 'assets/avatars/geralt.png' },
  { id: 'ciri', label: 'Ciri', src: 'assets/avatars/ciri.png' },
  { id: 'triss', label: 'Triss Merigold', src: 'assets/avatars/triss.png' },
  { id: 'yenn', label: 'Yennefer of Vengerberg', src: 'assets/avatars/yenn.png' },
];

export const DEFAULT_AVATAR_ID = AVATARS[0].id;

export function getAvatar(id) {
  return AVATARS.find((a) => a.id === id) || AVATARS[0];
}

// Each monster has a fixed profile: which zones it may strike, which it may
// guard, and how many of each it picks per turn. Actual picks are randomized
// within the profile every turn, without repeats.
// The ladder, in order: rung 1 is the first contract and the easiest, rung 5
// is the last and the hardest. Each rung raises HP, damage per turn, guards
// and crit chance together, while keeping a distinct attack/defense profile.
//
// Every entry obeys the balance rule (maxHp >= 3 * damage), and the player's
// 120 HP outlasts even the top rung's output for well over three turns.
export const OPPONENTS = [
  {
    id: 'griffin',
    name: 'Griffin',
    src: 'assets/opponents/griffin.png',
    maxHp: 60,
    damage: 9, //  9 per turn
    critChance: 0.08,
    critMultiplier: 1.5,
    attacksPerTurn: 1,
    defendsPerTurn: 1,
    attackZones: ['head', 'chest', 'arms'],
    defenseZones: ['head', 'chest', 'arms'],
  },
  {
    id: 'werewolf',
    name: 'Werewolf',
    src: 'assets/opponents/werewolf.png',
    maxHp: 80,
    damage: 7, // 14 per turn
    critChance: 0.12,
    critMultiplier: 1.5,
    attacksPerTurn: 2,
    defendsPerTurn: 2,
    attackZones: ['head', 'chest', 'stomach', 'arms', 'legs'],
    defenseZones: ['chest', 'stomach', 'arms', 'legs'],
  },
  {
    id: 'katakan',
    name: 'Katakan',
    src: 'assets/opponents/katakan.png',
    maxHp: 95,
    damage: 9, // 18 per turn
    critChance: 0.18,
    critMultiplier: 1.5,
    attacksPerTurn: 2,
    defendsPerTurn: 2,
    attackZones: ['head', 'chest', 'stomach', 'arms', 'legs'],
    defenseZones: ['head', 'chest', 'arms'],
  },
  {
    id: 'fiend',
    name: 'Fiend',
    src: 'assets/opponents/fiend.png',
    maxHp: 115,
    damage: 22, // 22 per turn — one crushing blow
    critChance: 0.22,
    critMultiplier: 1.5,
    attacksPerTurn: 1,
    defendsPerTurn: 2,
    attackZones: ['head', 'chest', 'stomach'],
    defenseZones: ['head', 'chest', 'stomach'],
  },
  {
    id: 'leshen',
    name: 'Leshen',
    src: 'assets/opponents/leshen.png',
    maxHp: 120,
    damage: 11, // 26 per turn, behind three guards
    critChance: 0.25,
    critMultiplier: 1.5,
    attacksPerTurn: 2,
    defendsPerTurn: 3,
    attackZones: ['chest', 'stomach', 'arms', 'legs'],
    defenseZones: ['head', 'chest', 'stomach', 'arms'],
  },
];

export const LADDER_LENGTH = OPPONENTS.length;

export function getOpponent(id) {
  return OPPONENTS.find((o) => o.id === id) || OPPONENTS[0];
}

// A win moves you up a rung; a loss or a draw leaves you where you are. Once
// the ladder is cleared the top rung repeats.
export function getLadderOpponent(wins) {
  const n = Math.floor(Number(wins));
  const safe = Number.isFinite(n) ? Math.max(0, n) : 0;
  return OPPONENTS[Math.min(safe, OPPONENTS.length - 1)];
}

// 1-based rung of an opponent, for the "Contract N of 5" label.
export function ladderRung(opponentId) {
  const i = OPPONENTS.findIndex((o) => o.id === opponentId);
  return i < 0 ? 1 : i + 1;
}

