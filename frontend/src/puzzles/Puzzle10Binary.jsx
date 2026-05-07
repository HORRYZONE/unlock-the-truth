import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// "01001000 01001001" => "HI"
const BINARY = "01001000 01001001";
const ANSWER = "hi";

export default function Puzzle10Binary({ onSolve }) {
  const [val, setVal] = useState("");
  const [hint, setHint] = useState(false);

  const submit = () => {
    if (val.trim().toLowerCase() === ANSWER) onSolve();
    else toast.error("Eight bits at a time. ASCII whispers.");
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 rounded-3xl p-10 sm:p-14 shadow-2xl fade-in-up font-mono">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-400 text-center mb-3" style={{ fontFamily: "'Fraunces', serif" }}>Zeros & Ones</p>
      <h3 className="text-center text-zinc-400 italic mb-10" style={{ fontFamily: "'Fraunces', serif" }}>The simplest greeting, in machine.</h3>

      <div className="text-center mb-10">
        <div className="inline-block bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-5" data-testid="puzzle10-binary">
          <div className="text-2xl sm:text-3xl text-cyan-300 tracking-widest">{BINARY}</div>
        </div>
        <p className="text-zinc-500 text-sm mt-4 italic" style={{ fontFamily: "'Fraunces', serif" }}>
          two bytes. two letters.
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <Input
          data-testid="puzzle10-input"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="decoded text"
          className="h-12 bg-zinc-900 border-zinc-700 text-cyan-200"
        />
        <Button data-testid="puzzle10-submit" onClick={submit} className="w-full rounded-full bg-cyan-500 hover:bg-cyan-600 text-zinc-950">Decode</Button>
        <div className="text-center" style={{ fontFamily: "'Fraunces', serif" }}>
          <button onClick={() => setHint(!hint)} className="text-xs text-zinc-500 hover:text-zinc-300 underline">
            {hint ? "hide hint" : "need a hint?"}
          </button>
          {hint && <p className="text-zinc-400 text-sm mt-2 italic">Hint: split into 8-bit groups, convert to ASCII.</p>}
        </div>
      </div>
    </div>
  );
}
