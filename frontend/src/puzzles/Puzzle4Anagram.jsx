import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Anagram: rearrange letters of "CELEBRATE"
const SCRAMBLED = "TLBEEAREC";
const ANSWER = "CELEBRATE";

export default function Puzzle4Anagram({ onSolve }) {
  const [letters, setLetters] = useState([]);
  const [picked, setPicked] = useState([]);

  useEffect(() => {
    setLetters(SCRAMBLED.split("").map((ch, i) => ({ id: i, ch })));
  }, []);

  const pick = (l) => {
    setLetters((prev) => prev.filter((x) => x.id !== l.id));
    setPicked((prev) => [...prev, l]);
  };
  const unpick = (l) => {
    setPicked((prev) => prev.filter((x) => x.id !== l.id));
    setLetters((prev) => [...prev, l]);
  };
  const reset = () => {
    setLetters(SCRAMBLED.split("").map((ch, i) => ({ id: i, ch })));
    setPicked([]);
  };
  const submit = () => {
    const w = picked.map((p) => p.ch).join("");
    if (w === ANSWER) onSolve();
    else toast.error("Not quite — try a different order.");
  };

  return (
    <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 sm:p-12 shadow-lg fade-in-up">
      <p className="text-xs uppercase tracking-[0.3em] text-rose-700 mb-2 text-center">Tangled letters</p>
      <h3 className="text-center text-stone-700 mb-8 italic">Arrange them into the word that fits a birthday.</h3>

      <div className="min-h-[80px] border-b-2 border-dashed border-rose-300 mb-6 flex flex-wrap justify-center items-center gap-2 pb-3" data-testid="puzzle4-slots">
        {picked.length === 0 && <span className="text-rose-300 italic">drag letters here</span>}
        {picked.map((l) => (
          <button key={l.id} onClick={() => unpick(l)}
            className="w-12 h-14 rounded-xl bg-rose-700 text-white text-2xl font-medium shadow-md hover:bg-rose-800 transition-transform hover:-translate-y-1">
            {l.ch}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8" data-testid="puzzle4-pool">
        {letters.map((l) => (
          <button key={l.id} data-testid={`puzzle4-letter-${l.ch}-${l.id}`} onClick={() => pick(l)}
            className="w-12 h-14 rounded-xl bg-white border-2 border-rose-300 text-rose-800 text-2xl font-medium shadow-sm hover:bg-rose-100 transition-transform hover:-translate-y-1">
            {l.ch}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-3">
        <Button onClick={reset} variant="outline" className="rounded-full border-stone-300">Reset</Button>
        <Button data-testid="puzzle4-submit" onClick={submit} className="rounded-full bg-rose-700 hover:bg-rose-800 px-8">Submit</Button>
      </div>
    </div>
  );
}
