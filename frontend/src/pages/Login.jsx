import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, runTransaction, set, get, onValue } from "firebase/database";
import { database, ROOM_ID, MAX_PLAYERS } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Cake } from "lucide-react";

const PLAYER_KEY = "bp_playerId";

export default function Login() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const join = async () => {
    const name = username.trim();
    if (!name) {
      toast.error("Please tell us your name");
      return;
    }
    setLoading(true);
    try {
      // Check game state
      const stateSnap = await get(ref(database, `rooms/${ROOM_ID}/state`));
      const state = stateSnap.val();
      if (state === "playing" || state === "finished") {
        toast.error("Game already in progress. Please wait for the next round.");
        setLoading(false);
        return;
      }

      // Allocate assignedNumber via transaction (atomic)
      const counterRef = ref(database, `rooms/${ROOM_ID}/counter`);
      const txRes = await runTransaction(counterRef, (current) => {
        const next = (current || 0) + 1;
        if (next > MAX_PLAYERS) return; // abort
        return next;
      });
      if (!txRes.committed || !txRes.snapshot.exists()) {
        toast.error("The room is full (12 players max).");
        setLoading(false);
        return;
      }
      const assignedNumber = txRes.snapshot.val();

      // Create player record
      const playerId = `p_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
      const player = {
        playerId,
        username: name,
        assignedNumber,
        isCompleted: false,
        finalText: "",
        joinedAt: Date.now(),
      };
      await set(ref(database, `rooms/${ROOM_ID}/players/${playerId}`), player);

      // Initialize state if empty
      const sSnap = await get(ref(database, `rooms/${ROOM_ID}/state`));
      if (!sSnap.exists()) {
        await set(ref(database, `rooms/${ROOM_ID}/state`), "lobby");
        await set(ref(database, `rooms/${ROOM_ID}/lobbyStartedAt`), Date.now());
      }

      localStorage.setItem(PLAYER_KEY, playerId);
      navigate("/lobby");
    } catch (e) {
      console.error(e);
      toast.error("Could not join: " + (e.message || "unknown error"));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative">
      {/* Decorative confetti dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-12 w-3 h-3 rounded-full bg-rose-300 opacity-60" />
        <div className="absolute top-32 right-20 w-2 h-2 rounded-full bg-amber-400 opacity-70" />
        <div className="absolute bottom-20 left-1/4 w-2.5 h-2.5 rounded-full bg-emerald-400 opacity-50" />
        <div className="absolute bottom-40 right-1/3 w-2 h-2 rounded-full bg-rose-400 opacity-60" />
        <div className="absolute top-1/2 left-8 w-2 h-2 rounded-full bg-amber-300 opacity-60" />
      </div>

      <Card className="max-w-md w-full shadow-2xl border-stone-200 relative z-10 fade-in-up">
        <CardContent className="p-10 space-y-7">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-50 border border-rose-100">
              <Cake className="w-7 h-7 text-rose-600 candle-flicker" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold leading-tight tracking-tight">
              A puzzle, <span className="italic shimmer-gold">together</span>.
            </h1>
            <p className="text-stone-600 text-base">
              Twelve friends. Twelve clues. One quiet message
              <br />waiting at the end.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm text-stone-600 block">Your name</label>
            <Input
              data-testid="username-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Aria"
              onKeyDown={(e) => e.key === "Enter" && join()}
              className="text-lg h-12 bg-white"
              maxLength={24}
            />
            <Button
              data-testid="join-btn"
              onClick={join}
              disabled={loading}
              className="w-full h-12 text-base bg-rose-700 hover:bg-rose-800 rounded-full"
            >
              {loading ? "Joining..." : "Join the room"}
            </Button>
          </div>

          <p className="text-xs text-center text-stone-500 handwritten text-base">
            shhh — don't tell the birthday person
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
