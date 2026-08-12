import { useEffect, useState } from 'react';
import { BookOpen, ListChecks, LogOut, ScrollText, Zap } from 'lucide-react';
import type { GameState, HandCard } from '../types';
import { Hotseat } from './Hotseat';
import { ClearOnChange, HoverPreviewProvider } from './HoverPreview';
import { CatalystCardView, NewsCardView, ResonanceCardView, TheoryCardView } from './CardViews';
import { findTheory } from '../game/engine';
import { maxAttachableNews } from '../game/rules';
import { canAttachNewsToTheory } from '../game/resonanceEffects';
import { findApplicableTheories } from '../game/targeting';
import { computeScores } from '../game/scoring';
import { TheoryPrintout } from './TheoryPrintout';

type ImmediateTarget = { theoryUid: string; newsUid: string };

interface Props {
  state: GameState;
  onDraw: (cat: number, news: number) => void;
  onPlaceCatalyst: (cardUid: string, theoryUid: string, slotKey: 'slotA' | 'slotB') => void;
  onAttachNews: (cardUid: string, theoryUid: string) => void;
  onCloseTheory: (theoryUid: string) => void;
  onEndTurn: () => void;
  onPlayResonance: (cardUid: string) => void;
  onPassReaction: () => void;
  onResolveRecycle: (keepUid: string) => void;
  onResolveDiscard: (cardUids: string[]) => void;
  onPlayImmediate: (cardUid: string, target: ImmediateTarget) => void;
  onShowRules: () => void;
  onEndGame: () => void;
  actionError: string | null;
  onDismissError: () => void;
  onDismissPrintout: () => void;
}

