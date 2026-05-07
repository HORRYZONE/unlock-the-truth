import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { playError } from "@/sounds";

const ANSWER = "make a wish";

export default function Puzzle6Emoji({ onSolve }) {
  const [val, setVal] = useState("");
  const [hint, setHint] = useState(false);
  const submit = () => {
    if (val.trim().toLowerCase() === ANSWER) onSolve();
    else { playError(); toast.error("Read the symbols softly. What do they ask of you?"); }
  };
  return (
    <div className="glass-card border-fuchsia-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl fade-in-up">
      <p className="text-[10px] uppercase tracking-[0.4em] text-fuchsia-300/80 text-center mb-3 italiana">Whisper of Symbols</p>
      <h3 className="text-center text-stone-300 italic mb-10">Three little pictures. One small ritual.</h3>

      <div className="flex justify-center items-center gap-4 sm:gap-10 text-6xl sm:text-8xl mb-10" data-testid="puzzle6-emojis">
        <span className="inline-block">🎂</span>
        <span className="text-stone-500 text-3xl sm:text-5xl">+</span>
        <span className="inline-block">🕯️</span>
        <span className="text-stone-500 text-3xl sm:text-5xl">+</span>
        <span className="inline-block">🎈</span>
      </div>
      <p className="text-center text-stone-400 mb-8 italic">= ?</p>

      <div className="max-w-md mx-auto space-y-4">
        <Input data-testid="puzzle6-input" value={val} onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="say it out loud"
          className="h-12 bg-black/40 border-fuchsia-500/30 text-fuchsia-50 placeholder:text-stone-500" />
        <Button data-testid="puzzle6-submit" onClick={submit} className="w-full rounded-full btn-maroon">Whisper back</Button>
        <div className="text-center">
          <button onClick={() => setHint(!hint)} className="text-xs text-stone-400 hover:text-fuchsia-300 underline">
            {hint ? "hide hint" : "need a hint?"}
          </button>
          {hint && <p className="text-fuchsia-200/80 text-sm mt-2 italic">Hint: three words. The thing you do before blowing out a candle.</p>}
        </div>
      </div>
    </div>
  );
}
