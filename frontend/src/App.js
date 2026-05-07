import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { isFirebaseConfigured } from "@/firebase";
import SetupNotice from "@/components/SetupNotice";
import MusicToggle from "@/components/MusicToggle";
import Login from "@/pages/Login";
import Lobby from "@/pages/Lobby";
import Puzzle from "@/pages/Puzzle";
import Waiting from "@/pages/Waiting";
import Reveal from "@/pages/Reveal";
import Admin from "@/pages/Admin";
import AdminPuzzlePreview from "@/pages/AdminPuzzlePreview";

function App() {
  if (!isFirebaseConfigured) {
    return (
      <div className="App paper-grain">
        <SetupNotice />
      </div>
    );
  }
  return (
    <div className="App paper-grain">
      <MusicToggle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/puzzle" element={<Puzzle />} />
          <Route path="/waiting" element={<Waiting />} />
          <Route path="/reveal" element={<Reveal />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/puzzle/:n" element={<AdminPuzzlePreview />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-center" />
    </div>
  );
}

export default App;
