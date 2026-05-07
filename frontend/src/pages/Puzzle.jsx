import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue, update } from "firebase/database";
import { database, ROOM_ID } from "@/firebase";
import { PUZZLE_META } from "@/data/puzzles";
import { getFragment } from "@/data/messageFragments";
import PUZZLE_COMPONENTS from "@/puzzles";

const PLAYER_KEY = "bp_playerId";

export default function Puzzle() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [state, setState] = useState("playing");
  const playerId = localStorage.getItem(PLAYER_KEY);

  useEffect(() => {
    if (!playerId) { navigate("/"); return; }
    const unsub = onValue(ref(database, `rooms/${ROOM_ID}/players/${playerId}`), (s) => {
      setMe(s.val());
    });
    const unsubState = onValue(ref(database, `rooms/${ROOM_ID}/state`), (s) => {
      const v = s.val() || "lobby";
      setState(v);
      if (v === "lobby") navigate("/lobby");
      if (v === "finished") navigate("/reveal");
    });
    return () => { unsub(); unsubState(); };
  }, [playerId, navigate]);

  // If already completed, send to waiting
  useEffect(() => {
    if (me?.isCompleted) navigate("/waiting");
  }, [me?.isCompleted, navigate]);

  if (!me) {
    return <div className="min-h-screen flex items-center justify-center text-stone-500">Loading your puzzle…</div>;
  }

  const meta = PUZZLE_META[me.assignedNumber] || PUZZLE_META[1];
  const PuzzleComponent = PUZZLE_COMPONENTS[me.assignedNumber] || PUZZLE_COMPONENTS[1];

  const onSolve = async () => {
    const fragment = getFragment(me.assignedNumber);
    await update(ref(database, `rooms/${ROOM_ID}/players/${playerId}`), {
      isCompleted: true,
      finalText: fragment,
      completedAt: Date.now(),
    });
    navigate("/waiting");
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-10 max-w-3xl mx-auto">
      <header className="mb-8 fade-in-up">
        <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-2 mono">{meta.subtitle}</p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{meta.title}</h1>
        <p className="text-sm text-stone-500 mt-2">Solve to unlock your fragment of the message.</p>
      </header>
      <PuzzleComponent onSolve={onSolve} username={me.username} assignedNumber={me.assignedNumber} />
    </div>
  );
}
