# Birthday Puzzle — PRD

## Original problem statement
A real-time multiplayer birthday puzzle web app for 8–12 players. Each player joins from their own device, gets a unique `assignedNumber`, solves a unique puzzle, then participates in a synchronized final reveal where everyone reads their assigned fragment of one heartfelt birthday message in order.

## Stack (per user choice)
- **Frontend**: React 19 + Tailwind + shadcn/ui (Fraunces serif + Caveat handwritten + JetBrains Mono)
- **Backend**: Firebase Realtime Database (per user request — FastAPI/Mongo not used)
- **Hosting**: Firebase Hosting (config files included for `firebase deploy`)

## Implemented (v1 — Feb 2026)
- Atomic unique-number assignment via `runTransaction` on `rooms/birthday-room/counter` (max 12).
- Login page (`/`) with name input.
- Lobby (`/lobby`) with live player grid, 5-min auto-start countdown, "Start now", and **Revoke** with confirmation dialog (resets all players + state).
- Puzzle page (`/puzzle`) routes to one of 12 distinct puzzle UIs by `assignedNumber`:
  1. Password (locked door, dark UI) — answer `090503`
  2. Caesar cipher (warm parchment) — answer `you got the answer haha`
  3. Morse code (signal/dark green) — answer `happy birthday`
  4. Anagram (drag/click letters, rose) — answer `CELEBRATE`
  5. Math equation (emerald) — answer `25`
  6. Emoji rebus (fuchsia/amber) — answer `make a wish`
  7. Mirror text (sky) — answer `now and here`
  8. Soft riddle (amber) — answer contains `memory`
  9. Number sequence (indigo) — answer `64`
  10. Binary ASCII (zinc/cyan, mono) — answer `hi`
  11. Memory match (pink) — solve by matching all pairs
  12. Word search (teal) — find `WISH`
- Waiting page (`/waiting`) shows live progress + each player's status; auto-finishes when all complete.
- Reveal page (`/reveal`) shows ordered fragments of the user's custom 12-piece birthday message with reading instructions.
- Setup notice screen if Firebase env vars are missing.
- `firebase.json`, `database.rules.json`, `.firebaserc` for `firebase deploy`.

## Data model
```
rooms/birthday-room/
  state: "lobby"|"playing"|"finished"
  counter: int
  lobbyStartedAt, gameStartedAt: ms
  players/<playerId>: { username, assignedNumber, isCompleted, finalText }
```

## Known limitations
- End-to-end multiplayer flow cannot be tested in the Emergent preview without the user's Firebase credentials. Once `frontend/.env` is filled in, the app is fully functional.
- DB rules are wide-open for testing (`.read/.write: true`) — should be tightened before any public use.

## Backlog
- P1: Multi-room support (room codes), so multiple parties can play in parallel.
- P1: Host controls (kick a player, manual start without revoke).
- P2: Confetti/audio on reveal page.
- P2: Stricter DB security rules with per-player write scoping.
- P2: Shareable final message card (image export).
