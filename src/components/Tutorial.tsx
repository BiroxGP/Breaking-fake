import { useEffect, useRef, useState } from 'react';
import { GraduationCap, X } from 'lucide-react';
import type { GameState } from '../types';
import { canCloseTheory } from '../game/rules';

interface TutorialContext {
  isHumanTurn: boolean;
  reactorIsHuman: boolean;
}

export interface TutorialStep {
  id: string;
  selector: string;
  title: string;
  body: string;
  match: (state: GameState, ctx: TutorialContext) => boolean;
}

/** Coach-mark tour: each step only "arrives" once its real UI target exists and its match()
 * condition is true, so the tour naturally follows whatever phase the player's own turn is
 * actually in instead of forcing artificial steps. */
export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'scores',
    selector: 'scores',
    title: 'Punti Vittoria',
    body: 'Qui vedi i PV di tutti i giocatori: contano solo le Teorie che hai già chiuso ("mandato in stampa"), non quelle ancora in corso.',
    match: () => true,
  },
  {
    id: 'draw',
    selector: 'draw-phase',
    title: 'Pesca',
    body: 'A inizio turno peschi 2 carte: scegli come dividerle tra Catalizzatori (riempiono gli slot delle Teorie) e Notizie (si collegano dopo). Ricevi sempre anche 1 carta Risonanza gratuita.',
    match: (state, ctx) => ctx.isHumanTurn && state.phase === 'draw',
  },
  {
    id: 'hand',
    selector: 'hand',
    title: 'La tua mano',
    body: 'Seleziona una carta e poi il bersaglio: un Catalizzatore va su uno slot libero compatibile (tuo o avversario), una Notizia si collega a una Teoria già "bloccata" (entrambi gli slot pieni) con un topic compatibile.',
    match: (state, ctx) => ctx.isHumanTurn && state.phase === 'actions',
  },
  {
    id: 'actions',
    selector: 'actions-counter',
    title: 'Le tue Azioni',
    body: 'Ogni turno hai al massimo 2 Azioni: 1 su una tua Teoria e 1 su una Teoria avversaria (mai due dello stesso tipo). Colpire un avversario attiva anche il Riciclo Tattico: peschi 3 carte extra e ne tieni 1.',
    match: (state, ctx) => ctx.isHumanTurn && state.phase === 'actions',
  },
  {
    id: 'own-theories',
    selector: 'own-theories',
    title: 'Le tue Teorie',
    body: 'Ogni Teoria ha 2 slot Catalizzatore. Finché non sono entrambi pieni puoi ancora sostituire un Catalizzatore già piazzato (anche su una Teoria avversaria) con un\'Azione: è la Regola d\'Oro. Appena il secondo slot si riempie, la Teoria si blocca.',
    match: (state, ctx) => ctx.isHumanTurn && state.phase === 'actions',
  },
  {
    id: 'reaction',
    selector: 'reaction-window',
    title: 'Finestra di Reazione',
    body: 'Ogni volta che qualcuno collega una Notizia, tutti i giocatori possono giocare una carta Risonanza per alterarla: ▲ Rafforza la aiuta, ▼ Indebolisce la danneggia. Guarda di chi è la Teoria per sapere da che parte stare.',
    match: (state, ctx) => state.phase === 'reaction' && ctx.reactorIsHuman,
  },
  {
    id: 'close-theory',
    selector: 'own-theories',
    title: 'Manda in stampa',
    body: 'Quando una Teoria ha entrambi gli slot pieni e abbastanza Notizie collegate, puoi chiuderla ("Manda in stampa") in qualunque momento del tuo turno, gratis: chiudine 3 per vincere!',
    match: (state, ctx) =>
      ctx.isHumanTurn &&
      state.phase === 'actions' &&
      state.players[state.currentPlayerIndex].theories.some((t) => !t.closed && canCloseTheory(t)),
  },
  {
    id: 'end-turn',
    selector: 'end-turn',
    title: 'Fine Turno',
    body: 'Quando hai finito, passa il turno da qui. Nessuna fretta: chiudere Teorie non consuma Azioni, puoi farlo quante volte vuoi prima di terminare.',
    match: (state, ctx) => ctx.isHumanTurn && state.phase === 'actions',
  },
];

