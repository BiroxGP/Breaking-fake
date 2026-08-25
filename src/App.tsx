import { useEffect, useRef, useState } from 'react';
import type { GameState } from './types';
import { createGame, initDraft, type NewPlayerConfig } from './game/setup';
import {
  attachNews,
  closeTheory,
  currentPlayer,
  dismissPrintout,
  endTurn,
  passReaction,
  placeCatalyst,
  playImmediateResonance,
  playResonanceCard,
  resolveDiscard,
  resolveRecycle,
  startDrawPhase,
  submitDraftPick,
} from './game/engine';
import {
  aiAttemptSingleAction,
  aiCloseAllPossible,
  runAiDiscard,
  runAiDraftPick,
  runAiDraw,
  runAiReaction,
  runAiRecycle,
} from './game/ai';
import { Landing } from './components/Landing';
import { SetupScreen } from './components/SetupScreen';
import { DraftScreen } from './components/DraftScreen';
import { GameScreen } from './components/GameScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { RulesModal } from './components/RulesModal';

type Screen = 'landing' | 'setup' | 'game';

function stepAi(state: GameState): GameState {
  if (state.phase === 'gameover') return state;

  // Pause the AI while a "manda in stampa" printout is on screen, so it stays visible
  // (and attributable to whoever closed the Teoria) instead of flashing by mid-turn.
  if (state.pendingPrintout) return state;

  if (state.draft) {
    return runAiDraftPick(state);
  }

  if (state.pendingRecycle) {
    const player = state.players.find((p) => p.id === state.pendingRecycle!.playerId);
    if (player?.isAI) return runAiRecycle(state);
    return state;
  }

  if (state.pendingDiscard) {
    const player = state.players.find((p) => p.id === state.pendingDiscard!.playerId);
    if (player?.isAI) return runAiDiscard(state);
    return state;
  }

  if (state.phase === 'reaction' && state.pendingReaction) {
    const reactorId = state.pendingReaction.queue[state.pendingReaction.currentIndex];
    const reactor = state.players.find((p) => p.id === reactorId);
    if (reactor?.isAI) return runAiReaction(state);
    return state;
  }

  const cp = currentPlayer(state);
  if (!cp.isAI) return state;

  if (state.phase === 'draw') {
    return runAiDraw(state);
  }

  if (state.phase === 'actions') {
    const closed = aiCloseAllPossible(state, cp.id);
    if (closed.actionsLeft <= 0) return endTurn(closed);
    const { state: attempted, acted } = aiAttemptSingleAction(closed);
    if (!acted) return endTurn(attempted);
    return attempted;
  }

  return state;
}

