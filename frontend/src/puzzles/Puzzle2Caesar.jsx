import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const CIPHER = "brx jrw wkh dqvzhu kdkd";
const ANSWER = "you got the answer haha";

export default function Puzzle2Caesar({ onSolve }) {
  const [val, setVal] = useState("");
  const [hint, setHint] = useState(false);

  const submit = () => {
    if (val.trim().toLowerCase() === ANSWER) onSolve();
    else toast.error("Almost. Try shifting again.");
  };

  return (
    <div className="bg-gradient-to-br from-stone-100 to-amber-50 border border-amber-200/60 rounded-3xl p-10 sm:p-14 shadow-lg fade-in-up">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-500 mb-3">Encrypted Whisper</p>
        <div className="mono text-3xl sm:text-4xl text-stone-800 tracking-wider mb-4 select-all" data-testid="puzzle2-cipher">
          {CIPHER}
        </div>
        <p className="text-stone-600 italic text-sm">Three steps too far. Walk back.</p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <Input
          data-testid="puzzle2-input"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="decode the message"
          className="h-12 bg-white text-base"
        />
        <Button data-testid="puzzle2-submit" onClick={submit} className="w-full rounded-full bg-stone-900 hover:bg-stone-800">Decode</Button>
        <div className="text-center">
          <button onClick={() => setHint(!hint)} className="text-xs text-stone-500 hover:text-stone-700 underline underline-offset-4">
            {hint ? "hide hint" : "need a hint?"}
          </button>
          {hint && <p className="text-stone-600 text-sm mt-2 italic">Hint: go back 3 steps in the alphabet.</p>}
        </div>
      </div>
    </div>
  );
}
