import type { DiffusionLevel, NewsInstance, ResonanceEffectId, TheoryInstance } from '../types';

export const LEVEL_ORDER: DiffusionLevel[] = ['Sconosciuta', 'Emergente', 'Popolare', 'Virale', 'TopSecret'];

export const LEVEL_POINTS: Record<DiffusionLevel, number> = {
  Sconosciuta: 1,
  Emergente: 2,
  Popolare: 3,
  Virale: 4,
  TopSecret: 5,
};

export const LEVEL_LABELS: Record<DiffusionLevel, string> = {
  Sconosciuta: 'Sconosciuta',
  Emergente: 'Emergente',
  Popolare: 'Popolare',
  Virale: 'Virale',
  TopSecret: 'Top Secret',
};

/** Effects that help the Teoria's owner (raise Diffusione/punti, or protect the Notizia) — worth
 * playing on your own Teoria. */
export const POSITIVE_EFFECTS: ResonanceEffectId[] = [
  'notizia_verificata',
  'leak_controllato',
  'clickbait',
  'trappola_governativa',
  'vaso_di_pandora',
  'anello_mancante',
];

/** Effects that hurt the Teoria's owner (lower Diffusione/punti, or raise its closing
 * requirements) — worth playing on an opponent's Teoria. */
export const NEGATIVE_EFFECTS: ResonanceEffectId[] = [
  'fuori_contesto',
  'insabbiamento',
  'smentita_ufficiale',
  'mezza_verita',
  'sotto_la_superficie',
  'fake_news',
];

function levelIndex(level: DiffusionLevel): number {
  return LEVEL_ORDER.indexOf(level);
}

function shiftLevel(current: DiffusionLevel, delta: number, opts?: { min?: DiffusionLevel; max?: DiffusionLevel }): DiffusionLevel {
  let idx = levelIndex(current) + delta;
  const minIdx = opts?.min ? levelIndex(opts.min) : 0;
  const maxIdx = opts?.max ? levelIndex(opts.max) : LEVEL_ORDER.length - 1;
  idx = Math.max(minIdx, Math.min(maxIdx, idx));
  return LEVEL_ORDER[idx];
}

export interface ResonanceOutcome {
  detail: string;
  removeFromTheory: boolean;
}

/**
 * Applies a Resonance effect to a News instance. `theory` is passed so effects that
 * touch theory-level state (Sotto la Superficie) or reject already-locked targets can act.
 * Returns removeFromTheory=true when the caller must detach/discard the news (Insabbiamento).
 */
export function applyResonanceEffect(
  news: NewsInstance,
  theory: TheoryInstance,
  effectId: ResonanceEffectId,
): ResonanceOutcome {
  let detail = '';
  let removeFromTheory = false;

  switch (effectId) {
    case 'fuori_contesto': {
      const effectiveSecondary =
        !news.categoryOverridePrincipale &&
        newsCategoryOnTheory(news, theory) === 'Secondaria' &&
        levelIndex(news.level) < levelIndex('Virale');
      if (effectiveSecondary) {
        news.pointsOverrideZero = true;
        detail = 'notizia secondaria: vale 0 punti.';
      } else {
        news.level = shiftLevel(news.level, -1, { min: 'Sconosciuta' });
        detail = `notizia principale: Diffusione scesa a ${news.level}.`;
      }
      break;
    }
    case 'notizia_verificata': {
      if (levelIndex(news.level) < levelIndex('Popolare')) {
        news.level = shiftLevel(news.level, 1, { max: 'Popolare' });
      }
      news.lockedByVerification = true;
      detail = `la notizia è ora a ${news.level} e blindata: nessuna Risonanza potrà più toccarla.`;
      break;
    }
    case 'leak_controllato': {
      news.level = 'Popolare';
      detail = 'la Diffusione è impostata direttamente a Popolare.';
      break;
    }
    case 'insabbiamento': {
      const rawIdx = levelIndex(news.level) - 2;
      if (rawIdx <= 0) {
        removeFromTheory = true;
        detail = 'la notizia crolla sotto Sconosciuta e viene rimossa dal gioco.';
      } else {
        news.level = LEVEL_ORDER[rawIdx];
        detail = `Diffusione ridotta a ${news.level}.`;
      }
      break;
    }
    case 'anello_mancante': {
      news.categoryOverridePrincipale = true;
      detail = 'la notizia è ora considerata di Categoria Principale.';
      break;
    }
    case 'clickbait': {
      news.level = shiftLevel(news.level, 2, { max: 'Virale' });
      news.pointsCapAt2 = true;
      detail = `Diffusione salita a ${news.level}, ma il valore è ora limitato a 2 punti.`;
      break;
    }
    case 'trappola_governativa': {
      news.level = shiftLevel(news.level, 1, { max: 'Virale' });
      detail = `Diffusione salita a ${news.level}.`;
      break;
    }
    case 'smentita_ufficiale': {
      news.level = shiftLevel(news.level, -1, { min: 'Sconosciuta' });
      detail = `Diffusione scesa a ${news.level}.`;
      break;
    }
    case 'mezza_verita': {
      news.pointsHalved = true;
      detail = 'il valore in punti della notizia viene dimezzato.';
      break;
    }
    case 'sotto_la_superficie': {
      if (theory.extraNewsRequired === 0) {
        theory.extraNewsRequired = 1;
        detail = 'per chiudere questa Teoria servirà ora 1 Notizia aggiuntiva.';
      } else {
        detail = 'effetto già applicato a questa Teoria: nessun cambiamento.';
      }
      break;
    }
    case 'vaso_di_pandora': {
      news.level = shiftLevel(news.level, 3, { max: 'TopSecret' });
      detail = `Diffusione salita a ${news.level}.`;
      break;
    }
    case 'fake_news': {
      if (news.level === 'Sconosciuta') {
        news.pointsOverrideZero = true;
        detail = 'era già Sconosciuta: il valore in punti crolla a 0.';
      } else {
        news.level = 'Sconosciuta';
        detail = 'la Diffusione è impostata a Sconosciuta.';
      }
      break;
    }
  }

  return { detail, removeFromTheory };
}

/** A News's Principale/Secondaria status depends on which Theory it's attached to: it matches
 * either the Theory's topic against categoriaPrincipale or categoriaSecondaria on the card. */
export function newsCategoryOnTheory(news: NewsInstance, theory: TheoryInstance): 'Principale' | 'Secondaria' | null {
  if (news.def.categoriaPrincipale === theory.def.topic) return 'Principale';
  if (news.def.categoriaSecondaria === theory.def.topic) return 'Secondaria';
  return null;
}

export function canAttachNewsToTheory(news: { def: { categoriaPrincipale: string; categoriaSecondaria: string } }, theory: TheoryInstance): boolean {
  return news.def.categoriaPrincipale === theory.def.topic || news.def.categoriaSecondaria === theory.def.topic;
}

export function isEffectivelyPrincipale(news: NewsInstance, theory: TheoryInstance): boolean {
  if (news.categoryOverridePrincipale) return true;
  if (levelIndex(news.level) >= levelIndex('Virale')) return true;
  return newsCategoryOnTheory(news, theory) === 'Principale';
}

export function newsScoreContribution(news: NewsInstance, theory: TheoryInstance): number {
  if (news.pointsOverrideZero) return 0;
  let value = LEVEL_POINTS[news.level];
  const principale = isEffectivelyPrincipale(news, theory);
  if (!principale) value = Math.ceil(value / 2);
  if (news.pointsCapAt2) value = Math.min(value, 2);
  if (news.pointsHalved) value = Math.floor(value / 2);
  return value;
}
