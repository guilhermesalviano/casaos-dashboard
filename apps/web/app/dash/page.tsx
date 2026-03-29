"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/hooks/useDashboard";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RainDrop {
  x: number;
  y: number;
  len: number;
  speed: number;
  alpha: number;
  width: number;
}

// ─── Rain canvas ─────────────────────────────────────────────────────────────

const RainCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropsRef = useRef<RainDrop[]>([]);
  const rafRef = useRef<number>(0);

  const initDrops = useCallback((w: number, h: number) => {
    const count = Math.floor(w * 0.25);
    dropsRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      len: 10 + Math.random() * 18,
      speed: 7 + Math.random() * 10,
      alpha: 0.08 + Math.random() * 0.22,
      width: 0.4 + Math.random() * 0.6,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initDrops(canvas.width, canvas.height);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const d of dropsRef.current) {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.len * 0.2, d.y + d.len);
        ctx.strokeStyle = `rgba(160,200,240,${d.alpha})`;
        ctx.lineWidth = d.width;
        ctx.stroke();
        d.y += d.speed;
        d.x -= d.speed * 0.2;
        if (d.y > canvas.height) { d.y = -d.len; d.x = Math.random() * canvas.width; }
        if (d.x < 0) d.x = canvas.width;
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [initDrops]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};

// ─── Lightning flash ──────────────────────────────────────────────────────────

const LightningFlash: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const schedule = () => {
      const delay = 3000 + Math.random() * 8000;
      setTimeout(() => {
        setVisible(true);
        setTimeout(() => {
          setVisible(false);
          setTimeout(() => {
            setVisible(true);
            setTimeout(() => { setVisible(false); schedule(); }, 120);
          }, 180);
        }, 100);
      }, delay);
    };
    schedule();
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none z-[1] transition-opacity duration-75"
      style={{ background: "rgba(240,240,200,0.035)", opacity: visible ? 1 : 0 }}
    />
  );
};

// ─── Clock ────────────────────────────────────────────────────────────────────

const useClock = () => {
  const [time, setTime] = useState(() => {
    const n = new Date();
    return {
      h: String(n.getHours()).padStart(2, "0"),
      m: String(n.getMinutes()).padStart(2, "0"),
      s: String(n.getSeconds()).padStart(2, "0"),
      day: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][n.getDay()],
      date: n.getDate(),
      month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][n.getMonth()],
      hour: n.getHours(),
    };
  });

  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date();
      setTime({
        h: String(n.getHours()).padStart(2, "0"),
        m: String(n.getMinutes()).padStart(2, "0"),
        s: String(n.getSeconds()).padStart(2, "0"),
        day: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][n.getDay()],
        date: n.getDate(),
        month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][n.getMonth()],
        hour: n.getHours(),
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
};

// ─── Backgrounds ─────────────────────────────────────────────────────────────

function getDayNightBackground(hour: number): string {
  if (hour >= 0 && hour < 5) return "linear-gradient(160deg, #080c14 0%, #060810 60%, #030508 100%)";
  else if (hour < 7) return "linear-gradient(160deg, #0d0c20 0%, #110d22 50%, #09090f 100%)";
  else if (hour < 10) return "linear-gradient(160deg, #2a1a0e 0%, #1a1230 50%, #0b0d18 100%)";
  else if (hour < 17) return "linear-gradient(160deg, #0c1d3a 0%, #0d2040 55%, #081525 100%)";
  else if (hour < 19) return "linear-gradient(160deg, #2a1206 0%, #1a1020 55%, #090b14 100%)";
  else if (hour < 21) return "linear-gradient(160deg, #1a0d1f 0%, #130b1a 55%, #080810 100%)";
  else return "linear-gradient(160deg, #141720 0%, #0b0d11 60%, #080a0e 100%)";
}

