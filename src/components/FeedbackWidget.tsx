import { useState } from 'react';
import { Facebook, Instagram, MessageCircle, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'breaking-fake-feedback-submitted';

const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/breakingfake.boardgame/',
  facebook: 'https://www.facebook.com/1305761112613079',
};

export function FeedbackWidget({ className }: { className?: string }) {
  const [alreadySubmitted, setAlreadySubmitted] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1',
  );
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');

  const submit = async () => {
    if (!supabase) {
      setStatus('error');
      return;
    }
    if (rating === 0 && comment.trim() === '') return;
    setStatus('sending');
    const { error } = await supabase
      .from('feedback')
      .insert({ rating: rating || null, comment: comment.trim() || null });
    if (error) {
      setStatus('error');
      return;
    }
    localStorage.setItem(STORAGE_KEY, '1');
    setAlreadySubmitted(true);
  };

  return (
    <div className={`rounded-xl border border-white/10 bg-panel/60 p-5 ${className ?? ''}`}>
      <div className="font-display text-xl text-white flex items-center gap-2 mb-1">
        <MessageCircle size={18} className="text-accent2" /> Dicci cosa ne pensi
      </div>
      <p className="text-white/50 text-sm mb-4">
        Il modo migliore per aiutarci è un commento o un like sui social — ma va benissimo anche un feedback anonimo.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <a
          href={SOCIAL_LINKS.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-pink-600 to-amber-500 text-white font-bold text-sm hover:opacity-90"
        >
          <Instagram size={16} /> Seguici e commenta su Instagram
        </a>
        <a
          href={SOCIAL_LINKS.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-sm hover:opacity-90"
        >
          <Facebook size={16} /> Lascia un mi piace su Facebook
        </a>
      </div>

      <div className="border-t border-white/10 pt-4">
        {alreadySubmitted ? (
          <p className="text-white/60 text-sm italic">Grazie per il tuo feedback anonimo!</p>
        ) : (
          <>
            <div className="text-white/70 text-xs uppercase tracking-widest mb-2">Oppure lascia un feedback anonimo</div>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`${n} stelle`}
                  className="p-0.5"
                >
                  <Star size={22} className={n <= rating ? 'text-gold fill-gold' : 'text-white/20'} />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Cosa ti è piaciuto? Cosa cambieresti?"
              className="w-full rounded-lg bg-black/30 border border-white/10 text-white text-sm p-2.5 placeholder:text-white/30 resize-none"
            />
            <button
              type="button"
              onClick={submit}
              disabled={status === 'sending' || (rating === 0 && comment.trim() === '')}
              className="mt-2 px-5 py-2 rounded-lg bg-accent2 text-ink font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent2/80"
            >
              {status === 'sending' ? 'Invio…' : 'Invia feedback anonimo'}
            </button>
            {status === 'error' && (
              <p className="text-accent text-xs mt-2">
                Invio non riuscito — riprova tra poco, oppure usa uno dei link social qui sopra.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
