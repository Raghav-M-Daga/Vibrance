import React from "react";

interface SplatterProps {
  x: number;
  y: number;
  colorHsl: string; // H S L string
  durationMs?: number; // lifespan before it fades out
}

// A small splatter with a few dripping dots that fades out
const Splatter: React.FC<SplatterProps> = ({ x, y, colorHsl, durationMs = 1400 }) => {
  const styleVars = {
    "--splatter-hsl": colorHsl,
  } as React.CSSProperties & Record<string, string>;

  // A bit of randomness per mount for organic look
  const mainSize = Math.round(28 + Math.random() * 20); // 28-48px
  const dropCount = 3 + Math.floor(Math.random() * 2); // 3-4 drops
  const drops = Array.from({ length: dropCount }, (_, i) => ({
    key: i,
    left: Math.round(-14 + Math.random() * 28), // -14..14 px
    top: Math.round(12 + Math.random() * 44), // 12..56 px below
    size: Math.round(6 + Math.random() * 8), // 6..14 px
    duration: durationMs + Math.round(Math.random() * 400),
    delay: i * 80,
  }));

  return (
    <div
      aria-hidden
      className="fixed z-50 pointer-events-none"
      style={{ left: x, top: y }}
    >
      {/* Main blot */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full shadow"
        style={{
          width: mainSize,
          height: mainSize,
          boxShadow: "0 0 24px hsl(var(--splatter-hsl) / 0.5)",
          background:
            "radial-gradient(circle at 35% 35%, hsl(var(--splatter-hsl) / 0.9) 0%, hsl(var(--splatter-hsl) / 0.6) 60%, hsl(var(--splatter-hsl) / 0.2) 100%)",
          animationName: "fade-out",
          animationDuration: `${durationMs}ms`,
          animationTimingFunction: "ease-out",
          animationFillMode: "forwards",
        } as React.CSSProperties & Record<string, string>}
      />

      {/* Drips */}
      {drops.map((d) => (
        <div
          key={d.key}
          className="absolute rounded-full"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            background: "hsl(var(--splatter-hsl) / 0.7)",
            boxShadow: "0 0 12px hsl(var(--splatter-hsl) / 0.4)",
            animationName: "fade-out",
            animationDuration: `${d.duration}ms`,
            animationDelay: `${d.delay}ms`,
            animationTimingFunction: "ease-out",
            animationFillMode: "forwards",
          } as React.CSSProperties & Record<string, string>}
        />
      ))}

      {/* Inject CSS var for HSL */}
      <div style={styleVars} />
    </div>
  );
};

export default Splatter;
