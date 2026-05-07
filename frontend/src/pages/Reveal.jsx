import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { database, ROOM_ID } from "@/firebase";
import { Card } from "@/components/ui/card";
import { playReveal } from "@/sounds";

const PLAYER_KEY = "bp_playerId";

function Confetti() {
  const colors = ["#8b1a2c", "#d4af37", "#f0d77f", "#b83c56", "#fef2f4"];
  const pieces = Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 4 + Math.random() * 4,
    color: colors[i % colors.length],
    rotate: Math.random() * 360,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {pieces.map((p) => (
        <span key={p.id} className="confetti"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
            borderRadius: p.id % 3 === 0 ? "50%" : "1px",
          }} />
      ))}
    </div>
  );
}

export default function Reveal() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState({});
  const playerId = localStorage.getItem(PLAYER_KEY);

  useEffect(() => {
    const unsub = onValue(ref(database, `rooms/${ROOM_ID}/players`), (s) => setPlayers(s.val() || {}));
    playReveal();
    return () => unsub();
  }, []);

  const ordered = Object.values(players).sort((a, b) => a.assignedNumber - b.assignedNumber);

  return (
    <div className="min-h-screen bg-stage grain px-4 sm:px-6 py-12 sm:py-16 max-w-3xl mx-auto relative">
      <Confetti />
      <div className="text-center mb-12 fade-in-up relative z-10">
        <p className="text-[10px] uppercase tracking-[0.4em] text-amber-400/70 mb-3 italiana">The Reveal</p>
        <h1 className="display text-4xl sm:text-6xl font-medium tracking-tight leading-[1.05] text-amber-50">
          Read it <span className="italic shimmer-gold">out loud</span>,
          <br />in order, together.
        </h1>
        <p className="text-stone-300 mt-5 handwritten text-xl sm:text-2xl">
          one fragment per friend — from #01 to #{String(ordered.length).padStart(2,"0")}
        </p>
      </div>

      <div className="space-y-4 sm:space-y-5 relative z-10" data-testid="reveal-fragments">
        {ordered.map((p, i) => {
          const isMine = p.playerId === playerId;
          return (
            <Card key={p.playerId}
              className={`p-5 sm:p-6 fade-in-up transition-all glass-card ${isMine ? "border-rose-400/60 ring-2 ring-rose-500/20" : "border-amber-500/15"}`}
              style={{ animationDelay: `${i * 120}ms` }}
              data-testid={`reveal-fragment-${p.assignedNumber}`}>
              <div className="flex items-baseline gap-4 sm:gap-5">
                <div className="display text-2xl sm:text-3xl text-amber-300 font-medium tabular-nums shrink-0 w-12 sm:w-14">
                  {String(p.assignedNumber).padStart(2,"0")}
                </div>
                <div className="flex-1">
                  <p className="display text-lg sm:text-2xl text-amber-50 leading-snug italic">
                    {p.finalText}
                  </p>
                  <p className="text-xs text-stone-400 mt-2">
                    read by <span className="font-medium text-amber-200">{p.username}</span>
                    {isMine && <span className="text-rose-300 ml-2 handwritten text-base">— your turn</span>}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-16 text-amber-300/80 handwritten text-2xl relative z-10">
        with love, from all of us.
      </div>
    </div>
  );
}
