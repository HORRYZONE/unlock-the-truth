import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue, set, update, get } from "firebase/database";
import { database, ROOM_ID, LOBBY_TIMER_SECONDS } from "@/firebase";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Users, Clock, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const PLAYER_KEY = "bp_playerId";

export default function Lobby() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState({});
  const [state, setState] = useState("lobby");
  const [lobbyStartedAt, setLobbyStartedAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const playerId = localStorage.getItem(PLAYER_KEY);
  const me = playerId ? players[playerId] : null;

  useEffect(() => {
    if (!playerId) { navigate("/"); return; }
    const unsubPlayers = onValue(ref(database, `rooms/${ROOM_ID}/players`), (s) => {
      setPlayers(s.val() || {});
    });
    const unsubState = onValue(ref(database, `rooms/${ROOM_ID}/state`), (s) => {
      const v = s.val();
      setState(v || "lobby");
      if (v === "playing") navigate("/puzzle");
      if (v === "finished") navigate("/reveal");
    });
    const unsubStarted = onValue(ref(database, `rooms/${ROOM_ID}/lobbyStartedAt`), (s) => {
      setLobbyStartedAt(s.val());
    });
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => { unsubPlayers(); unsubState(); unsubStarted(); clearInterval(t); };
  }, [playerId, navigate]);

  const playersList = Object.values(players).sort((a, b) => a.assignedNumber - b.assignedNumber);
  const remaining = lobbyStartedAt
    ? Math.max(0, LOBBY_TIMER_SECONDS - Math.floor((now - lobbyStartedAt) / 1000))
    : LOBBY_TIMER_SECONDS;
  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");

  // Auto-start when timer hits 0 (any client can fire; idempotent set is fine)
  useEffect(() => {
    if (remaining === 0 && state === "lobby" && playersList.length >= 1) {
      set(ref(database, `rooms/${ROOM_ID}/state`), "playing")
        .then(() => set(ref(database, `rooms/${ROOM_ID}/gameStartedAt`), Date.now()))
        .catch(() => {});
    }
  }, [remaining, state, playersList.length]);

  const startNow = async () => {
    if (playersList.length < 1) { toast.error("Need at least 1 player"); return; }
    await set(ref(database, `rooms/${ROOM_ID}/state`), "playing");
    await set(ref(database, `rooms/${ROOM_ID}/gameStartedAt`), Date.now());
  };

  const revokeGame = async () => {
    // Clear all players and reset state
    await update(ref(database, `rooms/${ROOM_ID}`), {
      players: null,
      counter: 0,
      state: "lobby",
      lobbyStartedAt: Date.now(),
      gameStartedAt: null,
      revokedAt: Date.now(),
      revokedBy: me?.username || "someone",
    });
    localStorage.removeItem(PLAYER_KEY);
    toast("Game revoked — everyone returns to the lobby");
    navigate("/");
  };

  return (
    <div className="min-h-screen px-6 py-12 max-w-4xl mx-auto">
      <header className="flex items-start justify-between mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-2">Lobby</p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">Gathering everyone…</h1>
          <p className="text-stone-600 mt-2 handwritten text-2xl">a few more, then we begin</p>
        </div>
        <div className="text-right" data-testid="lobby-timer">
          <div className="flex items-center gap-2 text-stone-500 text-xs uppercase tracking-widest mb-1 justify-end">
            <Clock className="w-3.5 h-3.5" /> auto-starts in
          </div>
          <div className="mono text-5xl font-medium text-rose-700">{mins}:{secs}</div>
        </div>
      </header>

      <div className="grid sm:grid-cols-[1fr_auto] gap-6 mb-8 items-end">
        <div className="flex items-center gap-3 text-stone-700">
          <Users className="w-5 h-5" />
          <span className="text-lg" data-testid="player-count">{playersList.length} of 12 friends here</span>
        </div>
        <div className="flex gap-3">
          <Button
            data-testid="start-now-btn"
            onClick={startNow}
            className="rounded-full bg-stone-900 hover:bg-stone-800"
          >
            Start now
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button data-testid="revoke-btn" variant="outline" className="rounded-full border-rose-300 text-rose-700 hover:bg-rose-50">
                <RotateCcw className="w-4 h-4 mr-2" /> Revoke
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-testid="revoke-confirm-dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>Send everyone back to the lobby?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will <strong>remove all players</strong> from the room and reset the game.
                  Use this if someone is stuck or there's a bug. Everyone will need to rejoin.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="revoke-cancel">Never mind</AlertDialogCancel>
                <AlertDialogAction data-testid="revoke-confirm" onClick={revokeGame} className="bg-rose-700 hover:bg-rose-800">
                  Yes, revoke
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" data-testid="players-grid">
        {playersList.map((p) => (
          <div key={p.playerId}
            className={`rounded-xl border bg-white p-4 fade-in-up ${p.playerId === playerId ? "border-rose-400 ring-2 ring-rose-100" : "border-stone-200"}`}
            data-testid={`player-card-${p.assignedNumber}`}
          >
            <div className="text-xs text-stone-500 mono">#{String(p.assignedNumber).padStart(2,"0")}</div>
            <div className="text-lg font-medium truncate">{p.username}</div>
            {p.playerId === playerId && <div className="text-xs text-rose-600 handwritten text-base">that's you</div>}
          </div>
        ))}
        {Array.from({ length: Math.max(0, 12 - playersList.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="rounded-xl border border-dashed border-stone-300 p-4 text-stone-400">
            <div className="text-xs mono">#{String(playersList.length + i + 1).padStart(2,"0")}</div>
            <div className="text-base italic">empty seat</div>
          </div>
        ))}
      </div>

      <p className="text-center text-stone-500 mt-12 text-sm">
        When the timer reaches zero, every player jumps to their puzzle. No one waits alone.
      </p>
    </div>
  );
}
