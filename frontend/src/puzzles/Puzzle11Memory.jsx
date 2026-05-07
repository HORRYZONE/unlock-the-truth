import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SYMBOLS = ["🎂", "🎈", "🎁", "🌸", "🍰", "💌"];

function buildDeck() {
  const deck = [...SYMBOLS, ...SYMBOLS].map((s, i) => ({ id: i, symbol: s, flipped: false, matched: false }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export default function Puzzle11Memory({ onSolve }) {
  const [deck, setDeck] = useState(buildDeck);
  const [picked, setPicked] = useState([]);
  const [moves, setMoves] = useState(0);

  const allMatched = deck.every((c) => c.matched);

  useEffect(() => {
    if (allMatched) {
      setTimeout(() => onSolve(), 700);
    }
  }, [allMatched, onSolve]);

  const flip = (card) => {
    if (card.flipped || card.matched || picked.length === 2) return;
    const newDeck = deck.map((c) => (c.id === card.id ? { ...c, flipped: true } : c));
    const newPicked = [...picked, card];
    setDeck(newDeck);
    setPicked(newPicked);

    if (newPicked.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newPicked;
      if (a.symbol === b.symbol) {
        setTimeout(() => {
          setDeck((prev) => prev.map((c) => (c.symbol === a.symbol ? { ...c, matched: true } : c)));
          setPicked([]);
        }, 500);
      } else {
        setTimeout(() => {
          setDeck((prev) => prev.map((c) => (c.id === a.id || c.id === b.id ? { ...c, flipped: false } : c)));
          setPicked([]);
        }, 900);
      }
    }
  };

  return (
    <div className="bg-pink-50 border border-pink-200 rounded-3xl p-8 sm:p-12 shadow-lg fade-in-up">
      <p className="text-xs uppercase tracking-[0.3em] text-pink-700 text-center mb-3">Memory Lane</p>
      <h3 className="text-center text-stone-700 italic mb-2">Match every pair to remember.</h3>
      <p className="text-center text-stone-500 text-sm mb-8 mono" data-testid="puzzle11-moves">moves: {moves}</p>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto" data-testid="puzzle11-grid">
        {deck.map((card) => (
          <button
            key={card.id}
            data-testid={`puzzle11-card-${card.id}`}
            onClick={() => flip(card)}
            className={`aspect-square rounded-xl text-3xl sm:text-4xl flex items-center justify-center transition-all duration-300 ${
              card.matched
                ? "bg-emerald-100 border-2 border-emerald-300"
                : card.flipped
                ? "bg-white border-2 border-pink-300 shadow-md"
                : "bg-pink-700 hover:bg-pink-800 text-pink-700"
            }`}
          >
            {card.flipped || card.matched ? card.symbol : "♥"}
          </button>
        ))}
      </div>
    </div>
  );
}
