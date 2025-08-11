
import React from "react";
import FlashOverlay from "./FlashOverlay";
import Splatter from "./Splatter";

// Vibrant HSL colors that pop on a black canvas
const VIBRANT_COLORS_HSL: string[] = [
  "0 100% 60%",    // red
  "30 100% 60%",   // orange
  "45 100% 60%",   // yellow
  "140 100% 45%",  // green
  "200 100% 60%",  // cyan
  "260 100% 65%",  // purple
  "300 100% 60%",  // magenta
  "330 95% 60%",   // pink
];

interface Circle {
  id: number;
  left: number; // percentage [5..95]
  size: number; // px
  duration: number; // ms
  colorHsl: string; // H S L string
}

let idCounter = 0;
let splatterId = 0;

interface SplatterItem {
  id: number;
  x: number;
  y: number;
  colorHsl: string;
  duration: number;
}

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;
const randomChoice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const makeCircle = (): Circle => {
  return {
    id: ++idCounter,
    left: randomBetween(5, 95),
    size: Math.round(randomBetween(28, 120)),
    duration: Math.round(randomBetween(25000, 60000)),
    colorHsl: randomChoice(VIBRANT_COLORS_HSL),
  };
};

const ColorPopCanvas: React.FC = () => {
  const [circles, setCircles] = React.useState<Circle[]>([]);
  const [flashActive, setFlashActive] = React.useState(false);
  const [flashColor, setFlashColor] = React.useState<string | null>(null);
  const [flashCenter, setFlashCenter] = React.useState<{ x: number; y: number } | null>(null);
  const [splatters, setSplatters] = React.useState<SplatterItem[]>([]);

  // Spawn circles at a staggered rate with variable cadence
  React.useEffect(() => {
    let alive = true;

    const scheduleNext = () => {
      if (!alive) return;
      const delay = randomBetween(280, 780); // stagger
      setTimeout(() => {
        if (!alive) return;
        setCircles((prev) => [...prev, makeCircle()]);
        scheduleNext();
      }, delay);
    };

    // prime the scene with a handful
    setCircles(Array.from({ length: 10 }, makeCircle));
    scheduleNext();

    return () => {
      alive = false;
    };
  }, []);

  const handlePop = (e: React.MouseEvent<HTMLButtonElement>, c: Circle) => {
    // trigger flash overlay with circle color and click center
    setFlashColor(c.colorHsl);
    setFlashCenter({ x: e.clientX, y: e.clientY });
    setFlashActive(true);

    // leave a transient splatter
    const duration = Math.round(randomBetween(900, 1600));
    const s: SplatterItem = { id: ++splatterId, x: e.clientX, y: e.clientY, colorHsl: c.colorHsl, duration };
    setSplatters((prev) => [...prev, s]);
    setTimeout(() => {
      setSplatters((prev) => prev.filter((sp) => sp.id !== s.id));
    }, duration + 100);

    // remove the circle immediately (pop)
    setCircles((prev) => prev.filter((x) => x.id !== c.id));
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <h1 className="sr-only">Color Popper: Vibrant Circle Pop Game</h1>

      {/* Rising circles layer */}
      <div className="absolute inset-0 z-10" aria-hidden>
        {circles.map((c) => {
          const style = {
            "--circle-hsl": c.colorHsl,
            left: `${c.left}%`,
            width: `${c.size}px`,
            height: `${c.size}px`,
            transform: "translateY(110vh)",
            animationDuration: `${c.duration}ms`,
            background: "radial-gradient(circle at 35% 35%, hsl(var(--circle-hsl) / 0.9) 0%, hsl(var(--circle-hsl) / 0.6) 60%, hsl(var(--circle-hsl) / 0.2) 100%)",
            boxShadow: "0 0 24px hsl(var(--circle-hsl) / 0.6), 0 0 80px hsl(var(--circle-hsl) / 0.25)",
          } as React.CSSProperties & Record<string, string>;

          return (
            <button
              key={c.id}
              aria-label="Pop circle"
              className="absolute top-0 -translate-x-1/2 rounded-full animate-rise outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-transform duration-150 active:scale-95"
              style={style}
              onClick={(e) => handlePop(e, c)}
              onAnimationEnd={() =>
                setCircles((prev) => prev.filter((x) => x.id !== c.id))
              }
            />
          );
        })}
      </div>

      {/* Flash overlay */}
      <FlashOverlay
        colorHsl={flashColor}
        active={flashActive}
        center={flashCenter ?? undefined}
        onEnd={() => setFlashActive(false)}
      />

      {/* Splatter drips */}
      {splatters.map((s) => (
        <Splatter key={s.id} x={s.x} y={s.y} colorHsl={s.colorHsl} durationMs={s.duration} />
      ))}

      {/* Minimal helper text (accessible, low prominence) */}
      <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center text-sm text-muted-foreground">
        <p className="px-3 py-1 rounded-full bg-secondary/40 backdrop-blur-sm">
          Tap circles to pop and flash
        </p>
      </div>
    </div>
  );
};

export default ColorPopCanvas;
