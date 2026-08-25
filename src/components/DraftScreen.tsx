import { useState } from 'react';
import type { CatalystType, GameState, TheoryDef } from '../types';
import { Hotseat } from './Hotseat';
import { CroppedArt, THEORY_ART_CROP, TheoryFlavor } from './CardViews';

function Stars({ n }: { n: number }) {
  return (
    <span className="text-gold">
      {'★'.repeat(n)}
      <span className="text-white/20">{'★'.repeat(3 - n)}</span>
    </span>
  );
}

const TYPE_ICON: Record<CatalystType, string> = {
  Artefice: '🛠️',
  Luogo: '📍',
  Mezzo: '📡',
  Prova: '🔍',
  Scopo: '🎯',
};

function TheoryPickCard({ def, picked, onToggle }: { def: TheoryDef; picked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`text-left rounded-xl border p-3 flex flex-col gap-1 transition ${
        picked ? 'border-accent2 bg-accent2/10 shadow-glow' : 'border-white/10 bg-panel hover:border-white/30'
      }`}
    >
      <CroppedArt src={def.image} alt={def.name} crop={THEORY_ART_CROP} className="w-full rounded-md -mt-1" />
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wide text-accent2">{def.topic}</span>
        <Stars n={def.stars} />
      </div>
      <div className="font-display text-xl text-white leading-tight">{def.name}</div>
      <TheoryFlavor
        flavor={def.flavor}
        descClassName="text-[11px] text-white/50 leading-snug"
        quoteClassName="text-[10px] text-white/40 leading-snug mt-1"
      />
      <div className="flex items-center justify-between mt-1 text-[11px] text-white/60">
        <span>Slot: {def.slotA} + {def.slotB}</span>
        <span className="text-gold font-bold">{def.basePV} PV</span>
      </div>
    </button>
  );
}

function SelectionSummary({ picked }: { picked: TheoryDef[] }) {
  const slots = [0, 1, 2];

  const topicCounts = new Map<string, number>();
  const typeCounts = new Map<CatalystType, number>();
  let totalPV = 0;
  for (const def of picked) {
    topicCounts.set(def.topic, (topicCounts.get(def.topic) ?? 0) + 1);
    typeCounts.set(def.slotA, (typeCounts.get(def.slotA) ?? 0) + 1);
    typeCounts.set(def.slotB, (typeCounts.get(def.slotB) ?? 0) + 1);
    totalPV += def.basePV;
  }
  const monopolioTopics = [...topicCounts.entries()].filter(([, n]) => n >= 2);

  return (
    <div className="mt-6 w-full max-w-3xl rounded-xl border border-white/10 bg-panel/80 p-4">
      <div className="text-accent2 text-xs uppercase tracking-widest mb-2">La tua selezione</div>
      <div className="grid grid-cols-3 gap-2">
        {slots.map((i) => {
          const def = picked[i];
          return (
            <div
              key={i}
              className={`rounded-lg border text-xs px-2 py-2 min-h-[64px] flex flex-col justify-center ${
                def ? 'border-accent2/50 bg-accent2/10' : 'border-dashed border-white/15 text-white/30 italic text-center'
              }`}
            >
              {def ? (
                <>
                  <div className="text-white font-semibold leading-tight">{def.name}</div>
                  <div className="text-white/50 mt-0.5">{def.topic}</div>
                </>
              ) : (
                <span>Teoria mancante</span>
              )}
            </div>
          );
        })}
      </div>

      {picked.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] text-white/60">
          <span>
            Catalizzatori richiesti:{' '}
            {[...typeCounts.entries()].map(([type, n]) => (
              <span key={type} className="inline-flex items-center gap-0.5 mr-2">
                {TYPE_ICON[type]} {type} ×{n}
              </span>
            ))}
          </span>
          <span className="text-gold font-bold">{totalPV} PV base totali</span>
          {monopolioTopics.length > 0 && (
            <span className="text-accent flex items-center gap-1">
              🎯 Monopolio possibile:{' '}
              {monopolioTopics.map(([topic, n]) => `${topic} ×${n}`).join(', ')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function DraftScreen({
  state,
  onSubmit,
}: {
  state: GameState;
  onSubmit: (playerId: string, keepIds: string[]) => void;
}) {
  const draft = state.draft!;
  const activePlayer = state.players.find((p) => !p.isAI && !draft.submitted[p.id]);

  if (!activePlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60 font-display text-2xl">Le IA stanno scegliendo le loro Teorie…</div>
      </div>
    );
  }

  return (
    <Hotseat key={activePlayer.id} revealKey={`draft-${activePlayer.id}`} name={activePlayer.name}>
      <DraftPicker
        name={activePlayer.name}
        choices={draft.choices[activePlayer.id]}
        onSubmit={(ids) => onSubmit(activePlayer.id, ids)}
      />
    </Hotseat>
  );
}

function DraftPicker({
  name,
  choices,
  onSubmit,
}: {
  name: string;
  choices: TheoryDef[];
  onSubmit: (ids: string[]) => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const pickedDefs = picked.map((id) => choices.find((c) => c.id === id)!).filter(Boolean);

  const toggle = (id: string) => {
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  return (
    <div className="min-h-screen px-4 py-10 flex flex-col items-center">
      <h2 className="font-display text-3xl text-white text-center">
        {name}, scegli 3 Teorie su cui lavorare
      </h2>
      <p className="text-white/50 text-sm mt-1">{picked.length}/3 selezionate</p>

      <SelectionSummary picked={pickedDefs} />

      <div className="text-white/40 text-xs uppercase tracking-widest mt-6 mb-1 self-start max-w-3xl w-full">
        Le 6 Teorie tra cui scegliere
      </div>
      <div className="grid sm:grid-cols-2 gap-3 max-w-3xl w-full">
        {choices.map((def) => (
          <TheoryPickCard key={def.id} def={def} picked={picked.includes(def.id)} onToggle={() => toggle(def.id)} />
        ))}
      </div>

      <button
        type="button"
        disabled={picked.length !== 3}
        onClick={() => onSubmit(picked)}
        className={`mt-8 px-8 py-3 rounded-xl font-display text-2xl tracking-wide ${
          picked.length === 3
            ? 'bg-accent text-white hover:bg-accent/80 shadow-glow'
            : 'bg-white/5 text-white/30 cursor-not-allowed'
        }`}
      >
        Conferma Scelta
      </button>
    </div>
  );
}
