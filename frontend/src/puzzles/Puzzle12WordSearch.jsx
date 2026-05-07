import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { playClick, playError } from "@/sounds";

const GRID = [
  ["P","Q","R","S","T","U"],
  ["A","B","C","D","E","F"],
  ["G","W","I","S","H","J"],
  ["K","L","M","N","O","P"],
  ["Q","R","S","T","U","V"],
  ["W","X","Y","Z","A","B"],
];
const TARGET = new Set(["2-1","2-2","2-3","2-4"]);

export default function Puzzle12WordSearch({ onSolve }) {
  const [selected, setSelected] = useState(new Set());
  const toggle = (r, c) => {
    playClick();
    const k = `${r}-${c}`;
    const next = new Set(selected);
    if (next.has(k)) next.delete(k); else next.add(k);
    setSelected(next);
  };
  const submit = () => {
    if (selected.size !== TARGET.size) { playError(); toast.error("Select exactly the cells that spell the hidden word."); return; }
    for (const k of selected) {
      if (!TARGET.has(k)) { playError(); toast.error("Some cells are wrong. Look again."); return; }
    }
    onSolve();
  };

  return (
    <div className="glass-card border-teal-500/30 rounded-3xl p-6 sm:p-12 shadow-2xl fade-in-up">
      <p className="text-[10px] uppercase tracking-[0.4em] text-teal-300/80 text-center mb-3 italiana">Hidden Word</p>
      <h3 className="text-center text-stone-300 italic mb-2">Find the four-letter word a candle hears.</h3>
      <p className="text-center text-stone-400 text-sm mb-6 sm:mb-8">tap to select cells in order</p>

      <div className="flex justify-center mb-8">
        <div className="inline-grid grid-cols-6 gap-1.5 bg-black/40 p-3 rounded-xl border border-teal-500/30" data-testid="puzzle12-grid">
          {GRID.map((row, r) =>
            row.map((ch, c) => {
              const k = `${r}-${c}`;
              const isOn = selected.has(k);
              return (
                <button key={k} data-testid={`puzzle12-cell-${r}-${c}`} onClick={() => toggle(r, c)}
                  className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg mono text-base sm:text-lg font-medium transition-all ${
                    isOn ? "btn-maroon scale-105" : "bg-stone-900 text-stone-300 hover:bg-teal-500/10"
                  }`}>
                  {ch}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Button onClick={() => setSelected(new Set())} variant="outline" className="rounded-full border-stone-600 text-stone-300 hover:bg-stone-800">Clear</Button>
        <Button data-testid="puzzle12-submit" onClick={submit} className="rounded-full btn-maroon px-8">Submit</Button>
      </div>
      <p className="text-center text-stone-500 text-xs mt-4 italic">hint: the word is "wish"</p>
    </div>
  );
}
