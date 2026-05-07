import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const MIRRORED = "ereh dna woN"; // "Now and here"
const ANSWER = "now and here";

export default function Puzzle7Mirror({ onSolve }) {
  const [val, setVal] = useState("");

  const submit = () => {
    if (val.trim().toLowerCase() === ANSWER) onSolve();
    else toast.error("Look from the other side.");
  };

  return (
    <div className="bg-sky-50 border border-sky-200 rounded-3xl p-10 sm:p-14 shadow-lg fade-in-up">
      <p className="text-xs uppercase tracking-[0.3em] text-sky-700 text-center mb-3">Mirror, Mirror</p>
      <h3 className="text-center text-stone-700 italic mb-10">The world reads us both ways.</h3>

      <div className="text-center mb-10" data-testid="puzzle7-mirror">
        <div className="text-4xl sm:text-5xl text-stone-800" style={{ transform: "scaleX(-1)", display: "inline-block", fontFamily: "'Fraunces', serif" }}>
          {MIRRORED}
        </div>
        <p className="text-stone-500 text-sm mt-4 italic">tilt your head — or your screen</p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <Input
          data-testid="puzzle7-input"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="what does the mirror say?"
          className="h-12 bg-white text-base"
        />
        <Button data-testid="puzzle7-submit" onClick={submit} className="w-full rounded-full bg-sky-700 hover:bg-sky-800">Reflect</Button>
      </div>
    </div>
  );
}
