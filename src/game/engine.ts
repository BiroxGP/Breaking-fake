import type {
  CatalystInstance,
  GameState,
  HandCard,
  NewsInstance,
  Player,
  TheoryDef,
  TheoryInstance,
} from '../types';
import { nextUid, shuffle } from './ids';
import { applyResonanceEffect, canAttachNewsToTheory } from './resonanceEffects';
import { canCloseTheory, maxAttachableNews } from './rules';
import { computeScores } from './scoring';

const HAND_LIMIT = 10;

export function clone(state: GameState): GameState {
  return structuredClone(state);
}

export function addLog(state: GameState, text: string) {
  state.log.push({ id: nextUid('log'), text, turn: state.turnNumber });
  if (state.log.length > 200) state.log.shift();
}

export function currentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex];
}

export function findTheory(state: GameState, theoryUid: string): TheoryInstance | undefined {
  for (const p of state.players) {
    const t = p.theories.find((th) => th.uid === theoryUid);
    if (t) return t;
  }
  return undefined;
}

export function findOwnerOfTheory(state: GameState, theoryUid: string): Player | undefined {
  return state.players.find((p) => p.theories.some((t) => t.uid === theoryUid));
}

function ensureCatalystDeck(state: GameState) {
  if (state.catalystDeck.length === 0 && state.catalystDiscard.length > 0) {
    state.catalystDeck = shuffle(state.catalystDiscard);
    state.catalystDiscard = [];
    addLog(state, 'Il mazzo Catalizzatori viene rimescolato dagli scarti.');
  }
}

function ensureNewsDeck(state: GameState) {
  if (state.newsDeck.length === 0 && state.newsDiscard.length > 0) {
    state.newsDeck = shuffle(state.newsDiscard);
    state.newsDiscard = [];
    addLog(state, 'Il mazzo Notizie viene rimescolato dagli scarti.');
  }
}

function ensureResonanceDeck(state: GameState) {
  if (state.resonanceDeck.length === 0 && state.resonanceDiscard.length > 0) {
    state.resonanceDeck = shuffle(state.resonanceDiscard);
    state.resonanceDiscard = [];
    addLog(state, 'Il mazzo Risonanze viene rimescolato dagli scarti.');
  }
}

export function drawCatalyst(state: GameState): CatalystInstance | null {
  ensureCatalystDeck(state);
  return state.catalystDeck.pop() ?? null;
}

export function drawNews(state: GameState): NewsInstance | null {
  ensureNewsDeck(state);
  return state.newsDeck.pop() ?? null;
}

export function drawResonance(state: GameState) {
  ensureResonanceDeck(state);
  return state.resonanceDeck.pop() ?? null;
}

export function startDrawPhase(prev: GameState, catalystCount: number, newsCount: number): GameState {
  const state = clone(prev);
  const player = currentPlayer(state);
  for (let i = 0; i < catalystCount; i++) {
    const c = drawCatalyst(state);
    if (c) player.hand.push(c);
  }
  for (let i = 0; i < newsCount; i++) {
    const n = drawNews(state);
    if (n) player.hand.push(n);
  }
  const res = drawResonance(state);
  if (res) player.hand.push(res);
  addLog(
    state,
    `${player.name} pesca ${catalystCount} Catalizzatore/i, ${newsCount} Notizia/e e 1 Risonanza.`,
  );
  state.phase = 'actions';
  state.actionsLeft = 2;
  state.selfActionUsed = false;
  state.opponentActionUsed = false;
  return state;
}

interface ActionResult {
  state: GameState;
  error?: string;
}