function getAtmosphericOverlay(hour: number): string {
  if (hour >= 7 && hour < 10) return "radial-gradient(ellipse 120% 60% at 50% 0%, rgba(180,100,40,0.22) 0%, transparent 70%)";
  else if (hour >= 10 && hour < 17) return "radial-gradient(ellipse 120% 60% at 50% 0%, rgba(40,90,180,0.20) 0%, transparent 70%)";
  else if (hour >= 17 && hour < 19) return "radial-gradient(ellipse 120% 60% at 50% 0%, rgba(200,100,30,0.25) 0%, transparent 70%)";
  else if (hour >= 19 && hour < 20) return "radial-gradient(ellipse 120% 60% at 50% 0%, rgba(120,50,140,0.20) 0%, transparent 70%)";
  else return "radial-gradient(ellipse 120% 60% at 50% 0%, rgba(60,90,140,0.18) 0%, transparent 70%)";
}

// ─── Panel & Label ────────────────────────────────────────────────────────────

const Panel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div
    className={`rounded-2xl border border-white/[0.07] backdrop-blur-sm relative overflow-hidden ${className}`}
    style={{ background: "rgba(255,255,255,0.04)" }}
  >
    {children}
  </div>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-[10px] font-semibold tracking-[0.12em] text-white/30 uppercase">{children}</span>
);

// ─── AI Narrative component ───────────────────────────────────────────────────

interface WeatherData {
  temp: number;
  condition: string;
  city: string;
  state: string;
  code: number;
}

interface AINarrativeProps {
  weather: WeatherData;
  hour: number;
}

type NarrativeState = "idle" | "loading" | "done" | "error";

