import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue, update } from "firebase/database";
import { database, ROOM_ID } from "@/firebase";
import { PUZZLE_META } from "@/data/puzzles";
import { getFragment } from "@/data/messageFragments";
import PUZZLE_COMPONENTS from "@/puzzles";
import { playSuccess } from "@/sounds";

const PLAYER_KEY = "bp_playerId";
const ADMIN_KEY = "bp_isAdmin";

export default function Puzzle() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const playerId = localStorage.getItem(PLAYER_KEY);
  const isAdmin = localStorage.getItem(ADMIN_KEY) === "true";
  const sawSelf = useRef(false);

  useEffect(() => {
    if (isAdmin) { navigate("/admin"); return; }
    if (!playerId) { navigate("/"); return; }
    const unsub = onValue(ref(database, `rooms/${ROOM_ID}/players/${playerId}`), (s) => {
      const v = s.val();
      setMe(v);
      if (v) sawSelf.current = true;
      else if (sawSelf.current) {
        // I was here, now I'm gone — revoked
        localStorage.removeItem(PLAYER_KEY);
        navigate("/");
      }
    });
    const unsubState = onValue(ref(database, `rooms/${ROOM_ID}/state`), (s) => {
      const v = s.val() || "lobby";
      if (v === "lobby") navigate("/lobby");
      if (v === "finished") navigate("/reveal");
    });
    return () => { unsub(); unsubState(); };
  }, [playerId, isAdmin, navigate]);

  useEffect(() => {
    if (me?.isCompleted) navigate("/waiting");
  }, [me?.isCompleted, navigate]);

  if (!me) {
    return <div className="min-h-screen flex items-center justify-center text-stone-500">Loading your puzzle…</div>;
  }

  const meta = PUZZLE_META[me.assignedNumber] || PUZZLE_META[1];
  const PuzzleComponent = PUZZLE_COMPONENTS[me.assignedNumber] || PUZZLE_COMPONENTS[1];

  const onSolve = async () => {
    // Prefer admin-assigned dynamic fragment; fallback to static lookup
    const fragment = me.assignedFragment || getFragment(me.assignedNumber);
    playSuccess();
    await update(ref(database, `rooms/${ROOM_ID}/players/${playerId}`), {
      isCompleted: true,
      finalText: fragment,
      completedAt: Date.now(),
    });
    navigate("/waiting");
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 sm:py-10 max-w-3xl mx-auto">
      <header className="mb-6 sm:mb-8 fade-in-up">
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500 mb-2 mono">{meta.subtitle}</p>
        <h1 className="cinzel text-2xl sm:text-4xl font-semibold tracking-tight">{meta.title}</h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-2">Solve to unlock your fragment of the message.</p>
      </header>
      <PuzzleComponent onSolve={onSolve} username={me.username} assignedNumber={me.assignedNumber} />
    </div>
  );
}
