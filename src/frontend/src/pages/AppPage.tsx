import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, LogOut, Phone, User, Video, WifiOff } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import CallsSection from "../components/CallsSection";
import LoginScreen from "../components/LoginScreen";
import VideoLibrary from "../components/VideoLibrary";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface Props {
  onBack: () => void;
}

export default function AppPage({ onBack }: Props) {
  const { identity, clear } = useInternetIdentity();
  const { actor } = useActor();
  const [initializing, setInitializing] = useState(false);

  const isLoggedIn = !!identity;
  const principal = identity?.getPrincipal().toString();

  const handleLogout = () => {
    clear();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* App Header */}
      <header
        className="border-b border-border px-6 py-3 flex items-center justify-between"
        style={{
          background: "oklch(0.14 0.032 241 / 0.95)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
            data-ocid="app.back.button"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/streamwave-logo-transparent.dim_120x120.png"
              alt="StreamWave"
              className="h-7 w-7"
            />
            <span className="font-display font-bold text-lg">
              Stream<span className="text-gradient-teal">Wave</span>
            </span>
          </div>
          <Badge className="bg-primary/10 text-primary border-0 text-xs hidden sm:flex">
            <WifiOff className="h-3 w-3 mr-1" /> Offline Ready
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <>
              <span className="text-muted-foreground text-xs hidden sm:inline truncate max-w-[120px]">
                {principal?.slice(0, 10)}…
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
                data-ocid="app.logout.button"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 py-8">
        {!isLoggedIn ? (
          <LoginScreen
            actor={actor}
            setInitializing={setInitializing}
            initializing={initializing}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Tabs defaultValue="videos" className="w-full">
              <TabsList className="mb-6 bg-secondary" data-ocid="app.tabs.tab">
                <TabsTrigger value="videos" data-ocid="app.videos.tab">
                  <Video className="h-4 w-4 mr-2" /> Videos
                </TabsTrigger>
                <TabsTrigger value="calls" data-ocid="app.calls.tab">
                  <Phone className="h-4 w-4 mr-2" /> Free Calls
                </TabsTrigger>
              </TabsList>

              <TabsContent value="videos">
                <VideoLibrary actor={actor} />
              </TabsContent>

              <TabsContent value="calls">
                <CallsSection actor={actor} />
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </main>
    </div>
  );
}
