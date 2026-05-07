import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// 🎂 + 🕯️ + 🎈 = "make a wish"
const ANSWER = "make a wish";

export default function Puzzle6Emoji({ onSolve }) {
  const [val, setVal] = useState("");
  const [hint, setHint] = useState(false);

  const submit = () => {
    if (val.trim().toLowerCase() === ANSWER) onSolve();
    else toast.error("Read the symbols softly. What do they ask of you?");
  };

  return (
    <div className="bg-gradient-to-br from-fuchsia-50 to-amber-50 border border-fuchsia-200 rounded-3xl p-10 sm:p-14 shadow-lg fade-in-up">
      <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-700 text-center mb-3">Whisper of Symbols</p>
      <h3 className="text-center text-stone-700 italic mb-10">Three little pictures. One small ritual.</h3>

      <div className="flex justify-center items-center gap-6 sm:gap-10 text-7xl sm:text-8xl mb-10" data-testid="puzzle6-emojis">
        <span className="candle-flicker inline-block">🎂</span>
        <span className="text-stone-300 text-5xl">+</span>
        <span className="candle-flicker inline-block" style={{ animationDelay: "0.4s" }}>🕯️</span>
        <span className="text-stone-300 text-5xl">+</span>
        <span className="candle-flicker inline-block" style={{ animationDelay: "0.8s" }}>🎈</span>
      </div>
      <p className="text-center text-stone-500 mb-8 italic">= ?</p>

      <div className="max-w-md mx-auto space-y-4">
        <Input
          data-testid="puzzle6-input"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="say it out loud"
          className="h-12 bg-white text-base"
        />
        <Button data-testid="puzzle6-submit" onClick={submit} className="w-full rounded-full bg-fuchsia-700 hover:bg-fuchsia-800">Whisper back</Button>
        <div className="text-center">
          <button onClick={() => setHint(!hint)} className="text-xs text-stone-500 hover:text-stone-700 underline">
            {hint ? "hide hint" : "need a hint?"}
          </button>
          {hint && <p className="text-stone-600 text-sm mt-2 italic">Hint: three words. The thing you do before blowing out a candle.</p>}
        </div>
      </div>
    </div>
  );
}