const AINarrative: React.FC<AINarrativeProps> = ({ weather, hour }) => {
  const [text, setText] = useState("");
  const [state, setState] = useState<NarrativeState>("idle");
  const abortRef = useRef<AbortController | null>(null);
  // const cacheKey = `${weather.city}-${weather.code}-${weather.temp}-${Math.floor(hour / 3)}`;
  // const cacheRef = useRef<Record<string, string>>({});

  const fetchNarrative = useCallback(async () => {
    // if (cacheRef.current[cacheKey]) {
    //   setText(cacheRef.current[cacheKey]);
    //   setState("done");
    //   return;
    // }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState("loading");
    setText("");

    try {
      const res = await fetch("/api/ai/narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weather: {
            city: weather.city,
            state: weather.state,
            temp: weather.temp,
            condition: weather.condition,
          },
          hour,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      const narrative = data.data || "";

      setText(narrative);
      setState("done");
      // cacheRef.current[cacheKey] = narrative;
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setState("error");
      }
    }
  }, [weather, hour]);

  useEffect(() => {
    fetchNarrative();
    return () => abortRef.current?.abort();
  }, []);

  return (
    <div
      className="rounded-xl p-3! flex flex-col gap-2 max-w-sm"
      style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="min-h-[2.8rem] flex items-start">
        {state === "loading" && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/20">Thinking</span>
            <span className="flex gap-[3px]">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="inline-block w-1 h-1 rounded-full bg-white/25"
                  style={{
                    animation: "narrativePulse 1.2s ease-in-out infinite",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </span>            
          </div>
        )}

        {(state === "done") && text && (
          <div className="flex flex-col">
            <div>
              <span className="text-[10px] font-semibold tracking-[0.12em] text-white/30 uppercase">
                Rocky says:
              </span>
              {/* {state === "done" && text && (
                <button
                  onClick={fetchNarrative}
                  className="text-[10px] text-white/20 hover:text-white/50 transition-colors cursor-pointer"
                  title="Regenerate"
                >
                  ↺
                </button>
              )} */}
            </div>
            <p
              className="text-[12px] leading-[1.65] text-white/55 font-light"
              style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
            >
              {text.split("\n").map((line, i) => ( // replace * 
                <span key={i}>
                  {line}
                  {i < text.split("\n").length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>
        )}

        {state === "error" && (
          <p className="text-[11px] text-white/25 italic">
            Sorry, Rocky is offline. &nbsp;
            <button
              onClick={fetchNarrative}
              className="underline hover:text-white/50 transition-colors cursor-pointer">
              Retry
            </button>
          </p>
        )}
      </div>

      <style>{`
        @keyframes narrativePulse {
          0%, 100% { opacity: 0.2; transform: scaleY(1); }
          50% { opacity: 0.7; transform: scaleY(1.4); }
        }
      `}</style>
    </div>
  );
};

// ─── Constants ────────────────────────────────────────────────────────────────

const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 85, 86, 95, 96, 99]);
const isRaining = (code: number) => RAIN_CODES.has(code);

// ─── Main page ────────────────────────────────────────────────────────────────

export default function IdleDashboard() {
  const clock = useClock();
  const router = useRouter();
  const { weather } = useDashboard();
  const [isThundering, setIsThundering] = useState(false);

  const background = getDayNightBackground(clock.hour);
  const atmosphericOverlay = getAtmosphericOverlay(clock.hour);

  const handleClick = useCallback(() => {
    router.push("/");
  }, [router]);

  if (weather.status === "idle" || weather.status === "loading" || weather.status === "error" || !weather.data) return null;

  const w = weather.data;
  const raining = isRaining(w.code);

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden flex flex-col"
      style={{
        background,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        transition: "background 2s ease",
      }}
      onClick={handleClick}
    >
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background: atmosphericOverlay, transition: "background 2s ease" }}
      />

      {raining && <RainCanvas />}
      {isThundering && <LightningFlash />}

      <div className="relative h-screen z-10 flex justify-center items-center gap-10 p-6!">

        <div className="flex flex-col justify-center gap-2 pl-2">
          <div
            className="font-light text-white leading-none"
            style={{ fontSize: "clamp(64px, 8vw, 96px)", letterSpacing: "-4px", fontFamily: "'DM Mono', monospace" }}
          >
            {clock.h}<span className="text-white/20">:</span>{clock.m}
          </div>
          <div className="text-white/40 text-base font-light tracking-wide">
            {clock.day} &nbsp;|&nbsp; {clock.month} {clock.date}
          </div>
        </div>

        <Panel className="p-6! flex flex-col gap-4! min-w-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/40">
              <MapPin size={12} />
              <span className="text-xs">{w.city}, {w.state}</span>
            </div>
            <Label>Live weather</Label>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <div
                className="text-6xl font-light text-white"
                style={{ letterSpacing: "-3px", fontFamily: "'DM Mono', monospace" }}
              >
                {w.temp}°
              </div>
              <div className="text-white/50 text-sm mt-1!">{w.condition}</div>
              {/* <div className="flex items-center gap-1 mt-1!">
                <CloudLightning size={13} className="text-yellow-400" />
                <span className="text-white/30 text-xs">Storm approaching</span>
              </div> */}
            </div>

            <div className="relative w-20 h-20 shrink-0">
              <div className="text-6xl">
                {w.icon}
              </div>
              {/* Cloud SVG */}
              {/* <svg viewBox="0 0 80 80" className="w-full h-full">
                <ellipse cx="44" cy="48" rx="24" ry="13" fill="#7a9bb5" opacity="0.8" />
                <ellipse cx="30" cy="50" rx="16" ry="11" fill="#8daec5" opacity="0.85" />
                <ellipse cx="38" cy="40" rx="18" ry="13" fill="#a8c4d8" />
                <ellipse cx="52" cy="43" rx="14" ry="12" fill="#bcd3e6" />
                <ellipse cx="43" cy="37" rx="13" ry="12" fill="#cde0ed" />
                {/* <polygon points="45,50 38,63 43,61 39,76 50,58 44,60" fill="#f5d44a" opacity="0.95">
                  <animate attributeName="opacity" values="0.95;0.3;0.95;0.3;0.95" dur="4s" repeatCount="indefinite"/>
                </polygon>
              </svg> */}
            </div>
          </div>

          {/* ── AI Narrative ── */}
          <AINarrative weather={w} hour={clock.hour} />
        </Panel>
      </div>
    </div>
  );
}