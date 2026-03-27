import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Download,
  Globe,
  Mic,
  Phone,
  Play,
  Shield,
  Video,
  WifiOff,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { SiApple, SiGithub, SiGoogleplay, SiX } from "react-icons/si";

interface Props {
  onGetStarted: () => void;
}

const NAV_LINKS = ["Home", "Features", "Download", "Support"];
const NAV_LINKS_2 = ["Library", "Calling", "Pricing", "Blog"];

const FEATURES = [
  {
    icon: WifiOff,
    title: "Works Offline",
    desc: "Save any video and watch without internet",
  },
  {
    icon: Phone,
    title: "Free Calls",
    desc: "HD video calls with zero balance needed",
  },
  {
    icon: Shield,
    title: "Encrypted",
    desc: "End-to-end encryption on all connections",
  },
  {
    icon: Zap,
    title: "Ultra Fast",
    desc: "Optimized streaming with adaptive quality",
  },
];

const VIDEO_CARDS = [
  {
    title: "Ocean Depths",
    duration: "45:22",
    size: "1.2 GB",
    thumb: "/assets/generated/video-thumb-1.dim_320x180.jpg",
  },
  {
    title: "Tech Tutorial: WebRTC",
    duration: "28:14",
    size: "780 MB",
    thumb: "/assets/generated/video-thumb-2.dim_320x180.jpg",
  },
  {
    title: "Mountain Valley",
    duration: "1:12:05",
    size: "2.1 GB",
    thumb: "/assets/generated/video-thumb-3.dim_320x180.jpg",
  },
];

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 5) % 100}%`,
  top: `${(i * 29 + 10) % 100}%`,
  size: (i % 3) * 2 + 4,
  delay: i * 0.5,
  duration: (i % 3) * 2 + 4,
}));

export default function LandingPage({ onGetStarted }: Props) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b border-border"
        style={{
          background: "oklch(0.14 0.032 241 / 0.9)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img
                src="/assets/generated/streamwave-logo-transparent.dim_120x120.png"
                alt="StreamWave"
                className="h-8 w-8"
              />
              <span className="font-display font-bold text-xl text-foreground">
                Stream<span className="text-gradient-teal">Wave</span>
              </span>
            </div>

            {/* Nav */}
            <div className="hidden md:flex flex-col items-center gap-0.5">
              <nav className="flex gap-6">
                {NAV_LINKS.map((link) => (
                  <button
                    type="button"
                    key={link}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors bg-transparent border-0 cursor-pointer"
                    data-ocid={`nav.${link.toLowerCase()}.link`}
                  >
                    {link}
                  </button>
                ))}
              </nav>
              <nav className="flex gap-6">
                {NAV_LINKS_2.map((link) => (
                  <button
                    type="button"
                    key={link}
                    className="text-xs text-muted-foreground hover:text-teal transition-colors bg-transparent border-0 cursor-pointer"
                    data-ocid={`nav.${link.toLowerCase()}.link`}
                  >
                    {link}
                  </button>
                ))}
              </nav>
            </div>

            <Button
              onClick={onGetStarted}
              className="bg-primary text-primary-foreground font-semibold px-5 glow-teal-sm hover:opacity-90"
              data-ocid="nav.download_app.button"
            >
              <Download className="h-4 w-4 mr-2" />
              Download App
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        {/* Particles */}
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              background:
                p.id % 3 === 0
                  ? "oklch(0.82 0.12 196 / 0.7)"
                  : p.id % 3 === 1
                    ? "oklch(0.55 0.22 265 / 0.5)"
                    : "oklch(0.54 0.26 305 / 0.4)",
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}

        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-xs uppercase tracking-widest">
                <WifiOff className="h-3 w-3 mr-1" /> Offline First Platform
              </Badge>
              <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight mb-6">
                Watch Videos.
                <br />
                <span className="text-gradient-teal">Call Anyone.</span>
                <br />
                No Internet Needed.
              </h1>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                StreamWave lets you save any video for offline playback and make
                crystal-clear video calls to anyone — completely free, no data
                charges, no balance required.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={onGetStarted}
                  className="bg-primary text-primary-foreground font-bold px-8 glow-teal animate-pulse-glow"
                  data-ocid="hero.get_started.primary_button"
                >
                  <Play className="h-5 w-5 mr-2" /> Get Started Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border text-foreground hover:bg-secondary"
                  data-ocid="hero.learn_more.secondary_button"
                >
                  <Globe className="h-5 w-5 mr-2" /> Learn More
                </Button>
              </div>
            </motion.div>

            {/* Right: Phone Mockup */}
            <motion.div
              className="relative flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, oklch(0.82 0.12 196 / 0.25) 0%, transparent 70%)",
                    transform: "scale(1.2)",
                    filter: "blur(30px)",
                  }}
                />
                <img
                  src="/assets/generated/phone-mockup.dim_400x600.png"
                  alt="StreamWave App"
                  className="relative z-10 max-h-[520px] object-contain drop-shadow-2xl"
                />
              </div>
              <p className="mt-3 text-muted-foreground text-xs tracking-widest uppercase">
                iPhone 15 Pro
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section: Offline Video Library */}
      <section className="py-20" id="features">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs uppercase tracking-widest text-primary font-semibold">
              Offline Library
            </span>
            <h2 className="font-display text-4xl font-bold mt-2">
              Your Videos, Anywhere
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {VIDEO_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                className="card-glass rounded-xl overflow-hidden group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                data-ocid={`library.item.${i + 1}`}
              >
                <div className="relative">
                  <img
                    src={card.thumb}
                    alt={card.title}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-background/20" />
                  <div className="absolute bottom-2 right-2 bg-background/80 rounded text-xs px-2 py-0.5 font-mono">
                    {card.duration}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-primary/90 rounded-full p-3 glow-teal">
                      <Play className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{card.title}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {card.size}
                    </p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-0 text-xs">
                    <WifiOff className="h-3 w-3 mr-1" /> Offline
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: WebRTC Calling */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs uppercase tracking-widest text-primary font-semibold">
                WebRTC Technology
              </span>
              <h2 className="font-display text-4xl font-bold mt-2 mb-4">
                Call Anyone for Free
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Crystal-clear HD video calls powered by WebRTC. No accounts, no
                bills, no balance needed. Just share a room code and connect
                instantly — even on slow connections.
              </p>
              <Button
                size="lg"
                onClick={onGetStarted}
                className="bg-primary text-primary-foreground font-bold glow-teal-sm"
                data-ocid="calling.start_call.primary_button"
              >
                <Phone className="h-5 w-5 mr-2" /> Start Free Call
              </Button>
            </motion.div>

            {/* Calling mock UI */}
            <motion.div
              className="card-glass rounded-2xl p-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="grid grid-cols-2 gap-3 mb-4">
                {["Alex M.", "Jordan K."].map((name, i) => (
                  <div
                    key={name}
                    className="rounded-xl overflow-hidden relative"
                    style={{ background: "oklch(0.18 0.04 241)" }}
                  >
                    <div
                      className="h-28 flex items-center justify-center"
                      style={{
                        background:
                          i === 0
                            ? "linear-gradient(135deg, oklch(0.22 0.08 196), oklch(0.18 0.06 241))"
                            : "linear-gradient(135deg, oklch(0.20 0.08 265), oklch(0.18 0.06 305))",
                      }}
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                        {name[0]}
                      </div>
                    </div>
                    <p className="text-center text-xs py-1.5 text-muted-foreground">
                      {name}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  type="button"
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Mic className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Video className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center glow-teal-sm hover:opacity-80 transition-opacity"
                >
                  <Phone className="h-5 w-5 text-white rotate-[135deg]" />
                </button>
              </div>
              <p className="text-center text-xs mt-3 text-primary">
                ✓ Free · No Balance · End-to-End Encrypted
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section: Feature Pills */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.h2
            className="font-display text-3xl font-bold text-center mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Everything You Need
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                className="card-glass rounded-xl p-5 text-center hover:border-primary/40 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                data-ocid={`features.item.${i + 1}`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="font-semibold text-sm mb-1">{f.title}</p>
                <p className="text-muted-foreground text-xs">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t border-border mt-8"
        style={{ background: "oklch(0.14 0.032 241)" }}
      >
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img
                  src="/assets/generated/streamwave-logo-transparent.dim_120x120.png"
                  alt="StreamWave"
                  className="h-7 w-7"
                />
                <span className="font-display font-bold text-lg">
                  Stream<span className="text-gradient-teal">Wave</span>
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Offline video playback and free WebRTC calls for everyone,
                everywhere.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-sm mb-3">Company</p>
                {["About", "Blog", "Careers", "Press"].map((l) => (
                  <button
                    type="button"
                    key={l}
                    className="block text-muted-foreground text-sm hover:text-foreground transition-colors mb-1.5 bg-transparent border-0 cursor-pointer p-0"
                  >
                    {l}
                  </button>
                ))}
              </div>
              <div>
                <p className="font-semibold text-sm mb-3">Sitemap</p>
                {["Features", "Download", "Support", "Privacy"].map((l) => (
                  <button
                    type="button"
                    key={l}
                    className="block text-muted-foreground text-sm hover:text-foreground transition-colors mb-1.5 bg-transparent border-0 cursor-pointer p-0"
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Social + App Stores */}
            <div>
              <div className="flex gap-3 mb-5">
                {[
                  { Icon: SiGithub, label: "GitHub" },
                  { Icon: SiX, label: "X" },
                ].map(({ Icon, label }) => (
                  <button
                    type="button"
                    key={label}
                    className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    aria-label={label}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-muted transition-colors text-sm"
                >
                  <SiApple size={16} /> App Store
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-muted transition-colors text-sm"
                >
                  <SiGoogleplay size={16} /> Google Play
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
