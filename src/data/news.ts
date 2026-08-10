import type { NewsDef } from '../types';

export const NEWS: NewsDef[] = [
  // PRINCIPALI
  { id: 'n-p1', name: 'Servizio al TG della Sera', category: 'Principale', startLevel: 'Popolare', flavor: 'La notizia apre l\'edizione principale, con tanto di grafica animata e sondaggio in sovraimpressione.' },
  { id: 'n-p2', name: 'Prima Pagina Nazionale', category: 'Principale', startLevel: 'Virale', flavor: 'Titolo cubitale su tutte le edicole del paese, impossibile non notarlo.' },
  { id: 'n-p3', name: 'Conferenza Stampa Ufficiale', category: 'Principale', startLevel: 'Emergente', flavor: 'Un portavoce risponde alle domande, ma le risposte lasciano più dubbi che certezze.' },
  { id: 'n-p4', name: 'Trend Mondiale sui Social', category: 'Principale', startLevel: 'Popolare', flavor: 'L\'hashtag scala le classifiche in poche ore, rilanciato da migliaia di profili sospettosamente simili.' },
  { id: 'n-p5', name: 'Speciale Prima Serata', category: 'Principale', startLevel: 'Popolare', flavor: 'Un\'intera puntata dedicata al caso, con ospiti in studio e collegamenti internazionali.' },
  { id: 'n-p6', name: 'Editoriale del Direttore', category: 'Principale', startLevel: 'Emergente', flavor: 'Il direttore in persona firma il pezzo, dando peso istituzionale alla teoria.' },
  { id: 'n-p7', name: 'Copertina del Settimanale', category: 'Principale', startLevel: 'Emergente', flavor: 'Un fotomontaggio inquietante campeggia sulla copertina in ogni edicola.' },
  { id: 'n-p8', name: 'Interrogazione Parlamentare', category: 'Principale', startLevel: 'Virale', flavor: 'Un deputato chiede chiarimenti in aula, portando il caso al livello istituzionale più alto.' },
  { id: 'n-p9', name: 'Documentario in Streaming', category: 'Principale', startLevel: 'Popolare', flavor: 'Una piattaforma globale rilascia un documentario "esclusivo" che milioni guarderanno in un weekend.' },
  { id: 'n-p10', name: 'Podcast da Milioni di Ascolti', category: 'Principale', startLevel: 'Emergente', flavor: 'L\'episodio diventa virale prima ancora di essere pubblicato per intero.' },
  { id: 'n-p11', name: 'Allerta Governativa', category: 'Principale', startLevel: 'Virale', flavor: 'Un comunicato ufficiale invita alla calma, ottenendo l\'effetto contrario.' },
  { id: 'n-p12', name: 'Servizio Investigativo Premiato', category: 'Principale', startLevel: 'Popolare', flavor: 'Un\'inchiesta pluripremiata dà credibilità istituzionale a ogni dettaglio, vero o presunto.' },

  // SECONDARIE
  { id: 'n-s1', name: 'Post su un Forum Anonimo', category: 'Secondaria', startLevel: 'Sconosciuta', flavor: 'Pubblicato alle 3 di notte da un utente con zero post precedenti.' },
  { id: 'n-s2', name: 'Storia Instagram Cancellata', category: 'Secondaria', startLevel: 'Sconosciuta', flavor: 'Visibile per sole ventiquattro ore, ma qualcuno ha fatto in tempo a fare uno screenshot.' },
  { id: 'n-s3', name: 'Volantino di Quartiere', category: 'Secondaria', startLevel: 'Sconosciuta', flavor: 'Fotocopiato male e attaccato ai pali della luce nel cuore della notte.' },
  { id: 'n-s4', name: 'Chat di Gruppo Familiare', category: 'Secondaria', startLevel: 'Emergente', flavor: 'Inoltrato da zia in zia fino a raggiungere una credibilità del tutto immeritata.' },
  { id: 'n-s5', name: 'Blog Amatoriale', category: 'Secondaria', startLevel: 'Sconosciuta', flavor: 'Un sito con la grafica ferma al 2003, ma incredibilmente ben indicizzato dai motori di ricerca.' },
  { id: 'n-s6', name: 'Commento Virale sotto un Video', category: 'Secondaria', startLevel: 'Emergente', flavor: 'Migliaia di "mi piace" per un commento privo di qualunque fonte verificabile.' },
  { id: 'n-s7', name: 'Radio Locale di Provincia', category: 'Secondaria', startLevel: 'Sconosciuta', flavor: 'Trasmesso tra un annuncio di mercato e le previsioni del tempo.' },
  { id: 'n-s8', name: 'Meme Condiviso Migliaia di Volte', category: 'Secondaria', startLevel: 'Emergente', flavor: 'Un\'immagine con scritta in Impact font che riassume (male) l\'intera vicenda.' },
  { id: 'n-s9', name: 'Newsletter di Nicchia', category: 'Secondaria', startLevel: 'Sconosciuta', flavor: 'Inviata a duemila iscritti, ma citata con insistenza come "fonte indipendente".' },
  { id: 'n-s10', name: 'Live di uno Streamer Minore', category: 'Secondaria', startLevel: 'Emergente', flavor: 'Commentata in diretta da un canale con poche centinaia di spettatori, ma con una chat molto agitata.' },
  { id: 'n-s11', name: 'Volantinaggio Digitale', category: 'Secondaria', startLevel: 'Sconosciuta', flavor: 'Un banner pop-up comparso su siti di dubbia reputazione.' },
  { id: 'n-s12', name: 'Passaparola al Bar', category: 'Secondaria', startLevel: 'Sconosciuta', flavor: 'Raccontato tra un caffè e l\'altro, e già arricchito di dettagli mai confermati.' },
];
