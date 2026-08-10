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
  const hasPrincipaleOrVirale = news.some(isEffectivelyPrincipale);
  if (stars === 2) return hasPrincipaleOrVirale;
  return hasPrincipaleOrVirale && news.length >= 2;
}

export function closeReasonIfBlocked(theory: TheoryInstance): string | null {
  if (theory.closed) return 'La Teoria è già chiusa.';
  if (!isTheoryBuilt(theory)) return 'Servono entrambi gli slot Catalizzatore occupati.';
  const stars = theory.def.stars;
  const minCount = minRequiredNews(theory);
  const news = theory.attachedNews;
  if (news.length < minCount) return `Servono almeno ${minCount} Notizie collegate (attualmente ${news.length}).`;
  if (stars >= 2 && !news.some(isEffectivelyPrincipale)) {
    return 'Serve almeno una Notizia Principale (o diventata Virale).';
  }
  if (stars === 3 && news.length < 2) {
    return 'Servono almeno 2 Notizie collegate.';
  }
  return null;
}