export function placeCatalyst(
  prev: GameState,
  actingPlayerId: string,
  cardUid: string,
  theoryUid: string,
  slotKey: 'slotA' | 'slotB',
): ActionResult {
  const state = clone(prev);
  const actingPlayer = state.players.find((p) => p.id === actingPlayerId);
  if (!actingPlayer) return { state: prev, error: 'Giocatore non trovato.' };
  if (state.actionsLeft <= 0) return { state: prev, error: 'Nessuna azione disponibile.' };

  const cardIdx = actingPlayer.hand.findIndex((c) => c.uid === cardUid);
  if (cardIdx === -1) return { state: prev, error: 'Carta non trovata in mano.' };
  const card = actingPlayer.hand[cardIdx];
  if (card.kind !== 'catalyst') return { state: prev, error: 'La carta non è un Catalizzatore.' };

  const theory = findTheory(state, theoryUid);
  if (!theory) return { state: prev, error: 'Teoria non trovata.' };
  const slot = theory[slotKey];
  if (slot.required !== card.def.type) {
    return { state: prev, error: `Questo slot richiede un Catalizzatore di tipo ${slot.required}.` };
  }
  if (slot.filled && theory.locked) {
    return { state: prev, error: 'La Teoria ha già Notizie collegate: i Catalizzatori sono bloccati.' };
  }

  const isOpponent = theory.ownerId !== actingPlayerId;
  if (isOpponent && state.opponentActionUsed) {
    return { state: prev, error: 'Hai già giocato la tua azione su un avversario questo turno.' };
  }
  if (!isOpponent && state.selfActionUsed) {
    return { state: prev, error: 'Hai già giocato la tua azione su te stesso questo turno.' };
  }

  const replaced = slot.filled;
  actingPlayer.hand.splice(cardIdx, 1);
  slot.filled = card;
  if (replaced) state.catalystDiscard.push(replaced);
  if (theory.slotA.filled && theory.slotB.filled) theory.locked = true;
  state.actionsLeft -= 1;
  if (isOpponent) state.opponentActionUsed = true;
  else state.selfActionUsed = true;

  addLog(
    state,
    `${actingPlayer.name} piazza il Catalizzatore "${card.def.name}" ${
      replaced ? 'sostituendo quello precedente ' : ''
    }su "${theory.def.name}"${isOpponent ? ' (teoria avversaria!)' : ''}.`,
  );

  if (isOpponent) {
    triggerRicicloTattico(state, actingPlayer, 'catalyst');
  }

  return { state };
}

export function attachNews(
  prev: GameState,
  actingPlayerId: string,
  cardUid: string,
  theoryUid: string,
): ActionResult {
  const state = clone(prev);
  const actingPlayer = state.players.find((p) => p.id === actingPlayerId);
  if (!actingPlayer) return { state: prev, error: 'Giocatore non trovato.' };
  if (state.actionsLeft <= 0) return { state: prev, error: 'Nessuna azione disponibile.' };

  const cardIdx = actingPlayer.hand.findIndex((c) => c.uid === cardUid);
  if (cardIdx === -1) return { state: prev, error: 'Carta non trovata in mano.' };
  const card = actingPlayer.hand[cardIdx];
  if (card.kind !== 'news') return { state: prev, error: 'La carta non è una Notizia.' };

  const theory = findTheory(state, theoryUid);
  if (!theory) return { state: prev, error: 'Teoria non trovata.' };
  if (!theory.slotA.filled || !theory.slotB.filled) {
    return { state: prev, error: 'Servono entrambi i Catalizzatori piazzati prima di collegare Notizie.' };
  }
  if (theory.attachedNews.length >= maxAttachableNews(theory)) {
    return { state: prev, error: 'Questa Teoria ha già il numero massimo di Notizie collegate.' };
  }
  if (!canAttachNewsToTheory(card, theory)) {
    return {
      state: prev,
      error: `"${card.def.name}" non è compatibile con il topic "${theory.def.topic}" di questa Teoria.`,
    };
  }

  const isOpponent = theory.ownerId !== actingPlayerId;
  if (isOpponent && state.opponentActionUsed) {
    return { state: prev, error: 'Hai già giocato la tua azione su un avversario questo turno.' };
  }
  if (!isOpponent && state.selfActionUsed) {
    return { state: prev, error: 'Hai già giocato la tua azione su te stesso questo turno.' };
  }

  actingPlayer.hand.splice(cardIdx, 1);
  card.attackerId = actingPlayerId;
  theory.attachedNews.push(card);
  state.actionsLeft -= 1;
  if (isOpponent) state.opponentActionUsed = true;
  else state.selfActionUsed = true;

  addLog(
    state,
    `${actingPlayer.name} pubblica la Notizia "${card.def.name}" su "${theory.def.name}"${
      isOpponent ? ' (teoria avversaria!)' : ''
    }.`,
  );

  if (isOpponent) {
    triggerRicicloTattico(state, actingPlayer, 'news');
  }

  startReactionWindow(state, card.uid, theory.uid, theory.ownerId, actingPlayerId);

  return { state };
}

