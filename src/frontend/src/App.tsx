import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AppPage from "./pages/AppPage";
import LandingPage from "./pages/LandingPage";

export type AppView = "landing" | "app";

export default function App() {
  const [view, setView] = useState<AppView>("landing");

  return (
    <div className="min-h-screen bg-background font-body">
      {view === "landing" ? (
        <LandingPage onGetStarted={() => setView("app")} />
      ) : (
        <AppPage onBack={() => setView("landing")} />
      )}
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
}
