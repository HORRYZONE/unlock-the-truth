import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ref, onValue, update, set, get } from "firebase/database";
import { database, ROOM_ID, LOBBY_TIMER_SECONDS } from "@/firebase";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Play, RotateCcw, Eye, LogOut, Clock } from "lucide-react";
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
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const isAdmin = localStorage.getItem(ADMIN_KEY) === "true";
    if (!isAdmin) { navigate("/"); return; }
    const unsubP = onValue(ref(database, `rooms/${ROOM_ID}/players`), (s) => setPlayers(s.val() || {}));
    const unsubS = onValue(ref(database, `rooms/${ROOM_ID}/state`), (s) => setState(s.val() || "lobby"));
    const unsubStart = onValue(ref(database, `rooms/${ROOM_ID}/lobbyStartedAt`), (s) => setLobbyStartedAt(s.val()));
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => { unsubP(); unsubS(); unsubStart(); clearInterval(t); };
  }, [navigate]);

  const playersList = Object.values(players).sort((a, b) => a.assignedNumber - b.assignedNumber);
  const remaining = lobbyStartedAt
    ? Math.max(0, LOBBY_TIMER_SECONDS - Math.floor((now - lobbyStartedAt) / 1000))
    : LOBBY_TIMER_SECONDS;
  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");

  const startGame = async () => {
    if (state !== "lobby") return;
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
    await update(ref(database), updates);
    playSuccess();
    toast.success(`Game started with ${list.length} players`);
  };

  // Auto-start when timer hits 0 (admin client triggers)
  useEffect(() => {
    if (remaining === 0 && state === "lobby" && playersList.length > 0) {
      startGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, state, playersList.length]);

  const revokeGame = async () => {
    await update(ref(database, `rooms/${ROOM_ID}`), {
      players: null,
      counter: 0,
      state: "lobby",
      lobbyStartedAt: Date.now(),
      gameStartedAt: null,
      revokedAt: Date.now(),
    });
    playSuccess();
    toast("Game revoked — everyone returns to the door");
  };

  const resetForNewGame = async () => {
    await update(ref(database, `rooms/${ROOM_ID}`), {
      players: null,
      counter: 0,
      state: "lobby",
      lobbyStartedAt: Date.now(),
      gameStartedAt: null,
    });
    toast.success("Fresh lobby ready");
    playSuccess();
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_KEY);
    navigate("/");
  };

  const completed = playersList.filter((p) => p.isCompleted).length;

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 sm:py-12 max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] uppercase tracking-widest cinzel">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin Console
          </div>
          <h1 className="cinzel text-3xl sm:text-5xl font-semibold tracking-tight mt-3" data-testid="admin-title">Unlock the Truth</h1>
          <p className="text-stone-500 text-sm mt-1">Run the game without joining as a player.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={logout} data-testid="admin-logout" className="rounded-full">
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </Button>
        </div>
      </header>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="card-3d border-stone-200">
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-widest text-stone-500 mb-1">State</div>
            <div className="cinzel text-2xl font-semibold capitalize" data-testid="admin-state">{state}</div>
          </CardContent>
        </Card>
        <Card className="card-3d border-stone-200">
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-widest text-stone-500 mb-1">Players</div>
            <div className="cinzel text-2xl font-semibold" data-testid="admin-player-count">{playersList.length} / 12</div>
            <div className="text-xs text-stone-400 mt-1">{completed} solved</div>
          </CardContent>
        </Card>
        <Card className="card-3d border-stone-200">
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-widest text-stone-500 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Auto-start in
            </div>
            <div className="cinzel text-2xl font-semibold mono" data-testid="admin-timer">{mins}:{secs}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-10">
        <Button
          data-testid="admin-start-btn"
          onClick={startGame}
          disabled={state !== "lobby" || playersList.length === 0}
          className="rounded-full bg-stone-900 hover:bg-stone-800 px-6 h-11"
        >
          <Play className="w-4 h-4 mr-2" /> Start the game now
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              data-testid="admin-revoke-btn"
              variant="outline"
              className="rounded-full border-rose-300 text-rose-700 hover:bg-rose-50 h-11"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Revoke
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent data-testid="admin-revoke-dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Send everyone back to the door?</AlertDialogTitle>
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

        {state === "finished" && (
          <Button data-testid="admin-reset-btn" variant="outline" onClick={resetForNewGame} className="rounded-full h-11">
            New round
          </Button>
        )}

        <Link to="/reveal" className="ml-auto">
          <Button variant="ghost" className="rounded-full">View reveal →</Button>
        </Link>
      </div>

      {/* Players list */}
      <section className="mb-12">
        <h2 className="cinzel text-xl font-medium mb-4">Players in the room</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {playersList.map((p) => (
            <div key={p.playerId}
              data-testid={`admin-player-${p.assignedNumber}`}
              className={`rounded-xl bg-white border p-3 sm:p-4 card-3d ${p.isCompleted ? "border-emerald-300" : "border-stone-200"}`}>
              <div className="text-[10px] mono text-stone-500">#{String(p.assignedNumber).padStart(2,"0")}</div>
              <div className="text-base font-medium truncate">{p.username}</div>
              <div className={`text-xs mt-1 ${p.isCompleted ? "text-emerald-700" : "text-stone-400"}`}>
                {p.isCompleted ? "✓ solved" : "still solving"}
              </div>
            </div>
          ))}
          {playersList.length === 0 && (
            <div className="col-span-full text-stone-500 italic text-sm">No players have joined yet.</div>
          )}
        </div>
      </section>

      {/* Puzzle preview grid */}
      <section>
        <h2 className="cinzel text-xl font-medium mb-1">Browse all 12 puzzles</h2>
        <p className="text-sm text-stone-500 mb-4">Tap a puzzle to preview the experience your players will see.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" data-testid="admin-puzzle-grid">
          {Object.values(PUZZLE_META).map((m) => (
            <Link key={m.id} to={`/admin/puzzle/${m.id}`} data-testid={`admin-puzzle-link-${m.id}`}>
              <div className="rounded-xl bg-white border border-stone-200 p-4 card-3d hover:border-amber-400 transition-colors h-full">
                <div className="text-[10px] mono text-stone-500">#{String(m.id).padStart(2,"0")}</div>
                <div className="cinzel text-base font-medium mt-1">{m.title}</div>
                <div className="text-xs text-stone-400 mt-1">{m.subtitle.split("/")[1]?.trim()}</div>
                <div className="text-xs text-amber-700 mt-3 inline-flex items-center gap-1"><Eye className="w-3 h-3" /> Preview</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
