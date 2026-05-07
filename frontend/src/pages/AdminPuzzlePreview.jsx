import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PUZZLE_META } from "@/data/puzzles";
import PUZZLE_COMPONENTS from "@/puzzles";
import { toast } from "sonner";

const ADMIN_KEY = "bp_isAdmin";

export default function AdminPuzzlePreview() {
  const { n } = useParams();
  const navigate = useNavigate();
  const num = parseInt(n, 10);
  const meta = PUZZLE_META[num];
  const PuzzleComponent = PUZZLE_COMPONENTS[num];

  React.useEffect(() => {
    const isAdmin = localStorage.getItem(ADMIN_KEY) === "true";
    if (!isAdmin) navigate("/");
  }, [navigate]);

  if (!meta || !PuzzleComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-500">
        Puzzle not found.
        <Link to="/admin" className="ml-3 underline">Back</Link>
      </div>
    );
  }

  const onSolve = () => {
    toast.success("Solved (preview only)");
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin">
          <Button variant="ghost" size="sm" className="rounded-full" data-testid="admin-back">
            <ArrowLeft className="w-4 h-4 mr-1" /> Admin
          </Button>
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] uppercase tracking-widest cinzel">
          <Eye className="w-3.5 h-3.5" /> Preview
        </div>
      </div>
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-500 mb-2 mono">{meta.subtitle}</p>
        <h1 className="cinzel text-3xl sm:text-4xl font-semibold tracking-tight">{meta.title}</h1>
      </header>
      <PuzzleComponent onSolve={onSolve} username="Admin" assignedNumber={num} />
      <div className="mt-8 flex flex-wrap gap-2 justify-center">
        {Object.values(PUZZLE_META).map((m) => (
          <Link key={m.id} to={`/admin/puzzle/${m.id}`}>
            <Button
              size="sm"
              variant={m.id === num ? "default" : "outline"}
              className="rounded-full mono"
              data-testid={`admin-puzzle-quick-${m.id}`}
            >
              #{String(m.id).padStart(2,"0")}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
