import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Riddle: "I am old the moment I am made, yet I grow younger every time you visit me."
const ANSWER = "memory";

export default function Puzzle8Riddle({ onSolve }) {
  const [val, setVal] = useState("");
  const [hint, setHint] = useState(false);

  const submit = () => {
    if (val.trim().toLowerCase().includes(ANSWER)) onSolve();
    else toast.error("Read it once more. Slowly.");
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-10 sm:p-14 shadow-lg fade-in-up">
      <p className="text-xs uppercase tracking-[0.3em] text-amber-700 text-center mb-3">A Soft Riddle</p>

      <div className="max-w-xl mx-auto text-center my-10" data-testid="puzzle8-riddle">
        <p className="text-2xl sm:text-3xl text-stone-800 leading-relaxed italic" style={{ fontFamily: "'Fraunces', serif" }}>
          "I am old the moment I am made,
          <br />yet I grow softer every time you visit me.
          <br />What am I?"
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <Input
          data-testid="puzzle8-input"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="answer in one word"
          className="h-12 bg-white text-base"
        />
        <Button data-testid="puzzle8-submit" onClick={submit} className="w-full rounded-full bg-amber-700 hover:bg-amber-800">Answer</Button>
        <div className="text-center">
          <button onClick={() => setHint(!hint)} className="text-xs text-stone-500 hover:text-stone-700 underline">
            {hint ? "hide hint" : "need a hint?"}
          </button>
          {hint && <p className="text-stone-600 text-sm mt-2 italic">Hint: it lives in photo albums and birthday songs.</p>}
        </div>
      </div>
    </div>
  );
}
