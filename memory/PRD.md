# Unlock the Truth — PRD

## Original problem statement
Real-time multiplayer birthday puzzle for Anisha's 23rd birthday party. 8–12 players join from their devices, get a unique `assignedNumber` via Firebase transactions, solve a unique puzzle, and at the end participate in a synchronized reveal where each player reads their fragment of one heartfelt birthday message in order.

## Stack
- React 19 + Tailwind + shadcn/ui
- Firebase Realtime Database (Asia-Southeast1, project `birthday-nisha`)
- Web Audio API for sounds + procedural ambient music
- Firebase Hosting for deployment

## Theme
- **Maroon + black** modern color palette, glass-morphism cards, gold accent (champagne)
- Fonts: **Bodoni Moda** (display), **Italiana** (uppercase labels), **Manrope** (body), **JetBrains Mono** (code), **Caveat** (handwritten flourish)
- 3D card tilt, floating orbs, wax-seal loader, confetti on reveal, paper-grain overlay

## Implemented (latest iteration — Feb 2026)
### Game core
- Atomic unique `assignedNumber` allocation via Firebase `runTransaction` (max 12 players)
- Login → Lobby → Puzzle → Waiting → Reveal flow
- Live realtime sync across all clients
- 12 distinct creative puzzle UIs, each with unique answer logic
- Dynamic message-fragment splitting for 1–12 players (`getFragmentsForCount(n)`)
- 5-minute auto-start timer with **pause / resume / reset**

### Intro experience
- **Loader screen** (~2s wax-seal pulse) on first visit
- **Invitation card** for "Anisha's 23rd birthday party" with "I'll be there" CTA
- **Join form** with `Step into the room` button
- Session-skip: revisits within same session jump straight to form

### Admin console (`/admin`)
- Login by typing `Admin69` as username OR direct URL (with `localStorage.bp_isAdmin=true`)
- **Admin is NOT counted as a player**
- Live state, player count, completion progress, countdown timer
- Controls: **Start game**, **Revoke** (confirm), **Reset room** (confirm), **Stop timer / Resume timer / Reset timer to 5:00**, **Sign out**
- Browse all 12 puzzles via grid → `/admin/puzzle/N` preview pages
- Regular players in `/lobby` see ONLY timer + player grid (no Start/Revoke buttons)

### Sound & motion
- Web Audio API for procedural click / success / error / reveal sounds
- Ambient drone-pad music with mute/unmute toggle (top-right, persists in localStorage)
- Confetti rain on `/reveal` page
- Float-orb decorations on Login/Invitation, fade-in-up animations across pages

### Bug fixes
- Revoke fan-out (iteration_2): when admin revokes, all already-joined players in `/lobby`, `/puzzle`, `/waiting` now auto-redirect to `/` via `sawSelf` ref pattern
- Hooks-order fix in `Puzzle.jsx`

## Test status
- iteration_1: 12/13 passed (revoke fan-out failure — fixed in iteration_2 attempt)
- iteration_2: 17/18 passed (revoke fan-out still failing — **fixed in this iteration via sawSelf ref**)
- iteration_3: pending (main agent self-verifying)

## Known limitations
- DB rules wide-open (`.read/.write: true`) — testing only. Tighten before public deploy. See `README_FIREBASE.md → Going public`.
- Auto-start at timer-zero only fires from open admin client. If no admin connected at T=0, game won't auto-start (would need server function or any-client transaction race).

## Backlog
- P1: Multi-room support via `?room=<code>`
- P1: Firebase App Check + Auth-gated admin
- P2: Personalized voice notes feature on reveal page (shareable keepsake)
- P2: Stricter DB rules with per-player write scoping
- P2: Confetti audio sting; ambient music swap to royalty-free track via CDN

## Files of note
- `frontend/src/firebase.js` — config, ROOM_ID, MAX_PLAYERS, LOBBY_TIMER_SECONDS
- `frontend/src/data/messageFragments.js` — `getFragmentsForCount(n)` dynamic split
- `frontend/src/pages/Login.jsx` — 3-stage intro + admin gate
- `frontend/src/pages/Admin.jsx` — full console (start/revoke/reset/timer)
- `frontend/src/pages/Lobby.jsx`, `Puzzle.jsx`, `Waiting.jsx` — `sawSelf` revoke detection
- `frontend/src/sounds.js` — Web Audio API sounds + drone music
- `frontend/src/components/EyeOfTruth.jsx` — (legacy, unused in current theme; kept for reference)
- `firebase.json`, `database.rules.json`, `.firebaserc` — deployment config
- `README_FIREBASE.md` — full setup, customization, security, deploy guide with all puzzle answers
