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