function triggerRicicloTattico(state: GameState, actingPlayer: Player, deckType: 'catalyst' | 'news') {
  const options: (CatalystInstance | NewsInstance)[] = [];
  for (let i = 0; i < 3; i++) {
    const c = deckType === 'catalyst' ? drawCatalyst(state) : drawNews(state);
    if (c) options.push(c);
  }
  if (options.length === 0) return;
  addLog(
    state,
    `Riciclo Tattico! ${actingPlayer.name} pesca ${options.length} carte extra e ne terrà solo 1.`,
  );
  state.pendingRecycle = { playerId: actingPlayer.id, deckType, options };
}

export function resolveRecycle(prev: GameState, playerId: string, keepUid: string): ActionResult {
  const state = clone(prev);
  if (!state.pendingRecycle || state.pendingRecycle.playerId !== playerId) {
    return { state: prev, error: 'Nessun Riciclo Tattico in corso per questo giocatore.' };
  }
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { state: prev, error: 'Giocatore non trovato.' };

  const kept = state.pendingRecycle.options.find((o) => o.uid === keepUid);
  if (!kept) return { state: prev, error: 'Carta non valida.' };

  player.hand.push(kept);
  for (const o of state.pendingRecycle.options) {
    if (o.uid !== keepUid) {
      if (o.kind === 'catalyst') state.catalystDiscard.push(o);
      else state.newsDiscard.push(o);
    }
  }
  addLog(state, `${player.name} tiene "${kept.def.name}" e scarta le altre 2 carte pescate.`);
  state.pendingRecycle = null;
  return { state };
}

function startReactionWindow(
  state: GameState,
  newsUid: string,
  theoryUid: string,
  theoryOwnerId: string,
  placedById: string,
) {
  const n = state.players.length;
  const placerIdx = state.players.findIndex((p) => p.id === placedById);
  const queue: string[] = [];
  for (let i = 0; i < n; i++) {
    queue.push(state.players[(placerIdx + i) % n].id);
  }
  state.pendingReaction = {
    newsUid,
    theoryUid,
    theoryOwnerId,
    placedById,
    queue,
    currentIndex: 0,
  };
  state.phase = 'reaction';
}

/** Only one Resonance card may be played per reactor: after playing (or passing), the window
 * always advances to the next player in the queue, closing once everyone has had their turn. */
function advanceReactionQueue(state: GameState) {
  const pr = state.pendingReaction;
  if (!pr) return;
  pr.currentIndex += 1;
  if (pr.currentIndex >= pr.queue.length) {
    state.pendingReaction = null;
    state.phase = 'actions';
    addLog(state, 'La Finestra di Reazione si chiude.');
  }
}

export function playResonanceCard(prev: GameState, playerId: string, cardUid: string): ActionResult {
  const state = clone(prev);
  const pr = state.pendingReaction;
  if (!pr) return { state: prev, error: 'Nessuna finestra di reazione aperta.' };
  if (pr.queue[pr.currentIndex] !== playerId) {
    return { state: prev, error: 'Non è il tuo turno di reazione.' };
  }
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { state: prev, error: 'Giocatore non trovato.' };
  const cardIdx = player.hand.findIndex((c) => c.uid === cardUid);
  if (cardIdx === -1) return { state: prev, error: 'Carta non trovata in mano.' };
  const card = player.hand[cardIdx];
  if (card.kind !== 'resonance') return { state: prev, error: 'La carta non è una Risonanza.' };

  const theory = findTheory(state, pr.theoryUid);
  const news = theory?.attachedNews.find((n) => n.uid === pr.newsUid);
  if (!theory || !news) return { state: prev, error: 'Notizia bersaglio non trovata.' };
  if (news.lockedByVerification) {
    return { state: prev, error: 'Questa notizia è protetta da Notizia Verificata: nessun\'altra Risonanza può toccarla.' };
  }

  player.hand.splice(cardIdx, 1);
  const outcome = applyResonanceEffect(news, theory, card.def.effectId);
  state.resonanceDiscard.push(card);
  if (outcome.removeFromTheory) {
    theory.attachedNews = theory.attachedNews.filter((n) => n.uid !== news.uid);
    state.newsDiscard.push(news);
  }

  addLog(state, `${player.name} gioca la Risonanza "${card.def.name}" su "${news.def.name}": ${outcome.detail}`);
  advanceReactionQueue(state);

  return { state };
}

