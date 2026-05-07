import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { playClick, playError } from "@/sounds";

const CIPHER = "brx jrw wkh dqvzhu kdkd";
const ANSWER = "you got the answer haha";

export default function Puzzle2Caesar({ onSolve }) {
  const [val, setVal] = useState("");
  const [hint, setHint] = useState(false);

  const submit = () => {
    if (val.trim().toLowerCase() === ANSWER) { playClick(); onSolve(); }
    else { playError(); toast.error("Almost. Try shifting again."); }
  };

  return (
    <div className="glass-card border-amber-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl fade-in-up">
      <div className="text-center mb-8">
        <p className="text-[10px] uppercase tracking-[0.4em] text-amber-300/70 mb-3 italiana">Encrypted Whisper</p>
        <div className="mono text-2xl sm:text-3xl text-amber-100 tracking-wider mb-4 select-all break-all" data-testid="puzzle2-cipher">
          {CIPHER}
        </div>
        <p className="text-stone-400 italic text-sm">Three steps too far. Walk back.</p>
      </div>
      <div className="max-w-md mx-auto space-y-4">
        <Input data-testid="puzzle2-input" value={val} onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="decode the message"
          className="h-12 bg-black/40 border-amber-500/20 text-amber-50 placeholder:text-stone-500" />
        <Button data-testid="puzzle2-submit" onClick={submit} className="w-full rounded-full btn-maroon">Decode</Button>
        <div className="text-center">
          <button onClick={() => setHint(!hint)} className="text-xs text-stone-400 hover:text-amber-300 underline underline-offset-4">
            {hint ? "hide hint" : "need a hint?"}
          </button>
          {hint && <p className="text-amber-200/80 text-sm mt-2 italic">Hint: go back 3 steps in the alphabet.</p>}
        </div>
      </div>
    </div>
  );
}
