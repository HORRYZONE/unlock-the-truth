import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { playError } from "@/sounds";

const ANSWER = 25;

export default function Puzzle5Math({ onSolve }) {
  const [val, setVal] = useState("");
  const submit = () => {
    if (parseInt(val, 10) === ANSWER) onSolve();
    else { playError(); toast.error("Numbers don't agree. Try again."); }
  };
  return (
    <div className="glass-card border-emerald-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl fade-in-up">
      <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-300/80 text-center mb-3 italiana">Quiet Arithmetic</p>
      <h3 className="text-center text-stone-300 italic mb-10">Solve gently. There is only one answer.</h3>

      <div className="text-center mono text-3xl sm:text-5xl text-amber-50 mb-10 leading-relaxed" data-testid="puzzle5-equation">
        <div>(12 × 3) − 11 = ?</div>
        <div className="text-stone-400 text-sm sm:text-base mt-3 italic display">a small story in numbers</div>
      </div>

      <div className="max-w-xs mx-auto space-y-4">
        <Input data-testid="puzzle5-input" type="number" value={val} onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="?"
          className="h-14 bg-black/40 border-emerald-500/30 text-emerald-50 text-3xl text-center mono" />
        <Button data-testid="puzzle5-submit" onClick={submit} className="w-full rounded-full btn-maroon">Solve</Button>
      </div>
    </div>
  );
}
