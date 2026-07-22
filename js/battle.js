// Battle engine. Pure state-in, state-out where possible so every turn can be
// persisted and a reload resumes the bout exactly where it stopped.

import { PLAYER_BASE, OPPONENTS, getOpponent } from './data.js';

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

// n distinct picks from arr, uniformly random.
export function sampleDistinct(arr, n) {
  const pool = [...arr];
  const out = [];
  while (out.length < n && pool.length > 0) {
    out.push(pool.splice(randomInt(pool.length), 1)[0]);
  }
  return out;
}

export function createBattle(playerName) {
  const opponent = OPPONENTS[randomInt(OPPONENTS.length)];
  return {
    opponentId: opponent.id,
    playerHp: PLAYER_BASE.maxHp,
    opponentHp: opponent.maxHp,
    round: 1,
    finished: false,
    result: null,
    log: [
      {
        t: 'sys',
        round: 0,
        text: `${playerName} steps into the wood. ${opponent.name} is waiting.`,
      },
    ],
  };
}

function resolveStrike({ attacker, target, zone, damage, critChance, critMultiplier, defense }) {
  const isCrit = Math.random() < critChance;
  const guarded = defense.includes(zone);
  if (guarded && !isCrit) {
    return { t: 'block', who: attacker, whom: target, zone, dmg: 0 };
  }
  const dealt = isCrit ? Math.round(damage * critMultiplier) : damage;
  return {
    t: isCrit ? 'crit' : 'hit',
    who: attacker,
    whom: target,
    zone,
    dmg: dealt,
    brokeGuard: isCrit && guarded,
  };
}

// Both sides swing simultaneously: all strikes are computed and applied even
// if one fighter would already be down, then the outcome is judged.
export function resolveTurn(battle, playerName, playerAttackZone, playerDefenseZones) {
  const opponent = getOpponent(battle.opponentId);
  const round = battle.round;

  const oppAttacks = sampleDistinct(opponent.attackZones, opponent.attacksPerTurn);
  const oppDefense = sampleDistinct(opponent.defenseZones, opponent.defendsPerTurn);

  const entries = [];

  const playerStrike = resolveStrike({
    attacker: playerName,
    target: opponent.name,
    zone: playerAttackZone,
    damage: PLAYER_BASE.damage,
    critChance: PLAYER_BASE.critChance,
    critMultiplier: PLAYER_BASE.critMultiplier,
    defense: oppDefense,
  });
  entries.push(playerStrike);

  for (const zone of oppAttacks) {
    entries.push(
      resolveStrike({
        attacker: opponent.name,
        target: playerName,
        zone,
        damage: opponent.damage,
        critChance: opponent.critChance,
        critMultiplier: opponent.critMultiplier,
        defense: playerDefenseZones,
      })
    );
  }

  let opponentHp = battle.opponentHp;
  let playerHp = battle.playerHp;
  for (const e of entries) {
    e.round = round;
    if (e.who === opponent.name) {
      playerHp = Math.max(0, playerHp - e.dmg);
    } else {
      opponentHp = Math.max(0, opponentHp - e.dmg);
    }
  }

  let finished = false;
  let result = null;
  if (playerHp === 0 || opponentHp === 0) {
    finished = true;
    if (playerHp === 0 && opponentHp === 0) {
      result = 'draw';
      entries.push({
        t: 'sys',
        round,
        text: 'Both died.',
      });
    } else if (opponentHp === 0) {
      result = 'win';
      entries.push({
        t: 'sys',
        round,
        text: `${opponent.name} goes down. ${playerName} claims the contract.`,
      });
    } else {
      result = 'loss';
      entries.push({
        t: 'sys',
        round,
        text: `${playerName} is dead. The Witcher never dies in his bed.`,
      });
    }
  }

  return {
    ...battle,
    playerHp,
    opponentHp,
    round: finished ? round : round + 1,
    finished,
    result,
    log: [...battle.log, ...entries],
  };
}

