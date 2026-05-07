import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { playError } from "@/sounds";

const ANSWER = 64;

export default function Puzzle9Sequence({ onSolve }) {
  const [val, setVal] = useState("");
  const submit = () => {
    if (parseInt(val, 10) === ANSWER) onSolve();
    else { playError(); toast.error("Each number doubles its quiet."); }
  };
  const seq = [2, 4, 8, 16, 32];
  return (
    <div className="glass-card border-indigo-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl fade-in-up">
      <p className="text-[10px] uppercase tracking-[0.4em] text-indigo-300/80 text-center mb-3 italiana">Pattern of Years</p>
      <h3 className="text-center text-stone-300 italic mb-10">Each step grows from the last.</h3>

      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-10" data-testid="puzzle9-sequence">
        {seq.map((n, i) => (
          <div key={i} className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-black/40 border-2 border-indigo-500/40 flex items-center justify-center mono text-xl sm:text-3xl text-indigo-100 fade-in-up"
            style={{ animationDelay: `${i * 100}ms` }}>{n}</div>
        ))}
        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl btn-maroon flex items-center justify-center mono text-xl sm:text-3xl">?</div>
      </div>

      <div className="max-w-xs mx-auto space-y-4">
        <Input data-testid="puzzle9-input" type="number" value={val} onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="?"
          className="h-14 bg-black/40 border-indigo-500/30 text-indigo-50 text-3xl text-center mono" />
        <Button data-testid="puzzle9-submit" onClick={submit} className="w-full rounded-full btn-maroon">Continue the pattern</Button>
      </div>
    </div>
  );
}
