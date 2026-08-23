import { Newspaper, X } from 'lucide-react';
import type { TheoryInstance } from '../types';
import { CroppedArt, NEWS_ART_CROP, THEORY_ART_CROP, TheoryFlavor, personalizedFlavor } from './CardViews';
import { LEVEL_LABELS, isEffectivelyPrincipale, newsScoreContribution } from '../game/resonanceEffects';
import { monopolioBonusFor, scoreTheory } from '../game/scoring';

/** Shown every time a Teoria is closed ("mandata in stampa"): a newspaper-clipping recap of the
 * story that theory tells, the News that "confirm" it, and exactly how many PV it earned. */
export function TheoryPrintout({
  theory,
  allTheories,
  ownerName,
  onClose,
}: {
  theory: TheoryInstance;
  allTheories: TheoryInstance[];
  ownerName: string;
  onClose: () => void;
}) {
  const score = scoreTheory(theory);
  const monopolio = monopolioBonusFor(theory, allTheories);
  const total = score.subtotal + monopolio;

  return (
    <div className="fixed inset-0 z-[220] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#f3ead9] text-ink max-w-5xl w-full max-h-[92vh] overflow-y-auto rounded-sm shadow-2xl border-4 border-double border-ink/70">
        <div className="flex items-center justify-between px-7 pt-6">
          <span className="flex items-center gap-1.5 text-sm uppercase tracking-[0.2em] font-bold text-ink/70">
            <Newspaper size={18} /> Edizione Straordinaria — {theory.def.topic}
          </span>
          <button onClick={onClose} className="p-1 rounded hover:bg-ink/10 text-ink/60">
            <X size={22} />
          </button>
        </div>
        <div className="border-b-2 border-ink/70 mx-7 mt-2" />

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-7 px-7 py-6">
          <div>
            <CroppedArt
              src={theory.def.image}
              alt={theory.def.name}
              crop={THEORY_ART_CROP}
              className="float-left w-40 sm:w-52 rounded-sm border border-ink/40 shadow mr-4 mb-1 grayscale contrast-125"
            />
            <h2 className="font-display text-4xl sm:text-5xl leading-[1.05] uppercase">{theory.def.name}</h2>
            <p className="font-serif italic text-xs text-ink/50 mt-0.5">Chiusa da {ownerName}</p>
            <TheoryFlavor
              flavor={personalizedFlavor(theory)}
              descClassName="font-serif text-lg leading-snug mt-3 text-ink/90"
              quoteClassName="font-serif text-base leading-snug mt-2 text-ink/70"
            />
            <div className="clear-both" />

            <div className="mt-6">
              <div className="text-xs uppercase tracking-widest font-bold text-ink/50 mb-2">
                Le prove che confermano la storia
              </div>
              {theory.attachedNews.length === 0 ? (
                <p className="text-sm italic text-ink/50">Nessuna Notizia collegata a supporto.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {theory.attachedNews.map((n) => (
                    <div key={n.uid} className="flex items-start gap-3 border border-ink/25 rounded-sm overflow-hidden bg-black/[0.02] p-2">
                      <CroppedArt src={n.def.image} alt={n.def.name} crop={NEWS_ART_CROP} className="w-28 shrink-0 rounded-sm border border-ink/20 grayscale contrast-125" />
                      <div className="min-w-0">
                        <div className="font-serif font-bold text-sm leading-tight">"{n.def.name}"</div>
                        <div className="text-[11px] text-ink/60 mt-0.5">
                          {isEffectivelyPrincipale(n, theory) ? 'Principale' : 'Secondaria'} · {LEVEL_LABELS[n.level]} ·{' '}
                          {newsScoreContribution(n, theory)} PV
                        </div>
                        <div className="font-serif italic text-[11px] text-ink/60 leading-snug mt-1 line-clamp-3">
                          {n.def.flavor}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 text-sm text-ink/50">
              Catalizzatori: <strong>{theory.slotA.filled?.def.name ?? '—'}</strong> +{' '}
              <strong>{theory.slotB.filled?.def.name ?? '—'}</strong>
            </div>
          </div>

          <div className="sm:w-56 shrink-0 bg-ink/5 border border-ink/20 rounded p-4 flex flex-col gap-2 h-fit">
            <div className="text-xs uppercase tracking-widest font-bold text-ink/50 mb-1">Punti Guadagnati</div>
            <ScoreLine label="Teoria" value={score.theoryValue} />
            <ScoreLine label="Catalizzatori" value={score.catalystValue} />
            <ScoreLine label="Notizie" value={score.newsValue} />
            {score.coerenzaTestuale > 0 && <ScoreLine label="Coerenza Testuale" value={score.coerenzaTestuale} gold />}
            {monopolio > 0 && <ScoreLine label="Monopolio" value={monopolio} gold />}
            {score.clickbaiterSeriale > 0 && <ScoreLine label="Clickbaiter Seriale" value={score.clickbaiterSeriale} gold />}
            <div className="border-t border-ink/20 mt-1.5 pt-2 flex items-center justify-between">
              <span className="text-sm font-bold uppercase">Totale</span>
              <span className="text-2xl font-display font-bold">{total}</span>
            </div>
          </div>
        </div>

        <div className="px-7 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 rounded bg-ink text-[#f3ead9] font-display text-xl tracking-wide hover:bg-ink/80"
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
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink/60">{label}</span>
      <span className={`font-bold ${gold ? 'text-amber-700' : ''}`}>+{value}</span>
    </div>
  );
}
