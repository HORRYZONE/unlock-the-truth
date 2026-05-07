import React, { useState, useEffect } from "react";
import { playClick, playSuccess } from "@/sounds";

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
    if (allMatched) { playSuccess(); setTimeout(() => onSolve(), 700); }
  }, [allMatched, onSolve]);

  const flip = (card) => {
    if (card.flipped || card.matched || picked.length === 2) return;
    playClick();
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
    <div className="glass-card border-rose-500/30 rounded-3xl p-6 sm:p-12 shadow-2xl fade-in-up">
      <p className="text-[10px] uppercase tracking-[0.4em] text-rose-300/80 text-center mb-3 italiana">Memory Lane</p>
      <h3 className="text-center text-stone-300 italic mb-2">Match every pair to remember.</h3>
      <p className="text-center text-stone-400 text-sm mb-6 sm:mb-8 mono" data-testid="puzzle11-moves">moves: {moves}</p>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto" data-testid="puzzle11-grid">
        {deck.map((card) => (
          <button key={card.id} data-testid={`puzzle11-card-${card.id}`} onClick={() => flip(card)}
            className={`aspect-square rounded-xl text-3xl sm:text-4xl flex items-center justify-center transition-all duration-300 ${
              card.matched
                ? "bg-emerald-500/20 border-2 border-emerald-500/50"
                : card.flipped
                ? "bg-amber-500/10 border-2 border-amber-500/40"
                : "btn-maroon"
            }`}>
            {card.flipped || card.matched ? card.symbol : "♥"}
          </button>
        ))}
      </div>
    </div>
  );
}
