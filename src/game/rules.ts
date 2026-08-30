import type { TheoryInstance } from '../types';
import { isEffectivelyPrincipale } from './resonanceEffects';

export function maxAttachableNews(theory: TheoryInstance): number {
  return theory.def.stars + theory.extraNewsRequired;
}

export function minRequiredNews(theory: TheoryInstance): number {
  return theory.def.stars - 1 + theory.extraNewsRequired;
}

export function isTheoryBuilt(theory: TheoryInstance): boolean {
  return !!theory.slotA.filled && !!theory.slotB.filled;
}

export function canCloseTheory(theory: TheoryInstance): boolean {
  if (theory.closed) return false;
  if (!isTheoryBuilt(theory)) return false;
  const stars = theory.def.stars;
  const minCount = minRequiredNews(theory);
  const news = theory.attachedNews;
  if (news.length < minCount) return false;
  if (stars === 1) return true;
  const hasPrincipaleOrVirale = news.some((n) => isEffectivelyPrincipale(n, theory));
  if (stars === 2) return hasPrincipaleOrVirale;
  return hasPrincipaleOrVirale && news.length >= 2;
}

/** A 2★/3★ Teoria at its Notizie cap with no Principale (or Virale) among them is a dead end:
 * it can't close (missing that requirement) and can't accept another Notizia (already at cap).
 * Only escape without a lucky Risonanza draw was Anello Mancante or Insabbiamento — this flags
 * the state so the UI can offer substituting one of the stuck Notizie instead. */
export function isTheorySoftLocked(theory: TheoryInstance): boolean {
  if (theory.closed) return false;
  if (theory.def.stars < 2) return false;
  if (theory.attachedNews.length < maxAttachableNews(theory)) return false;
  return !theory.attachedNews.some((n) => isEffectivelyPrincipale(n, theory));
}

export function closeReasonIfBlocked(theory: TheoryInstance): string | null {
  if (theory.closed) return 'La Teoria è già chiusa.';
  if (!isTheoryBuilt(theory)) return 'Servono entrambi gli slot Catalizzatore occupati.';
  const stars = theory.def.stars;
  const minCount = minRequiredNews(theory);
  const news = theory.attachedNews;
  if (news.length < minCount) return `Servono almeno ${minCount} Notizie collegate (attualmente ${news.length}).`;
  if (stars >= 2 && !news.some((n) => isEffectivelyPrincipale(n, theory))) {
    return 'Serve almeno una Notizia Principale (o diventata Virale).';
  }
  if (stars === 3 && news.length < 2) {
    return 'Servono almeno 2 Notizie collegate.';
  }
  return null;
}
