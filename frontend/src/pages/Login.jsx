import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, runTransaction, set, get } from "firebase/database";
import { database, ROOM_ID, MAX_PLAYERS } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Sparkles, ArrowRight } from "lucide-react";
import { playClick, playSuccess, playError } from "@/sounds";

const PLAYER_KEY = "bp_playerId";
const ADMIN_KEY = "bp_isAdmin";
const ADMIN_PASSWORD = "Admin69";
const SEEN_KEY = "bp_seenIntro";

function Loader() {
  return (
    <div className="min-h-screen bg-stage grain flex flex-col items-center justify-center px-4 fade-in" data-testid="loader-screen">
      <div className="relative h-72 w-72 flex items-center justify-center">
        <div className="loader-ring outer" />
        <div className="loader-ring" />
        <div className="wax-seal flex items-center justify-center">
          <span className="italiana text-4xl text-amber-100/90">A</span>
        </div>
      </div>
      <p className="mt-10 text-amber-200/80 italiana text-2xl tracking-widest">unlocking the truth…</p>
      <div className="mt-3 flex gap-1.5">
        {[0,1,2].map((i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-amber-300/70 animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />
        ))}
      </div>
    </div>
  );
}

function Invitation({ onNext }) {
  return (
    <div className="min-h-screen bg-stage grain flex items-center justify-center px-4 py-12 relative overflow-hidden" data-testid="invitation-screen">
      {/* Floating orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="float-orb w-2 h-2 bg-amber-300/60 top-[10%] left-[14%]" />
        <div className="float-orb w-2 h-2 bg-rose-300/50 top-[20%] right-[12%]" style={{ animationDelay: "1.2s" }} />
        <div className="float-orb w-1.5 h-1.5 bg-amber-200/70 bottom-[18%] left-[18%]" style={{ animationDelay: "2.4s" }} />
        <div className="float-orb w-2 h-2 bg-rose-200/40 bottom-[26%] right-[20%]" style={{ animationDelay: "3.1s" }} />
      </div>

      <div className="invitation-card max-w-lg w-full rounded-2xl p-8 sm:p-12 scale-in relative z-10">
        <div className="text-center space-y-5">
          <div className="text-[10px] sm:text-xs uppercase tracking-[0.5em] text-amber-300/70 mb-2 italiana">
            ✦ formal invitation ✦
          </div>
          <h1 className="display text-4xl sm:text-6xl font-medium leading-[1.05] text-amber-100" data-testid="invitation-title">
            You're <span className="italic shimmer-gold">invited</span>
          </h1>
          <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

          <p className="italiana text-2xl sm:text-3xl text-rose-100/90 leading-snug">
            to celebrate <span className="shimmer-rose">Anisha's</span>
            <br /><span className="text-amber-200">23<sup className="text-base">rd</sup></span> birthday
          </p>

          <div className="space-y-3 text-stone-200/80 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
            <p>
              An evening woven with quiet laughter, twelve small mysteries, and one
              message hidden between us — waiting to be solved together.
            </p>
            <p className="italic text-amber-200/70 handwritten text-xl sm:text-2xl">
              dress: cozy. heart: open. phone: charged.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              data-testid="invitation-next-btn"
              onClick={() => { playClick(); onNext(); }}
              className="btn-maroon rounded-full h-12 px-8 text-base group"
            >
              I'll be there <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="pt-4 text-[10px] uppercase tracking-[0.4em] text-stone-400/60">
            ✦ &nbsp; for friends only &nbsp; ✦
          </div>
        </div>
      </div>
    </div>
  );
}

function JoinForm() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const join = async () => {
    const name = username.trim();
    if (!name) { toast.error("Please enter your name"); playError(); return; }

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
      const playerId = `p_${Date.now()}_${Math.floor(Math.random()*9999)}`;
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
    <div className="min-h-screen bg-stage grain flex items-center justify-center px-4 py-10 relative overflow-hidden" data-testid="join-form-screen">
      <div className="absolute inset-0 pointer-events-none">
        <div className="float-orb w-2 h-2 bg-amber-300/60 top-[10%] left-[10%]" />
        <div className="float-orb w-1.5 h-1.5 bg-rose-300/50 top-[18%] right-[14%]" style={{ animationDelay: "1.4s" }} />
        <div className="float-orb w-2 h-2 bg-rose-400/40 bottom-[16%] right-[18%]" style={{ animationDelay: "2.6s" }} />
      </div>
      <div className="glass-card max-w-md w-full rounded-3xl p-7 sm:p-10 fade-in-up card-3d shadow-2xl relative z-10">
        <div className="text-center space-y-5">
          <div className="text-[10px] uppercase tracking-[0.5em] text-amber-300/70 italiana">welcome, friend</div>
          <h1 className="display text-3xl sm:text-5xl font-medium leading-[1.05] text-amber-100" data-testid="app-title">
            Unlock <span className="italic shimmer-gold">the Truth</span>
          </h1>
          <p className="text-stone-300/80 text-sm sm:text-base">
            Twelve clues. One quiet message. Hidden until we all solve it together.
          </p>

          <div className="space-y-3 text-left pt-2">
            <label className="text-xs uppercase tracking-widest text-stone-400 block">Your name</label>
            <Input
              data-testid="username-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Aria"
              onKeyDown={(e) => e.key === "Enter" && join()}
              className="h-12 bg-black/40 border-amber-500/20 text-amber-50 placeholder:text-stone-500"
              maxLength={32}
            />
            <Button
              data-testid="join-btn"
              onClick={join}
              disabled={loading}
              className="btn-maroon w-full h-12 rounded-full pulse-ring"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {loading ? "Joining..." : "Step into the room"}
            </Button>
            <p className="text-[10px] text-center text-stone-500 italic pt-2">
              psst — only the host knows the secret name.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  // stages: 'loader' -> 'invitation' -> 'form'
  const [stage, setStage] = useState(() => {
    if (sessionStorage.getItem(SEEN_KEY) === "true") return "form";
    return "loader";
  });

  useEffect(() => {
    if (stage === "loader") {
      const t = setTimeout(() => setStage("invitation"), 1900);
      return () => clearTimeout(t);
    }
  }, [stage]);

  const goToForm = () => {
    sessionStorage.setItem(SEEN_KEY, "true");
    setStage("form");
  };

  if (stage === "loader") return <Loader />;
  if (stage === "invitation") return <Invitation onNext={goToForm} />;
  return <JoinForm />;
}
