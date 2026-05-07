import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { playError } from "@/sounds";

const ANSWER = "memory";

export default function Puzzle8Riddle({ onSolve }) {
  const [val, setVal] = useState("");
  const [hint, setHint] = useState(false);
  const submit = () => {
    if (val.trim().toLowerCase().includes(ANSWER)) onSolve();
    else { playError(); toast.error("Read it once more. Slowly."); }
  };
  return (
    <div className="glass-card border-amber-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl fade-in-up">
      <p className="text-[10px] uppercase tracking-[0.4em] text-amber-300/80 text-center mb-3 italiana">A Soft Riddle</p>

      <div className="max-w-xl mx-auto text-center my-10" data-testid="puzzle8-riddle">
        <p className="display text-2xl sm:text-3xl text-amber-50 leading-relaxed italic">
          "I am old the moment I am made,
          <br />yet I grow softer every time you visit me.
          <br />What am I?"
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <Input data-testid="puzzle8-input" value={val} onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="answer in one word"
          className="h-12 bg-black/40 border-amber-500/30 text-amber-50 placeholder:text-stone-500" />
        <Button data-testid="puzzle8-submit" onClick={submit} className="w-full rounded-full btn-maroon">Answer</Button>
        <div className="text-center">
          <button onClick={() => setHint(!hint)} className="text-xs text-stone-400 hover:text-amber-300 underline">
            {hint ? "hide hint" : "need a hint?"}
          </button>
          {hint && <p className="text-amber-200/80 text-sm mt-2 italic">Hint: it lives in photo albums and birthday songs.</p>}
        </div>
      </div>
    </div>
  );
}
