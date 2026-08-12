import { Newspaper, X } from 'lucide-react';
import type { TheoryInstance } from '../types';
import { TheoryFlavor } from './CardViews';
import { LEVEL_LABELS, isEffectivelyPrincipale, newsScoreContribution } from '../game/resonanceEffects';
import { monopolioBonusFor, scoreTheory } from '../game/scoring';

/** Shown every time a Teoria is closed ("mandata in stampa"): a newspaper-clipping recap of the
 * story that theory tells, the News that "confirm" it, and exactly how many PV it earned. */
export function TheoryPrintout({
  theory,
  allTheories,
  onClose,
}: {
  theory: TheoryInstance;
  allTheories: TheoryInstance[];
  onClose: () => void;
}) {
  const score = scoreTheory(theory);
  const monopolio = monopolioBonusFor(theory, allTheories);
  const total = score.subtotal + monopolio;

  return (
    <div className="fixed inset-0 z-[220] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#f3ead9] text-ink max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl border-4 border-double border-ink/70">
        <div className="flex items-center justify-between px-5 pt-4">
          <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-bold text-ink/70">
            <Newspaper size={14} /> Edizione Straordinaria — {theory.def.topic}
          </span>
          <button onClick={onClose} className="p-1 rounded hover:bg-ink/10 text-ink/60">
            <X size={18} />
          </button>
        </div>
        <div className="border-b-2 border-ink/70 mx-5 mt-1" />

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-5 px-5 py-4">
          <div>
            <img
              src={theory.def.image}
              alt={theory.def.name}
              className="float-left w-28 sm:w-32 aspect-[4/3] object-cover rounded-sm border border-ink/40 shadow grayscale contrast-125 mr-3 mb-1"
            />
            <h2 className="font-display text-3xl sm:text-4xl leading-[1.05] uppercase">{theory.def.name}</h2>
            <TheoryFlavor
              flavor={theory.def.flavor}
              descClassName="font-serif text-[15px] leading-snug mt-2 text-ink/90"
              quoteClassName="font-serif text-[13px] leading-snug mt-1.5 text-ink/70"
            />
            <div className="clear-both" />

            <div className="mt-4">
              <div className="text-[10px] uppercase tracking-widest font-bold text-ink/50 mb-2">
                Le prove che confermano la storia
              </div>
              {theory.attachedNews.length === 0 ? (
                <p className="text-sm italic text-ink/50">Nessuna Notizia collegata a supporto.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {theory.attachedNews.map((n) => (
                    <div key={n.uid} className="border border-ink/25 rounded-sm overflow-hidden bg-black/[0.02]">
                      <img
                        src={n.def.image}
                        alt={n.def.name}
                        className="w-full aspect-[4/3] object-cover grayscale contrast-125"
                      />
                      <div className="p-1.5">
                        <div className="font-serif font-bold text-[11px] leading-tight">"{n.def.name}"</div>
                        <div className="text-[9px] text-ink/60 mt-0.5">
                          {isEffectivelyPrincipale(n, theory) ? 'Principale' : 'Secondaria'} · {LEVEL_LABELS[n.level]} ·{' '}
                          {newsScoreContribution(n, theory)} PV
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 text-[11px] text-ink/50">
              Catalizzatori: <strong>{theory.slotA.filled?.def.name ?? '—'}</strong> +{' '}
              <strong>{theory.slotB.filled?.def.name ?? '—'}</strong>
            </div>
          </div>

          <div className="sm:w-44 shrink-0 bg-ink/5 border border-ink/20 rounded p-3 flex flex-col gap-1.5 h-fit">
            <div className="text-[10px] uppercase tracking-widest font-bold text-ink/50 mb-1">Punti Guadagnati</div>
            <ScoreLine label="Teoria" value={score.theoryValue} />
            <ScoreLine label="Catalizzatori" value={score.catalystValue} />
            <ScoreLine label="Notizie" value={score.newsValue} />
            {score.coerenzaTestuale > 0 && <ScoreLine label="Coerenza Testuale" value={score.coerenzaTestuale} gold />}
            {monopolio > 0 && <ScoreLine label="Monopolio" value={monopolio} gold />}
            {score.clickbaiterSeriale > 0 && <ScoreLine label="Clickbaiter Seriale" value={score.clickbaiterSeriale} gold />}
            <div className="border-t border-ink/20 mt-1 pt-1.5 flex items-center justify-between">
              <span className="text-xs font-bold uppercase">Totale</span>
              <span className="text-xl font-display font-bold">{total}</span>
            </div>
          </div>
        </div>

        <div className="px-5 pb-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded bg-ink text-[#f3ead9] font-display text-lg tracking-wide hover:bg-ink/80"
          >
            Continua
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreLine({ label, value, gold }: { label: string; value: number; gold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-ink/60">{label}</span>
      <span className={`font-bold ${gold ? 'text-amber-700' : ''}`}>+{value}</span>
    </div>
  );
}
