import React, { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { startMusic, stopMusic, isMusicPlaying } from "@/sounds";

const KEY = "bp_music_on";

export default function MusicToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === "true") {
      // Browser policy: user gesture required. Will start on next click.
      setOn(true);
    }
  }, []);

  const toggle = () => {
    if (on) {
      stopMusic();
      setOn(false);
      localStorage.setItem(KEY, "false");
    } else {
      startMusic();
      setOn(true);
      localStorage.setItem(KEY, "true");
    }
  };

  return (
    <button
      data-testid="music-toggle"
      onClick={toggle}
      aria-label={on ? "Mute music" : "Play music"}
      className="fixed top-4 right-4 z-50 w-11 h-11 rounded-full bg-white/80 backdrop-blur-md border border-stone-200 shadow-lg hover:scale-105 transition-transform flex items-center justify-center text-stone-700"
    >
      {on ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 opacity-60" />}
    </button>
  );
}
