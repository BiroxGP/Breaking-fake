import { CircleDot, Flame, Newspaper, Zap } from 'lucide-react';
import type { CatalystInstance, NewsInstance, ResonanceInstance, TheoryInstance } from '../types';
import {
  LEVEL_LABELS,
  LEVEL_POINTS,
  NEGATIVE_EFFECTS,
  POSITIVE_EFFECTS,
  isEffectivelyPrincipale,
  newsScoreContribution,
} from '../game/resonanceEffects';
import { canCloseTheory } from '../game/rules';
import { Magnify } from './HoverPreview';

function Stars({ n }: { n: number }) {
  return (
    <span className="text-gold tracking-tight">
      {'★'.repeat(n)}
      <span className="text-white/20">{'★'.repeat(3 - n)}</span>
    </span>
  );
}

const TYPE_ICON: Record<string, string> = {
  Artefice: '🛠️',
  Luogo: '📍',
  Mezzo: '📡',
  Prova: '🔍',
  Scopo: '🎯',
};

/** Splits `**marked**` segments out of a Theory's flavor text into highlighted spans — these mark
 * the Catalizzatore names cited in the narrative, for the Coerenza Testuale bonus (+5 PV when the
 * placed Catalizzatore's name matches one of them). */
export function FlavorText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\*\*.+?\*\*)/g);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="text-gold font-bold">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

/** Splits a Theory's flavor text into its general description and the sentence(s) citing a
 * Catalizzatore by name (the `**marked**` part). Falls back to treating the whole thing as one
 * or the other when there's no clean sentence boundary to split on. */
function splitFlavor(flavor: string): { description: string; quote: string } {
  const boldIdx = flavor.indexOf('**');
  if (boldIdx === -1) return { description: flavor, quote: '' };
  const sentenceEnd = flavor.lastIndexOf('. ', boldIdx);
  if (sentenceEnd === -1) return { description: '', quote: flavor };
  return { description: flavor.slice(0, sentenceEnd + 1).trim(), quote: flavor.slice(sentenceEnd + 2).trim() };
}

/** Renders a Theory's flavor as a general description line, followed on its own line by the
 * catalyst-citing sentence — quoted and in italics, smaller than the description — since that's
 * the part the Coerenza Testuale bonus actually checks against the placed Catalizzatore's name. */
export function TheoryFlavor({
  flavor,
  descClassName,
  quoteClassName,
}: {
  flavor: string;
  descClassName?: string;
  quoteClassName?: string;
}) {
  const { description, quote } = splitFlavor(flavor);
  return (
    <>
      {description && <div className={descClassName}>{description}</div>}
      {quote && (
        <div className={`italic ${quoteClassName ?? ''}`}>
          “<FlavorText text={quote} />”
        </div>
      )}
    </>
  );
}

export function CatalystCardView({
  card,
  onClick,
  selected,
  small,
}: {
  card: CatalystInstance;
  onClick?: () => void;
  selected?: boolean;
  small?: boolean;
}) {
  const cardEl = (
    <button
      type="button"
      onClick={onClick}
      className={`card-tilt text-left rounded-xl border ${
        selected ? 'border-accent2 shadow-glow' : 'border-white/10'
      } bg-panel2 overflow-hidden flex flex-col ${small ? 'w-28' : 'w-40'} shrink-0 disabled:cursor-default`}
      disabled={!onClick}
    >
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 px-2 py-1 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wide text-indigo-200 flex items-center gap-1">
          {TYPE_ICON[card.def.type]} {card.def.type}
        </span>
        <span className="text-[10px] font-bold text-gold">{card.def.points}pt</span>
      </div>
      {!small && <img src={card.def.image} alt={card.def.name} className="w-full aspect-square object-cover" />}
      <div className="p-2 flex-1 flex flex-col gap-1">
        <Stars n={card.def.stars} />
        <div className="font-display text-base leading-tight text-white">{card.def.name}</div>
        {!small && <div className="text-[10px] text-white/50 leading-snug">{card.def.flavor}</div>}
      </div>
    </button>
  );
  return (
    <Magnify preview={<CatalystCardView card={card} />} className="shrink-0">
      {cardEl}
    </Magnify>
  );
}