export function playImmediateResonance(
  prev: GameState,
  playerId: string,
  cardUid: string,
  target: { theoryUid: string; newsUid: string },
): ActionResult {
  const state = clone(prev);
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { state: prev, error: 'Giocatore non trovato.' };
  const cardIdx = player.hand.findIndex((c) => c.uid === cardUid);
  if (cardIdx === -1) return { state: prev, error: 'Carta non trovata in mano.' };
  const card = player.hand[cardIdx];
  if (card.kind !== 'resonance') return { state: prev, error: 'La carta non è una Risonanza.' };
  if (card.def.type !== 'Immediata') {
    return { state: prev, error: 'Questa carta si può giocare solo durante la Finestra di Reazione.' };
  }

  const theory = findTheory(state, target.theoryUid);
  if (!theory) return { state: prev, error: 'Teoria non trovata.' };

  const news = theory.attachedNews.find((n) => n.uid === target.newsUid);
  if (!news) return { state: prev, error: 'Notizia non trovata.' };
  if (news.lockedByVerification) {
    return { state: prev, error: 'Questa notizia è protetta da Notizia Verificata.' };
  }

  player.hand.splice(cardIdx, 1);
  const outcome = applyResonanceEffect(news, theory, card.def.effectId);
  state.resonanceDiscard.push(card);
  if (outcome.removeFromTheory) {
    theory.attachedNews = theory.attachedNews.filter((n) => n.uid !== news.uid);
    state.newsDiscard.push(news);
  }
  addLog(
    state,
    `${player.name} gioca "${card.def.name}" su "${news.def.name}" (${theory.def.name}): ${outcome.detail}`,
  );
  return { state };
}

export function passReaction(prev: GameState, playerId: string): ActionResult {
  const state = clone(prev);
  const pr = state.pendingReaction;
  if (!pr) return { state: prev, error: 'Nessuna finestra di reazione aperta.' };
  if (pr.queue[pr.currentIndex] !== playerId) {
    return { state: prev, error: 'Non è il tuo turno di reazione.' };
  }
  advanceReactionQueue(state);
  return { state };
}

export function closeTheory(prev: GameState, playerId: string, theoryUid: string): ActionResult {
  const state = clone(prev);
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { state: prev, error: 'Giocatore non trovato.' };
  const theory = player.theories.find((t) => t.uid === theoryUid);
  if (!theory) return { state: prev, error: 'Teoria non trovata o non tua.' };
  if (!canCloseTheory(theory)) return { state: prev, error: 'Requisiti di chiusura non soddisfatti.' };

  const closedCountBefore = player.theories.filter((t) => t.closed).length;
  theory.closed = true;
  theory.closeOrder = closedCountBefore + 1;

  addLog(state, `${player.name} manda in stampa "${theory.def.name}"! (Teoria chiusa n. ${theory.closeOrder})`);

  const totalClosed = player.theories.filter((t) => t.closed).length;
  if (totalClosed >= 3 && !state.triggerPlayerId) {
    state.triggerPlayerId = player.id;
    state.finalTurnsRemaining = state.players.length - 1;
    addLog(
      state,
      `SCOOP DEL SECOLO! ${player.name} ha chiuso la sua terza Teoria. Inizia l'Ultimo Giro per tutti gli altri.`,
    );
  }

  return { state };
}

export function endTurn(prev: GameState): GameState {
  const state = clone(prev);
  const player = currentPlayer(state);

  if (player.hand.length > HAND_LIMIT) {
    state.pendingDiscard = { playerId: player.id, excess: player.hand.length - HAND_LIMIT };
    addLog(
      state,
      `${player.name} ha superato il limite di 10 carte in mano: deve scartarne ${state.pendingDiscard.excess}.`,
    );
    return state;
  }

  return advanceTurn(state);
}

