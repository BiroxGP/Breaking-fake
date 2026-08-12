import type { GameState, ScoreBreakdown, TheoryInstance } from '../types';
import { LEVEL_ORDER, newsCategoryOnTheory, newsScoreContribution } from './resonanceEffects';

/** Manuale, "Bonus Coerenza Testuale": +5 PV per Teoria chiusa che usa negli slot il Catalizzatore
 * citato nel testo narrativo — un unico +5 a Teoria, non uno per slot. */
function coerenzaTestualeBonus(theory: TheoryInstance): number {
  const refs = theory.def.testuale;
  const matches =
    (!!theory.slotA.filled && refs.includes(theory.slotA.filled.def.id)) ||
    (!!theory.slotB.filled && refs.includes(theory.slotB.filled.def.id));
  return matches ? 5 : 0;
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

export interface TheoryScore {
  theoryValue: number;
  catalystValue: number;
  newsValue: number;
  coerenzaTestuale: number;
  clickbaiterSeriale: number;
  subtotal: number;
}

/** Per-Teoria breakdown (everything a single closed Teoria contributes on its own — excludes
 * Monopolio, which depends on the player's other closed Teorie, and Scoop del Secolo, which is a
 * whole-game trigger bonus, not tied to any one Teoria). */
export function scoreTheory(theory: TheoryInstance): TheoryScore {
  const theoryValue = theory.def.basePV;
  const catalystValue = (theory.slotA.filled?.def.points ?? 0) + (theory.slotB.filled?.def.points ?? 0);
  const newsValue = theory.attachedNews.reduce((sum, n) => sum + newsScoreContribution(n, theory), 0);
  const coerenzaTestuale = coerenzaTestualeBonus(theory);
  const clickbaiterSeriale = clickbaiterQualifies(theory) ? 5 : 0;
  const subtotal = theoryValue + catalystValue + newsValue + coerenzaTestuale + clickbaiterSeriale;
  return { theoryValue, catalystValue, newsValue, coerenzaTestuale, clickbaiterSeriale, subtotal };
}

/** Manuale, "Bonus Monopolio": +5 PV per ogni Teoria chiusa dello stesso topic successiva alla
 * prima. Attributed here to whichever Teoria wasn't the first of its topic to close. */
export function monopolioBonusFor(theory: TheoryInstance, allTheories: TheoryInstance[]): number {
  const sameTopicClosed = allTheories
    .filter((t) => t.closed && t.def.topic === theory.def.topic)
    .sort((a, b) => (a.closeOrder ?? 0) - (b.closeOrder ?? 0));
  const idx = sameTopicClosed.findIndex((t) => t.uid === theory.uid);
  return idx > 0 ? 5 : 0;
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
    let monopolio = 0;

    for (const t of closed) {
      const s = scoreTheory(t);
      theoryValue += s.theoryValue;
      catalystValue += s.catalystValue;
      newsValue += s.newsValue;
      coerenzaTestuale += s.coerenzaTestuale;
      clickbaiterSeriale += s.clickbaiterSeriale;
      monopolio += monopolioBonusFor(t, player.theories);
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
