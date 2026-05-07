import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Quiet equation: 7 + 18 = 25 (a referenced age perhaps)
// Player must compute (12 * 3) - 11 = 25
const ANSWER = 25;

export default function Puzzle5Math({ onSolve }) {
  const [val, setVal] = useState("");
  const submit = () => {
    if (parseInt(val, 10) === ANSWER) onSolve();
    else toast.error("Numbers don't agree. Try again.");
  };

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-10 sm:p-14 shadow-lg fade-in-up">
      <p className="text-xs uppercase tracking-[0.3em] text-emerald-700 text-center mb-3">Quiet Arithmetic</p>
      <h3 className="text-center text-stone-700 italic mb-10">Solve gently. There is only one answer.</h3>

      <div className="text-center mono text-4xl sm:text-5xl text-stone-800 mb-10 leading-relaxed" data-testid="puzzle5-equation">
        <div>(12 × 3) − 11 = ?</div>
        <div className="text-stone-400 text-base mt-3 italic" style={{ fontFamily: "'Fraunces', serif" }}>
          a small story in numbers
        </div>
      </div>

      <div className="max-w-xs mx-auto space-y-4">
        <Input
          data-testid="puzzle5-input"
          type="number"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="?"
          className="h-14 bg-white text-3xl text-center mono"
        />
        <Button data-testid="puzzle5-submit" onClick={submit} className="w-full rounded-full bg-emerald-700 hover:bg-emerald-800">Solve</Button>
      </div>
    </div>
  );
}
