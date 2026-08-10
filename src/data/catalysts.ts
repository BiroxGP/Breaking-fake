import type { CatalystDef } from '../types';

const pts = (stars: 1 | 2 | 3) => stars * 2;

export const CATALYSTS: CatalystDef[] = [
  // ARTEFICE
  { id: 'art-1', name: 'Replicanti Sociali', type: 'Artefice', stars: 2, points: pts(2), flavor: 'Individui addestrati a imitare personalità influenti per sostituirle temporaneamente e alterare decisioni chiave.' },
  { id: 'art-2', name: 'Governo Ombra', type: 'Artefice', stars: 3, points: pts(3), flavor: 'Un consesso segreto di burocrati e magnati che tira davvero le fila dietro le quinte del potere ufficiale.' },
  { id: 'art-3', name: 'Rettiliani Infiltrati', type: 'Artefice', stars: 3, points: pts(3), flavor: 'Entità rettiliodi che occupano ruoli di potere senza farsi notare, mimetizzati tra i vertici umani.' },
  { id: 'art-4', name: 'Chip Sottocutaneo', type: 'Artefice', stars: 1, points: pts(1), flavor: 'Un minuscolo dispositivo impiantato di nascosto durante controlli medici di routine.' },

  // LUOGO
  { id: 'luo-1', name: 'Base Segreta Antartica', type: 'Luogo', stars: 3, points: pts(3), flavor: 'Un complesso sotterraneo scavato nel ghiaccio, invisibile ai satelliti civili.' },
  { id: 'luo-2', name: 'Zona d\'Ombra della Luna', type: 'Luogo', stars: 2, points: pts(2), flavor: 'Il lato nascosto del satellite, dove nessuna sonda ufficiale ha mai davvero puntato l\'obiettivo.' },
  { id: 'luo-3', name: 'Bunker sotto il Parlamento', type: 'Luogo', stars: 2, points: pts(2), flavor: 'Una sala riunioni blindata mai comparsa in nessuna planimetria pubblica dell\'edificio.' },
  { id: 'luo-4', name: 'Portale Quantico', type: 'Luogo', stars: 1, points: pts(1), flavor: 'Un varco instabile utilizzato per spostare persone e materiali senza lasciare tracce.' },

  // MEZZO
  { id: 'mez-1', name: 'Spore Bio-reattive', type: 'Mezzo', stars: 2, points: pts(2), flavor: 'Spore che si "svegliano" al contatto con specifici segnali radio e si attivano in massa.' },
  { id: 'mez-2', name: 'Segnale Subliminale 5G', type: 'Mezzo', stars: 2, points: pts(2), flavor: 'Impulsi nascosti nella normale trasmissione dati che modificano l\'umore delle masse.' },
  { id: 'mez-3', name: 'Nanorobot nell\'Acqua Potabile', type: 'Mezzo', stars: 3, points: pts(3), flavor: 'Macchine microscopiche disperse negli acquedotti cittadini per monitorare la popolazione.' },
  { id: 'mez-4', name: 'Ipnosi di Massa', type: 'Mezzo', stars: 1, points: pts(1), flavor: 'Frequenze audio impercettibili trasmesse durante gli spot pubblicitari serali.' },

  // PROVA
  { id: 'pro-1', name: 'Documento Declassificato', type: 'Prova', stars: 2, points: pts(2), flavor: 'Un fascicolo con metà delle righe censurate, trapelato da una fonte "vicina ai fatti".' },
  { id: 'pro-2', name: 'Fotografia Sgranata', type: 'Prova', stars: 1, points: pts(1), flavor: 'Uno scatto sfocato scattato di notte, l\'unica prova visiva mai emersa.' },
  { id: 'pro-3', name: 'Testimone Anonimo Interno', type: 'Prova', stars: 3, points: pts(3), flavor: 'Un dipendente che dice di aver visto tutto, ma che ha chiesto di restare anonimo per "motivi di sicurezza".' },
  { id: 'pro-4', name: 'Registrazione Audio Manomessa', type: 'Prova', stars: 2, points: pts(2), flavor: 'Un file audio in cui si sente distintamente qualcosa, se lo si ascolta al contrario.' },

  // SCOPO
  { id: 'sco-1', name: 'Sperimentazione Sociale', type: 'Scopo', stars: 2, points: pts(2), flavor: 'Testare le reazioni dei cittadini a uno stimolo controllato, per affinare tecniche di controllo su larga scala.' },
  { id: 'sco-2', name: 'Controllo delle Masse', type: 'Scopo', stars: 3, points: pts(3), flavor: 'Rendere la popolazione docile e prevedibile attraverso la gestione capillare dell\'informazione.' },
  { id: 'sco-3', name: 'Distrazione di Massa', type: 'Scopo', stars: 1, points: pts(1), flavor: 'Spostare l\'attenzione pubblica da uno scandalo più grande, ancora tutto da svelare.' },
  { id: 'sco-4', name: 'Profitto Occulto', type: 'Scopo', stars: 2, points: pts(2), flavor: 'Arricchire pochi eletti sfruttando l\'ignoranza collettiva sul reale funzionamento dei mercati.' },
];
