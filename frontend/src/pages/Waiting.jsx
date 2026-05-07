import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue, set, get } from "firebase/database";
import { database, ROOM_ID } from "@/firebase";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2 } from "lucide-react";

const PLAYER_KEY = "bp_playerId";

export default function Waiting() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState({});
  const [state, setState] = useState("playing");
  const playerId = localStorage.getItem(PLAYER_KEY);

  useEffect(() => {
    if (!playerId) { navigate("/"); return; }
    const unsubP = onValue(ref(database, `rooms/${ROOM_ID}/players`), (s) => setPlayers(s.val() || {}));
    const unsubS = onValue(ref(database, `rooms/${ROOM_ID}/state`), (s) => {
      const v = s.val();
      setState(v);
      if (v === "lobby") navigate("/lobby");
      if (v === "finished") navigate("/reveal");
    });
    return () => { unsubP(); unsubS(); };
  }, [playerId, navigate]);

  const playersList = Object.values(players).sort((a, b) => a.assignedNumber - b.assignedNumber);
  const completed = playersList.filter((p) => p.isCompleted);
  const total = playersList.length;
  const pct = total > 0 ? (completed.length / total) * 100 : 0;
  const me = playerId ? players[playerId] : null;

  // Trigger finish when all complete
  useEffect(() => {
    if (total > 0 && completed.length === total && state === "playing") {
      set(ref(database, `rooms/${ROOM_ID}/state`), "finished").catch(() => {});
    }
  }, [completed.length, total, state]);

  return (
    <div className="min-h-screen px-6 py-12 max-w-2xl mx-auto flex flex-col">
      <div className="text-center mb-10 fade-in-up">
        <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">You did it</p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
          One piece of the message <span className="italic shimmer-gold">is yours</span>.
        </h1>
        <p className="text-stone-600 mt-4 handwritten text-2xl">now we wait for the others…</p>
      </div>

      {me?.finalText && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-10 text-center" data-testid="my-fragment">
          <div className="text-xs uppercase tracking-widest text-amber-700 mb-2">Your fragment · #{String(me.assignedNumber).padStart(2,"0")}</div>
          <p className="text-lg sm:text-xl text-stone-800 italic">"{me.finalText}"</p>
          <p className="text-xs text-stone-500 mt-3">It will be revealed in order with the others.</p>
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm" data-testid="waiting-progress">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-stone-700">{completed.length} of {total} done</span>
          <span className="mono text-xs text-stone-500">{Math.round(pct)}%</span>
        </div>
        <Progress value={pct} className="h-2 mb-5" />
        <ul className="space-y-2">
          {playersList.map((p) => (
            <li key={p.playerId} className="flex items-center justify-between text-sm" data-testid={`waiting-player-${p.assignedNumber}`}>
              <span className="flex items-center gap-3">
                <span className="mono text-xs text-stone-400">#{String(p.assignedNumber).padStart(2,"0")}</span>
                <span className="text-stone-800">{p.username}</span>
              </span>
              {p.isCompleted ? (
                <span className="flex items-center gap-1.5 text-emerald-700 text-xs">
                  <CheckCircle2 className="w-4 h-4" /> done
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-stone-400 text-xs">
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
