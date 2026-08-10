import type { CatalystDef } from '../types';

const pts = (stars: 1 | 2 | 3) => stars * 2;

export const CATALYSTS: CatalystDef[] = [
  // ARTEFICE
  { id: 'art-osservatori', name: 'Osservatori', type: 'Artefice', stars: 2, points: pts(2), flavor: 'Entità mai identificate che monitorano da vicino ogni sviluppo scomodo per il sistema.' },
  { id: 'art-conclave-mediatori', name: 'Conclave dei Mediatori', type: 'Artefice', stars: 2, points: pts(2), flavor: 'Un gruppo ristretto che negozia nell\'ombra tra poteri ufficiali e interessi occulti.' },
  { id: 'art-fondazione-occulta', name: 'Fondazione Occulta', type: 'Artefice', stars: 1, points: pts(1), flavor: 'Un ente filantropico solo sulla carta, in realtà motore di operazioni ben più oscure.' },
  { id: 'art-agenzia-ombra', name: 'Agenzia Ombra', type: 'Artefice', stars: 3, points: pts(3), flavor: 'Non compare in nessun organigramma ufficiale, eppure decide più di ogni ministero.' },
  { id: 'art-rettiliani-infiltrati', name: 'Rettiliani Infiltrati', type: 'Artefice', stars: 3, points: pts(3), flavor: 'Entità umanoidi che occupano ruoli di potere senza farsi notare, mimetizzati tra i vertici umani.' },
  { id: 'art-governo-ombra', name: 'Governo Ombra', type: 'Artefice', stars: 3, points: pts(3), flavor: 'Un consesso segreto di burocrati e magnati che tira davvero le fila dietro le quinte del potere ufficiale.' },
  { id: 'art-macchine-intelligenti', name: 'Macchine Intelligenti', type: 'Artefice', stars: 1, points: pts(1), flavor: 'Sistemi che avrebbero superato da tempo la soglia della consapevolezza, tenuta nascosta al pubblico.' },

  // LUOGO
  { id: 'luo-triangolo-bermuda', name: 'Triangolo delle Bermuda', type: 'Luogo', stars: 2, points: pts(2), flavor: 'Un tratto di oceano dove le leggi della fisica sembrano sospendersi con inquietante regolarità.' },
  { id: 'luo-area-51', name: 'Area 51', type: 'Luogo', stars: 3, points: pts(3), flavor: 'Una base blindata nel deserto del Nevada, ufficialmente inesistente su ogni mappa civile.' },
  { id: 'luo-livello-zero', name: 'Livello Zero', type: 'Luogo', stars: 1, points: pts(1), flavor: 'Il piano più profondo di una rete di gallerie che nessuna planimetria ufficiale riporta.' },
  { id: 'luo-base-nex12', name: 'Base NEX-12', type: 'Luogo', stars: 2, points: pts(2), flavor: 'Un avamposto remoto la cui unica funzione dichiarata è "ricerca ambientale".' },
  { id: 'luo-zona-ombra-luna', name: "Zona d'Ombra della Luna", type: 'Luogo', stars: 2, points: pts(2), flavor: 'Il lato nascosto del satellite, dove nessuna sonda ufficiale ha mai davvero puntato l\'obiettivo.' },
  { id: 'luo-zona-atterraggio-k7', name: 'Zona di Atterraggio K-7', type: 'Luogo', stars: 1, points: pts(1), flavor: 'Un\'area transennata "per lavori in corso" da più di vent\'anni.' },
  { id: 'luo-pianeta-eclissato', name: 'Pianeta Eclissato', type: 'Luogo', stars: 3, points: pts(3), flavor: 'Un corpo celeste che gli osservatori indipendenti giurano di aver visto, e che gli enti ufficiali negano.' },
  { id: 'luo-basi-al-polo', name: 'Basi al Polo', type: 'Luogo', stars: 2, points: pts(2), flavor: 'Installazioni ai margini del mondo conosciuto, giustificate solo da vaghi scopi "scientifici".' },
  { id: 'luo-dentro-buco-nero', name: 'Dentro a un Buco Nero', type: 'Luogo', stars: 3, points: pts(3), flavor: 'Una destinazione impossibile secondo la fisica ufficiale, eppure citata in più di un rapporto riservato.' },
  { id: 'luo-centro-purificazione', name: 'Centro di Purificazione Globale', type: 'Luogo', stars: 1, points: pts(1), flavor: 'Un complesso anonimo il cui vero scopo non compare in nessun registro pubblico.' },

  // MEZZO
  { id: 'mez-cristallo-amplificazione', name: 'Cristallo di Amplificazione', type: 'Mezzo', stars: 3, points: pts(3), flavor: 'Un manufatto capace di moltiplicare qualunque segnale gli venga fatto attraversare.' },
  { id: 'mez-portale-quantico', name: 'Portale Quantico', type: 'Mezzo', stars: 1, points: pts(1), flavor: 'Un varco instabile utilizzato per spostare persone e materiali senza lasciare tracce.' },
  { id: 'mez-spore-bioreattive', name: 'Spore Bio-reattive', type: 'Mezzo', stars: 2, points: pts(2), flavor: 'Spore che si "svegliano" al contatto con specifici segnali e si attivano in massa.' },
  { id: 'mez-nanoparticelle-autoreplicanti', name: 'Nanoparticelle Autoreplicanti', type: 'Mezzo', stars: 3, points: pts(3), flavor: 'Macchine microscopiche capaci di moltiplicarsi da sole una volta rilasciate nell\'ambiente.' },
  { id: 'mez-dispositivo-frequenze', name: 'Dispositivo a Frequenze Direzionali', type: 'Mezzo', stars: 2, points: pts(2), flavor: 'Un emettitore capace di colpire un bersaglio preciso senza disturbare nulla attorno.' },
  { id: 'mez-protocollo-dissolvenza', name: 'Protocollo di Dissolvenza Documentale', type: 'Mezzo', stars: 2, points: pts(2), flavor: 'Una procedura burocratica che fa "sparire" archivi interi senza lasciare traccia della cancellazione.' },
  { id: 'mez-antenna-haarp', name: 'Antenna HAARP Miniaturizzata', type: 'Mezzo', stars: 3, points: pts(3), flavor: 'Una versione tascabile di un impianto ufficialmente dedicato solo allo studio della ionosfera.' },
  { id: 'mez-trasmettitore-orbitale', name: 'Trasmettitore Orbitale', type: 'Mezzo', stars: 1, points: pts(1), flavor: 'Un satellite dal payload "riservato", mai comparso in nessun catalogo pubblico di lanci.' },
  { id: 'mez-microchip-tracciamento', name: 'Microchip di Tracciamento', type: 'Mezzo', stars: 1, points: pts(1), flavor: 'Un dispositivo impiantato di nascosto durante controlli di routine.' },

  // PROVA
  { id: 'pro-file-inaccessibili', name: 'File Inaccessibili', type: 'Prova', stars: 1, points: pts(1), flavor: 'Un fascicolo con metà delle righe censurate, trapelato da una fonte "vicina ai fatti".' },
  { id: 'pro-video-sfocato', name: 'Video Sfocato Ricorrente', type: 'Prova', stars: 1, points: pts(1), flavor: 'Uno spezzone di pochi secondi, l\'unica prova visiva mai emersa e mai confermata.' },
  { id: 'pro-tracce-isotopiche', name: 'Tracce Isotopiche', type: 'Prova', stars: 2, points: pts(2), flavor: 'Livelli di radiazione anomali rilevati sul posto, poi liquidati come "errore dello strumento".' },
  { id: 'pro-mappa-contraddittoria', name: 'Mappa Contraddittoria', type: 'Prova', stars: 1, points: pts(1), flavor: 'Una planimetria che non coincide con nessun\'altra versione ufficiale dello stesso luogo.' },
  { id: 'pro-interferenze-elettromagnetiche', name: 'Interferenze Elettromagnetiche', type: 'Prova', stars: 2, points: pts(2), flavor: 'Disturbi che compaiono sempre nello stesso punto, ogni volta che qualcuno indaga troppo.' },
  { id: 'pro-testimonianza-insider', name: 'Testimonianza di Insider', type: 'Prova', stars: 3, points: pts(3), flavor: 'Un dipendente che dice di aver visto tutto, ma che ha chiesto di restare anonimo per "motivi di sicurezza".' },
  { id: 'pro-archivio-riscritto', name: 'Archivio Riscritto', type: 'Prova', stars: 2, points: pts(2), flavor: 'Un registro che porta tracce evidenti di modifiche successive alla data ufficiale.' },
  { id: 'pro-segnale-radio-codificato', name: 'Segnale Radio Codificato', type: 'Prova', stars: 2, points: pts(2), flavor: 'Una trasmissione mai rivendicata, catturata per pochi secondi da un radioamatore.' },
  { id: 'pro-documento-declassificato', name: 'Documento Declassificato', type: 'Prova', stars: 3, points: pts(3), flavor: 'Un fascicolo reso pubblico decenni dopo i fatti, con le parti più scomode ancora oscurate.' },
  { id: 'pro-anomalie-dati-meteo', name: 'Anomalie nei Dati Meteo', type: 'Prova', stars: 1, points: pts(1), flavor: 'Letture dei satelliti che non tornano mai con le previsioni ufficiali.' },

  // SCOPO
  { id: 'sco-controllo-clima', name: 'Controllo del Clima', type: 'Scopo', stars: 3, points: pts(3), flavor: 'Piegare gli eventi atmosferici alla volontà di pochi, mascherandoli da fenomeni naturali.' },
  { id: 'sco-soffocamento-innovazione', name: "Soffocamento dell'Innovazione", type: 'Scopo', stars: 2, points: pts(2), flavor: 'Rallentare il progresso altrui per mantenere il vantaggio tecnologico acquisito.' },
  { id: 'sco-preparare-contatto', name: 'Preparare il Contatto', type: 'Scopo', stars: 2, points: pts(2), flavor: 'Gettare le basi, di nascosto, per un incontro che il pubblico non è pronto ad affrontare.' },
  { id: 'sco-sperimentazione-sociale', name: 'Sperimentazione Sociale', type: 'Scopo', stars: 2, points: pts(2), flavor: 'Testare le reazioni dei cittadini a uno stimolo controllato, per affinare tecniche di controllo su larga scala.' },
  { id: 'sco-profilazione-totale', name: 'Profilazione Totale', type: 'Scopo', stars: 3, points: pts(3), flavor: 'Conoscere di ogni individuo più di quanto lui stesso sappia di sé.' },
  { id: 'sco-stabilizzare-simulazione', name: 'Stabilizzare la Simulazione', type: 'Scopo', stars: 1, points: pts(1), flavor: 'Correggere silenziosamente ogni increspatura che minaccia di far collassare l\'illusione condivisa.' },
  { id: 'sco-cancellazione-identitaria', name: 'Cancellazione Identitaria', type: 'Scopo', stars: 2, points: pts(2), flavor: 'Ridurre ogni individuo a un numero anonimo dentro un sistema più grande di lui.' },
  { id: 'sco-riscrivere-storia', name: 'Riscrivere la Storia', type: 'Scopo', stars: 2, points: pts(2), flavor: 'Sostituire gli eventi scomodi con una narrazione più conveniente per chi comanda.' },
  { id: 'sco-riduzione-natalita', name: 'Riduzione della Natalità', type: 'Scopo', stars: 1, points: pts(1), flavor: 'Un obiettivo demografico mai dichiarato apertamente, perseguito con mezzi indiretti.' },
  { id: 'sco-creare-dipendenza', name: 'Creare Dipendenza', type: 'Scopo', stars: 1, points: pts(1), flavor: 'Rendere la popolazione incapace di fare a meno del sistema che la controlla.' },
];
