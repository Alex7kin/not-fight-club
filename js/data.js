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
export const OPPONENTS = [
  {
    id: 'griffin',
    name: 'Griffin',
    src: 'assets/opponents/griffin.png',
    maxHp: 90,
    damage: 16,
    critChance: 0.22,
    critMultiplier: 1.5,
    attacksPerTurn: 1,
    defendsPerTurn: 2,
    attackZones: ['head', 'chest', 'arms'],
    defenseZones: ['head', 'chest', 'arms', 'legs'],
  },
  {
    id: 'leshen',
    name: 'Leshen',
    src: 'assets/opponents/leshen.png',
    maxHp: 130,
    damage: 13,
    critChance: 0.1,
    critMultiplier: 1.5,
    attacksPerTurn: 1,
    defendsPerTurn: 3,
    attackZones: ['chest', 'stomach', 'arms', 'legs'],
    defenseZones: ['head', 'chest', 'stomach', 'arms', 'legs'],
  },
  {
    id: 'fiend',
    name: 'Fiend',
    src: 'assets/opponents/fiend.png',
    maxHp: 120,
    damage: 18,
    critChance: 0.15,
    critMultiplier: 1.5,
    attacksPerTurn: 1,
    defendsPerTurn: 1,
    attackZones: ['head', 'chest', 'stomach'],
    defenseZones: ['head', 'chest', 'stomach'],
  },
  {
    id: 'katakan',
    name: 'Katakan',
    src: 'assets/opponents/katakan.png',
    maxHp: 80,
    damage: 10,
    critChance: 0.3,
    critMultiplier: 1.5,
    attacksPerTurn: 2,
    defendsPerTurn: 1,
    attackZones: ['head', 'chest', 'stomach', 'arms', 'legs'],
    defenseZones: ['head', 'chest', 'arms'],
  },
  {
    id: 'werewolf',
    name: 'Werewolf',
    src: 'assets/opponents/werewolf.png',
    maxHp: 95,
    damage: 12,
    critChance: 0.2,
    critMultiplier: 1.5,
    attacksPerTurn: 2,
    defendsPerTurn: 2,
    attackZones: ['head', 'chest', 'stomach', 'arms', 'legs'],
    defenseZones: ['chest', 'stomach', 'arms', 'legs'],
  },
];

export function getOpponent(id) {
  return OPPONENTS.find((o) => o.id === id) || OPPONENTS[0];
}