export function GameScreen(props: Props) {
  const { state } = props;
  const [showLog, setShowLog] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const reactorId = state.pendingReaction?.queue[state.pendingReaction.currentIndex] ?? null;
  const reactor = reactorId ? state.players.find((p) => p.id === reactorId) : null;
  const cp = state.players[state.currentPlayerIndex];

  const printoutOwner = state.pendingPrintout
    ? state.players.find((p) => p.id === state.pendingPrintout!.ownerId)
    : null;
  const printoutTheory = state.pendingPrintout ? findTheory(state, state.pendingPrintout.theoryUid) : null;

  useEffect(() => {
    if (!state.pendingPrintout) return;
    const timer = setTimeout(() => props.onDismissPrintout(), 7000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.pendingPrintout?.theoryUid]);

  return (
    <HoverPreviewProvider>
      <ClearOnChange
        sceneKey={`${state.phase}-${!!state.pendingRecycle}-${!!state.pendingReaction}-${!!state.pendingDiscard}-${state.currentPlayerIndex}-${state.turnNumber}`}
      />
      <div className="min-h-screen pb-4">
        <TopBar
          state={state}
          onShowRules={props.onShowRules}
          onToggleLog={() => setShowLog((s) => !s)}
          onRequestEndGame={() => setShowEndConfirm(true)}
        />

        {state.pendingRecycle ? (
          (() => {
            const recyclePlayer = state.players.find((p) => p.id === state.pendingRecycle!.playerId)!;
            return recyclePlayer.isAI ? (
              <ThinkingPanel name={recyclePlayer.name} label="sta scegliendo quale carta tenere (Riciclo Tattico)" />
            ) : (
              <Hotseat
                key={`recycle-${state.pendingRecycle!.playerId}-${state.pendingRecycle!.options.map((o) => o.uid).join('-')}`}
                revealKey={`recycle-${state.pendingRecycle!.playerId}-${state.pendingRecycle!.options.map((o) => o.uid).join('-')}`}
                name={recyclePlayer.name}
              >
                <RecycleModal
                  options={state.pendingRecycle!.options}
                  state={state}
                  viewerPlayerId={recyclePlayer.id}
                  onPick={props.onResolveRecycle}
                />
              </Hotseat>
            );
          })()
        ) : state.pendingDiscard ? (
          (() => {
            const discardPlayer = state.players.find((p) => p.id === state.pendingDiscard!.playerId)!;
            return discardPlayer.isAI ? (
              <ThinkingPanel name={discardPlayer.name} label="sta scegliendo cosa scartare" />
            ) : (
              <Hotseat
                key={`discard-${state.pendingDiscard!.playerId}-${state.turnNumber}`}
                revealKey={`discard-${state.pendingDiscard!.playerId}-${state.turnNumber}`}
                name={discardPlayer.name}
              >
                <DiscardModal player={discardPlayer} excess={state.pendingDiscard!.excess} onConfirm={props.onResolveDiscard} />
              </Hotseat>
            );
          })()
        ) : state.phase === 'reaction' && reactor ? (
          reactor.isAI ? (
            <ThinkingPanel name={reactor.name} label="sta valutando come reagire" />
          ) : (
            <Hotseat
              key={`${state.pendingReaction!.newsUid}-${state.pendingReaction!.currentIndex}`}
              revealKey={`reaction-${state.pendingReaction!.newsUid}-${state.pendingReaction!.currentIndex}`}
              name={reactor.name}
            >
              <ReactionPanel state={state} onPlay={props.onPlayResonance} onPass={props.onPassReaction} />
            </Hotseat>
          )
        ) : cp.isAI ? (
          <ThinkingPanel name={cp.name} label="sta giocando" />
        ) : (
          <Hotseat key={`${state.turnNumber}-${state.currentPlayerIndex}`} revealKey={`turn-${state.turnNumber}-${state.currentPlayerIndex}`} name={cp.name}>
            <MainBoard {...props} />
          </Hotseat>
        )}

        {showLog && <LogPanel state={state} onClose={() => setShowLog(false)} />}
        {showEndConfirm && (
          <EndGameConfirmModal
            onConfirm={props.onEndGame}
            onCancel={() => setShowEndConfirm(false)}
          />
        )}
        {props.actionError && <ErrorToast message={props.actionError} onDismiss={props.onDismissError} />}
        {printoutTheory && printoutOwner && (
          <TheoryPrintout
            theory={printoutTheory}
            allTheories={printoutOwner.theories}
            ownerName={printoutOwner.name}
            onClose={props.onDismissPrintout}
          />
        )}
      </div>
    </HoverPreviewProvider>
  );
}

function ErrorToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[250] max-w-md w-[calc(100%-2rem)] px-4">
      <button
        type="button"
        onClick={onDismiss}
        className="w-full text-left rounded-lg border border-accent/50 bg-ink/95 shadow-lg px-4 py-3 text-sm text-white flex items-start gap-2"
      >
        <span className="text-accent font-bold">⚠</span>
        <span>{message}</span>
      </button>
    </div>
  );
}

