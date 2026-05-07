import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ref, onValue, update, get } from "firebase/database";
import { database, ROOM_ID, LOBBY_TIMER_SECONDS } from "@/firebase";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Play, RotateCcw, Eye, LogOut, Clock, Pause, Play as ResumeIcon, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getFragmentsForCount } from "@/data/messageFragments";
import { PUZZLE_META } from "@/data/puzzles";
import { playClick, playSuccess, playError } from "@/sounds";

const ADMIN_KEY = "bp_isAdmin";

export default function Admin() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState({});
  const [state, setState] = useState("lobby");
  const [lobbyStartedAt, setLobbyStartedAt] = useState(null);
  const [timerPaused, setTimerPaused] = useState(false);
  const [frozenRemaining, setFrozenRemaining] = useState(LOBBY_TIMER_SECONDS);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const isAdmin = localStorage.getItem(ADMIN_KEY) === "true";
    if (!isAdmin) { navigate("/"); return; }
    const u1 = onValue(ref(database, `rooms/${ROOM_ID}/players`), (s) => setPlayers(s.val() || {}));
    const u2 = onValue(ref(database, `rooms/${ROOM_ID}/state`), (s) => setState(s.val() || "lobby"));
    const u3 = onValue(ref(database, `rooms/${ROOM_ID}/lobbyStartedAt`), (s) => setLobbyStartedAt(s.val()));
    const u4 = onValue(ref(database, `rooms/${ROOM_ID}/timerPaused`), (s) => setTimerPaused(Boolean(s.val())));
    const u5 = onValue(ref(database, `rooms/${ROOM_ID}/frozenRemaining`), (s) => {
      const v = s.val();
      setFrozenRemaining(typeof v === "number" ? v : LOBBY_TIMER_SECONDS);
    });
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => { u1(); u2(); u3(); u4(); u5(); clearInterval(t); };
  }, [navigate]);

  const playersList = Object.values(players).sort((a, b) => a.assignedNumber - b.assignedNumber);
  const liveRemaining = lobbyStartedAt
    ? Math.max(0, LOBBY_TIMER_SECONDS - Math.floor((now - lobbyStartedAt) / 1000))
    : LOBBY_TIMER_SECONDS;
  const remaining = timerPaused ? frozenRemaining : liveRemaining;
  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");

  const startGame = async () => {
    if (state !== "lobby") return;
    playClick();
    const snap = await get(ref(database, `rooms/${ROOM_ID}/players`));
    const list = Object.values(snap.val() || {}).sort((a, b) => a.assignedNumber - b.assignedNumber);
    if (list.length === 0) {
      toast.error("No players yet");
      playError();
      return;
    }
    const fragments = getFragmentsForCount(list.length);
    const updates = {};
    list.forEach((p, i) => {
      updates[`rooms/${ROOM_ID}/players/${p.playerId}/assignedFragment`] = fragments[i] || "";
    });
    updates[`rooms/${ROOM_ID}/state`] = "playing";
    updates[`rooms/${ROOM_ID}/gameStartedAt`] = Date.now();
    updates[`rooms/${ROOM_ID}/timerPaused`] = false;
    await update(ref(database), updates);
    playSuccess();
    toast.success(`Game started with ${list.length} players`);
  };

  // Auto-start when timer hits 0 (admin client triggers; respects pause)
  useEffect(() => {
    if (timerPaused) return;
    if (liveRemaining === 0 && state === "lobby" && playersList.length > 0) {
      startGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveRemaining, state, playersList.length, timerPaused]);

  const pauseTimer = async () => {
    playClick();
    await update(ref(database, `rooms/${ROOM_ID}`), {
      timerPaused: true,
      frozenRemaining: liveRemaining,
    });
    toast("Timer paused");
  };

  const resumeTimer = async () => {
    playClick();
    const newStart = Date.now() - (LOBBY_TIMER_SECONDS - frozenRemaining) * 1000;
    await update(ref(database, `rooms/${ROOM_ID}`), {
      timerPaused: false,
      lobbyStartedAt: newStart,
    });
    toast.success("Timer resumed");
  };

  const resetTimer = async () => {
    playClick();
    await update(ref(database, `rooms/${ROOM_ID}`), {
      timerPaused: false,
      lobbyStartedAt: Date.now(),
      frozenRemaining: LOBBY_TIMER_SECONDS,
    });
    toast.success("Timer reset to 5:00");
  };

  const revokeGame = async () => {
    await update(ref(database, `rooms/${ROOM_ID}`), {
      players: null,
      counter: 0,
      state: "lobby",
      lobbyStartedAt: Date.now(),
      gameStartedAt: null,
      timerPaused: false,
      frozenRemaining: LOBBY_TIMER_SECONDS,
      revokedAt: Date.now(),
    });
    playSuccess();
    toast("Game revoked — everyone returns to the door");
  };

  const resetForNewGame = async () => {
    playClick();
    await update(ref(database, `rooms/${ROOM_ID}`), {
      players: null,
      counter: 0,
      state: "lobby",
      lobbyStartedAt: Date.now(),
      gameStartedAt: null,
      timerPaused: false,
      frozenRemaining: LOBBY_TIMER_SECONDS,
    });
    toast.success("Fresh lobby ready");
    playSuccess();
  };

  const logout = () => {
    playClick();
    localStorage.removeItem(ADMIN_KEY);
    navigate("/");
  };

  const completed = playersList.filter((p) => p.isCompleted).length;

  return (
    <div className="min-h-screen bg-stage grain px-4 sm:px-6 py-8 sm:py-12 max-w-5xl mx-auto relative">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-[10px] uppercase tracking-[0.3em] italiana border border-amber-500/30">
            <ShieldCheck className="w-3 h-3" /> Admin Console
          </div>
          <h1 className="display text-3xl sm:text-5xl font-medium tracking-tight mt-3 text-amber-50" data-testid="admin-title">
            Unlock <span className="italic shimmer-gold">the Truth</span>
          </h1>
          <p className="text-stone-400 text-sm mt-1">Run the game without joining as a player.</p>
        </div>
        <Button variant="outline" onClick={logout} data-testid="admin-logout" className="rounded-full border-amber-500/30 text-amber-200 hover:bg-amber-500/10">
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </Button>
      </header>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="glass-card border-amber-500/20">
          <CardContent className="p-5">
            <div className="text-[10px] uppercase tracking-[0.3em] text-amber-300/70 mb-1">State</div>
            <div className="display text-2xl font-medium capitalize text-amber-50" data-testid="admin-state">{state}</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-amber-500/20">
          <CardContent className="p-5">
            <div className="text-[10px] uppercase tracking-[0.3em] text-amber-300/70 mb-1">Players</div>
            <div className="display text-2xl font-medium text-amber-50" data-testid="admin-player-count">{playersList.length} / 12</div>
            <div className="text-xs text-stone-400 mt-1">{completed} solved</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-amber-500/20">
          <CardContent className="p-5">
            <div className="text-[10px] uppercase tracking-[0.3em] text-amber-300/70 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {timerPaused ? "Paused" : "Auto-start in"}
            </div>
            <div className={`display text-2xl font-medium mono ${timerPaused ? "text-stone-400" : "text-amber-50"}`} data-testid="admin-timer">
              {mins}:{secs}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button data-testid="admin-start-btn" onClick={startGame}
          disabled={state !== "lobby" || playersList.length === 0}
          className="btn-maroon rounded-full px-6 h-11">
          <Play className="w-4 h-4 mr-2" /> Start the game
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button data-testid="admin-revoke-btn" variant="outline"
              className="rounded-full border-rose-400/40 text-rose-200 hover:bg-rose-500/10 h-11">
              <RotateCcw className="w-4 h-4 mr-2" /> Revoke
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent data-testid="admin-revoke-dialog" className="bg-stone-950 border-amber-500/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-amber-50">Send everyone back to the door?</AlertDialogTitle>
              <AlertDialogDescription>
                This wipes all players and resets the room. Use this if someone is stuck.
                Everyone needs to rejoin. <strong>This cannot be undone.</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="admin-revoke-cancel">Never mind</AlertDialogCancel>
              <AlertDialogAction data-testid="admin-revoke-confirm" onClick={revokeGame} className="bg-rose-700 hover:bg-rose-800">
                Yes, revoke
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button data-testid="admin-reset-btn" variant="outline"
              className="rounded-full border-amber-500/30 text-amber-200 hover:bg-amber-500/10 h-11">
              <RefreshCw className="w-4 h-4 mr-2" /> Reset room
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent data-testid="admin-reset-dialog" className="bg-stone-950 border-amber-500/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-amber-50">Reset for a new round?</AlertDialogTitle>
              <AlertDialogDescription>
                Clears all players and the timer, ready for a fresh game.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="admin-reset-cancel">Never mind</AlertDialogCancel>
              <AlertDialogAction data-testid="admin-reset-confirm" onClick={resetForNewGame} className="btn-maroon">
                Yes, reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Link to="/reveal" className="ml-auto">
          <Button variant="ghost" className="rounded-full text-amber-200 hover:bg-amber-500/10">View reveal →</Button>
        </Link>
      </div>

      {/* Timer controls */}
      <div className="flex flex-wrap gap-3 mb-10 text-sm" data-testid="admin-timer-controls">
        {!timerPaused ? (
          <Button data-testid="admin-pause-timer" onClick={pauseTimer} variant="outline"
            className="rounded-full border-amber-500/30 text-amber-200 hover:bg-amber-500/10 h-10"
            disabled={state !== "lobby"}>
            <Pause className="w-4 h-4 mr-2" /> Stop timer
          </Button>
        ) : (
          <Button data-testid="admin-resume-timer" onClick={resumeTimer}
            className="btn-maroon rounded-full h-10" disabled={state !== "lobby"}>
            <ResumeIcon className="w-4 h-4 mr-2" /> Resume timer
          </Button>
        )}
        <Button data-testid="admin-reset-timer" onClick={resetTimer} variant="outline"
          className="rounded-full border-stone-600 text-stone-300 hover:bg-stone-800 h-10"
          disabled={state !== "lobby"}>
          <RefreshCw className="w-4 h-4 mr-2" /> Reset timer to 5:00
        </Button>
      </div>

      <section className="mb-12">
        <h2 className="display text-xl font-medium mb-4 text-amber-100">Players in the room</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {playersList.map((p) => (
            <div key={p.playerId} data-testid={`admin-player-${p.assignedNumber}`}
              className={`rounded-xl glass-card p-3 sm:p-4 card-3d ${p.isCompleted ? "border-emerald-500/40" : ""}`}>
              <div className="text-[10px] mono text-amber-400/70">#{String(p.assignedNumber).padStart(2,"0")}</div>
              <div className="text-base font-medium truncate text-amber-50">{p.username}</div>
              <div className={`text-xs mt-1 ${p.isCompleted ? "text-emerald-400" : "text-stone-400"}`}>
                {p.isCompleted ? "✓ solved" : "still solving"}
              </div>
            </div>
          ))}
          {playersList.length === 0 && (
            <div className="col-span-full text-stone-400 italic text-sm">No players have joined yet.</div>
          )}
        </div>
      </section>

      <section>
        <h2 className="display text-xl font-medium mb-1 text-amber-100">Browse all 12 puzzles</h2>
        <p className="text-sm text-stone-400 mb-4">Tap a puzzle to preview the experience your players will see.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" data-testid="admin-puzzle-grid">
          {Object.values(PUZZLE_META).map((m) => (
            <Link key={m.id} to={`/admin/puzzle/${m.id}`} data-testid={`admin-puzzle-link-${m.id}`}>
              <div className="rounded-xl glass-card p-4 card-3d hover:border-amber-400/60 transition-colors h-full">
                <div className="text-[10px] mono text-amber-400/70">#{String(m.id).padStart(2,"0")}</div>
                <div className="display text-base font-medium mt-1 text-amber-50">{m.title}</div>
                <div className="text-xs text-stone-400 mt-1">{m.subtitle.split("/")[1]?.trim()}</div>
                <div className="text-xs text-amber-300 mt-3 inline-flex items-center gap-1"><Eye className="w-3 h-3" /> Preview</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
