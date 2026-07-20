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

