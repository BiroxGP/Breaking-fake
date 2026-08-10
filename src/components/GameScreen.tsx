import { useState } from 'react';
import { BookOpen, ListChecks, LogOut, ScrollText, Zap } from 'lucide-react';
import type { GameState, HandCard } from '../types';
import { Hotseat } from './Hotseat';
import { HoverPreviewProvider } from './HoverPreview';
import { CatalystCardView, NewsCardView, ResonanceCardView, TheoryCardView } from './CardViews';
import { findTheory } from '../game/engine';
import { maxAttachableNews } from '../game/rules';
import { canAttachNewsToTheory } from '../game/resonanceEffects';

type ImmediateTarget = { theoryUid: string; newsUid: string } | { theoryUid: string; slotKey: 'slotA' | 'slotB' };

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
  onPlayImmediate: (cardUid: string, target: ImmediateTarget) => void;
  onShowRules: () => void;
  onEndGame: () => void;
}

export function GameScreen(props: Props) {
  const { state } = props;
  const [showLog, setShowLog] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const reactorId = state.pendingReaction?.queue[state.pendingReaction.currentIndex] ?? null;
  const reactor = reactorId ? state.players.find((p) => p.id === reactorId) : null;
  const cp = state.players[state.currentPlayerIndex];

  return (
    <HoverPreviewProvider>
      <div className="min-h-screen pb-4">
        <TopBar
          state={state}
          onShowRules={props.onShowRules}
          onToggleLog={() => setShowLog((s) => !s)}
          onRequestEndGame={() => setShowEndConfirm(true)}
        />

        {state.phase === 'reaction' && reactor ? (
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
      </div>
    </HoverPreviewProvider>
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
  return (
    <div className="sticky top-0 z-20 bg-ink/90 backdrop-blur border-b border-white/10 px-4 py-2 flex items-center justify-between">
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

  if (state.pendingRecycle && state.pendingRecycle.playerId === cp.id) {
    return <RecycleModal options={state.pendingRecycle.options} onPick={props.onResolveRecycle} />;
  }

  if (state.phase === 'draw') {
    return <DrawChooser onDraw={props.onDraw} />;
  }

  const others = state.players.filter((p) => p.id !== cp.id);
  const isInsabbiamento = selected?.kind === 'resonance' && selected.def.effectId === 'insabbiamento';

  const canTargetSlot = (theoryUid: string, slotKey: 'slotA' | 'slotB') => {
    if (!selected) return false;
    const theory = findTheory(state, theoryUid);
    if (!theory || theory.closed) return false;
    const slot = theory[slotKey];
    if (selected.kind === 'catalyst') {
      if (slot.required !== selected.def.type) return false;
      if (slot.filled && theory.locked) return false;
      return true;
    }
    if (isInsabbiamento) {
      return !!slot.filled && theory.attachedNews.length === 0;
    }
    return false;
  };

  const canTargetAttach = (theoryUid: string) => {
    if (!selected || selected.kind !== 'news') return false;
    const theory = findTheory(state, theoryUid);
    if (!theory || theory.closed) return false;
    if (!theory.slotA.filled || !theory.slotB.filled) return false;
    if (theory.attachedNews.length >= maxAttachableNews(theory)) return false;
    return canAttachNewsToTheory(selected, theory);
  };

  const canTargetNews = () => selected?.kind === 'resonance' && selected.def.type === 'Immediata' && !isInsabbiamento;

  const handleSlotClick = (theoryUid: string, slotKey: 'slotA' | 'slotB') => {
    if (!selected) return;
    if (!canTargetSlot(theoryUid, slotKey)) return;
    if (selected.kind === 'catalyst') {
      props.onPlaceCatalyst(selected.uid, theoryUid, slotKey);
    } else {
      props.onPlayImmediate(selected.uid, { theoryUid, slotKey });
    }
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
            <Zap size={13} className="text-gold" /> Azioni: {state.actionsLeft}/2
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
                onSlotClick={selected && (selected.kind === 'catalyst' || isInsabbiamento) ? (slot) => handleSlotClick(t.uid, slot) : undefined}
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
              onSlotClick={selected && (selected.kind === 'catalyst' || isInsabbiamento) ? (slot) => handleSlotClick(t.uid, slot) : undefined}
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
          {cp.hand.map((card) => {
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
          {isInsabbiamento
            ? 'Insabbiamento: scegli una Notizia da colpire, oppure un Catalizzatore su una Teoria senza Notizie collegate.'
            : selected?.kind === 'resonance'
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
  onPick,
}: {
  options: (import('../types').CatalystInstance | import('../types').NewsInstance)[];
  onPick: (uid: string) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-14 px-4">
      <h3 className="font-display text-3xl text-white text-center">Riciclo Tattico!</h3>
      <p className="text-white/50 text-sm text-center max-w-sm">
        Hai sabotato un avversario: scegli 1 di queste 3 carte da tenere, le altre finiscono nello scarto.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        {options.map((o) =>
          o.kind === 'catalyst' ? (
            <CatalystCardView key={o.uid} card={o} onClick={() => onPick(o.uid)} />
          ) : (
            <NewsCardView key={o.uid} card={o} onClick={() => onPick(o.uid)} />
          ),
        )}
      </div>
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

  return (
    <div className="flex flex-col items-center gap-4 py-10 px-4">
      <h3 className="font-display text-3xl text-white text-center">Finestra di Reazione</h3>
      <p className="text-white/50 text-sm text-center max-w-md">
        <strong className="text-white">{theory?.def.name}</strong> ha appena ricevuto la notizia{' '}
        <strong className="text-white">{news?.def.name}</strong>. Tocca a{' '}
        <strong className="text-accent2">{reactor.name}</strong>: gioca una Risonanza o passa.
      </p>

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
