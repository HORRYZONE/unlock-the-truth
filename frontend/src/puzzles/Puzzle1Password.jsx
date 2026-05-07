import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function Puzzle1Password({ onSolve }) {
  const [val, setVal] = useState("");
  const [show, setShow] = useState(false);
  const [hint, setHint] = useState(false);

  const submit = () => {
    if (val.trim() === "090503") onSolve();
    else toast.error("Not quite. Try again.");
  };

  return (
    <div className="bg-stone-900 text-stone-100 rounded-3xl p-10 sm:p-14 shadow-2xl fade-in-up">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-stone-800 border-2 border-amber-500/40 flex items-center justify-center mb-6">
          <Lock className="w-9 h-9 text-amber-400" />
        </div>
        <p className="text-sm uppercase tracking-[0.35em] text-amber-400/80 mb-2">Locked</p>
        <h2 className="text-2xl sm:text-3xl font-light mb-2">Please insert the password</h2>
        <p className="text-stone-400 text-sm mb-8 italic">A small key opens a quiet door.</p>

        <div className="w-full max-w-xs relative mb-4">
          <input
            data-testid="puzzle1-input"
            type={show ? "text" : "password"}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="mono w-full h-14 bg-stone-800 border border-stone-700 rounded-xl px-5 pr-12 text-2xl tracking-[0.5em] text-center text-amber-300 focus:outline-none focus:border-amber-500"
            placeholder="••••••"
            maxLength={6}
          />
          <button onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200">
            {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <Button data-testid="puzzle1-submit" onClick={submit} className="bg-amber-500 hover:bg-amber-600 text-stone-900 rounded-full px-8 mb-4">Unlock</Button>

        <button onClick={() => setHint(!hint)} data-testid="puzzle1-hint" className="text-xs text-stone-500 hover:text-stone-300 underline underline-offset-4">
          {hint ? "hide hint" : "need a hint?"}
        </button>
        {hint && <p className="text-stone-400 text-sm mt-3 italic">Hint: the beginning.</p>}
      </div>
    </div>
  );
}