export function TutorialOverlay({
  active,
  state,
  seenSteps,
  onMarkSeen,
  onDisable,
}: {
  active: boolean;
  state: GameState;
  seenSteps: Set<string>;
  onMarkSeen: (id: string) => void;
  onDisable: () => void;
}) {
  const cp = state.players[state.currentPlayerIndex];
  const reactor = state.pendingReaction
    ? state.players.find((p) => p.id === state.pendingReaction!.queue[state.pendingReaction!.currentIndex])
    : null;
  const ctx: TutorialContext = {
    isHumanTurn: !cp.isAI,
    reactorIsHuman: !!reactor && !reactor.isAI,
  };

  const step = active ? TUTORIAL_STEPS.find((s) => !seenSteps.has(s.id) && s.match(state, ctx)) : undefined;
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Steps can become valid without GameScreen re-rendering — e.g. the Hotseat "reveal my cards"
  // click is local component state, so the target element mounts with no prop change reaching
  // this component. A ref plus a light poll (instead of relying solely on render-triggered
  // effects) is what lets the spotlight catch up regardless of what caused the DOM to change.
  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => {
    if (!active) {
      setRect(null);
      return;
    }
    const sameRect = (a: DOMRect | null, b: DOMRect | null) =>
      a === b || (!!a && !!b && a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height);
    const update = () => {
      const s = stepRef.current;
      const el = s ? document.querySelector(`[data-tutorial="${s.selector}"]`) : null;
      const next = el ? el.getBoundingClientRect() : null;
      setRect((prev) => (sameRect(prev, next) ? prev : next));
    };
    update();
    const interval = window.setInterval(update, 350);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      <div className="fixed bottom-4 left-4 z-[240] flex items-center gap-2 rounded-full bg-ink/95 border border-accent2/40 pl-3 pr-1.5 py-1.5 shadow-lg">
        <GraduationCap size={16} className="text-accent2" />
        <span className="text-xs text-white/70">
          Tutorial {seenSteps.size}/{TUTORIAL_STEPS.length}
        </span>
        <button
          onClick={onDisable}
          className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white"
          title="Disattiva tutorial"
        >
          <X size={14} />
        </button>
      </div>

      {step && rect && (
        <TutorialSpotlight
          rect={rect}
          title={step.title}
          body={step.body}
          onNext={() => onMarkSeen(step.id)}
          onSkip={onDisable}
        />
      )}
    </>
  );
}

function TutorialSpotlight({
  rect,
  title,
  body,
  onNext,
  onSkip,
}: {
  rect: DOMRect;
  title: string;
  body: string;
  onNext: () => void;
  onSkip: () => void;
}) {
  const pad = 8;
  const box = {
    left: rect.left - pad,
    top: rect.top - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  };

  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const spaceBelow = vh - (box.top + box.height);
  const placeBelow = spaceBelow > 180 || spaceBelow > box.top;

  const bubbleWidth = Math.min(300, vw - 24);
  let bubbleLeft = box.left + box.width / 2 - bubbleWidth / 2;
  bubbleLeft = Math.max(12, Math.min(bubbleLeft, vw - bubbleWidth - 12));

  return (
    <>
      <div
        className="fixed z-[230] rounded-lg ring-2 ring-accent2 pointer-events-none"
        style={{
          left: box.left,
          top: box.top,
          width: box.width,
          height: box.height,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)',
        }}
      />
      <div
        className="fixed z-[231] pointer-events-auto"
        style={{
          left: bubbleLeft,
          top: placeBelow ? box.top + box.height + 12 : undefined,
          bottom: placeBelow ? undefined : vh - box.top + 12,
          width: bubbleWidth,
        }}
      >
        <div className="bg-panel border border-accent2/40 rounded-xl shadow-2xl p-4">
          <div className="text-accent2 font-bold text-xs uppercase tracking-widest mb-1">{title}</div>
          <p className="text-white/80 text-sm leading-snug mb-3">{body}</p>
          <div className="flex justify-between items-center gap-3">
            <button onClick={onSkip} className="text-white/40 hover:text-white text-xs shrink-0">
              Salta tutorial
            </button>
            <button
              onClick={onNext}
              className="px-4 py-1.5 rounded-lg bg-accent2 text-ink text-sm font-bold hover:bg-accent2/80"
            >
              Ho capito
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
