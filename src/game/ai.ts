import type { GameState, ResonanceEffectId, TheoryDef, TheoryInstance } from '../types';
import {
  attachNews,
  closeTheory,
  currentPlayer,
  findTheory,
  passReaction,
  placeCatalyst,
  playResonanceCard,
  resolveDiscard,
  resolveRecycle,
  startDrawPhase,
  submitDraftPick,
} from './engine';
import { canCloseTheory, maxAttachableNews } from './rules';
import { LEVEL_POINTS, canAttachNewsToTheory } from './resonanceEffects';
import type { NewsInstance } from '../types';

const NEGATIVE_EFFECTS: ResonanceEffectId[] = [
  'fuori_contesto',
  'insabbiamento',
  'smentita_ufficiale',
  'mezza_verita',
  'fake_news',
  'sotto_la_superficie',
];
const POSITIVE_EFFECTS: ResonanceEffectId[] = [
  'notizia_verificata',
  'leak_controllato',
  'clickbait',
  'trappola_governativa',
  'vaso_di_pandora',
  'anello_mancante',
];

export function aiPickDraft(defs: TheoryDef[]): string[] {
  const sorted = [...defs].sort((a, b) => a.stars - b.stars || Math.random() - 0.5);
  return sorted.slice(0, 3).map((d) => d.id);
}

export function aiDrawSplit(state: GameState): { catalyst: number; news: number } {
  const player = currentPlayer(state);
  let needCatalyst = 0;
  let needNews = 0;
  for (const t of player.theories) {
    if (t.closed) continue;
    if (!t.slotA.filled) needCatalyst += 1;
    if (!t.slotB.filled) needCatalyst += 1;
    const remaining = maxAttachableNews(t) - t.attachedNews.length;
    if (remaining > 0) needNews += 1;
  }
  if (needCatalyst > needNews) return { catalyst: 2, news: 0 };
  if (needNews > needCatalyst) return { catalyst: 0, news: 2 };
  return { catalyst: 1, news: 1 };
}

function findOwnSlotForCatalyst(theories: TheoryInstance[], catalystType: string) {
  for (const t of theories) {
    if (t.closed) continue;
    if (!t.slotA.filled && t.slotA.required === catalystType) return { theory: t, slotKey: 'slotA' as const };
    if (!t.slotB.filled && t.slotB.required === catalystType) return { theory: t, slotKey: 'slotB' as const };
  }
  return null;
}

function findSpotForNews(theories: TheoryInstance[], news: NewsInstance) {
  for (const t of theories) {
    if (t.closed) continue;
    if (!t.slotA.filled || !t.slotB.filled) continue;
    if (t.attachedNews.length >= maxAttachableNews(t)) continue;
    if (!canAttachNewsToTheory(news, t)) continue;
    return t;
  }
  return null;
}

export function aiCloseAllPossible(initial: GameState, playerId: string): GameState {
  let state = initial;
  let progress = true;
  while (progress) {
    progress = false;
    const player = state.players.find((p) => p.id === playerId)!;
    for (const t of player.theories) {
      if (!t.closed && canCloseTheory(t)) {
        const res = closeTheory(state, playerId, t.uid);
        if (!res.error) {
          state = res.state;
          progress = true;
          break;
        }
      }
    }
  }
  return state;
}

