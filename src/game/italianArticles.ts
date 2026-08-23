export type Gender = 'm' | 'f';

function startsWithVowelSound(name: string): boolean {
  return /^[aeiouAEIOU]/.test(name.trim());
}

/** The consonant clusters that make a masculine noun take "lo/gli/uno" instead of "il/i/un":
 * s+consonant, z, gn, pn, ps, x, y. */
function startsWithImpureCluster(name: string): boolean {
  return /^(s[bcdfgjklmnpqrtvwz]|z|gn|pn|ps|x|y)/i.test(name.trim());
}

export function definiteArticleFor(name: string, gender: Gender, plural?: boolean): string {
  const vowel = startsWithVowelSound(name);
  const impure = startsWithImpureCluster(name);
  if (plural) {
    if (gender === 'f') return 'le';
    return vowel || impure ? 'gli' : 'i';
  }
  if (gender === 'f') return vowel ? "l'" : 'la';
  return impure ? 'lo' : vowel ? "l'" : 'il';
}

export function indefiniteArticleFor(name: string, gender: Gender, plural?: boolean): string {
  const vowel = startsWithVowelSound(name);
  const impure = startsWithImpureCluster(name);
  // Italian has no true indefinite plural article ("un/una" only exist singular) — "delle Tracce
  // Isotopiche" ("some Isotopic Traces") is how "un/una" naturally extends to a plural noun.
  if (plural) {
    if (gender === 'f') return 'delle';
    return vowel || impure ? 'degli' : 'dei';
  }
  if (gender === 'f') return vowel ? "un'" : 'una';
  return impure ? 'uno' : 'un';
}

/** di/a/da/in/su fused with a definite article ("della", "nell'", "dagli"...). */
const PREP_FUSION: Record<string, Record<string, string>> = {
  di: { il: 'del', lo: 'dello', la: 'della', "l'": "dell'", i: 'dei', gli: 'degli', le: 'delle' },
  a: { il: 'al', lo: 'allo', la: 'alla', "l'": "all'", i: 'ai', gli: 'agli', le: 'alle' },
  da: { il: 'dal', lo: 'dallo', la: 'dalla', "l'": "dall'", i: 'dai', gli: 'dagli', le: 'dalle' },
  in: { il: 'nel', lo: 'nello', la: 'nella', "l'": "nell'", i: 'nei', gli: 'negli', le: 'nelle' },
  su: { il: 'sul', lo: 'sullo', la: 'sulla', "l'": "sull'", i: 'sui', gli: 'sugli', le: 'sulle' },
};

const FUSED_LOOKUP = new Map<string, { prep: string; art: string }>();
for (const [prep, forms] of Object.entries(PREP_FUSION)) {
  for (const [art, fused] of Object.entries(forms)) {
    FUSED_LOOKUP.set(fused, { prep, art });
  }
}

const BARE_DEFINITE = new Set(['il', 'lo', 'la', "l'", 'i', 'gli', 'le']);
const BARE_INDEFINITE = new Set(['un', 'uno', 'una', "un'"]);

interface ParsedArticle {
  kind: 'def' | 'indef';
  prep?: string;
}

/** Recognizes an Italian article immediately before a noun — bare ("un'", "gli") or fused with a
 * preposition ("dalla", "nell'", "degli") — so it can be rebuilt to agree with a different noun.
 * Returns null for anything else (a bare preposition, a verb, punctuation...), which is the
 * signal to leave that word untouched. */
function parseArticle(word: string): ParsedArticle | null {
  const w = word.toLowerCase();
  if (BARE_DEFINITE.has(w)) return { kind: 'def' };
  if (BARE_INDEFINITE.has(w)) return { kind: 'indef' };
  const fused = FUSED_LOOKUP.get(w);
  if (fused) return { kind: 'def', prep: fused.prep };
  return null;
}

/** If `word` is a recognized article (bare or fused with a preposition), rebuilds it to agree
 * with `name`'s gender/number — keeping the same definite/indefinite status and preposition —
 * and preserves `word`'s original capitalization. Returns null if `word` isn't an article. */
export function reagreeArticle(word: string, name: string, gender: Gender, plural?: boolean): string | null {
  const parsed = parseArticle(word);
  if (!parsed) return null;
  const rebuilt =
    parsed.kind === 'indef'
      ? indefiniteArticleFor(name, gender, plural)
      : parsed.prep
        ? PREP_FUSION[parsed.prep][definiteArticleFor(name, gender, plural)]
        : definiteArticleFor(name, gender, plural);
  const wasCapitalized = word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase();
  return wasCapitalized ? rebuilt[0].toUpperCase() + rebuilt.slice(1) : rebuilt;
}
