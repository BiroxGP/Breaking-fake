import { X } from 'lucide-react';

export function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-panel border border-white/10 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white"
        >
          <X size={20} />
        </button>
        <h2 className="font-display text-3xl text-white mb-4">Regolamento in breve</h2>

        <Section title="Obiettivo">
          Chiudi 3 Teorie del Complotto piazzando Catalizzatori e Notizie. La partita finisce non appena un
          giocatore chiude la sua terza Teoria: tutti gli altri hanno un ultimo turno, poi si contano i
          Punti Vittoria (PV).
        </Section>

        <Section title="Turno">
          <ol className="list-decimal list-inside space-y-1">
            <li>Pesca: scegli come dividere 2 carte tra Catalizzatori e Notizie, più 1 Risonanza obbligatoria.</li>
            <li>Fino a 2 Azioni: piazza un Catalizzatore in uno slot libero/sostituibile della tua Teoria, oppure
              collega una Notizia. Farlo su una Teoria avversaria attiva il Riciclo Tattico (peschi 3 carte,
              ne tieni 1).</li>
            <li>Chiudere Teorie è gratis e puoi farlo in ogni momento del tuo turno, anche più volte.</li>
          </ol>
        </Section>

        <Section title="Regola d'Oro">
          Un Catalizzatore già piazzato può sempre essere sostituito, MA non appena a una Teoria viene
          collegata la prima Notizia, i suoi Catalizzatori si bloccano per sempre.
        </Section>

        <Section title="Finestra di Reazione">
          Ogni volta che una Notizia viene collegata a una Teoria, tutti i giocatori (in senso orario dal
          giocatore alla sinistra di chi l'ha piazzata) possono giocare carte Risonanza per alterarla.
        </Section>

        <Section title="Chiudere una Teoria">
          Servono entrambi gli slot Catalizzatore occupati, più un numero minimo di Notizie collegate pari
          alle Stelle di difficoltà meno 1. Dalle 2 stelle in su serve almeno una Notizia Principale (o
          Secondaria diventata Virale).
        </Section>

        <Section title="Punteggio finale">
          Solo le Teorie chiuse contano: valore base + valore Catalizzatori + diffusione Notizie, più i
          bonus Coerenza Testuale (+5), Monopolio (+5 per teoria dello stesso tipo oltre la prima), Scoop
          del Secolo (+3 a chi ha innescato la fine partita) e Clickbaiter Seriale (+5 chiudendo una teoria
          a 3 stelle con sole Notizie Secondarie diventate Virali).
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="text-accent2 font-bold uppercase text-xs tracking-widest mb-1">{title}</h3>
      <div className="text-white/70 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