/** Attempts exactly one action for the AI player. Returns acted=false if nothing useful could be done. */
export function aiAttemptSingleAction(initial: GameState): { state: GameState; acted: boolean } {
  const playerId = currentPlayer(initial).id;
  const player = initial.players.find((p) => p.id === playerId)!;

  const catalystCard = player.hand.find((c) => c.kind === 'catalyst');
  if (catalystCard && catalystCard.kind === 'catalyst') {
    const spot = findOwnSlotForCatalyst(player.theories, catalystCard.def.type);
    if (spot) {
      const res = placeCatalyst(initial, playerId, catalystCard.uid, spot.theory.uid, spot.slotKey);
      if (!res.error) return { state: res.state, acted: true };
    }
  }

  const newsCards = player.hand.filter((c): c is NewsInstance => c.kind === 'news');
  for (const newsCard of newsCards) {
    const spot = findSpotForNews(player.theories, newsCard);
    if (spot) {
      const res = attachNews(initial, playerId, newsCard.uid, spot.uid);
      if (!res.error) return { state: res.state, acted: true };
    }
  }

  const opponents = initial.players.filter((p) => p.id !== playerId);
  if (catalystCard && catalystCard.kind === 'catalyst') {
    for (const opp of opponents) {
      const spot = findOwnSlotForCatalyst(opp.theories, catalystCard.def.type);
      if (spot) {
        const res = placeCatalyst(initial, playerId, catalystCard.uid, spot.theory.uid, spot.slotKey);
        if (!res.error) return { state: res.state, acted: true };
      }
    }
  }
  for (const newsCard of newsCards) {
    for (const opp of opponents) {
      const spot = findSpotForNews(opp.theories, newsCard);
      if (spot) {
        const res = attachNews(initial, playerId, newsCard.uid, spot.uid);
        if (!res.error) return { state: res.state, acted: true };
      }
    }
  }

  return { state: initial, acted: false };
}

export function runAiDraw(state: GameState): GameState {
  const split = aiDrawSplit(state);
  return startDrawPhase(state, split.catalyst, split.news);
}

export function runAiRecycle(state: GameState): GameState {
  if (!state.pendingRecycle) return state;
  const { playerId, deckType, options } = state.pendingRecycle;
  let best = options[0];
  for (const o of options) {
    if (deckType === 'catalyst' && o.kind === 'catalyst' && best.kind === 'catalyst') {
      if (o.def.points > best.def.points) best = o;
    } else if (deckType === 'news' && o.kind === 'news' && best.kind === 'news') {
      if (LEVEL_POINTS[o.def.startLevel] > LEVEL_POINTS[best.def.startLevel]) best = o;
    }
  }
  const res = resolveRecycle(state, playerId, best.uid);
  return res.error ? state : res.state;
}

export function runAiReaction(state: GameState): GameState {
  const pr = state.pendingReaction;
  if (!pr) return state;
  const reactorId = pr.queue[pr.currentIndex];
  const reactor = state.players.find((p) => p.id === reactorId);
  if (!reactor) return state;

  const theory = findTheory(state, pr.theoryUid);
  const isOwnTheory = theory?.ownerId === reactorId;
  const wantedEffects = isOwnTheory ? POSITIVE_EFFECTS : NEGATIVE_EFFECTS;

  const card = reactor.hand.find((c) => c.kind === 'resonance' && wantedEffects.includes(c.def.effectId));

  if (card) {
    const res = playResonanceCard(state, reactorId, card.uid);
    if (!res.error) return res.state;
  }
  const res = passReaction(state, reactorId);
  return res.error ? state : res.state;
}

function cardRoughValue(card: GameState['players'][number]['hand'][number]): number {
  if (card.kind === 'catalyst') return card.def.points;
  if (card.kind === 'news') return LEVEL_POINTS[card.def.startLevel];
  return 3.5; // Resonance cards are scarce/flexible: prefer keeping them over low-value commons.
}

export function runAiDiscard(state: GameState): GameState {
  const pd = state.pendingDiscard;
  if (!pd) return state;
  const player = state.players.find((p) => p.id === pd.playerId);
  if (!player) return state;

  const toDiscard = [...player.hand]
    .sort((a, b) => cardRoughValue(a) - cardRoughValue(b))
    .slice(0, pd.excess)
    .map((c) => c.uid);

  const res = resolveDiscard(state, pd.playerId, toDiscard);
  return res.error ? state : res.state;
}

export function runAiDraftPick(state: GameState): GameState {
  if (!state.draft) return state;
  let next = state;
  for (const player of state.players) {
    if (!player.isAI) continue;
    if (next.draft?.submitted[player.id]) continue;
    const choices = next.draft?.choices[player.id];
    if (!choices) continue;
    const keepIds = aiPickDraft(choices);
    const res = submitDraftPick(next, player.id, keepIds);
    if (!res.error) next = res.state;
  }
  return next;
}
