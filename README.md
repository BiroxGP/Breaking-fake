# Breaking Fake — Demo Web

Demo web giocabile del gioco da tavolo **Breaking Fake — L'Architetto dei Complotti**, pensata per far provare il gioco a potenziali giocatori (pass-and-play, 2-5 giocatori, con possibilità di riempire i posti con IA).

## Stack

React + TypeScript + Vite + Tailwind CSS.

## Sviluppo locale

```bash
npm install
npm run dev
```

L'app parte su `http://localhost:3001`.

## Build

```bash
npm run build
npm run preview
```

## Struttura

- `src/data/` — contenuto delle carte (Teorie, Catalizzatori, Notizie, Risonanze)
- `src/game/` — motore di gioco (setup/draft, regole, punteggio, IA)
- `src/components/` — interfaccia (schermate, carte, tabellone)
- `public/cards/` — illustrazioni delle carte

## Stato

Bozza giocabile: copre l'intero flusso (draft, pesca, azioni, Riciclo Tattico, Finestra di Reazione, chiusura Teorie, punteggio finale). I contenuti delle carte sono in fase di allineamento con le carte ufficiali del gioco.