export function NewsCardView({
  card,
  onClick,
  selected,
  small,
  theory,
}: {
  card: NewsInstance;
  onClick?: () => void;
  selected?: boolean;
  small?: boolean;
  /** When known (e.g. attached, or being reacted to), resolves the real Principale/Secondaria status and score. */
  theory?: TheoryInstance;
}) {
  const principale = theory ? isEffectivelyPrincipale(card, theory) : false;
  const points = theory ? newsScoreContribution(card, theory) : LEVEL_POINTS[card.level];
  const cardEl = (
    <button
      type="button"
      onClick={onClick}
      className={`card-tilt text-left rounded-xl border ${
        selected ? 'border-accent2 shadow-glow' : 'border-white/10'
      } bg-panel2 overflow-hidden flex flex-col ${small ? 'w-28' : 'w-40'} shrink-0 disabled:cursor-default`}
      disabled={!onClick}
    >
      <div
        className={`px-2 py-1 flex items-center justify-between ${
          principale ? 'bg-gradient-to-r from-accent to-red-700' : 'bg-gradient-to-r from-slate-700 to-slate-600'
        }`}
      >
        <span className="text-[10px] uppercase tracking-wide text-white flex items-center gap-1">
          <Newspaper size={11} /> {theory ? (principale ? 'Principale' : 'Secondaria') : LEVEL_LABELS[card.level]}
        </span>
        <span className="text-[10px] font-bold text-white">{points}pt</span>
      </div>
      {!small && <img src={card.def.image} alt={card.def.name} className="w-full aspect-[4/3] object-cover" />}
      <div className="p-2 flex-1 flex flex-col gap-1">
        <span className="text-[9px] text-accent2 font-bold uppercase tracking-wide">
          {LEVEL_LABELS[card.level]}
          {card.lockedByVerification && ' · Blindata'}
        </span>
        {card.pointsOverrideZero && <span className="text-[9px] text-accent font-bold">VALORE AZZERATO</span>}
        <div className="font-display text-base leading-tight text-white">{card.def.name}</div>
        {!small && (
          <div className="text-[9px] text-white/40 leading-snug">
            Principale: {card.def.categoriaPrincipale} · Secondaria: {card.def.categoriaSecondaria}
          </div>
        )}
        {!small && <div className="text-[10px] text-white/50 leading-snug">{card.def.flavor}</div>}
      </div>
    </button>
  );
  return (
    <Magnify preview={<NewsCardView card={card} theory={theory} />} className="shrink-0">
      {cardEl}
    </Magnify>
  );
}

export function ResonanceCardView({
  card,
  onClick,
  selected,
}: {
  card: ResonanceInstance;
  onClick?: () => void;
  selected?: boolean;
}) {
  const cardEl = (
    <button
      type="button"
      onClick={onClick}
      className={`card-tilt text-left rounded-xl border ${
        selected ? 'border-accent2 shadow-glow' : 'border-white/10'
      } bg-panel2 overflow-hidden flex flex-col w-40 shrink-0 disabled:cursor-default`}
      disabled={!onClick}
    >
      <div className="relative">
        <img src={card.def.image} alt={card.def.name} className="w-full aspect-[3/4] object-cover" />
        <span
          className={`absolute top-1 right-1 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
            card.def.type === 'Reazione' ? 'bg-gold text-black' : 'bg-accent2 text-black'
          }`}
        >
          <Zap size={9} /> {card.def.type}
        </span>
        {POSITIVE_EFFECTS.includes(card.def.effectId) && (
          <span className="absolute top-1 left-1 text-[8px] font-bold px-1.5 py-0.5 rounded bg-green-600 text-white" title="Rafforza la Notizia: giocala su una Teoria che vuoi aiutare">
            ▲ RAFFORZA
          </span>
        )}
        {NEGATIVE_EFFECTS.includes(card.def.effectId) && (
          <span className="absolute top-1 left-1 text-[8px] font-bold px-1.5 py-0.5 rounded bg-accent text-white" title="Indebolisce la Notizia: giocala su una Teoria che vuoi danneggiare">
            ▼ INDEBOLISCE
          </span>
        )}
      </div>
      <div className="p-2 flex-1 flex flex-col gap-1">
        <div className="font-display text-base leading-tight text-white">{card.def.name}</div>
        <div className="text-[10px] text-white/60 leading-snug">{card.def.description}</div>
      </div>
    </button>
  );
  return (
    <Magnify preview={<ResonanceCardView card={card} />} className="shrink-0">
      {cardEl}
    </Magnify>
  );
}