function TopBar({
  state,
  onShowRules,
  onToggleLog,
  onRequestEndGame,
}: {
  state: GameState;
  onShowRules: () => void;
  onToggleLog: () => void;
  onRequestEndGame: () => void;
}) {
  const scores = computeScores(state);
  const cpId = state.players[state.currentPlayerIndex].id;

  return (
    <div className="sticky top-0 z-20 bg-ink/90 backdrop-blur border-b border-white/10 px-4 py-2 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl text-white tracking-wide">
            BREAKING <span className="text-accent">FAKE</span>
          </span>
          <span className="text-white/40 text-xs">Turno {state.turnNumber}</span>
          {state.triggerPlayerId && (
            <span className="text-accent text-xs font-bold uppercase animate-pulse">Ultimo Giro!</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggleLog} className="p-2 rounded-md hover:bg-white/10 text-white/70">
            <ScrollText size={18} />
          </button>
          <button onClick={onShowRules} className="p-2 rounded-md hover:bg-white/10 text-white/70">
            <BookOpen size={18} />
          </button>
          <button
            onClick={onRequestEndGame}
            className="p-2 rounded-md hover:bg-accent/20 text-white/70 hover:text-accent"
            title="Termina Partita"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {state.players.map((p) => (
          <span
            key={p.id}
            className={`text-[11px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${
              p.id === cpId ? 'border-accent2 bg-accent2/10 text-white' : 'border-white/10 text-white/50'
            }`}
            title="Punti Vittoria attuali (solo Teorie chiuse)"
          >
            {p.name}
            <strong className="text-gold">{scores[p.id]?.total ?? 0} PV</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

function EndGameConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-panel border border-white/10 rounded-xl max-w-sm w-full p-6 text-center">
        <h3 className="font-display text-2xl text-white mb-2">Terminare la partita?</h3>
        <p className="text-white/60 text-sm mb-6">
          La partita in corso andrà persa e tornerai alla schermata principale.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold"
          >
            Annulla
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-lg bg-accent hover:bg-accent/80 text-white text-sm font-bold"
          >
            Termina Partita
          </button>
        </div>
      </div>
    </div>
  );
}

function ThinkingPanel({ name, label }: { name: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="w-10 h-10 border-4 border-accent2/30 border-t-accent2 rounded-full animate-spin" />
      <div className="text-white/60 text-sm">
        <strong className="text-white">{name}</strong> {label}…
      </div>
    </div>
  );
}

function LogPanel({ state, onClose }: { state: GameState; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4">
      <div className="bg-panel border border-white/10 rounded-xl max-w-lg w-full max-h-[70vh] overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display text-2xl text-white flex items-center gap-2">
            <ListChecks size={18} /> Diario della Redazione
          </h3>
          <button onClick={onClose} className="text-white/50 hover:text-white text-sm">
            Chiudi
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          {[...state.log].reverse().map((entry) => (
            <div key={entry.id} className="text-xs text-white/60 border-b border-white/5 pb-1.5">
              <span className="text-white/30 mr-1">T{entry.turn}</span>
              {entry.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DrawChooser({ onDraw }: { onDraw: (c: number, n: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <h3 className="font-display text-3xl text-white">Fase di Pesca</h3>
      <p className="text-white/50 text-sm max-w-sm text-center">
        Scegli come dividere le tue 2 carte pescate. Riceverai comunque 1 Risonanza gratuita.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <button onClick={() => onDraw(2, 0)} className="px-5 py-3 rounded-xl bg-panel2 border border-white/10 hover:border-accent2 text-white">
          2 Catalizzatori
        </button>
        <button onClick={() => onDraw(1, 1)} className="px-5 py-3 rounded-xl bg-panel2 border border-white/10 hover:border-accent2 text-white">
          1 Catalizzatore + 1 Notizia
        </button>
        <button onClick={() => onDraw(0, 2)} className="px-5 py-3 rounded-xl bg-panel2 border border-white/10 hover:border-accent2 text-white">
          2 Notizie
        </button>
      </div>
    </div>
  );
}

function MainBoard(props: Props) {
  const { state } = props;
  const cp = state.players[state.currentPlayerIndex];
  const [selected, setSelected] = useState<HandCard | null>(null);

  if (state.phase === 'draw') {
    return <DrawChooser onDraw={props.onDraw} />;
  }

  const others = state.players.filter((p) => p.id !== cp.id);

  const canTargetSlot = (theoryUid: string, slotKey: 'slotA' | 'slotB') => {
    if (!selected || selected.kind !== 'catalyst') return false;
    const theory = findTheory(state, theoryUid);
    if (!theory || theory.closed) return false;
    const slot = theory[slotKey];
    if (slot.required !== selected.def.type) return false;
    if (slot.filled && theory.locked) return false;
    const isOpponent = theory.ownerId !== cp.id;
    if (isOpponent && state.opponentActionUsed) return false;
    if (!isOpponent && state.selfActionUsed) return false;
    return true;
  };

  const canTargetAttach = (theoryUid: string) => {
    if (!selected || selected.kind !== 'news') return false;
    const theory = findTheory(state, theoryUid);
    if (!theory || theory.closed) return false;
    if (!theory.slotA.filled || !theory.slotB.filled) return false;
    if (theory.attachedNews.length >= maxAttachableNews(theory)) return false;
    const isOpponent = theory.ownerId !== cp.id;
    if (isOpponent && state.opponentActionUsed) return false;
    if (!isOpponent && state.selfActionUsed) return false;
    return canAttachNewsToTheory(selected, theory);
  };

  const canTargetNews = () => selected?.kind === 'resonance' && selected.def.type === 'Immediata';

  const handleSlotClick = (theoryUid: string, slotKey: 'slotA' | 'slotB') => {
    if (!selected || selected.kind !== 'catalyst') return;
    if (!canTargetSlot(theoryUid, slotKey)) return;
    props.onPlaceCatalyst(selected.uid, theoryUid, slotKey);
    setSelected(null);
  };

  const handleAttachClick = (theoryUid: string) => {
    if (!selected || selected.kind !== 'news') return;
    if (!canTargetAttach(theoryUid)) return;
    props.onAttachNews(selected.uid, theoryUid);
    setSelected(null);
  };

  const handleNewsClick = (theoryUid: string, newsUid: string) => {
    if (!selected || !canTargetNews()) return;
    props.onPlayImmediate(selected.uid, { theoryUid, newsUid });
    setSelected(null);
  };

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mt-3 mb-2">
        <div className="text-white font-display text-2xl">{cp.name}</div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/50 flex items-center gap-1">
            <Zap size={13} className="text-gold" />
            Su te stesso: {state.selfActionUsed ? 'usata' : 'disponibile'} · Su avversario:{' '}
            {state.opponentActionUsed ? 'usata' : 'disponibile'}
          </span>
          <button
            onClick={props.onEndTurn}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold"
          >
            Fine Turno
          </button>
        </div>
      </div>

      {others.map((opp) => (
        <div key={opp.id} className="mb-4">
          <div className="text-white/40 text-xs uppercase tracking-widest mb-1">{opp.name} (avversario)</div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {opp.theories.map((t) => (
              <TheoryCardView
                key={t.uid}
                theory={t}
                isOwn={false}
                onSlotClick={selected?.kind === 'catalyst' ? (slot) => handleSlotClick(t.uid, slot) : undefined}
                onAttachClick={selected?.kind === 'news' ? () => handleAttachClick(t.uid) : undefined}
                onNewsClick={canTargetNews() ? (newsUid) => handleNewsClick(t.uid, newsUid) : undefined}
                isNewsTargetable={(n) => !n.lockedByVerification}
                highlightSlotA={canTargetSlot(t.uid, 'slotA')}
                highlightSlotB={canTargetSlot(t.uid, 'slotB')}
                highlightAttach={selected?.kind === 'news' && canTargetAttach(t.uid)}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="mb-4">
        <div className="text-accent2 text-xs uppercase tracking-widest mb-1">Le tue Teorie</div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {cp.theories.map((t) => (
            <TheoryCardView
              key={t.uid}
              theory={t}
              isOwn
              onSlotClick={selected?.kind === 'catalyst' ? (slot) => handleSlotClick(t.uid, slot) : undefined}
              onAttachClick={selected?.kind === 'news' ? () => handleAttachClick(t.uid) : undefined}
              onCloseClick={() => props.onCloseTheory(t.uid)}
              onNewsClick={canTargetNews() ? (newsUid) => handleNewsClick(t.uid, newsUid) : undefined}
              isNewsTargetable={(n) => !n.lockedByVerification}
              highlightSlotA={canTargetSlot(t.uid, 'slotA')}
              highlightSlotB={canTargetSlot(t.uid, 'slotB')}
              highlightAttach={selected?.kind === 'news' && canTargetAttach(t.uid)}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="text-white/40 text-xs uppercase tracking-widest mb-1">
          La tua mano ({cp.hand.length}/10) {selected && '— seleziona una Teoria bersaglio, o clicca di nuovo la carta per deselezionare'}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3">
          {[...cp.hand].sort((a, b) => HAND_ORDER[a.kind] - HAND_ORDER[b.kind]).map((card) => {
            const isSelected = selected?.uid === card.uid;
            const toggle = () => setSelected(isSelected ? null : card);
            if (card.kind === 'catalyst') return <CatalystCardView key={card.uid} card={card} selected={isSelected} onClick={toggle} />;
            if (card.kind === 'news') return <NewsCardView key={card.uid} card={card} selected={isSelected} onClick={toggle} />;
            const canPlayNow = card.def.type === 'Immediata';
            return (
              <ResonanceCardView
                key={card.uid}
                card={card}
                selected={isSelected}
                onClick={canPlayNow ? toggle : undefined}
              />
            );
          })}
          {cp.hand.length === 0 && <div className="text-white/30 text-sm italic py-4">Mano vuota.</div>}
        </div>
        <p className="text-[11px] text-white/30">
          {selected?.kind === 'resonance'
            ? 'Scegli una Notizia in gioco (anche avversaria) da colpire con questa carta Immediata.'
            : selected?.kind === 'news'
            ? 'Una Notizia si può collegare solo a una Teoria il cui topic corrisponde alla sua Categoria Principale o Secondaria (evidenziate qui sopra).'
            : 'Le carte Risonanza "Reazione" si giocano solo durante la Finestra di Reazione. Le carte "Immediata" si possono giocare ora: selezionale e scegli il bersaglio.'}
        </p>
      </div>
    </div>
  );
}

function RecycleModal({
  options,
  state,
  viewerPlayerId,
  onPick,
}: {
  options: (import('../types').CatalystInstance | import('../types').NewsInstance)[];
  state: GameState;
  viewerPlayerId: string;
  onPick: (uid: string) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-14 px-4">
      <h3 className="font-display text-3xl text-white text-center">Riciclo Tattico!</h3>
      <p className="text-white/50 text-sm text-center max-w-sm">
        Hai sabotato un avversario: scegli 1 di queste 3 carte da tenere, le altre finiscono nello scarto.
      </p>
      <div className="flex gap-4 flex-wrap justify-center items-start max-w-4xl">
        {options.map((o) => {
          const matches = findApplicableTheories(o, state, viewerPlayerId);
          return (
            <div key={o.uid} className="flex flex-col items-center gap-2 w-44">
              {o.kind === 'catalyst' ? (
                <CatalystCardView card={o} onClick={() => onPick(o.uid)} />
              ) : (
                <NewsCardView card={o} onClick={() => onPick(o.uid)} />
              )}
              <div className="w-full rounded-lg border border-white/10 bg-panel2/60 px-2 py-1.5 text-[10px] leading-snug">
                {matches.length === 0 ? (
                  <span className="italic text-white/30">Nessuna Teoria compatibile ora.</span>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {matches.map((m, i) => (
                      <li key={i} className={m.isOwn ? 'text-accent2' : 'text-accent'}>
                        <strong>{m.isOwn ? 'Tu' : m.ownerName}</strong>: {m.theoryName}
                        <span className="text-white/40"> — {m.detail}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const HAND_ORDER: Record<HandCard['kind'], number> = { catalyst: 0, news: 1, resonance: 2 };

function DiscardModal({
  player,
  excess,
  onConfirm,
}: {
  player: import('../types').Player;
  excess: number;
  onConfirm: (cardUids: string[]) => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const sortedHand = [...player.hand].sort((a, b) => HAND_ORDER[a.kind] - HAND_ORDER[b.kind]);

  const toggle = (uid: string) => {
    setPicked((prev) => {
      if (prev.includes(uid)) return prev.filter((x) => x !== uid);
      if (prev.length >= excess) return prev;
      return [...prev, uid];
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 py-14 px-4">
      <h3 className="font-display text-3xl text-white text-center">Limite di Mano Superato</h3>
      <p className="text-white/50 text-sm text-center max-w-sm">
        {player.name} ha più di 10 carte in mano: scegli {excess} carta/e da scartare ({picked.length}/{excess}
        selezionate).
      </p>
      <div className="flex gap-2 flex-wrap justify-center max-w-4xl">
        {sortedHand.map((card) => {
          const isSelected = picked.includes(card.uid);
          const onClick = () => toggle(card.uid);
          if (card.kind === 'catalyst') return <CatalystCardView key={card.uid} card={card} selected={isSelected} onClick={onClick} />;
          if (card.kind === 'news') return <NewsCardView key={card.uid} card={card} selected={isSelected} onClick={onClick} />;
          return <ResonanceCardView key={card.uid} card={card} selected={isSelected} onClick={onClick} />;
        })}
      </div>
      <button
        type="button"
        disabled={picked.length !== excess}
        onClick={() => onConfirm(picked)}
        className={`mt-2 px-8 py-3 rounded-xl font-display text-2xl tracking-wide ${
          picked.length === excess
            ? 'bg-accent text-white hover:bg-accent/80 shadow-glow'
            : 'bg-white/5 text-white/30 cursor-not-allowed'
        }`}
      >
        Scarta
      </button>
    </div>
  );
}

function ReactionPanel({
  state,
  onPlay,
  onPass,
}: {
  state: GameState;
  onPlay: (cardUid: string) => void;
  onPass: () => void;
}) {
  const pr = state.pendingReaction!;
  const reactor = state.players.find((p) => p.id === pr.queue[pr.currentIndex])!;
  const theory = findTheory(state, pr.theoryUid);
  const news = theory?.attachedNews.find((n) => n.uid === pr.newsUid);
  const resonanceCards = reactor.hand.filter((c) => c.kind === 'resonance');
  const owner = state.players.find((p) => p.id === pr.theoryOwnerId);
  const placer = state.players.find((p) => p.id === pr.placedById);
  const isOwnTheory = reactor.id === pr.theoryOwnerId;

  return (
    <div className="flex flex-col items-center gap-4 py-10 px-4">
      <h3 className="font-display text-3xl text-white text-center">Finestra di Reazione</h3>
      <p className="text-white/50 text-sm text-center max-w-md">
        <strong className="text-accent2">{placer?.name}</strong> ha collegato la notizia{' '}
        <strong className="text-white">{news?.def.name}</strong> a{' '}
        <strong className="text-white">{theory?.def.name}</strong>, Teoria di{' '}
        <strong className="text-white">{owner?.name}</strong>. Tocca a{' '}
        <strong className="text-accent2">{reactor.name}</strong>: gioca una Risonanza o passa.
      </p>

      <div
        className={`text-sm text-center max-w-md rounded-lg px-4 py-2 border ${
          isOwnTheory ? 'border-green-600/50 bg-green-950/30 text-green-200' : 'border-accent/50 bg-accent/10 text-red-200'
        }`}
      >
        {isOwnTheory
          ? 'È la TUA Teoria: una Risonanza ▲ Rafforza la aiuta, una ▼ Indebolisce la danneggia.'
          : `È la Teoria di ${owner?.name} (avversaria per te): una Risonanza ▼ Indebolisce la danneggia, una ▲ Rafforza la aiuta.`}
      </div>

      {news && theory && (
        <div className="scale-110">
          <NewsCardView card={news} theory={theory} />
        </div>
      )}

      <div className="flex gap-2 flex-wrap justify-center mt-2">
        {resonanceCards.length === 0 && (
          <span className="text-white/30 text-sm italic">Nessuna Risonanza in mano.</span>
        )}
        {resonanceCards.map((c) => (
          <ResonanceCardView key={c.uid} card={c} onClick={() => onPlay(c.uid)} />
        ))}
      </div>

      <button onClick={onPass} className="mt-2 px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold">
        Passa
      </button>
    </div>
  );
}
