import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, Phone, Video, WifiOff } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface Props {
  actor: backendInterface | null;
  setInitializing: (v: boolean) => void;
  initializing: boolean;
}

export default function LoginScreen({
  actor,
  setInitializing,
  initializing,
}: Props) {
  const { login, loginStatus, identity } = useInternetIdentity();
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [username, setUsername] = useState("");
  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = async () => {
    await login();
    setShowUsernameDialog(true);
  };

  const handleInitUser = async () => {
    if (!actor || !username.trim()) return;
    setInitializing(true);
    try {
      await actor.initializeUser(username.trim(), null);
      setShowUsernameDialog(false);
      toast.success(`Welcome, ${username}!`);
    } catch {
      toast.error("Failed to initialize user");
    } finally {
      setInitializing(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="card-glass rounded-2xl p-10">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5 glow-teal">
              <img
                src="/assets/generated/streamwave-logo-transparent.dim_120x120.png"
                alt="StreamWave"
                className="h-10 w-10"
              />
            </div>
            <h2 className="font-display text-3xl font-bold mb-2">
              Stream<span className="text-gradient-teal">Wave</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Login to access your offline video library and free calls.
            </p>

            <div className="flex flex-col gap-3 mb-6">
              {[
                { icon: WifiOff, text: "Save videos for offline playback" },
                { icon: Phone, text: "Free WebRTC calls — no balance needed" },
                { icon: Video, text: "HD video quality" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full bg-primary text-primary-foreground font-bold glow-teal"
              data-ocid="login.submit_button"
            >
              {isLoggingIn ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4 mr-2" />
              )}
              {isLoggingIn ? "Connecting..." : "Login"}
            </Button>
          </div>
        </motion.div>
      </div>

      <Dialog
        open={showUsernameDialog && !!identity}
        onOpenChange={setShowUsernameDialog}
      >
        <DialogContent
          className="card-glass border-border"
          data-ocid="login.username.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Choose your username
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. alex_stream"
                className="mt-1.5 bg-secondary border-border"
                data-ocid="login.username.input"
                onKeyDown={(e) => e.key === "Enter" && handleInitUser()}
                autoFocus
              />
            </div>
            <Button
              onClick={handleInitUser}
              disabled={!username.trim() || initializing}
              className="w-full bg-primary text-primary-foreground"
              data-ocid="login.confirm.submit_button"
            >
              {initializing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {initializing ? "Setting up..." : "Continue"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
