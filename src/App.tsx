import { useEffect, useState } from 'react';
import type { GameState } from './types';
import { createGame, initDraft, type NewPlayerConfig } from './game/setup';
import {
  attachNews,
  closeTheory,
  currentPlayer,
  endTurn,
  passReaction,
  placeCatalyst,
  playImmediateResonance,
  playResonanceCard,
  resolveRecycle,
  startDrawPhase,
  submitDraftPick,
} from './game/engine';
import {
  aiAttemptSingleAction,
  aiCloseAllPossible,
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

  if (state.draft) {
    return runAiDraftPick(state);
  }

  if (state.pendingRecycle) {
    const player = state.players.find((p) => p.id === state.pendingRecycle!.playerId);
    if (player?.isAI) return runAiRecycle(state);
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

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [state, setState] = useState<GameState | null>(null);
  const [showRules, setShowRules] = useState(false);

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

  const withState = (fn: (s: GameState) => GameState) => {
    setState((prev) => (prev ? fn(prev) : prev));
  };

  const confirmSetup = (configs: NewPlayerConfig[]) => {
    const game = initDraft(createGame(configs));
    setState(game);
    setScreen('game');
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
        onShowRules={() => setShowRules(true)}
        onDraw={(c, n) => withState((s) => startDrawPhase(s, c, n))}
        onPlaceCatalyst={(cardUid, theoryUid, slotKey) =>
          withState((s) => {
            const playerId = s.players[s.currentPlayerIndex].id;
            const res = placeCatalyst(s, playerId, cardUid, theoryUid, slotKey);
            return res.state;
          })
        }
        onAttachNews={(cardUid, theoryUid) =>
          withState((s) => {
            const playerId = s.players[s.currentPlayerIndex].id;
            const res = attachNews(s, playerId, cardUid, theoryUid);
            return res.state;
          })
        }
        onCloseTheory={(theoryUid) =>
          withState((s) => {
            const playerId = s.players[s.currentPlayerIndex].id;
            const res = closeTheory(s, playerId, theoryUid);
            return res.state;
          })
        }
        onEndTurn={() => withState((s) => endTurn(s))}
        onPlayResonance={(cardUid) =>
          withState((s) => {
            if (!s.pendingReaction) return s;
            const playerId = s.pendingReaction.queue[s.pendingReaction.currentIndex];
            const res = playResonanceCard(s, playerId, cardUid);
            return res.state;
          })
        }
        onPassReaction={() =>
          withState((s) => {
            if (!s.pendingReaction) return s;
            const playerId = s.pendingReaction.queue[s.pendingReaction.currentIndex];
            const res = passReaction(s, playerId);
            return res.state;
          })
        }
        onResolveRecycle={(keepUid) =>
          withState((s) => {
            if (!s.pendingRecycle) return s;
            const res = resolveRecycle(s, s.pendingRecycle.playerId, keepUid);
            return res.state;
          })
        }
        onPlayImmediate={(cardUid, target) =>
          withState((s) => {
            const playerId = s.players[s.currentPlayerIndex].id;
            const res = playImmediateResonance(s, playerId, cardUid, target);
            return res.state;
          })
        }
        onEndGame={restart}
      />
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </>
  );
}
