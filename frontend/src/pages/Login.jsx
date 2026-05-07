import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, runTransaction, set, get } from "firebase/database";
import { database, ROOM_ID, MAX_PLAYERS } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles, Eye } from "lucide-react";
import EyeOfTruth from "@/components/EyeOfTruth";
import { playClick, playSuccess, playError } from "@/sounds";

const PLAYER_KEY = "bp_playerId";
const ADMIN_KEY = "bp_isAdmin";
const ADMIN_PASSWORD = "Admin69";

export default function Login() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const join = async () => {
    const name = username.trim();
    if (!name) { toast.error("Whisper your name first"); playError(); return; }

    // Admin shortcut: never registered as player
    if (name === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_KEY, "true");
      localStorage.removeItem(PLAYER_KEY);
      playSuccess();
      navigate("/admin");
      return;
    }

    setLoading(true);
    try {
      const stateSnap = await get(ref(database, `rooms/${ROOM_ID}/state`));
      const state = stateSnap.val();
      if (state === "playing" || state === "finished") {
        toast.error("A game is already in progress.");
        playError();
        setLoading(false);
        return;
      }

      const counterRef = ref(database, `rooms/${ROOM_ID}/counter`);
      const txRes = await runTransaction(counterRef, (current) => {
        const next = (current || 0) + 1;
        if (next > MAX_PLAYERS) return;
        return next;
      });
      if (!txRes.committed || !txRes.snapshot.exists()) {
        toast.error("The room is full.");
        playError();
        setLoading(false);
        return;
      }
      const assignedNumber = txRes.snapshot.val();
      const playerId = `p_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
      const player = {
        playerId, username: name, assignedNumber,
        isCompleted: false, finalText: "", joinedAt: Date.now(),
      };
      await set(ref(database, `rooms/${ROOM_ID}/players/${playerId}`), player);

      const sSnap = await get(ref(database, `rooms/${ROOM_ID}/state`));
      if (!sSnap.exists()) {
        await set(ref(database, `rooms/${ROOM_ID}/state`), "lobby");
        await set(ref(database, `rooms/${ROOM_ID}/lobbyStartedAt`), Date.now());
      }

      localStorage.setItem(PLAYER_KEY, playerId);
      localStorage.removeItem(ADMIN_KEY);
      playSuccess();
      navigate("/lobby");
    } catch (e) {
      console.error(e);
      toast.error("Could not join: " + (e.message || "unknown"));
      playError();
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 sm:py-16 relative overflow-hidden">
      {/* floating orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="float-orb w-3 h-3 bg-rose-400/60 top-[12%] left-[10%]" />
        <div className="float-orb w-2 h-2 bg-amber-400/70 top-[22%] right-[14%]" style={{ animationDelay: "1.2s" }} />
        <div className="float-orb w-2.5 h-2.5 bg-emerald-400/50 bottom-[18%] left-[18%]" style={{ animationDelay: "2.4s" }} />
        <div className="float-orb w-2 h-2 bg-rose-300/60 bottom-[28%] right-[20%]" style={{ animationDelay: "3.1s" }} />
        <div className="float-orb w-1.5 h-1.5 bg-amber-300/70 top-[55%] left-[8%]" style={{ animationDelay: "0.6s" }} />
        <div className="float-orb w-2 h-2 bg-fuchsia-400/40 top-[40%] right-[8%]" style={{ animationDelay: "1.8s" }} />
      </div>
      {/* cipher wheels */}
      <div className="cipher-wheel" style={{ top: "-80px", right: "-80px" }} />
      <div className="cipher-wheel inner" style={{ bottom: "-40px", left: "-40px" }} />

      <Card className="max-w-md w-full glass shadow-2xl rounded-3xl relative z-10 fade-in-up card-3d border-amber-200/60">
        <CardContent className="p-7 sm:p-10 space-y-6">
          <div className="text-center space-y-3">
            <div className="-mt-4 -mb-2"><EyeOfTruth size={150} /></div>
            <p className="cinzel text-xs uppercase tracking-[0.4em] text-amber-700/80">Welcome, friend</p>
            <h1 className="cinzel text-3xl sm:text-5xl font-semibold leading-tight tracking-tight" data-testid="app-title">
              Unlock <span className="italic shimmer-gold">the Truth</span>
            </h1>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Twelve clues, one quiet message — hidden until you all solve it together.
              <br /><span className="handwritten text-xl text-rose-700/80">a birthday, in pieces.</span>
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs uppercase tracking-widest text-stone-600 block">Your name</label>
            <Input
              data-testid="username-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Aria"
              onKeyDown={(e) => e.key === "Enter" && join()}
              className="text-base h-12 bg-white/90"
              maxLength={32}
            />
            <Button
              data-testid="join-btn"
              onClick={join}
              disabled={loading}
              className="w-full h-12 text-base bg-rose-700 hover:bg-rose-800 rounded-full pulse-ring"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {loading ? "Joining..." : "Step into the room"}
            </Button>
            <p className="text-[11px] text-center text-stone-400 italic">
              psst — only the host knows the secret name.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
