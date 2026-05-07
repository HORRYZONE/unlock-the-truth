# Birthday Puzzle — Firebase Setup & Deploy

A real-time multiplayer birthday puzzle for 8–12 players. Built with React + Firebase Realtime Database.

## 1. Configure Firebase

1. Go to https://console.firebase.google.com/ and create a new project.
2. **Build → Realtime Database → Create Database** (start in test mode for now).
3. **Project settings → Your apps → Web (</>) → Register app** → copy the config.
4. Open `frontend/.env` and fill in your config values:
   ```
   REACT_APP_FIREBASE_API_KEY=...
   REACT_APP_FIREBASE_AUTH_DOMAIN=...
   REACT_APP_FIREBASE_DATABASE_URL=https://<your-project>.firebaseio.com
   REACT_APP_FIREBASE_PROJECT_ID=...
   REACT_APP_FIREBASE_STORAGE_BUCKET=...
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
   REACT_APP_FIREBASE_APP_ID=...
   ```
5. Restart the frontend (`sudo supervisorctl restart frontend`).

## 2. Run locally
The app auto-runs at the preview URL on this Emergent environment once the env vars are set.

## 3. Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
# Update .firebaserc with your project id, then:
cd /app/frontend && yarn build && cd /app
firebase deploy
```

Database rules live at `database.rules.json`. Hosting config at `firebase.json`.

## Game flow
- `/` → Login (enter name, gets unique `assignedNumber` via Firebase transaction).
- `/lobby` → 5-min auto-start timer + revoke (with confirmation).
- `/puzzle` → Each assignedNumber routes to a unique puzzle UI (12 total).
- `/waiting` → Live progress while others finish.
- `/reveal` → Synchronized reveal of every fragment in order.

## Data model (Realtime Database)
```
rooms/birthday-room/
  state: "lobby" | "playing" | "finished"
  counter: <int>
  lobbyStartedAt: <ms>
  gameStartedAt: <ms>
  players/<playerId>:
    username
    assignedNumber
    isCompleted
    finalText
```