interface ActionResult {
  state: GameState;
  error?: string;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [state, setState] = useState<GameState | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialSeen, setTutorialSeen] = useState<Set<string>>(new Set());
  // Il tutorial parte attivo di default; dopo che una partita è stata portata a termine, se se ne
  // avvia una nuova lo disattiviamo in automatico (l'utente resta comunque libero di riattivarlo).
  const hasCompletedGameRef = useRef(false);

  useEffect(() => {
    if (state?.phase === 'gameover') hasCompletedGameRef.current = true;
  }, [state?.phase]);

  useEffect(() => {
    if (!state) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      setState((prev) => (prev ? stepAi(prev) : prev));
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [state]);

  useEffect(() => {
    if (!actionError) return;
    const timer = setTimeout(() => setActionError(null), 4000);
    return () => clearTimeout(timer);
  }, [actionError]);

  const withState = (fn: (s: GameState) => GameState) => {
    setState((prev) => (prev ? fn(prev) : prev));
  };

  /** Runs an action that can fail validation (wrong turn, locked target, etc.) and surfaces
   * the error as a toast instead of silently doing nothing when it's rejected. */
  const runResult = (fn: (s: GameState) => ActionResult) => {
    if (!state) return;
    const res = fn(state);
    if (res.error) {
      setActionError(res.error);
      return;
    }
    setActionError(null);
    setState(res.state);
  };

  const confirmSetup = (configs: NewPlayerConfig[]) => {
    const game = initDraft(createGame(configs));
    setState(game);
    setScreen('game');
    setTutorialSeen(new Set());
    setTutorialActive(!hasCompletedGameRef.current);
  };

  const restart = () => {
    setState(null);
    setScreen('landing');
  };

  if (screen === 'landing') {
    return (
      <>
        <Landing onStart={() => setScreen('setup')} onRules={() => setShowRules(true)} />
        {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      </>
    );
  }

  if (screen === 'setup' || !state) {
    return <SetupScreen onConfirm={confirmSetup} />;
  }

  if (state.draft) {
    return (
      <DraftScreen
        state={state}
        onSubmit={(playerId, keepIds) =>
          withState((s) => {
            const res = submitDraftPick(s, playerId, keepIds);
            return res.state;
          })
        }
      />
    );
  }

  if (state.phase === 'gameover') {
    return <GameOverScreen state={state} onRestart={restart} />;
  }

  return (
    <>
      <GameScreen
        state={state}
        actionError={actionError}
        onDismissError={() => setActionError(null)}
        onShowRules={() => setShowRules(true)}
        onDraw={(c, n) => withState((s) => startDrawPhase(s, c, n))}
        onPlaceCatalyst={(cardUid, theoryUid, slotKey) =>
          runResult((s) => {
            const playerId = s.players[s.currentPlayerIndex].id;
            return placeCatalyst(s, playerId, cardUid, theoryUid, slotKey);
          })
        }
        onAttachNews={(cardUid, theoryUid) =>
          runResult((s) => {
            const playerId = s.players[s.currentPlayerIndex].id;
            return attachNews(s, playerId, cardUid, theoryUid);
          })
        }
        onCloseTheory={(theoryUid) =>
          runResult((s) => {
            const playerId = s.players[s.currentPlayerIndex].id;
            return closeTheory(s, playerId, theoryUid);
          })
        }
        onEndTurn={() => withState((s) => endTurn(s))}
        onPlayResonance={(cardUid) =>
          runResult((s) => {
            if (!s.pendingReaction) return { state: s };
            const playerId = s.pendingReaction.queue[s.pendingReaction.currentIndex];
            return playResonanceCard(s, playerId, cardUid);
          })
        }
        onPassReaction={() =>
          runResult((s) => {
            if (!s.pendingReaction) return { state: s };
            const playerId = s.pendingReaction.queue[s.pendingReaction.currentIndex];
            return passReaction(s, playerId);
          })
        }
        onResolveRecycle={(keepUid) =>
          runResult((s) => {
            if (!s.pendingRecycle) return { state: s };
            return resolveRecycle(s, s.pendingRecycle.playerId, keepUid);
          })
        }
        onResolveDiscard={(cardUids) =>
          runResult((s) => {
            if (!s.pendingDiscard) return { state: s };
            return resolveDiscard(s, s.pendingDiscard.playerId, cardUids);
          })
        }
        onPlayImmediate={(cardUid, target) =>
          runResult((s) => {
            const playerId = s.players[s.currentPlayerIndex].id;
            return playImmediateResonance(s, playerId, cardUid, target);
          })
        }
        onDismissPrintout={() => withState((s) => dismissPrintout(s))}
        onEndGame={restart}
        tutorialActive={tutorialActive}
        onToggleTutorial={() => setTutorialActive((a) => !a)}
        tutorialSeen={tutorialSeen}
        onMarkTutorialStep={(id) => setTutorialSeen((prev) => new Set(prev).add(id))}
      />
      {showRules && (
        <RulesModal
          onClose={() => setShowRules(false)}
          onActivateTutorial={() => {
            setTutorialActive(true);
            setShowRules(false);
          }}
        />
      )}
    </>
  );
}