export function resolveDiscard(prev: GameState, playerId: string, cardUids: string[]): ActionResult {
  const state = clone(prev);
  if (!state.pendingDiscard || state.pendingDiscard.playerId !== playerId) {
    return { state: prev, error: 'Nessuno scarto da risolvere per questo giocatore.' };
  }
  if (cardUids.length !== state.pendingDiscard.excess) {
    return { state: prev, error: `Devi scartare esattamente ${state.pendingDiscard.excess} carta/e.` };
  }
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { state: prev, error: 'Giocatore non trovato.' };

  const uniqueUids = new Set(cardUids);
  if (uniqueUids.size !== cardUids.length) {
    return { state: prev, error: 'Non puoi scartare la stessa carta più volte.' };
  }

  for (const uid of uniqueUids) {
    const idx = player.hand.findIndex((c) => c.uid === uid);
    if (idx === -1) return { state: prev, error: 'Carta non trovata in mano.' };
    const [card] = player.hand.splice(idx, 1);
    if (card.kind === 'catalyst') state.catalystDiscard.push(card);
    else if (card.kind === 'news') state.newsDiscard.push(card);
    else state.resonanceDiscard.push(card);
  }

  addLog(state, `${player.name} scarta ${cardUids.length} carta/e per rientrare nel limite di mano.`);
  state.pendingDiscard = null;

  return { state: advanceTurn(state) };
}

function advanceTurn(state: GameState): GameState {
  const player = currentPlayer(state);

  if (state.triggerPlayerId) {
    if (player.id === state.triggerPlayerId) {
      state.phase = 'gameover';
      state.scores = computeScores(state);
      const best = Object.values(state.scores).sort((a, b) => b.total - a.total)[0];
      state.winnerId = best.playerId;
      addLog(state, `La partita termina! Vince ${state.players.find((p) => p.id === best.playerId)?.name} con ${best.total} PV.`);
      return state;
    }
  }

  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
  state.turnNumber += 1;
  state.phase = 'draw';
  state.actionsLeft = 2;

  return state;
}

export function buildTheoryInstance(def: TheoryDef, ownerId: string): TheoryInstance {
  return {
    uid: nextUid('theory'),
    def,
    ownerId,
    slotA: { required: def.slotA, filled: null },
    slotB: { required: def.slotB, filled: null },
    attachedNews: [],
    locked: false,
    closed: false,
    closeOrder: null,
    extraNewsRequired: 0,
  };
}

export function handOfType(hand: HandCard[], kind: HandCard['kind']) {
  return hand.filter((c) => c.kind === kind);
}

export function submitDraftPick(prev: GameState, playerId: string, keepIds: string[]): ActionResult {
  const state = clone(prev);
  if (!state.draft) return { state: prev, error: 'Nessun draft in corso.' };
  if (state.draft.submitted[playerId]) return { state: prev, error: 'Scelta già effettuata.' };
  if (keepIds.length !== 3) return { state: prev, error: 'Devi scegliere esattamente 3 Teorie.' };

  const player = state.players.find((p) => p.id === playerId);
  const choices = state.draft.choices[playerId];
  if (!player || !choices) return { state: prev, error: 'Giocatore non trovato.' };

  for (const id of keepIds) {
    const def = choices.find((c) => c.id === id);
    if (!def) return { state: prev, error: 'Scelta non valida.' };
    player.theories.push(buildTheoryInstance(def, player.id));
  }
  for (const def of choices) {
    if (!keepIds.includes(def.id)) state.theoryDiscard.push(def);
  }
  state.draft.submitted[playerId] = true;
  addLog(state, `${player.name} ha selezionato le sue 3 Teorie iniziali.`);

  if (Object.values(state.draft.submitted).every(Boolean)) {
    state.draft = null;
    state.phase = 'draw';
    state.currentPlayerIndex = 0;
    addLog(state, 'Tutti pronti! La partita ha inizio.');
  }

  return { state };
}