export function CardBack({ label }: { label: string }) {
  if (label === 'Risonanza') {
    return (
      <img
        src="/cards/risonanza/back.png"
        alt="Risonanza"
        className="w-16 h-24 rounded-lg border border-white/10 object-cover shrink-0"
      />
    );
  }
  return (
    <div className="w-16 h-24 rounded-lg border border-white/10 bg-gradient-to-br from-panel2 to-ink flex items-center justify-center shrink-0">
      <span className="text-[9px] text-white/40 rotate-90 whitespace-nowrap">{label}</span>
    </div>
  );
}

export function TheoryCardView({
  theory,
  isOwn,
  onSlotClick,
  onAttachClick,
  onCloseClick,
  onNewsClick,
  highlightSlotA,
  highlightSlotB,
  highlightAttach,
  isNewsTargetable,
  fullText,
}: {
  theory: TheoryInstance;
  isOwn: boolean;
  onSlotClick?: (slot: 'slotA' | 'slotB') => void;
  onAttachClick?: () => void;
  onCloseClick?: () => void;
  onNewsClick?: (newsUid: string) => void;
  highlightSlotA?: boolean;
  highlightSlotB?: boolean;
  highlightAttach?: boolean;
  isNewsTargetable?: (news: NewsInstance) => boolean;
  /** Full, untruncated flavor text — used for the magnified preview where clipping defeats the purpose. */
  fullText?: boolean;
}) {
  const closeable = !theory.closed && canCloseTheory(theory);
  const cardEl = (
    <div
      className={`rounded-xl border ${
        theory.closed ? 'border-gold/60' : 'border-white/10'
      } bg-panel overflow-hidden flex flex-col w-60 shrink-0 ${theory.closed ? 'opacity-90' : ''}`}
    >
      <div className="bg-gradient-to-r from-panel2 to-ink px-2 py-1.5 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wide text-accent2">{theory.def.topic}</span>
        <span className="flex items-center gap-1 text-[10px]">
          <Stars n={theory.def.stars} />
          <span className="text-gold font-bold">{theory.def.basePV}pt</span>
        </span>
      </div>
      <img src={theory.def.image} alt={theory.def.name} className="w-full aspect-[16/9] object-cover" />
      <div className="px-2 pt-1.5">
        <div className="font-display text-lg leading-tight text-white">{theory.def.name}</div>
        <TheoryFlavor
          flavor={theory.def.flavor}
          descClassName={`text-[10px] text-white/50 leading-snug mt-0.5 ${fullText ? '' : 'line-clamp-2'}`}
          quoteClassName={`text-[9px] text-white/40 leading-snug mt-1 ${fullText ? '' : 'line-clamp-2'}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-1 px-2 mt-2">
        {(['slotA', 'slotB'] as const).map((key) => {
          const slot = theory[key];
          const highlight = key === 'slotA' ? highlightSlotA : highlightSlotB;
          const coerente = !!slot.filled && theory.def.testuale.includes(slot.filled.def.id);
          return (
            <button
              key={key}
              type="button"
              disabled={!onSlotClick}
              onClick={() => onSlotClick?.(key)}
              className={`relative rounded-md border text-[10px] px-1 py-2 flex flex-col items-center gap-0.5 ${
                highlight
                  ? 'border-accent2 bg-accent2/10 animate-pulse'
                  : slot.filled
                  ? 'border-indigo-400/40 bg-indigo-950/60'
                  : 'border-dashed border-white/20 bg-black/20'
              } ${onSlotClick ? 'cursor-pointer' : ''}`}
            >
              {coerente && (
                <span
                  title="Coerenza Testuale: questo Catalizzatore è citato nel testo della Teoria (+5 PV alla chiusura)"
                  className="absolute -top-1.5 -right-1.5 text-[9px] leading-none bg-gold text-ink rounded-full w-4 h-4 flex items-center justify-center font-bold shadow"
                >
                  ✓
                </span>
              )}
              {slot.filled ? (
                <Magnify preview={<CatalystCardView card={slot.filled} />}>
                  <span className="text-white font-semibold">{slot.filled.def.name}</span>
                  <span className="text-gold">{slot.filled.def.points}pt</span>
                </Magnify>
              ) : (
                <span className="text-white/40">{TYPE_ICON[slot.required]} {slot.required}</span>
              )}
            </button>
          );
        })}
      </div>

      <div
        onClick={onAttachClick}
        role={onAttachClick ? 'button' : undefined}
        tabIndex={onAttachClick ? 0 : undefined}
        aria-label={onAttachClick ? `Collega Notizia a ${theory.def.name}` : undefined}
        className={`mx-2 mt-2 mb-2 rounded-md border text-[10px] px-1 py-1.5 min-h-[40px] flex flex-wrap gap-1 items-start content-start ${
          highlightAttach ? 'border-accent2 bg-accent2/10 animate-pulse cursor-pointer' : 'border-dashed border-white/15'
        }`}
      >
        {theory.attachedNews.length === 0 && (
          <span className="text-white/30 italic">Nessuna Notizia collegata</span>
        )}
        {theory.attachedNews.map((n) => {
          const targetable = !!onNewsClick && (isNewsTargetable ? isNewsTargetable(n) : true);
          return (
            <button
              key={n.uid}
              type="button"
              disabled={!targetable}
              onClick={(e) => {
                e.stopPropagation();
                onNewsClick?.(n.uid);
              }}
              className={`px-1 py-0.5 rounded ${
                isEffectivelyPrincipale(n, theory) ? 'bg-accent/30 text-red-200' : 'bg-slate-600/40 text-slate-200'
              } ${n.pointsOverrideZero ? 'line-through opacity-50' : ''} ${
                targetable ? 'ring-1 ring-accent2 animate-pulse cursor-pointer' : ''
              }`}
              title={`${n.def.name} — ${LEVEL_LABELS[n.level]}`}
            >
              <Magnify preview={<NewsCardView card={n} theory={theory} />}>
                {n.def.name.length > 14 ? `${n.def.name.slice(0, 14)}…` : n.def.name} ({newsScoreContribution(n, theory)})
              </Magnify>
            </button>
          );
        })}
      </div>

      {isOwn && !theory.closed && (
        <button
          type="button"
          disabled={!closeable || !onCloseClick}
          onClick={onCloseClick}
          className={`m-2 mt-0 rounded-md py-1.5 text-xs font-bold flex items-center justify-center gap-1 ${
            closeable
              ? 'bg-accent text-white hover:bg-accent/80'
              : 'bg-white/5 text-white/30 cursor-not-allowed'
          }`}
        >
          <Flame size={13} /> Manda in stampa
        </button>
      )}
      {theory.closed && (
        <div className="m-2 mt-0 rounded-md py-1.5 text-xs font-bold flex items-center justify-center gap-1 bg-gold/20 text-gold">
          <CircleDot size={13} /> Chiusa (#{theory.closeOrder})
        </div>
      )}
    </div>
  );
  return (
    <Magnify preview={<TheoryCardView theory={theory} isOwn={isOwn} fullText />} className="shrink-0">
      {cardEl}
    </Magnify>
  );
}
