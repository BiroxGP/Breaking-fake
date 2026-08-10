import { Crown, RotateCcw } from 'lucide-react';
import type { GameState } from '../types';

export function GameOverScreen({ state, onRestart }: { state: GameState; onRestart: () => void }) {
  const scores = state.scores!;
  const ranked = state.players
    .map((p) => ({ player: p, score: scores[p.id] }))
    .sort((a, b) => b.score.total - a.score.total);

  return (
    <div className="min-h-screen px-4 py-12 flex flex-col items-center">
      <Crown size={48} className="text-gold" />
      <h2 className="font-display text-5xl text-white mt-2">Fine delle Trasmissioni</h2>
      <p className="text-white/50 mt-1">
        Vince <strong className="text-accent2">{ranked[0].player.name}</strong> con {ranked[0].score.total} PV!
      </p>

      <div className="mt-8 w-full max-w-2xl flex flex-col gap-3">
        {ranked.map(({ player, score }, i) => (
          <div key={player.id} className="rounded-xl border border-white/10 bg-panel p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl text-white/40">#{i + 1}</span>
                <span className="font-display text-2xl text-white">{player.name}</span>
                {player.isAI && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50">IA</span>}
              </div>
              <span className="font-display text-3xl text-gold">{score.total} PV</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3 text-[11px] text-white/50">
              <Stat label="Teorie" value={score.theoryValue} />
              <Stat label="Catalizzatori" value={score.catalystValue} />
              <Stat label="Notizie" value={score.newsValue} />
              <Stat label="Coerenza Testuale" value={score.coerenzaTestuale} />
              <Stat label="Monopolio" value={score.monopolio} />
              <Stat label="Scoop del Secolo" value={score.scoopDelSecolo} />
              <Stat label="Clickbaiter Seriale" value={score.clickbaiterSeriale} />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onRestart}
        className="mt-10 px-8 py-4 rounded-xl bg-accent text-white font-display text-2xl tracking-wide hover:bg-accent/80 shadow-glow flex items-center gap-2"
      >
        <RotateCcw size={20} /> Gioca Ancora
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-black/20 px-2 py-1.5 flex flex-col">
      <span className="text-white/30">{label}</span>
      <span className="text-white font-bold">{value}</span>
    </div>
  );
}
