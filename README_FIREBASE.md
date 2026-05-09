# Unlock the Truth — A Birthday Puzzle (Firebase + React)

A real-time multiplayer birthday puzzle for **1–12 friends**. Each player gets a unique number, solves a unique puzzle, and at the end everyone sees their fragment of one heartfelt birthday message read in order — together.

**Live tech**: React 19 · Firebase Realtime Database · Tailwind · shadcn/ui · Web Audio API

---

## ✦ Quick start

1. **Add Firebase web config** to `frontend/.env` (see [Firebase setup](#-firebase-setup)).
2. Restart the frontend (`sudo supervisorctl restart frontend` in the dev pod, or `yarn start` locally).
3. Open the preview URL — first visit shows the loader → invitation → join screen.

---

## ✦ Game flow

```
/  (Login)
   ├─ Loader (≈2s)         ← first visit only
   ├─ Invitation card      ← "I'll be there" → form
   └─ Join form            ← enter name → /lobby
                              (or enter `Admin69` → /admin)

/lobby           live player grid + 5-min countdown
/puzzle          your unique puzzle (routed by assignedNumber)
/waiting         live progress while everyone finishes
/reveal          synchronized fragment reveal, in order
/admin           admin console (no player slot)
/admin/puzzle/N  preview any puzzle UI (1..12)
```

---

## ✦ All 12 puzzles — questions & answers

| # | Title | Type | Question shown to player | **Answer** | Hint |
|---|---|---|---|---|---|
| 1 | The Locked Door | Password | "Please insert the password" | `090503` | "the beginning" (a birthdate) |
| 2 | Three Steps Back | Caesar cipher | `brx jrw wkh dqvzhu kdkd` | `you got the answer haha` | shift back 3 letters |
| 3 | Dots & Lines | Morse code | `.... .- .--. .--. -.-- / -... .. .-. - .... -.. .- -.--` | `happy birthday` | dots and dashes |
| 4 | Tangled Letters | Anagram | Letters: `T L B E E A R E C` | `CELEBRATE` | rearrange |
| 5 | The Quiet Equation | Math | `(12 × 3) − 11 = ?` | `25` | basic order of ops |
| 6 | Emoji Whispers | Rebus | 🎂 + 🕯️ + 🎈 = ? | `make a wish` | three words |
| 7 | Mirror, Mirror | Reverse text | `ereh dna woN` (mirrored) | `now and here` | read backwards |
| 8 | A Soft Riddle | Riddle | "I am old the moment I am made, yet I grow softer every time you visit me. What am I?" | `memory` (any answer containing the word `memory` passes) | photo albums |
| 9 | Pattern of Years | Number sequence | `2, 4, 8, 16, 32, ?` | `64` | doubling |
| 10 | Zeros & Ones | Binary ASCII | `01001000 01001001` | `hi` | 8-bit ASCII |
| 11 | Memory Lane | Memory match | 12 cards, 6 pairs of emojis | match all pairs to win | — |
| 12 | Hidden Word | Word search | 6×6 grid; word hidden at row 3, cols 2–5 | tap cells **W I S H** | "the word a candle hears" |

> **Answer comparison rules**: trimmed + lowercased except #5/#9 (numeric). Puzzle #8 uses `.includes("memory")` so e.g. `"a memory"` also passes.

---

## ✦ The birthday message (12 sentence fragments)

The full message is split into **N balanced fragments** based on the number of joined players (1–12). Sentences in order:

1. Happy birthday.
2. I once read that love is not measured by how long we stay together,
3. but by how deeply we grow through everything we face together.
4. And when I look back at all the laughter, the silence,
5. the difficult days, and the small moments in between,
6. I realize how much those moments became some of the most meaningful parts of my life.
7. Thank you for being part of my days in ways words could never fully explain.
8. For every joy you brought, every comfort you gave,
9. and every memory we created together.
10. I hope life continues to be gentle with you,
11. and I hope you never forget how appreciated, cherished, and deeply loved you are.
12. Happy birthday.

**Dynamic split logic** (`/app/frontend/src/data/messageFragments.js → getFragmentsForCount(n)`):
- `n === 1` → entire message becomes one fragment
- `n < 12` → consecutive sentences grouped into `n` near-equal chunks (e.g. `n=5 → [3,3,2,2,2]`)
- `n === 12` → each sentence is its own fragment
- `n > 12` → impossible (counter capped at 12); if you raise the cap, extras repeat the final sentence

---

## ✦ Admin console (`/admin`)

**Login**: type `Admin69` as the username on the join screen, OR navigate directly to `/admin`.
- Admin is **not counted as a player** — no number assigned, no Firebase counter increment.
- Admin session is local: `localStorage.bp_isAdmin = "true"`.

**Admin can**:
- See live state, player count, completion progress, countdown
- **Start the game** (computes fragments, writes them per-player, flips state to `playing`)
- **Revoke** with confirmation (wipes all players, resets timer & state)
- **Reset room** with confirmation (same wipe, no "revoked" banner)
- **Stop / Resume timer** (freezes the 5-min countdown for everyone)
- **Reset timer to 5:00**
- **Sign out**
- Browse all 12 puzzles via `/admin/puzzle/1..12` to preview each UI live

Players in the lobby see only the timer + their seat — **no Start/Revoke buttons**.

---

## ✦ What you can customize (and where)

| What | File | Notes |
|---|---|---|
| Birthday message text | `src/data/messageFragments.js → SENTENCES` | Add/remove sentences; up to 12 work cleanly. |
| Max players | `src/firebase.js → MAX_PLAYERS` | Default `12`. Bumping above 12 needs more sentences too. |
| Lobby auto-start timer | `src/firebase.js → LOBBY_TIMER_SECONDS` | Default `300` (5 min). |
| Admin password | `src/pages/Login.jsx → ADMIN_PASSWORD` | Default `"Admin69"`. **Change before deploying publicly.** |
| Puzzle answers | each `src/puzzles/Puzzle*.jsx` | Look for `ANSWER` const at top. |
| Puzzle titles | `src/data/puzzles.js → PUZZLE_META` | Titles + subtitles shown above each puzzle. |
| Theme colors | `src/index.css → :root` | HSL CSS vars. Plus `bg-stage`, `btn-maroon`, etc. |
| Fonts | `src/index.css` `@import` and `body { font-family }` | Bodoni Moda / Italiana / Manrope / JetBrains Mono / Caveat. |
| Invitation copy | `src/pages/Login.jsx → Invitation()` | Edit name, age, body text. |
| App title | `public/index.html → <title>` and Login `<h1>` | Currently "Unlock the Truth". |
| Sounds | `src/sounds.js` | Pure Web Audio — change frequencies/envelopes. |
| Music toggle position | `src/components/MusicToggle.jsx` | Currently top-right fixed. |

---

## ✦ Firebase setup

1. https://console.firebase.google.com → **Create project** (e.g. `birthday-nisha`).
2. **Build → Realtime Database → Create Database** (pick region, e.g. `asia-southeast1`).
3. **Project settings → Your apps → Web (`</>`) → Register app** → copy config.
4. Paste each value into `frontend/.env`:
   ```
   REACT_APP_FIREBASE_API_KEY=...
   REACT_APP_FIREBASE_AUTH_DOMAIN=...
   REACT_APP_FIREBASE_DATABASE_URL=https://<project>-default-rtdb.<region>.firebasedatabase.app
   REACT_APP_FIREBASE_PROJECT_ID=...
   REACT_APP_FIREBASE_STORAGE_BUCKET=...
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
   REACT_APP_FIREBASE_APP_ID=...
   ```
5. Restart frontend.

---

## ✦ Deploy to Firebase Hosting

You have **two paths**. Both work — **Option B is what I used to deploy your live site at https://unlock-the-truth.web.app**.

### Option A — Deploy from your local machine

1. Install Node 18+ and the CLI:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
2. Clone or download `/app` to your computer.
3. Make sure `frontend/.env` has your Firebase config (same values as in this pod).
4. Build and deploy:
   ```bash
   cd frontend && yarn install && yarn build && cd ..
   firebase deploy --only hosting:unlock-the-truth --project birthday-nisha
   ```

### Option B — Deploy from this Emergent pod (simple, repeatable)

This is **exactly the recipe I used**. Re-run it any time you change code.

**One-time setup** (already done — you can skip on subsequent deploys):
- `firebase.json` has `"hosting": { "target": "unlock-the-truth", "public": "frontend/build", ... }`
- `.firebaserc` maps the target: `"targets": { "birthday-nisha": { "hosting": { "unlock-the-truth": ["unlock-the-truth"] } } }`
- `firebase-tools` is already installed in this pod (`npm install -g firebase-tools` if not).

**Get a fresh CI token** (≈30 seconds, on YOUR computer — not in the pod):
```bash
npx firebase-tools login:ci
```
This opens a browser, you log in once, and prints a long token starting with `1//`. Copy it.

**Deploy** (in this pod, replace `<YOUR_TOKEN>`):
```bash
cd /app/frontend && yarn build && cd /app && \
  FIREBASE_TOKEN="<YOUR_TOKEN>" firebase deploy \
    --only hosting:unlock-the-truth \
    --project birthday-nisha \
    --non-interactive
```

You'll see:
```
✔  hosting[unlock-the-truth]: release complete
✔  Deploy complete!
Hosting URL: https://unlock-the-truth.web.app
```

**🔒 After deploying, revoke the token** (treat it like a password):
```bash
firebase logout --token "<YOUR_TOKEN>"
```
Generate a new one each time you deploy.

### Deploying database rules too

If you change `database.rules.json`, run:
```bash
FIREBASE_TOKEN="<YOUR_TOKEN>" firebase deploy --only database --project birthday-nisha --non-interactive
```

Or deploy everything at once:
```bash
FIREBASE_TOKEN="<YOUR_TOKEN>" firebase deploy --project birthday-nisha --non-interactive
```

---

## ✦ Going public — security checklist

The current setup uses **wide-open database rules** (`.read: true, .write: true`) so the team can play without sign-in. Before sharing the URL outside trusted friends:

| Risk | Why it matters | Fix |
|---|---|---|
| 🔴 **Open DB rules** | Anyone on the internet can read/write your DB. They can wipe players, fake completions, write arbitrary data. | Tighten `database.rules.json` — see below. |
| 🟡 **Admin password in plain JS** | `Admin69` is visible in any browser's source. Anyone who reads the JS can become admin. | Move admin gate to a Firebase Cloud Function with a **server-side check**, OR use Firebase Auth (e.g. magic-link / Google login limited to host's email). |
| 🟡 **API key exposed** | Firebase web API keys are *meant* to be public, but combined with permissive rules they let anyone hit your DB. | This is normal as long as DB rules + Auth are correct. |
| 🟡 **Counter never resets** | If max-players is reached, no one new can join until admin revokes. | Already handled by the Reset / Revoke buttons. Make sure rules let admin write `counter`/`players`. |
| 🟢 **No abuse rate-limiting** | Spam joins could fill the room. | Add Firebase **App Check** + reCAPTCHA v3, or limit by IP via Cloud Functions. |
| 🟢 **No HTTPS** | Firebase Hosting is HTTPS by default — already fine. | — |

### Recommended `database.rules.json` (tighter)

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        "counter":     { ".write": true },
        "state":       { ".write": true },
        "lobbyStartedAt":  { ".write": true },
        "gameStartedAt":   { ".write": true },
        "timerPaused":     { ".write": true },
        "frozenRemaining": { ".write": true },
        "players": {
          ".write": true,
          "$playerId": {
            ".validate": "newData.hasChildren(['username','assignedNumber']) && newData.child('username').isString() && newData.child('username').val().length <= 32 && newData.child('assignedNumber').isNumber()"
          }
        }
      }
    }
  }
}
```

For the strongest protection: gate everything behind **Firebase Auth** + custom claims (admin claim for the host's account). That's an evening of work — happy to add if you want.

### Other hardening (optional, recommended for "really public" rooms)

1. **App Check + reCAPTCHA v3** — blocks bots before they even hit your DB.
2. **Move admin password server-side** — Cloud Function `claimAdmin` that takes a secret, verifies, and sets a custom claim.
3. **Multi-room support** — append `?room=<code>` so different parties don't collide on the same `birthday-room` key.
4. **Cloudflare Turnstile** in front of join form.
5. **Auto-delete rooms older than 24h** (Firebase Cloud Scheduler).

---

## ✦ Data model (Realtime Database)

```
rooms/birthday-room/
  state             "lobby" | "playing" | "finished"
  counter           int (next assignedNumber to assign, max 12)
  lobbyStartedAt    ms epoch
  gameStartedAt     ms epoch | null
  timerPaused       boolean
  frozenRemaining   int (seconds, used while paused)
  revokedAt         ms epoch (set on revoke for audit)
  players/
    <playerId>/
      playerId       string
      username       string
      assignedNumber 1..12
      isCompleted    boolean
      finalText      string  (their fragment, written on solve)
      assignedFragment string (set by admin on Start)
      joinedAt       ms epoch
      completedAt    ms epoch | undefined
```

---

## ✦ Local dev cheatsheet

```bash
# Reset Firebase room from the command line:
curl -X DELETE 'https://<project>-default-rtdb.<region>.firebasedatabase.app/rooms/birthday-room.json'

# Restart frontend after .env or package change:
sudo supervisorctl restart frontend

# View frontend logs:
tail -n 50 /var/log/supervisor/frontend.*.log

# Build production bundle:
cd /app/frontend && yarn build
```

---

## ✦ Credits

Built on Emergent · React 19 · Firebase Realtime Database · Tailwind · shadcn/ui · Bodoni Moda + Italiana + Manrope + JetBrains Mono.

Have a beautiful birthday, Anisha. 🥂
