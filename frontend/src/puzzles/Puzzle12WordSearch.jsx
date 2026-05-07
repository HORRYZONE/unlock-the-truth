import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// 6x6 grid, hidden word "WISH" placed left-to-right at row 2 cols 1..4
const GRID = [
  ["P","Q","R","S","T","U"],
  ["A","B","C","D","E","F"],
  ["G","W","I","S","H","J"],
  ["K","L","M","N","O","P"],
  ["Q","R","S","T","U","V"],
  ["W","X","Y","Z","A","B"],
];
// target cells: row 2, cols 1..4 -> "W","I","S","H"
const TARGET = new Set(["2-1","2-2","2-3","2-4"]);
const TARGET_WORD = "WISH";

export default function Puzzle12WordSearch({ onSolve }) {
  const [selected, setSelected] = useState(new Set());

  const toggle = (r, c) => {
    const k = `${r}-${c}`;
    const next = new Set(selected);
    if (next.has(k)) next.delete(k); else next.add(k);
    setSelected(next);
  };

  const submit = () => {
    if (selected.size !== TARGET.size) {
      toast.error("Select exactly the cells that spell the hidden word.");
      return;
    }
    for (const k of selected) {
      if (!TARGET.has(k)) {
        toast.error("Some cells are wrong. Look again.");
        return;
      }
    }
    onSolve();
  };

  return (
    <div className="bg-teal-50 border border-teal-200 rounded-3xl p-8 sm:p-12 shadow-lg fade-in-up">
      <p className="text-xs uppercase tracking-[0.3em] text-teal-700 text-center mb-3">Hidden Word</p>
      <h3 className="text-center text-stone-700 italic mb-2">Find the four-letter word a candle hears.</h3>
      <p className="text-center text-stone-500 text-sm mb-8">tap to select cells in order</p>

      <div className="inline-grid grid-cols-6 gap-1.5 mx-auto bg-white p-3 rounded-xl border border-teal-200 mb-8" style={{ display: "grid", justifyContent: "center" }} data-testid="puzzle12-grid">
        {GRID.map((row, r) =>
          row.map((ch, c) => {
            const k = `${r}-${c}`;
            const isOn = selected.has(k);
            return (
              <button
                key={k}
                data-testid={`puzzle12-cell-${r}-${c}`}
                onClick={() => toggle(r, c)}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg mono text-base sm:text-lg font-medium transition-all ${
                  isOn ? "bg-teal-600 text-white shadow-md scale-105" : "bg-stone-50 text-stone-700 hover:bg-teal-100"
                }`}
              >
                {ch}
              </button>
            );
          })
        )}
      </div>

      <div className="flex justify-center gap-3">
        <Button onClick={() => setSelected(new Set())} variant="outline" className="rounded-full">Clear</Button>
        <Button data-testid="puzzle12-submit" onClick={submit} className="rounded-full bg-teal-700 hover:bg-teal-800 px-8">Submit</Button>
      </div>
      <p className="text-center text-stone-400 text-xs mt-4 italic">hint: the word is "{TARGET_WORD.toLowerCase()}"</p>
    </div>
  );
}
