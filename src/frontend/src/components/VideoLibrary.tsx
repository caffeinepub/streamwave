import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  Loader2,
  Play,
  Trash2,
  Video,
  WifiOff,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend.d";

const DB_NAME = "streamwave-videos";
const STORE_NAME = "videos";

interface SavedVideo {
  title: string;
  url: string;
  size: number;
  blob: Blob;
  savedAt: number;
}

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: "title" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAllVideos(): Promise<SavedVideo[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result as SavedVideo[]);
    req.onerror = () => reject(req.error);
  });
}

async function saveVideoDB(video: SavedVideo): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).put(video);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function deleteVideoDB(title: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).delete(title);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

interface Props {
  actor: backendInterface | null;
}

export default function VideoLibrary({ actor }: Props) {
  const [videos, setVideos] = useState<SavedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<SavedVideo | null>(null);
  const [objectUrls, setObjectUrls] = useState<Map<string, string>>(new Map());
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    getAllVideos().then((vs) => {
      setVideos(vs);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const newMap = new Map<string, string>();
    for (const v of videos) {
      const objUrl = URL.createObjectURL(v.blob);
      newMap.set(v.title, objUrl);
    }
    setObjectUrls(newMap);
    return () => {
      for (const u of newMap.values()) {
        URL.revokeObjectURL(u);
      }
    };
  }, [videos]);

  const handleSave = async () => {
    if (!url.trim() || !title.trim()) {
      toast.error("Enter both a title and URL");
      return;
    }
    setDownloading(true);
    setProgress(0);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch video");
      const reader = response.body?.getReader();
      const contentLength = Number(response.headers.get("Content-Length") || 0);
      const chunks: Uint8Array<ArrayBuffer>[] = [];
      let received = 0;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          if (contentLength > 0) {
            setProgress(Math.round((received / contentLength) * 100));
          } else {
            setProgress((prev) => Math.min(prev + 5, 90));
          }
        }
      }

      const blob = new Blob(chunks);
      const savedVideo: SavedVideo = {
        title: title.trim(),
        url,
        size: blob.size,
        blob,
        savedAt: Date.now(),
      };

      await saveVideoDB(savedVideo);

      if (actor) {
        try {
          await actor.addVideo(title.trim(), url, BigInt(blob.size));
        } catch {
          // Non-critical
        }
      }

      setProgress(100);
      setVideos((prev) => [
        ...prev.filter((v) => v.title !== title.trim()),
        savedVideo,
      ]);
      setUrl("");
      setTitle("");
      toast.success(`"${title}" saved for offline viewing!`);
    } catch (e) {
      toast.error(
        `Download failed: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };

  const handleDelete = async (v: SavedVideo) => {
    await deleteVideoDB(v.title);
    if (actor) {
      try {
        await actor.deleteVideo(v.title);
      } catch {
        // Non-critical
      }
    }
    setVideos((prev) => prev.filter((x) => x.title !== v.title));
    if (playingVideo?.title === v.title) setPlayingVideo(null);
    toast.success(`"${v.title}" deleted`);
  };

  return (
    <div className="space-y-8">
      {/* Add Video */}
      <div className="card-glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Save Video for Offline
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <Label
              htmlFor="video-title"
              className="text-muted-foreground text-sm mb-1.5 block"
            >
              Title
            </Label>
            <Input
              id="video-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ocean Documentary"
              className="bg-secondary border-border"
              data-ocid="videos.title.input"
            />
          </div>
          <div>
            <Label
              htmlFor="video-url"
              className="text-muted-foreground text-sm mb-1.5 block"
            >
              Video URL
            </Label>
            <Input
              id="video-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
              className="bg-secondary border-border"
              data-ocid="videos.url.input"
            />
          </div>
        </div>

        {downloading && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Downloading...</span>
              <span className="text-primary font-mono">{progress}%</span>
            </div>
            <Progress
              value={progress}
              className="h-2"
              data-ocid="videos.download.loading_state"
            />
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={downloading || !url.trim() || !title.trim()}
          className="bg-primary text-primary-foreground font-bold glow-teal-sm w-full sm:w-auto"
          data-ocid="videos.save.primary_button"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {downloading ? "Saving..." : "Save for Offline"}
        </Button>
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {playingVideo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPlayingVideo(null)}
            data-ocid="videos.player.modal"
          >
            <motion.div
              className="relative w-full max-w-4xl mx-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-10 right-0 text-white"
                onClick={() => setPlayingVideo(null)}
                data-ocid="videos.player.close_button"
              >
                <X className="h-5 w-5 mr-1" /> Close
              </Button>
              {/* biome-ignore lint/a11y/useMediaCaption: offline video player, captions not available */}
              <video
                ref={videoRef}
                src={objectUrls.get(playingVideo.title)}
                controls
                autoPlay
                className="w-full rounded-xl"
              />
              <p className="text-center text-sm text-muted-foreground mt-3">
                {playingVideo.title} · {formatBytes(playingVideo.size)}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <WifiOff className="h-5 w-5 text-primary" />
            Offline Library
          </h2>
          <Badge className="bg-primary/10 text-primary border-0">
            {videos.length} video{videos.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        {loading ? (
          <div
            className="flex items-center justify-center py-16"
            data-ocid="videos.library.loading_state"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : videos.length === 0 ? (
          <div
            className="card-glass rounded-2xl flex flex-col items-center justify-center py-16 text-center"
            data-ocid="videos.library.empty_state"
          >
            <Video className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="font-semibold mb-1">No videos saved yet</p>
            <p className="text-muted-foreground text-sm">
              Enter a video URL above and save it for offline playback.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {videos.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  data-ocid={`videos.item.${i + 1}`}
                >
                  <Card className="bg-card border-border overflow-hidden group">
                    <CardContent className="p-0">
                      <button
                        type="button"
                        className="h-36 w-full flex items-center justify-center relative cursor-pointer border-0 bg-transparent p-0"
                        style={{
                          background:
                            "linear-gradient(135deg, oklch(0.18 0.05 196), oklch(0.16 0.04 241))",
                        }}
                        onClick={() => setPlayingVideo(v)}
                        aria-label={`Play ${v.title}`}
                      >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-primary/90 rounded-full p-3 glow-teal">
                            <Play className="h-6 w-6 text-primary-foreground" />
                          </div>
                        </div>
                        <Video className="h-10 w-10 text-primary/40" />
                      </button>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-semibold text-sm truncate">
                            {v.title}
                          </p>
                          <Badge className="bg-primary/10 text-primary border-0 text-xs flex-shrink-0">
                            <WifiOff className="h-2.5 w-2.5 mr-1" /> Offline
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs mb-3">
                          {formatBytes(v.size)}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setPlayingVideo(v)}
                            className="flex-1 bg-primary text-primary-foreground text-xs"
                            data-ocid={`videos.play.button.${i + 1}`}
                          >
                            <Play className="h-3 w-3 mr-1" /> Play
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(v)}
                            className="border-destructive/50 text-destructive hover:bg-destructive/10"
                            data-ocid={`videos.delete_button.${i + 1}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
