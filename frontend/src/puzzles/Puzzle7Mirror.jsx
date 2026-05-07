import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { playError } from "@/sounds";

const MIRRORED = "ereh dna woN";
const ANSWER = "now and here";

export default function Puzzle7Mirror({ onSolve }) {
  const [val, setVal] = useState("");
  const submit = () => {
    if (val.trim().toLowerCase() === ANSWER) onSolve();
    else { playError(); toast.error("Look from the other side."); }
  };
  return (
    <div className="glass-card border-cyan-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl fade-in-up">
      <p className="text-[10px] uppercase tracking-[0.4em] text-cyan-300/80 text-center mb-3 italiana">Mirror, Mirror</p>
      <h3 className="text-center text-stone-300 italic mb-10">The world reads us both ways.</h3>

      <div className="text-center mb-10" data-testid="puzzle7-mirror">
        <div className="display text-3xl sm:text-5xl text-amber-50 italic" style={{ transform: "scaleX(-1)", display: "inline-block" }}>
          {MIRRORED}
        </div>
        <p className="text-stone-400 text-sm mt-4 italic">tilt your head — or your screen</p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <Input data-testid="puzzle7-input" value={val} onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="what does the mirror say?"
          className="h-12 bg-black/40 border-cyan-500/30 text-cyan-50 placeholder:text-stone-500" />
        <Button data-testid="puzzle7-submit" onClick={submit} className="w-full rounded-full btn-maroon">Reflect</Button>
      </div>
    </div>
  );
}
