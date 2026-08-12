export type CatalystType = 'Artefice' | 'Luogo' | 'Mezzo' | 'Prova' | 'Scopo';

export type TheoryTopic =
  | 'Clima ed Elementi Terrestri'
  | 'Controllo sulle Masse'
  | 'Dittatura Sanitaria'
  | 'Extraterrestri'
  | 'Misteri e Leggende'
  | 'Negazionismo Bizzarro'
  | 'Nuovo Ordine Mondiale'
  | 'Personaggi Storici Ancora Vivi'
  | 'Revisionismo Storico'
  | 'Teoria della Simulazione'
  | 'Teorie Spaziali'
  | 'Teorie Terrestri';

export type NewsCategory = 'Principale' | 'Secondaria';

export type DiffusionLevel = 'Sconosciuta' | 'Emergente' | 'Popolare' | 'Virale' | 'TopSecret';

/** A News's Principale/Secondaria status is not fixed: it depends on which Theory it's attached
 * to. `categoriaPrincipale`/`categoriaSecondaria` are Theory topics; a News can only be attached
 * to a Theory whose topic matches one of the two, and counts as that category on that Theory. */

export interface TheoryDef {
  id: string;
  name: string;
  topic: TheoryTopic;
  stars: 1 | 2 | 3;
  basePV: number;
  /** May contain `**word**` markers around the catalyst names cited in the card's narrative,
   * matching `testuale` below (used to award the Coerenza Testuale bonus and to highlight the
   * reference in the UI). Not every marker corresponds to a real Catalyst — see `testuale`. */
  flavor: string;
  /** Catalyst ids referenced by the flavor text's `**markers**`, in the order they appear.
   * `null` when that marker is card flavor with no corresponding real Catalyst card. */
  testuale: [string | null, string | null];
  slotA: CatalystType;
  slotB: CatalystType;
  image: string;
}

export interface CatalystDef {
  id: string;
  name: string;
  type: CatalystType;
  stars: 1 | 2 | 3;
  points: number;
  flavor: string;
  image: string;
}

export interface NewsDef {
  id: string;
  name: string;
  categoriaPrincipale: TheoryTopic;
  categoriaSecondaria: TheoryTopic;
  startLevel: DiffusionLevel;
  points: number;
  flavor: string;
  image: string;
}

export type ResonanceEffectId =
  | 'fuori_contesto'
  | 'notizia_verificata'
  | 'leak_controllato'
  | 'insabbiamento'
  | 'anello_mancante'
  | 'clickbait'
  | 'trappola_governativa'
  | 'smentita_ufficiale'
  | 'mezza_verita'
  | 'sotto_la_superficie'
  | 'vaso_di_pandora'
  | 'fake_news';

export type ResonanceType = 'Reazione' | 'Immediata';

export interface ResonanceDef {
  id: string;
  name: string;
  effectId: ResonanceEffectId;
  type: ResonanceType;
  description: string;
  flavor: string;
  image: string;
}

export interface CatalystInstance {
  uid: string;
  kind: 'catalyst';
  def: CatalystDef;
}

export interface NewsInstance {
  uid: string;
  kind: 'news';
  def: NewsDef;
  level: DiffusionLevel;
  attackerId: string;
  categoryOverridePrincipale: boolean;
  pointsOverrideZero: boolean;
  pointsHalved: boolean;
  pointsCapAt2: boolean;
  lockedByVerification: boolean;
}

export interface ResonanceInstance {
  uid: string;
  kind: 'resonance';
  def: ResonanceDef;
}

export type HandCard = CatalystInstance | NewsInstance | ResonanceInstance;

export interface TheorySlot {
  required: CatalystType;
  filled: CatalystInstance | null;
}

export interface TheoryInstance {
  uid: string;
  def: TheoryDef;
  ownerId: string;
  slotA: TheorySlot;
  slotB: TheorySlot;
  attachedNews: NewsInstance[];
  locked: boolean;
  closed: boolean;
  closeOrder: number | null;
  extraNewsRequired: number;
}

export interface Player {
  id: string;
  name: string;
  isAI: boolean;
  hand: HandCard[];
  theories: TheoryInstance[];
  discardedTheoryChoices?: TheoryDef[];
}

export interface LogEntry {
  id: string;
  text: string;
  turn: number;
}

export type GamePhase =
  | 'setup'
  | 'draft'
  | 'draw'
  | 'actions'
  | 'reaction'
  | 'gameover';

export interface PendingReaction {
  newsUid: string;
  theoryUid: string;
  theoryOwnerId: string;
  placedById: string;
  queue: string[];
  currentIndex: number;
}

export interface PendingRecycle {
  playerId: string;
  deckType: 'catalyst' | 'news';
  options: (CatalystInstance | NewsInstance)[];
}

export interface PendingDiscard {
  playerId: string;
  excess: number;
}

export interface PendingPrintout {
  theoryUid: string;
  ownerId: string;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  actionsLeft: number;
  selfActionUsed: boolean;
  opponentActionUsed: boolean;
  phase: GamePhase;
  catalystDeck: CatalystInstance[];
  catalystDiscard: CatalystInstance[];
  newsDeck: NewsInstance[];
  newsDiscard: NewsInstance[];
  resonanceDeck: ResonanceInstance[];
  resonanceDiscard: ResonanceInstance[];
  theoryDeck: TheoryDef[];
  theoryDiscard: TheoryDef[];
  pendingReaction: PendingReaction | null;
  pendingRecycle: PendingRecycle | null;
  pendingDiscard: PendingDiscard | null;
  pendingPrintout: PendingPrintout | null;
  draft: { choices: Record<string, TheoryDef[]>; submitted: Record<string, boolean> } | null;
  turnNumber: number;
  triggerPlayerId: string | null;
  finalTurnsRemaining: number;
  log: LogEntry[];
  winnerId: string | null;
  scores: Record<string, ScoreBreakdown> | null;
}

export interface ScoreBreakdown {
  playerId: string;
  theoryValue: number;
  catalystValue: number;
  newsValue: number;
  coerenzaTestuale: number;
  monopolio: number;
  scoopDelSecolo: number;
  clickbaiterSeriale: number;
  total: number;
}
