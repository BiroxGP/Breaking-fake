import type { GameState, ScoreBreakdown, TheoryInstance } from '../types';
import { LEVEL_ORDER, newsCategoryOnTheory, newsScoreContribution } from './resonanceEffects';

function coerenzaTestualeBonus(theory: TheoryInstance): number {
  let bonus = 0;
  const flavor = theory.def.flavor.toLowerCase();
  if (theory.slotA.filled && flavor.includes(theory.slotA.filled.def.name.toLowerCase())) bonus += 5;
  if (theory.slotB.filled && flavor.includes(theory.slotB.filled.def.name.toLowerCase())) bonus += 5;
  return bonus;
}

function clickbaiterQualifies(theory: TheoryInstance): boolean {
  if (theory.def.stars !== 3) return false;
  if (theory.attachedNews.length === 0) return false;
  const viraleIdx = LEVEL_ORDER.indexOf('Virale');
  return theory.attachedNews.every(
    (n) =>
      newsCategoryOnTheory(n, theory) === 'Secondaria' &&
      !n.categoryOverridePrincipale &&
      !n.pointsOverrideZero &&
      LEVEL_ORDER.indexOf(n.level) >= viraleIdx,
  );
}

export function computeScores(state: GameState): Record<string, ScoreBreakdown> {
  const scores: Record<string, ScoreBreakdown> = {};

  for (const player of state.players) {
    const closed = player.theories.filter((t) => t.closed);

    let theoryValue = 0;
    let catalystValue = 0;
    let newsValue = 0;
    let coerenzaTestuale = 0;
    let clickbaiterSeriale = 0;

    for (const t of closed) {
      theoryValue += t.def.basePV;
      catalystValue += (t.slotA.filled?.def.points ?? 0) + (t.slotB.filled?.def.points ?? 0);
      newsValue += t.attachedNews.reduce((sum, n) => sum + newsScoreContribution(n, t), 0);
      coerenzaTestuale += coerenzaTestualeBonus(t);
      if (clickbaiterQualifies(t)) clickbaiterSeriale += 5;
    }

    const topicCounts = new Map<string, number>();
    for (const t of closed) {
      topicCounts.set(t.def.topic, (topicCounts.get(t.def.topic) ?? 0) + 1);
    }
    let monopolio = 0;
    for (const count of topicCounts.values()) {
      if (count > 1) monopolio += 5 * (count - 1);
    }

    const scoopDelSecolo = state.triggerPlayerId === player.id ? 3 : 0;

    const total =
      theoryValue + catalystValue + newsValue + coerenzaTestuale + monopolio + scoopDelSecolo + clickbaiterSeriale;

    scores[player.id] = {
      playerId: player.id,
      theoryValue,
      catalystValue,
      newsValue,
      coerenzaTestuale,
      monopolio,
      scoopDelSecolo,
      clickbaiterSeriale,
      total,
    };
  }

  return scores;
}
