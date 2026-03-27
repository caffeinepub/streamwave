import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Copy,
  Loader2,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend.d";

type CallState = "idle" | "creating" | "waiting" | "joining" | "incall";

interface Props {
  actor: backendInterface | null;
}

export default function CallsSection({ actor }: Props) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [roomId, setRoomId] = useState<bigint | null>(null);
  const [joinRoomId, setJoinRoomId] = useState("");
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      for (const t of localStreamRef.current.getTracks()) {
        t.stop();
      }
      localStreamRef.current = null;
    }
  };

  const getLocalStream = async (): Promise<MediaStream> => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  };

  const createPC = (stream: MediaStream): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    for (const t of stream.getTracks()) {
      pc.addTrack(t, stream);
    }
    pc.ontrack = (e) => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };
    pcRef.current = pc;
    return pc;
  };

  const handleCreateRoom = async () => {
    if (!actor) return toast.error("Not connected to backend");
    setCallState("creating");
    try {
      const rid = await actor.createRoom();
      setRoomId(rid);
      const stream = await getLocalStream();
      const pc = createPC(stream);

      pc.onicecandidate = async (e) => {
        if (e.candidate && actor) {
          await actor.postIceCandidate(rid, JSON.stringify(e.candidate));
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await actor.postSdpOffer(rid, JSON.stringify(offer));

      setCallState("waiting");
      toast.success(`Room created! Share ID: ${rid}`);

      pollingRef.current = setInterval(async () => {
        if (!actor) return;
        try {
          const [answerStr, candidates] = await Promise.all([
            actor.getSdpAnswer(rid),
            actor.getIceCandidates(rid),
          ]);

          if (answerStr && pc.remoteDescription === null) {
            const answer = JSON.parse(answerStr);
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            setCallState("incall");
          }

          if (candidates && pc.remoteDescription !== null) {
            for (const cStr of candidates) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(cStr)));
              } catch {
                // ignore duplicate candidates
              }
            }
          }
        } catch {
          // polling errors are non-fatal
        }
      }, 2000);
    } catch (e) {
      toast.error(
        `Failed to create room: ${e instanceof Error ? e.message : "error"}`,
      );
      setCallState("idle");
      cleanup();
    }
  };

  const handleJoinRoom = async () => {
    if (!actor) return toast.error("Not connected to backend");
    if (!joinRoomId.trim()) return toast.error("Enter a room ID");
    setCallState("joining");
    const rid = BigInt(joinRoomId.trim());
    try {
      const stream = await getLocalStream();
      const pc = createPC(stream);

      pc.onicecandidate = async (e) => {
        if (e.candidate && actor) {
          await actor.postIceCandidate(rid, JSON.stringify(e.candidate));
        }
      };

      const offerStr = await actor.getSdpOffer(rid);
      if (!offerStr) throw new Error("No offer found for this room");

      const offer = JSON.parse(offerStr);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await actor.postSdpAnswer(rid, JSON.stringify(answer));

      setRoomId(rid);
      setCallState("incall");
      toast.success("Joined the call!");

      pollingRef.current = setInterval(async () => {
        if (!actor) return;
        try {
          const candidates = await actor.getIceCandidates(rid);
          if (candidates) {
            for (const cStr of candidates) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(cStr)));
              } catch {
                // ignore
              }
            }
          }
        } catch {
          // non-fatal
        }
      }, 2000);
    } catch (e) {
      toast.error(
        `Failed to join: ${e instanceof Error ? e.message : "error"}`,
      );
      setCallState("idle");
      cleanup();
    }
  };

  const handleEndCall = () => {
    cleanup();
    setCallState("idle");
    setRoomId(null);
    setJoinRoomId("");
    toast.success("Call ended");
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      for (const t of localStreamRef.current.getAudioTracks()) {
        t.enabled = muted;
      }
    }
    setMuted((prev) => !prev);
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      for (const t of localStreamRef.current.getVideoTracks()) {
        t.enabled = cameraOff;
      }
    }
    setCameraOff((prev) => !prev);
  };

  const copyRoomId = () => {
    if (roomId !== null) {
      navigator.clipboard.writeText(roomId.toString());
      toast.success("Room ID copied!");
    }
  };

  if (callState === "incall" || callState === "waiting") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            {callState === "waiting" ? "Waiting for caller..." : "In Call"}
          </h2>
          {roomId !== null && (
            <Badge className="bg-secondary text-foreground border-border flex items-center gap-2">
              Room: {roomId.toString()}
              <button type="button" onClick={copyRoomId}>
                <Copy className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>

        <Badge className="bg-primary/10 text-primary border-0">
          ✓ Free · No Balance Needed · WebRTC Encrypted
        </Badge>

        <div className="relative">
          <div
            className="card-glass rounded-2xl overflow-hidden"
            style={{ minHeight: 360 }}
          >
            {/* biome-ignore lint/a11y/useMediaCaption: WebRTC live stream, captions not applicable */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-80 object-cover"
              data-ocid="calls.remote.canvas_target"
            />
            {callState === "waiting" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Waiting for other participant...
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-4 right-4 w-32 rounded-xl overflow-hidden border border-border glow-teal-sm">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-20 object-cover"
              data-ocid="calls.local.canvas_target"
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2">
          <Button
            variant="outline"
            size="lg"
            onClick={toggleMute}
            className="rounded-full w-14 h-14 border-border"
            data-ocid="calls.mute.toggle"
          >
            {muted ? (
              <MicOff className="h-5 w-5 text-destructive" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={toggleCamera}
            className="rounded-full w-14 h-14 border-border"
            data-ocid="calls.camera.toggle"
          >
            {cameraOff ? (
              <VideoOff className="h-5 w-5 text-destructive" />
            ) : (
              <Video className="h-5 w-5" />
            )}
          </Button>
          <Button
            size="lg"
            onClick={handleEndCall}
            className="rounded-full w-16 h-16 bg-destructive hover:bg-destructive/80"
            data-ocid="calls.end_call.delete_button"
          >
            <PhoneOff className="h-6 w-6 text-white" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-2xl font-bold">Free Calls</h2>
        <Badge className="bg-primary/10 text-primary border-0">
          ✓ Free · No Balance · WebRTC
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-card border-border h-full">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">
                Create a Room
              </h3>
              <p className="text-muted-foreground text-sm mb-6 flex-1">
                Start a new call and share the room ID with whoever you want to
                talk to.
              </p>
              <Button
                onClick={handleCreateRoom}
                disabled={callState === "creating" || !actor}
                className="bg-primary text-primary-foreground font-bold glow-teal-sm w-full"
                data-ocid="calls.create_room.primary_button"
              >
                {callState === "creating" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Phone className="h-4 w-4 mr-2" />
                )}
                {callState === "creating" ? "Creating..." : "Create Room"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="bg-card border-border h-full">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">
                Join a Room
              </h3>
              <p className="text-muted-foreground text-sm mb-4 flex-1">
                Enter the room ID shared by the person you want to call.
              </p>
              <div className="space-y-3">
                <div>
                  <Label
                    htmlFor="room-id"
                    className="text-muted-foreground text-sm mb-1.5 block"
                  >
                    Room ID
                  </Label>
                  <Input
                    id="room-id"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    placeholder="e.g. 12345"
                    className="bg-secondary border-border"
                    data-ocid="calls.room_id.input"
                    onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                  />
                </div>
                <Button
                  onClick={handleJoinRoom}
                  disabled={
                    callState === "joining" || !joinRoomId.trim() || !actor
                  }
                  variant="outline"
                  className="border-primary/40 text-primary hover:bg-primary/10 w-full"
                  data-ocid="calls.join_room.secondary_button"
                >
                  {callState === "joining" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Phone className="h-4 w-4 mr-2" />
                  )}
                  {callState === "joining" ? "Joining..." : "Join Room"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="card-glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4 text-sm">How it works</h3>
        <ol className="space-y-2">
          {[
            "Create a room — you'll get a unique Room ID",
            "Share the Room ID with the person you want to call",
            "They enter the ID and join — call starts instantly",
            "100% free, no phone number, no balance needed",
          ].map((step, i) => (
            <li
              key={step}
              className="flex items-start gap-3 text-sm text-muted-foreground"
            >
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
