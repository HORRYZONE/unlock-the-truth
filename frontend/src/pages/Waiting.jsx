import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue, set } from "firebase/database";
import { database, ROOM_ID } from "@/firebase";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2 } from "lucide-react";

const PLAYER_KEY = "bp_playerId";

export default function Waiting() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState({});
  const [state, setState] = useState("playing");
  const playerId = localStorage.getItem(PLAYER_KEY);
  const sawSelf = useRef(false);

  useEffect(() => {
    if (!playerId) { navigate("/"); return; }
    const u1 = onValue(ref(database, `rooms/${ROOM_ID}/players`), (s) => setPlayers(s.val() || {}));
    const u2 = onValue(ref(database, `rooms/${ROOM_ID}/state`), (s) => {
      const v = s.val();
      setState(v);
      if (v === "lobby") navigate("/lobby");
      if (v === "finished") navigate("/reveal");
    });
    return () => { u1(); u2(); };
  }, [playerId, navigate]);

  // Bounce to login if revoked
  useEffect(() => {
    if (!playerId) return;
    if (players[playerId]) { sawSelf.current = true; return; }
    if (sawSelf.current) {
      localStorage.removeItem(PLAYER_KEY);
      navigate("/");
    }
  }, [players, playerId, navigate]);

  const playersList = Object.values(players).sort((a, b) => a.assignedNumber - b.assignedNumber);
  const completed = playersList.filter((p) => p.isCompleted);
  const total = playersList.length;
  const pct = total > 0 ? (completed.length / total) * 100 : 0;
  const me = playerId ? players[playerId] : null;

  useEffect(() => {
    if (total > 0 && completed.length === total && state === "playing") {
      set(ref(database, `rooms/${ROOM_ID}/state`), "finished").catch(() => {});
    }
  }, [completed.length, total, state]);

  return (
    <div className="min-h-screen bg-stage grain px-4 sm:px-6 py-10 sm:py-14 max-w-2xl mx-auto flex flex-col">
      <div className="text-center mb-10 fade-in-up">
        <p className="text-[10px] uppercase tracking-[0.4em] text-amber-400/70 mb-3 italiana">You did it</p>
        <h1 className="display text-3xl sm:text-5xl font-medium tracking-tight text-amber-50">
          One piece <span className="italic shimmer-gold">is yours</span>.
        </h1>
        <p className="text-stone-300 mt-4 handwritten text-xl sm:text-2xl">now we wait for the others…</p>
      </div>

      {me?.finalText && (
        <div className="glass-card border-amber-500/30 rounded-2xl p-6 mb-10 text-center scale-in" data-testid="my-fragment">
          <div className="text-[10px] uppercase tracking-[0.3em] text-amber-300/80 mb-2 italiana">
            your fragment · #{String(me.assignedNumber).padStart(2,"0")}
          </div>
          <p className="display text-lg sm:text-xl text-amber-50 italic leading-relaxed">"{me.finalText}"</p>
          <p className="text-xs text-stone-500 mt-3">It will be revealed in order with the others.</p>
        </div>
      )}

      <div className="glass-card border-amber-500/20 rounded-2xl p-6 shadow-2xl" data-testid="waiting-progress">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-amber-100">{completed.length} of {total} done</span>
          <span className="mono text-xs text-amber-300/70">{Math.round(pct)}%</span>
        </div>
        <Progress value={pct} className="h-2 mb-5 bg-stone-800" />
        <ul className="space-y-2">
          {playersList.map((p) => (
            <li key={p.playerId} className="flex items-center justify-between text-sm" data-testid={`waiting-player-${p.assignedNumber}`}>
              <span className="flex items-center gap-3">
                <span className="mono text-xs text-amber-400/70">#{String(p.assignedNumber).padStart(2,"0")}</span>
                <span className="text-amber-50">{p.username}</span>
              </span>
              {p.isCompleted ? (
                <span className="flex items-center gap-1.5 text-emerald-400 text-xs">
                  <CheckCircle2 className="w-4 h-4" /> done
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-stone-500 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" /> still solving
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
