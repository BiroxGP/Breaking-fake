import { useState } from 'react';
import type { GameState, TheoryDef } from '../types';
import { Hotseat } from './Hotseat';

function Stars({ n }: { n: number }) {
  return (
    <span className="text-gold">
      {'★'.repeat(n)}
      <span className="text-white/20">{'★'.repeat(3 - n)}</span>
    </span>
  );
}

function TheoryPickCard({ def, picked, onToggle }: { def: TheoryDef; picked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`text-left rounded-xl border p-3 flex flex-col gap-1 transition ${
        picked ? 'border-accent2 bg-accent2/10 shadow-glow' : 'border-white/10 bg-panel hover:border-white/30'
      }`}
    >
      <img src={def.image} alt={def.name} className="w-full aspect-[16/9] object-cover rounded-md -mt-1" />
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wide text-accent2">{def.topic}</span>
        <Stars n={def.stars} />
      </div>
      <div className="font-display text-xl text-white leading-tight">{def.name}</div>
      <div className="text-[11px] text-white/50 leading-snug">{def.flavor}</div>
      <div className="flex items-center justify-between mt-1 text-[11px] text-white/60">
        <span>Slot: {def.slotA} + {def.slotB}</span>
        <span className="text-gold font-bold">{def.basePV} PV</span>
      </div>
    </button>
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

      <div className="mt-6 grid sm:grid-cols-2 gap-3 max-w-3xl w-full">
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
