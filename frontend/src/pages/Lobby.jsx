import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { database, ROOM_ID, LOBBY_TIMER_SECONDS } from "@/firebase";
import { Users, Clock, Pause } from "lucide-react";

const PLAYER_KEY = "bp_playerId";
const ADMIN_KEY = "bp_isAdmin";

export default function Lobby() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState({});
  const [state, setState] = useState("lobby");
  const [lobbyStartedAt, setLobbyStartedAt] = useState(null);
  const [timerPaused, setTimerPaused] = useState(false);
  const [frozenRemaining, setFrozenRemaining] = useState(LOBBY_TIMER_SECONDS);
  const [now, setNow] = useState(Date.now());
  const playerId = localStorage.getItem(PLAYER_KEY);
  const isAdmin = localStorage.getItem(ADMIN_KEY) === "true";

  useEffect(() => {
    if (isAdmin) { navigate("/admin"); return; }
    if (!playerId) { navigate("/"); return; }
    const u1 = onValue(ref(database, `rooms/${ROOM_ID}/players`), (s) => setPlayers(s.val() || {}));
    const u2 = onValue(ref(database, `rooms/${ROOM_ID}/state`), (s) => {
      const v = s.val() || "lobby";
      setState(v);
      if (v === "playing") navigate("/puzzle");
      if (v === "finished") navigate("/reveal");
    });
    const u3 = onValue(ref(database, `rooms/${ROOM_ID}/lobbyStartedAt`), (s) => setLobbyStartedAt(s.val()));
    const u4 = onValue(ref(database, `rooms/${ROOM_ID}/timerPaused`), (s) => setTimerPaused(Boolean(s.val())));
    const u5 = onValue(ref(database, `rooms/${ROOM_ID}/frozenRemaining`), (s) => {
      const v = s.val();
      setFrozenRemaining(typeof v === "number" ? v : LOBBY_TIMER_SECONDS);
    });
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => { u1(); u2(); u3(); u4(); u5(); clearInterval(t); };
  }, [playerId, isAdmin, navigate]);

  // If revoked / removed, bounce to login
  useEffect(() => {
    if (!playerId) return;
    if (Object.keys(players).length === 0) return;
    if (!players[playerId]) {
      localStorage.removeItem(PLAYER_KEY);
      navigate("/");
    }
  }, [players, playerId, navigate]);

  const playersList = Object.values(players).sort((a, b) => a.assignedNumber - b.assignedNumber);
  const liveRemaining = lobbyStartedAt
    ? Math.max(0, LOBBY_TIMER_SECONDS - Math.floor((now - lobbyStartedAt) / 1000))
    : LOBBY_TIMER_SECONDS;
  const remaining = timerPaused ? frozenRemaining : liveRemaining;
  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");

  return (
    <div className="min-h-screen bg-stage grain px-4 sm:px-6 py-10 sm:py-14 max-w-4xl mx-auto relative">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8 sm:mb-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-amber-400/70 mb-2 italiana">The Gathering</p>
          <h1 className="display text-3xl sm:text-5xl font-medium tracking-tight text-amber-50">
            Unlock <span className="italic shimmer-gold">the Truth</span>
          </h1>
          <p className="text-stone-300 mt-2 handwritten text-xl sm:text-2xl">a few more, then we begin</p>
        </div>
        <div className="text-left sm:text-right" data-testid="lobby-timer">
          <div className="flex items-center gap-2 text-amber-400/70 text-[10px] uppercase tracking-widest mb-1 sm:justify-end">
            {timerPaused ? <><Pause className="w-3 h-3" /> paused at</> : <><Clock className="w-3 h-3" /> auto-starts in</>}
          </div>
          <div className={`display text-4xl sm:text-5xl font-medium mono ${timerPaused ? "text-stone-500" : "text-rose-300"}`}>
            {mins}:{secs}
          </div>
        </div>
      </header>

      <div className="flex items-center gap-3 text-stone-300 mb-6">
        <Users className="w-5 h-5 text-amber-400/70" />
        <span className="text-base sm:text-lg" data-testid="player-count">
          {playersList.length} of 12 friends here
        </span>
      </div>

      <div className="rounded-2xl glass-card p-4 sm:p-5 mb-6 text-sm text-stone-300">
        Waiting for the host to begin. <span className="italic text-stone-400">The door opens automatically when the timer runs out.</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" data-testid="players-grid">
        {playersList.map((p) => (
          <div key={p.playerId}
            className={`rounded-xl glass-card p-3 sm:p-4 fade-in-up card-3d ${p.playerId === playerId ? "border-rose-400/60 ring-2 ring-rose-500/20" : ""}`}
            data-testid={`player-card-${p.assignedNumber}`}>
            <div className="text-[10px] text-amber-400/70 mono">#{String(p.assignedNumber).padStart(2,"0")}</div>
            <div className="text-base sm:text-lg font-medium truncate text-amber-50">{p.username}</div>
            {p.playerId === playerId && <div className="text-xs text-rose-300 handwritten text-base">that's you</div>}
          </div>
        ))}
        {Array.from({ length: Math.max(0, 12 - playersList.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="rounded-xl border border-dashed border-stone-700 p-3 sm:p-4 text-stone-600">
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
