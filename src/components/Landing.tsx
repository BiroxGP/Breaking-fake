import { Newspaper, Radio, Sparkles, Users, Zap } from 'lucide-react';

export function Landing({ onStart, onRules }: { onStart: () => void; onRules: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="max-w-3xl w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent2/40 text-accent2 text-xs uppercase tracking-widest mb-6">
          <Radio size={14} /> Demo giocabile — pre-lancio
        </div>
        <h1 className="font-display text-6xl sm:text-7xl text-white leading-none tracking-wide">
          BREAKING <span className="text-accent">FAKE</span>
        </h1>
        <p className="mt-3 text-white/60 text-sm uppercase tracking-[0.3em]">
          L'Architetto dei Complotti
        </p>

        <p className="mt-8 text-white/80 text-lg leading-relaxed">
          Sei uno spregiudicato <strong className="text-accent2">Spin Doctor</strong>. Fabbrica le tue
          Teorie del Complotto, piazza i tuoi Catalizzatori, lancia scoop attraverso i media e difendi (o
          demolisci) le notizie a colpi di Risonanza. Chiudi 3 Teorie prima degli avversari e accumula più
          Punti Vittoria: il gioco è tuo.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={onStart}
            className="px-8 py-4 rounded-xl bg-accent text-white font-display text-2xl tracking-wide hover:bg-accent/80 shadow-glow"
          >
            Prova la Demo
          </button>
          <button
            type="button"
            onClick={onRules}
            className="px-8 py-4 rounded-xl border border-white/20 text-white/80 font-display text-2xl tracking-wide hover:border-white/40"
          >
            Leggi il Regolamento
          </button>
        </div>

        <div className="mt-16 grid sm:grid-cols-3 gap-4 text-left">
          <Feature icon={<Sparkles className="text-gold" />} title="Complotti su misura">
            Combina Catalizzatori e Notizie per costruire teorie sempre più assurde e credibili.
          </Feature>
          <Feature icon={<Zap className="text-accent2" />} title="Sabotaggi in tempo reale">
            Usa le carte Risonanza per smentire, virare o azzerare le notizie degli avversari.
          </Feature>
          <Feature icon={<Users className="text-accent" />} title="2-5 giocatori, anche IA">
            Gioca in pass-and-play con amici o riempi i posti vuoti con Spin Doctor automatici.
          </Feature>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 text-white/40 text-xs flex items-center justify-center gap-2">
          <Newspaper size={14} /> Demo non ufficiale a scopo dimostrativo — le illustrazioni definitive
          delle carte arriveranno nella versione completa.
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-panel/60 p-5">
      <div className="mb-2">{icon}</div>
      <div className="font-display text-xl text-white flex items-center gap-2">{title}</div>
      <div className="text-white/50 text-sm mt-1 leading-relaxed">{children}</div>
    </div>
  );
}
