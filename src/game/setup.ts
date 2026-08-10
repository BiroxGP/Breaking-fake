import { CATALYSTS } from '../data/catalysts';
import { THEORIES } from '../data/theories';
import { NEWS } from '../data/news';
import { RESONANCES } from '../data/resonances';
import type { CatalystInstance, GameState, NewsInstance, Player, ResonanceInstance } from '../types';
import { nextUid, shuffle } from './ids';

export interface NewPlayerConfig {
  name: string;
  isAI: boolean;
}

function buildCatalystInstances(copies: number): CatalystInstance[] {
  const out: CatalystInstance[] = [];
  for (let c = 0; c < copies; c++) {
    for (const def of CATALYSTS) out.push({ uid: nextUid('cat'), kind: 'catalyst', def });
  }
  return out;
}

function buildNewsInstances(copies: number): NewsInstance[] {
  const out: NewsInstance[] = [];
  for (let c = 0; c < copies; c++) {
    for (const def of NEWS) {
      out.push({
        uid: nextUid('news'),
        kind: 'news',
        def,
        level: def.startLevel,
        attackerId: '',
        categoryOverridePrincipale: false,
        pointsOverrideZero: false,
        pointsHalved: false,
        pointsCapAt2: false,
        lockedByVerification: false,
      });
    }
  }
  return out;
}

function buildResonanceInstances(copies: number): ResonanceInstance[] {
  const out: ResonanceInstance[] = [];
  for (let c = 0; c < copies; c++) {
    for (const def of RESONANCES) out.push({ uid: nextUid('res'), kind: 'resonance', def });
  }
  return out;
}

export function createGame(configs: NewPlayerConfig[]): GameState {
  const playerCount = configs.length;
  const newsCopiesN = playerCount >= 4 ? 5 : 4;

  // Il mazzo Catalizzatori riproduce esattamente le 60 carte fisiche ufficiali (1 copia ciascuna).
  let catalystDeck = shuffle(buildCatalystInstances(1));
  let newsDeck = shuffle(buildNewsInstances(newsCopiesN));
  const resonanceDeck = shuffle(buildResonanceInstances(4));
  // Il mazzo Teorie riproduce esattamente le 48 carte fisiche ufficiali (1 copia ciascuna).
  const theoryDeck = shuffle([...THEORIES]);

  const players: Player[] = configs.map((c, i) => ({
    id: `p${i + 1}`,
    name: c.name,
    isAI: c.isAI,
    hand: [],
    theories: [],
  }));

  for (const p of players) {
    for (let i = 0; i < 2; i++) {
      const card = catalystDeck.pop();
      if (card) p.hand.push(card);
    }
    for (let i = 0; i < 2; i++) {
      const card = newsDeck.pop();
      if (card) p.hand.push(card);
    }
  }

  const log = [
    {
      id: nextUid('log'),
      text: `La Redazione apre i battenti. ${players.length} Spin Doctor entrano in scena: ${players.map((p) => p.name).join(', ')}.`,
      turn: 0,
    },
  ];

  return {
    players,
    currentPlayerIndex: 0,
    actionsLeft: 2,
    phase: 'draft',
    catalystDeck,
    catalystDiscard: [],
    newsDeck,
    newsDiscard: [],
    resonanceDeck,
    resonanceDiscard: [],
    theoryDeck,
    theoryDiscard: [],
    pendingReaction: null,
    pendingRecycle: null,
    draft: null,
    turnNumber: 1,
    triggerPlayerId: null,
    finalTurnsRemaining: 0,
    log,
    winnerId: null,
    scores: null,
  };
}

export function initDraft(prev: GameState): GameState {
  const state: GameState = { ...prev, players: prev.players.map((p) => ({ ...p, hand: [...p.hand], theories: [...p.theories] })) };
  const choices: Record<string, typeof state.theoryDeck> = {};
  const submitted: Record<string, boolean> = {};
  const theoryDeck = [...state.theoryDeck];
  for (const p of state.players) {
    const picks = [];
    for (let i = 0; i < 5; i++) {
      const t = theoryDeck.pop();
      if (t) picks.push(t);
    }
    choices[p.id] = picks;
    submitted[p.id] = false;
  }
  state.theoryDeck = theoryDeck;
  state.draft = { choices, submitted };
  return state;
}
