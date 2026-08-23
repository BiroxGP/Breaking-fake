import type { CatalystDef } from '../types';

const img = (slug: string) => `/cards/catalizzatori/${slug}.png`;

export const CATALYSTS: CatalystDef[] = [
  // ARTEFICE
  { id: 'art-governo-ombra', name: 'Governo Ombra', type: 'Artefice', stars: 1, points: 2, gender: 'm', flavor: 'Un organo parallelo non eletto che coordina decisioni globali.', image: img('art-governo-ombra') },
  { id: 'art-cartello-bigfood', name: 'Cartello Bigfood', type: 'Artefice', stars: 1, points: 2, gender: 'm', flavor: 'Industrie alimentari che spostano abitudini e filiere a proprio vantaggio.', image: img('art-cartello-bigfood') },
  { id: 'art-consorzio-farmaceutico', name: 'Consorzio Farmaceutico', type: 'Artefice', stars: 1, points: 2, gender: 'm', flavor: 'Alleanza di aziende che orienta ricerca e comunicazione sanitaria.', image: img('art-consorzio-farmaceutico') },
  { id: 'art-rettiliani-infiltrati', name: 'Rettiliani Infiltrati', type: 'Artefice', stars: 2, points: 4, gender: 'm', plural: true, flavor: 'Entità rettiloidi che occupano ruoli di potere senza farsi notare.', image: img('art-rettiliani-infiltrati') },
  { id: 'art-macchine-intelligenti', name: 'Macchine Intelligenti', type: 'Artefice', stars: 2, points: 4, gender: 'f', plural: true, flavor: 'Sistemi autonomi che ottimizzano il controllo senza supervisione umana.', image: img('art-macchine-intelligenti') },
  { id: 'art-custodi-sottosuolo', name: 'Custodi del Sottosuolo', type: 'Artefice', stars: 2, points: 4, gender: 'm', plural: true, flavor: 'Setta che protegge accessi a strutture sotterranee.', image: img('art-custodi-sottosuolo') },
  { id: 'art-osservatori', name: 'Osservatori', type: 'Artefice', stars: 1, points: 2, gender: 'm', plural: true, flavor: 'Presenze esterne che monitorano e influenzano eventi chiave.', image: img('art-osservatori') },
  { id: 'art-agenzia-ombra', name: 'Agenzia Ombra', type: 'Artefice', stars: 1, points: 2, gender: 'f', flavor: 'Unità speciale che insabbia prove e neutralizza testimoni.', image: img('art-agenzia-ombra') },
  { id: 'art-fondazione-occulta', name: 'Fondazione Occulta', type: 'Artefice', stars: 2, points: 4, gender: 'f', flavor: 'Ente di facciata che muove fondi e informazioni.', image: img('art-fondazione-occulta') },
  { id: 'art-conclave-mediatori', name: 'Conclave dei Mediatori', type: 'Artefice', stars: 2, points: 4, gender: 'm', flavor: 'Un network di negoziatori che interviene nelle crisi globali per orientare accordi, tregue e trattative verso esiti prestabiliti, mantenendo sempre un profilo neutrale e insospettabile.', image: img('art-conclave-mediatori') },
  { id: 'art-replicanti-sociali', name: 'Replicanti Sociali', type: 'Artefice', stars: 2, points: 4, gender: 'm', plural: true, flavor: 'Individui addestrati a imitare personalità influenti per sostituirle temporaneamente e alterare decisioni chiave.', image: img('art-replicanti-sociali') },
  { id: 'art-ordine-architetti', name: 'Ordine degli Architetti', type: 'Artefice', stars: 3, points: 6, gender: 'm', flavor: 'Rete di pianificatori che costruisce narrative e mappe ufficiali.', image: img('art-ordine-architetti') },

  // SCOPO
  { id: 'sco-creare-dipendenza', name: 'Creare Dipendenza', type: 'Scopo', stars: 1, points: 2, gender: 'f', flavor: 'Spingere la popolazione verso un servizio/prodotto indispensabile.', image: img('sco-creare-dipendenza') },
  { id: 'sco-sperimentazione-sociale', name: 'Sperimentazione Sociale', type: 'Scopo', stars: 1, points: 2, gender: 'f', flavor: 'Testare obbedienza e reazioni collettive a restrizioni/paure.', image: img('sco-sperimentazione-sociale') },
  { id: 'sco-copertura-risorsa', name: 'Copertura di una Risorsa', type: 'Scopo', stars: 2, points: 4, gender: 'f', flavor: 'Nascondere una scoperta per mantenerne il monopolio.', image: img('sco-copertura-risorsa') },
  { id: 'sco-preparare-contatto', name: 'Preparare il Contatto', type: 'Scopo', stars: 2, points: 4, gender: 'm', flavor: "Abituare le masse all'idea di presenze non terrestri.", image: img('sco-preparare-contatto') },
  { id: 'sco-ridistribuire-mercati', name: 'Ridistribuire Mercati', type: 'Scopo', stars: 1, points: 2, gender: 'm', plural: true, flavor: 'Provocare crisi mirate per spostare ricchezza e potere.', image: img('sco-ridistribuire-mercati') },
  { id: 'sco-riscrivere-storia', name: 'Riscrivere la Storia', type: 'Scopo', stars: 3, points: 6, gender: 'f', flavor: 'Rimuovere eventi scomodi per legittimare nuovi assetti.', image: img('sco-riscrivere-storia') },
  { id: 'sco-profilazione-totale-1', name: 'Profilazione Totale', type: 'Scopo', stars: 1, points: 2, gender: 'f', flavor: 'Raccogliere dati per prevedere e indirizzare scelte individuali.', image: img('sco-profilazione-totale-1') },
  { id: 'sco-profilazione-totale-2', name: 'Profilazione Totale', type: 'Scopo', stars: 1, points: 2, gender: 'f', flavor: 'Raccogliere dati per prevedere e indirizzare scelte individuali.', image: img('sco-profilazione-totale-2') },
  { id: 'sco-riduzione-natalita', name: 'Riduzione della Natalità', type: 'Scopo', stars: 1, points: 2, gender: 'f', flavor: 'Indurre cali demografici tramite interventi indiretti.', image: img('sco-riduzione-natalita') },
  { id: 'sco-stabilizzare-simulazione', name: 'Stabilizzare la Simulazione', type: 'Scopo', stars: 2, points: 4, gender: 'f', flavor: 'Evitare "glitch" mantenendo il sistema entro parametri sicuri.', image: img('sco-stabilizzare-simulazione') },
  { id: 'sco-soffocamento-innovazione', name: "Soffocamento dell'Innovazione", type: 'Scopo', stars: 2, points: 4, gender: 'm', flavor: 'Ostacolare scoperte emergenti per mantenere tecnologie obsolete ma controllabili.', image: img('sco-soffocamento-innovazione') },
  { id: 'sco-cancellazione-identitaria', name: 'Cancellazione Identitaria', type: 'Scopo', stars: 1, points: 2, gender: 'f', flavor: 'Un sistema che uniforma le culture per renderle più controllabili.', image: img('sco-cancellazione-identitaria') },

  // LUOGO
  { id: 'luo-zona-ombra-luna', name: "Zona d'Ombra della Luna", type: 'Luogo', stars: 2, points: 4, gender: 'f', flavor: 'Area remota e inaccessibile, costantemente nascosta alla vista terrestre.', image: img('luo-zona-ombra-luna') },
  { id: 'luo-centro-purificazione', name: 'Centro di Purificazione Globale', type: 'Luogo', stars: 1, points: 2, gender: 'm', flavor: 'Impianto che "ripulisce" aria/acqua con protocolli segreti.', image: img('luo-centro-purificazione') },
  { id: 'luo-zona-atterraggio-k7', name: 'Zona di Atterraggio K-7', type: 'Luogo', stars: 2, points: 4, gender: 'f', flavor: 'Pista remota per arrivi notturni e scarichi rapidi.', image: img('luo-zona-atterraggio-k7') },
  { id: 'luo-pianeta-eclissato', name: 'Pianeta Eclissato', type: 'Luogo', stars: 1, points: 2, gender: 'm', flavor: 'Corpo celeste fuori dalle mappe ufficiali, visibile solo a finestre.', image: img('luo-pianeta-eclissato') },
  { id: 'luo-citta-ipogea', name: 'Città Ipogea', type: 'Luogo', stars: 2, points: 4, gender: 'f', flavor: 'Metropoli sotterranea con accessi nascosti.', image: img('luo-citta-ipogea') },
  { id: 'luo-base-nex12', name: 'Base NEX-12', type: 'Luogo', stars: 2, points: 4, gender: 'f', flavor: 'Installazione classificata con laboratori e hangar schermati.', image: img('luo-base-nex12') },
  { id: 'luo-triangolo-bermuda', name: 'Triangolo delle Bermuda', type: 'Luogo', stars: 1, points: 2, gender: 'm', flavor: 'Zona marina associata a sparizioni e anomalie di navigazione.', image: img('luo-triangolo-bermuda') },
  { id: 'luo-camera-archiviazione-temporale', name: 'Camera di Archiviazione Temporale', type: 'Luogo', stars: 1, points: 2, gender: 'f', flavor: 'Locale dove il tempo scorrerebbe in modo diverso.', image: img('luo-camera-archiviazione-temporale') },
  { id: 'luo-area-51', name: 'Area 51', type: 'Luogo', stars: 1, points: 2, gender: 'f', flavor: 'Base simbolo di segreti militari e recuperi non convenzionali.', image: img('luo-area-51') },
  { id: 'luo-dentro-buco-nero', name: 'Dentro un Buco Nero', type: 'Luogo', stars: 3, points: 6, gender: 'm', flavor: 'Origine/luogo impossibile che spiegherebbe comunicazioni o oggetti.', image: img('luo-dentro-buco-nero') },
  { id: 'luo-basi-al-polo', name: 'Basi al Polo', type: 'Luogo', stars: 1, points: 2, gender: 'f', plural: true, flavor: 'Strutture oltre certe latitudini.', image: img('luo-basi-al-polo') },
  { id: 'luo-livello-zero', name: 'Il Livello Zero', type: 'Luogo', stars: 1, points: 2, gender: 'm', flavor: 'Alcuni edifici governativi avrebbero un piano inferiore non registrato. Le scale che vi conducono sono chiuse da porte senza serratura visibile.', image: img('luo-livello-zero') },

  // MEZZO
  { id: 'mez-protocollo-dissolvenza', name: 'Protocollo di Dissolvenza Documentale', type: 'Mezzo', stars: 3, points: 6, gender: 'm', flavor: 'I documenti che non possono essere modificati vengono resi gradualmente inaccessibili, corrotti o non verificabili.', image: img('mez-protocollo-dissolvenza') },
  { id: 'mez-spore-bioreattive', name: 'Spore Bio-Reattive', type: 'Mezzo', stars: 2, points: 4, gender: 'f', plural: true, flavor: 'Spore che reagiscono a stimoli e si attivano in massa.', image: img('mez-spore-bioreattive') },
  { id: 'mez-antenna-haarp', name: 'Antenna HAARP Miniaturizzata', type: 'Mezzo', stars: 1, points: 2, gender: 'f', flavor: 'Modulo portatile che genera micro-distorsioni elettromagnetiche locali.', image: img('mez-antenna-haarp') },
  { id: 'mez-cristallo-amplificazione', name: 'Cristallo di Amplificazione', type: 'Mezzo', stars: 1, points: 2, gender: 'm', flavor: 'Minerale che potenzia segnali o energia in modo anomalo.', image: img('mez-cristallo-amplificazione') },
  { id: 'mez-drone-aviariforme', name: 'Drone Aviariforme', type: 'Mezzo', stars: 1, points: 2, gender: 'm', flavor: 'Droni camuffati da uccelli usati per sorveglianza ravvicinata.', image: img('mez-drone-aviariforme') },
  { id: 'mez-nanoparticelle-autoreplicanti', name: 'Nanoparticelle Autoreplicanti', type: 'Mezzo', stars: 2, points: 4, gender: 'f', plural: true, flavor: 'Micro-unità che si moltiplicano e modificano materiali o organismi.', image: img('mez-nanoparticelle-autoreplicanti') },
  { id: 'mez-portale-quantico', name: 'Portale Quantico', type: 'Mezzo', stars: 1, points: 2, gender: 'm', flavor: 'Varco che permette scambi di materia/informazioni.', image: img('mez-portale-quantico') },
  { id: 'mez-acqua-modificata', name: 'Acqua Modificata', type: 'Mezzo', stars: 1, points: 2, gender: 'f', flavor: 'Tracce invisibili nell\'acqua che influenzano chimica corporea.', image: img('mez-acqua-modificata') },
  { id: 'mez-onde-alta-frequenza', name: 'Onde ad Alta Frequenza', type: 'Mezzo', stars: 1, points: 2, gender: 'f', plural: true, flavor: 'Campi che alterano percezioni, sonno o comportamento.', image: img('mez-onde-alta-frequenza') },
  { id: 'mez-dispositivo-frequenze', name: 'Dispositivo a Frequenze Direzionali', type: 'Mezzo', stars: 2, points: 4, gender: 'm', flavor: 'Emettitore che colpisce aree specifiche senza dispersione.', image: img('mez-dispositivo-frequenze') },
  { id: 'mez-microchip-tracciamento', name: 'Microchip di Tracciamento', type: 'Mezzo', stars: 1, points: 2, gender: 'm', flavor: 'Componenti miniaturizzati per localizzazione e identificazione.', image: img('mez-microchip-tracciamento') },
  { id: 'mez-trasmettitore-orbitale', name: 'Trasmettitore Orbitale', type: 'Mezzo', stars: 2, points: 4, gender: 'm', flavor: 'Sorgente in orbita che invia segnali mirati su larga scala.', image: img('mez-trasmettitore-orbitale') },

  // PROVA
  { id: 'pro-segnale-radio-codificato', name: 'Segnale Radio Codificato', type: 'Prova', stars: 2, points: 4, gender: 'm', flavor: 'Trasmissioni brevi con pattern ripetuti, captate da amatori.', image: img('pro-segnale-radio-codificato') },
  { id: 'pro-file-inaccessibile', name: 'File Inaccessibile', type: 'Prova', stars: 1, points: 2, gender: 'm', flavor: 'Un documento digitale che esiste, ma non può essere aperto da nessun sistema operativo: ogni tentativo genera un errore diverso.', image: img('pro-file-inaccessibile') },
  { id: 'pro-archivio-riscritto', name: 'Archivio Riscritto', type: 'Prova', stars: 2, points: 4, gender: 'm', flavor: 'Versioni diverse dello stesso documento in archivi differenti.', image: img('pro-archivio-riscritto') },
  { id: 'pro-glitch-realta', name: 'Glitch nella Realtà', type: 'Prova', stars: 1, points: 2, gender: 'm', flavor: 'Eventi "impossibili" che si ripetono come errori di sistema.', image: img('pro-glitch-realta') },
  { id: 'pro-documento-declassificato', name: 'Documento Declassificato', type: 'Prova', stars: 1, points: 2, gender: 'm', flavor: 'Un file ufficiale parzialmente oscurato che suggerisce molto.', image: img('pro-documento-declassificato') },
  { id: 'pro-tracce-isotopiche', name: 'Tracce Isotopiche', type: 'Prova', stars: 2, points: 4, gender: 'f', plural: true, flavor: 'Residui chimici rari trovati dove non dovrebbero esserci.', image: img('pro-tracce-isotopiche') },
  { id: 'pro-video-sfocato', name: 'Video Sfocato Ricorrente', type: 'Prova', stars: 1, points: 2, gender: 'm', flavor: 'Lo stesso frammento compare in più luoghi, sempre tagliato.', image: img('pro-video-sfocato') },
  { id: 'pro-mappa-contraddittoria', name: 'Mappa Contraddittoria', type: 'Prova', stars: 2, points: 4, gender: 'f', flavor: 'Carte e satelliti che non coincidono sulla stessa area.', image: img('pro-mappa-contraddittoria') },
  { id: 'pro-interferenze-elettromagnetiche', name: 'Interferenze Elettromagnetiche', type: 'Prova', stars: 1, points: 2, gender: 'f', plural: true, flavor: 'Blackout e disturbi ripetuti in coincidenza con eventi chiave.', image: img('pro-interferenze-elettromagnetiche') },
  { id: 'pro-testimonianza-insider', name: 'Testimonianza di Insider', type: 'Prova', stars: 1, points: 2, gender: 'f', flavor: 'Ex addetto che racconta procedure fuori protocollo.', image: img('pro-testimonianza-insider') },
  { id: 'pro-anomalia-dati-meteo', name: 'Anomalia nei Dati Meteo', type: 'Prova', stars: 1, points: 2, gender: 'f', flavor: 'Serie storiche con buchi, picchi e correzioni sospette.', image: img('pro-anomalia-dati-meteo') },
  { id: 'pro-frammento-sonoro-disturbato', name: 'Frammento Sonoro Disturbato', type: 'Prova', stars: 3, points: 6, gender: 'm', flavor: 'Voci e rumori di fondo indicano un messaggio nascosto o un evento non registrato ufficialmente.', image: img('pro-frammento-sonoro-disturbato') },
];
