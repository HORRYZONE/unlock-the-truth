import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { playClick, playError } from "@/sounds";

const SCRAMBLED = "TLBEEAREC";
const ANSWER = "CELEBRATE";

export default function Puzzle4Anagram({ onSolve }) {
  const [letters, setLetters] = useState([]);
  const [picked, setPicked] = useState([]);

  useEffect(() => {
    setLetters(SCRAMBLED.split("").map((ch, i) => ({ id: i, ch })));
  }, []);

  const pick = (l) => {
    playClick();
    setLetters((p) => p.filter((x) => x.id !== l.id));
    setPicked((p) => [...p, l]);
  };
  const unpick = (l) => {
    playClick();
    setPicked((p) => p.filter((x) => x.id !== l.id));
    setLetters((p) => [...p, l]);
  };
  const reset = () => {
    setLetters(SCRAMBLED.split("").map((ch, i) => ({ id: i, ch })));
    setPicked([]);
  };
  const submit = () => {
    const w = picked.map((p) => p.ch).join("");
    if (w === ANSWER) onSolve();
    else { playError(); toast.error("Not quite — try a different order."); }
  };

  return (
    <div className="glass-card border-rose-500/30 rounded-3xl p-7 sm:p-12 shadow-2xl fade-in-up">
      <p className="text-[10px] uppercase tracking-[0.4em] text-rose-300/80 mb-2 text-center italiana">Tangled letters</p>
      <h3 className="text-center text-stone-300 mb-8 italic">Arrange them into the word that fits a birthday.</h3>

      <div className="min-h-[80px] border-b-2 border-dashed border-rose-500/40 mb-6 flex flex-wrap justify-center items-center gap-2 pb-3" data-testid="puzzle4-slots">
        {picked.length === 0 && <span className="text-rose-400/50 italic">tap letters to add here</span>}
        {picked.map((l) => (
          <button key={l.id} onClick={() => unpick(l)}
            className="w-11 h-13 sm:w-12 sm:h-14 rounded-xl btn-maroon text-2xl font-medium hover:scale-105 transition-transform">{l.ch}</button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8" data-testid="puzzle4-pool">
        {letters.map((l) => (
          <button key={l.id} data-testid={`puzzle4-letter-${l.ch}-${l.id}`} onClick={() => pick(l)}
            className="w-11 h-13 sm:w-12 sm:h-14 rounded-xl bg-black/40 border-2 border-rose-500/40 text-rose-100 text-2xl font-medium hover:bg-rose-500/10 hover:scale-105 transition-all">
            {l.ch}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-3">
        <Button onClick={reset} variant="outline" className="rounded-full border-stone-600 text-stone-300 hover:bg-stone-800">Reset</Button>
        <Button data-testid="puzzle4-submit" onClick={submit} className="rounded-full btn-maroon px-8">Submit</Button>
      </div>
    </div>
  );
}
