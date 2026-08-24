/** Handful of Teoria flavor texts where the Catalizzatore in a slot is the grammatical subject of
 * the verb right after its bold name ("Il **Governo Ombra** occulta...") — swapping that slot's
 * Catalizzatore for one of a different number (singular/plural) leaves the verb's conjugation
 * stuck on the original, e.g. "Gli **Osservatori** camminano" -> "Il **Governo Ombra** camminano".
 *
 * This is a short, hand-verified list rather than a generic "fix the word after any bold span"
 * scan on purpose: several Teorie have a bold span immediately followed by a verb that actually
 * agrees with an *earlier* word instead (e.g. "...fuggito dalla **Base NEX-12** conferma..." — the
 * subject of "conferma" is "La Testimonianza di Insider", not "Base NEX-12"). A generic scan would
 * "fix" those into new mistakes. Keyed by `${theoryId}:${slotIndex}` (0 = slotA, 1 = slotB); each
 * entry is `[singular, plural]` — verified against the source text before adding.
 *
 * Deliberately does not attempt passive constructions ("vengono installati") — those need the
 * participle to agree in gender too, not just the auxiliary in number, which is a different and
 * more error-prone problem than this simple active-verb case. */
export const VERB_AGREEMENT: Record<string, [string, string]> = {
  'masse-sorveglianza-massa:0': ['monitora', 'monitorano'],
  'spazio-secondo-sole:0': ['monitora', 'monitorano'],
  'masse-propaganda-media:0': ['sta', 'stanno'],
  'sanitaria-pandemia:0': ['svela', 'svelano'],
  'noo-nuovo-ordine-mondiale:0': ['coordina', 'coordinano'],
  'terra-cava:0': ['occulta', 'occultano'],
  'terra-micro-buchi-neri:0': ['finanzia', 'finanziano'],
  'terra-5g-pericoloso:0': ['finanzia', 'finanziano'],
  'terra-piatta:0': ['sorveglia', 'sorvegliano'],
  'spazio-esplorazione-marziana:0': ['organizza', 'organizzano'],
  'et-alieni-tra-noi:0': ['cammina', 'camminano'],
  'misteri-rettiliani:0': ['utilizza', 'utilizzano'],
  'negazionismo-luna-inesistente:0': ['suggerisce', 'suggeriscono'],
  'negazionismo-sbarco-lunare-falso:0': ['serve', 'servono'],
  'simulazione-realta-simulata:0': ['proietta', 'proiettano'],
  'revisionismo-storia-riscritta:1': ['minaccia', 'minacciano'],
  'simulazione-backup-umanita:0': ['ha', 'hanno'],
};

/** Rebuilds `word` to the singular/plural form from the pair registered for this Teoria+slot (if
 * any), preserving capitalization. Returns null when there's no registered verb here, or `word`
 * isn't recognizably either form of it (a defensive check — should always match in practice). */
export function reagreeVerbFor(theoryId: string, slotIndex: 0 | 1, word: string, plural?: boolean): string | null {
  const pair = VERB_AGREEMENT[`${theoryId}:${slotIndex}`];
  if (!pair) return null;
  const [singular, pluralForm] = pair;
  const w = word.toLowerCase();
  if (w !== singular && w !== pluralForm) return null;
  const target = plural ? pluralForm : singular;
  const wasCapitalized = word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase();
  return wasCapitalized ? target[0].toUpperCase() + target.slice(1) : target;
}
