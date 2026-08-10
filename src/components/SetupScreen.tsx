import { useState } from 'react';
import { Bot, Minus, Plus, User } from 'lucide-react';
import type { NewPlayerConfig } from '../game/setup';

export function SetupScreen({ onConfirm }: { onConfirm: (configs: NewPlayerConfig[]) => void }) {
  const [configs, setConfigs] = useState<NewPlayerConfig[]>([
    { name: 'Tu', isAI: false },
    { name: 'Spin Doctor IA', isAI: true },
  ]);

  const addPlayer = () => {
    if (configs.length >= 5) return;
    setConfigs([...configs, { name: `Giocatore ${configs.length + 1}`, isAI: true }]);
  };

  const removePlayer = () => {
    if (configs.length <= 2) return;
    setConfigs(configs.slice(0, -1));
  };

  const update = (i: number, patch: Partial<NewPlayerConfig>) => {
    setConfigs(configs.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full">
        <h2 className="font-display text-4xl text-white text-center">Prepara la Redazione</h2>
        <p className="text-white/50 text-center mt-2 text-sm">
          Da 2 a 5 Spin Doctor. Ogni giocatore umano gioca a turno sullo stesso dispositivo
          (pass-and-play): il gioco mostrerà una schermata di passaggio prima di rivelare carte private.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={removePlayer}
            className="w-9 h-9 rounded-full border border-white/20 text-white flex items-center justify-center hover:border-accent2"
          >
            <Minus size={16} />
          </button>
          <span className="text-white font-display text-2xl w-10 text-center">{configs.length}</span>
          <button
            type="button"
            onClick={addPlayer}
            className="w-9 h-9 rounded-full border border-white/20 text-white flex items-center justify-center hover:border-accent2"
          >
            <Plus size={16} />
          </button>
          <span className="text-white/50 text-sm ml-2">giocatori</span>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {configs.map((c, i) => (
            <div key={i} className="flex items-center gap-2 bg-panel rounded-lg border border-white/10 p-2">
              <input
                value={c.name}
                onChange={(e) => update(i, { name: e.target.value })}
                className="flex-1 bg-transparent text-white px-2 py-1 outline-none"
                placeholder={`Giocatore ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => update(i, { isAI: false })}
                className={`px-3 py-1.5 rounded-md text-xs flex items-center gap-1 ${
                  !c.isAI ? 'bg-accent2 text-ink font-bold' : 'text-white/40 border border-white/10'
                }`}
              >
                <User size={13} /> Umano
              </button>
              <button
                type="button"
                onClick={() => update(i, { isAI: true })}
                className={`px-3 py-1.5 rounded-md text-xs flex items-center gap-1 ${
                  c.isAI ? 'bg-accent text-white font-bold' : 'text-white/40 border border-white/10'
                }`}
              >
                <Bot size={13} /> IA
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onConfirm(configs.map((c) => ({ ...c, name: c.name.trim() || 'Spin Doctor' })))}
          className="mt-8 w-full py-4 rounded-xl bg-accent text-white font-display text-2xl tracking-wide hover:bg-accent/80 shadow-glow"
        >
          Inizia la Partita
        </button>
      </div>
    </div>
  );
}
