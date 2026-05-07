import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const MORSE = ".... .- .--. .--. -.-- / -... .. .-. - .... -.. .- -.--";
const ANSWER = "happy birthday";

export default function Puzzle3Morse({ onSolve }) {
  const [val, setVal] = useState("");
  const [hint, setHint] = useState(false);

  const submit = () => {
    if (val.trim().toLowerCase() === ANSWER) onSolve();
    else toast.error("Listen again. Tap, tap, dash…");
  };

  return (
    <div className="bg-slate-950 text-slate-100 rounded-3xl p-10 sm:p-14 shadow-2xl fade-in-up relative overflow-hidden">
      <div className="absolute inset-0 dotted-border opacity-30" />
      <div className="relative">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-400 mb-3 text-center">Signal Incoming</p>
        <div className="text-center mb-8">
          <div className="mono text-2xl sm:text-3xl tracking-widest text-emerald-300 leading-relaxed" data-testid="puzzle3-morse">
            {MORSE.split("").map((c, i) => (
              <span key={i} className={c === "." ? "candle-flicker inline-block" : ""}>{c}</span>
            ))}
          </div>
          <p className="text-slate-400 italic text-sm mt-4">A space, a slash — a breath, a word.</p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <Input
            data-testid="puzzle3-input"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="what does it say?"
            className="h-12 bg-slate-900 border-slate-700 text-emerald-200"
          />
          <Button data-testid="puzzle3-submit" onClick={submit} className="w-full rounded-full bg-emerald-500 hover:bg-emerald-600 text-slate-950">Transmit</Button>
          <div className="text-center">
            <button onClick={() => setHint(!hint)} className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-4">
              {hint ? "hide hint" : "need a hint?"}
            </button>
            {hint && <p className="text-slate-400 text-sm mt-2 italic">Hint: dots and lines.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
