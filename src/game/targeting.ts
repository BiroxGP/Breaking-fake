import type { CatalystInstance, GameState, NewsInstance } from '../types';
import { canAttachNewsToTheory } from './resonanceEffects';
import { maxAttachableNews } from './rules';

export interface ApplicableMatch {
  theoryUid: string;
  theoryName: string;
  ownerName: string;
  isOwn: boolean;
  detail: string;
}

/** For a Catalyst or News card, lists every non-closed Theory (across all players) it could
 * currently be played on, so a tactical choice (e.g. Riciclo Tattico) can be made with full context. */
export function findApplicableTheories(
  card: CatalystInstance | NewsInstance,
  state: GameState,
  viewerPlayerId: string,
): ApplicableMatch[] {
  const matches: ApplicableMatch[] = [];

  for (const player of state.players) {
    for (const theory of player.theories) {
      if (theory.closed) continue;

      if (card.kind === 'catalyst') {
        for (const key of ['slotA', 'slotB'] as const) {
          const slot = theory[key];
          if (slot.required !== card.def.type) continue;
          if (slot.filled && theory.locked) continue;
          matches.push({
            theoryUid: theory.uid,
            theoryName: theory.def.name,
            ownerName: player.name,
            isOwn: player.id === viewerPlayerId,
            detail: slot.filled ? `sostituisce ${slot.filled.def.name}` : `slot ${slot.required} libero`,
          });
        }
      } else {
        if (!theory.slotA.filled || !theory.slotB.filled) continue;
        if (theory.attachedNews.length >= maxAttachableNews(theory)) continue;
        if (!canAttachNewsToTheory(card, theory)) continue;
        const asPrincipale = card.def.categoriaPrincipale === theory.def.topic;
        matches.push({
          theoryUid: theory.uid,
          theoryName: theory.def.name,
          ownerName: player.name,
          isOwn: player.id === viewerPlayerId,
          detail: asPrincipale ? 'conta come Principale' : 'conta come Secondaria',
        });
      }
    }
  }

  return matches;
}
