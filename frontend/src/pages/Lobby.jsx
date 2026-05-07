import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { database, ROOM_ID, LOBBY_TIMER_SECONDS } from "@/firebase";
import { Users, Clock } from "lucide-react";

const PLAYER_KEY = "bp_playerId";
const ADMIN_KEY = "bp_isAdmin";

export default function Lobby() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState({});
  const [state, setState] = useState("lobby");
  const [lobbyStartedAt, setLobbyStartedAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const playerId = localStorage.getItem(PLAYER_KEY);
  const isAdmin = localStorage.getItem(ADMIN_KEY) === "true";

  useEffect(() => {
    if (isAdmin) { navigate("/admin"); return; }
    if (!playerId) { navigate("/"); return; }
    const unsubP = onValue(ref(database, `rooms/${ROOM_ID}/players`), (s) => setPlayers(s.val() || {}));
    const unsubS = onValue(ref(database, `rooms/${ROOM_ID}/state`), (s) => {
      const v = s.val() || "lobby";
      setState(v);
      if (v === "playing") navigate("/puzzle");
      if (v === "finished") navigate("/reveal");
    });
    const unsubStart = onValue(ref(database, `rooms/${ROOM_ID}/lobbyStartedAt`), (s) => setLobbyStartedAt(s.val()));
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => { unsubP(); unsubS(); unsubStart(); clearInterval(t); };
  }, [playerId, isAdmin, navigate]);

  // Bug fix: if my playerId is no longer present (revoked by admin), bounce to login
  useEffect(() => {
    if (!playerId) return;
    if (Object.keys(players).length === 0) return; // initial empty state
    if (!players[playerId]) {
      localStorage.removeItem(PLAYER_KEY);
      navigate("/");
    }
  }, [players, playerId, navigate]);

  const playersList = Object.values(players).sort((a, b) => a.assignedNumber - b.assignedNumber);
  const remaining = lobbyStartedAt
    ? Math.max(0, LOBBY_TIMER_SECONDS - Math.floor((now - lobbyStartedAt) / 1000))
    : LOBBY_TIMER_SECONDS;
  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");

  return (
    <div className="min-h-screen px-4 sm:px-6 py-10 sm:py-14 max-w-4xl mx-auto relative">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8 sm:mb-10">
        <div>
          <p className="cinzel text-xs uppercase tracking-[0.3em] text-stone-500 mb-2">The Gathering</p>
          <h1 className="cinzel text-3xl sm:text-5xl font-semibold tracking-tight">Unlock the Truth</h1>
          <p className="text-stone-600 mt-2 handwritten text-xl sm:text-2xl">a few more, then we begin</p>
        </div>
        <div className="text-left sm:text-right" data-testid="lobby-timer">
          <div className="flex items-center gap-2 text-stone-500 text-[10px] uppercase tracking-widest mb-1 sm:justify-end">
            <Clock className="w-3.5 h-3.5" /> auto-starts in
          </div>
          <div className="mono text-4xl sm:text-5xl font-medium text-rose-700">{mins}:{secs}</div>
        </div>
      </header>

      <div className="flex items-center gap-3 text-stone-700 mb-6">
        <Users className="w-5 h-5" />
        <span className="text-base sm:text-lg" data-testid="player-count">
          {playersList.length} of 12 friends here
        </span>
      </div>

      <div className="rounded-2xl glass border border-amber-200/60 p-4 sm:p-5 mb-6 text-sm text-stone-700">
        Waiting for the host to begin. <span className="italic text-stone-500">Sit tight — the door opens automatically when the timer runs out.</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" data-testid="players-grid">
        {playersList.map((p) => (
          <div key={p.playerId}
            className={`rounded-xl bg-white p-3 sm:p-4 fade-in-up card-3d border ${p.playerId === playerId ? "border-rose-400 ring-2 ring-rose-100" : "border-stone-200"}`}
            data-testid={`player-card-${p.assignedNumber}`}
          >
            <div className="text-[10px] text-stone-500 mono">#{String(p.assignedNumber).padStart(2,"0")}</div>
            <div className="text-base sm:text-lg font-medium truncate">{p.username}</div>
            {p.playerId === playerId && <div className="text-xs text-rose-600 handwritten text-base">that's you</div>}
          </div>
        ))}
        {Array.from({ length: Math.max(0, 12 - playersList.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="rounded-xl border border-dashed border-stone-300 p-3 sm:p-4 text-stone-400">
            <div className="text-[10px] mono">#{String(playersList.length + i + 1).padStart(2,"0")}</div>
            <div className="text-sm sm:text-base italic">empty seat</div>
          </div>
        ))}
      </div>

      <p className="text-center text-stone-500 mt-10 sm:mt-12 text-sm">
        When the timer reaches zero, every player jumps to their puzzle. No one waits alone.
      </p>
    </div>
  );
}
