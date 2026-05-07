import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { database, ROOM_ID } from "@/firebase";
import { Card } from "@/components/ui/card";

const PLAYER_KEY = "bp_playerId";

export default function Reveal() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState({});
  const playerId = localStorage.getItem(PLAYER_KEY);

  useEffect(() => {
    if (!playerId) { navigate("/"); return; }
    const unsub = onValue(ref(database, `rooms/${ROOM_ID}/players`), (s) => setPlayers(s.val() || {}));
    return () => unsub();
  }, [playerId, navigate]);

  const ordered = Object.values(players).sort((a, b) => a.assignedNumber - b.assignedNumber);
  const me = playerId ? players[playerId] : null;

  return (
    <div className="min-h-screen px-6 py-16 max-w-3xl mx-auto">
      <div className="text-center mb-12 fade-in-up">
        <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">The Reveal</p>
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-tight">
          Read it <span className="italic shimmer-gold">out loud</span>,
          <br />in order, together.
        </h1>
        <p className="text-stone-600 mt-5 handwritten text-2xl">
          one fragment per friend — from #01 to #{String(ordered.length).padStart(2,"0")}
        </p>
      </div>

      <div className="space-y-5" data-testid="reveal-fragments">
        {ordered.map((p, i) => {
          const isMine = p.playerId === playerId;
          return (
            <Card key={p.playerId}
              className={`p-6 fade-in-up transition-all ${isMine ? "bg-rose-50 border-rose-300 ring-2 ring-rose-100" : "bg-white border-stone-200"}`}
              style={{ animationDelay: `${i * 120}ms` }}
              data-testid={`reveal-fragment-${p.assignedNumber}`}
            >
              <div className="flex items-baseline gap-5">
                <div className="mono text-3xl text-rose-700 font-medium tabular-nums shrink-0 w-14">
                  {String(p.assignedNumber).padStart(2,"0")}
                </div>
                <div className="flex-1">
                  <p className="text-xl sm:text-2xl text-stone-800 leading-snug" style={{ fontFamily: "'Fraunces', serif" }}>
                    {p.finalText}
                  </p>
                  <p className="text-xs text-stone-500 mt-2">
                    read by <span className="font-medium text-stone-700">{p.username}</span>
                    {isMine && <span className="text-rose-600 ml-2 handwritten text-base">— your turn</span>}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-16 text-stone-500 handwritten text-2xl">
        with love, from all of us.
      </div>
    </div>
  );
}
