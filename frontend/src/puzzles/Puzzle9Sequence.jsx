import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Sequence: 2, 4, 8, 16, 32, ?  -> 64
const ANSWER = 64;

export default function Puzzle9Sequence({ onSolve }) {
  const [val, setVal] = useState("");
  const submit = () => {
    if (parseInt(val, 10) === ANSWER) onSolve();
    else toast.error("Each number doubles its quiet.");
  };

  const seq = [2, 4, 8, 16, 32];

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-3xl p-10 sm:p-14 shadow-lg fade-in-up">
      <p className="text-xs uppercase tracking-[0.3em] text-indigo-700 text-center mb-3">Pattern of Years</p>
      <h3 className="text-center text-stone-700 italic mb-10">Each step grows from the last.</h3>

      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10" data-testid="puzzle9-sequence">
        {seq.map((n, i) => (
          <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-indigo-300 flex items-center justify-center mono text-2xl sm:text-3xl text-indigo-800 shadow-sm fade-in-up"
            style={{ animationDelay: `${i * 100}ms` }}>
            {n}
          </div>
        ))}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-700 text-white flex items-center justify-center mono text-2xl sm:text-3xl shadow-md candle-flicker">
          ?
        </div>
      </div>

      <div className="max-w-xs mx-auto space-y-4">
        <Input
          data-testid="puzzle9-input"
          type="number"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="?"
          className="h-14 bg-white text-3xl text-center mono"
        />
        <Button data-testid="puzzle9-submit" onClick={submit} className="w-full rounded-full bg-indigo-700 hover:bg-indigo-800">Continue the pattern</Button>
      </div>
    </div>
  );
}
