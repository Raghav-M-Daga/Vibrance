import React from "react";

interface FlashOverlayProps {
  colorHsl: string | null;
  active: boolean;
  center?: { x: number; y: number };
  onEnd?: () => void;
}

// Full-screen gradient flash overlay. Uses a CSS var for color (HSL only)
const FlashOverlay: React.FC<FlashOverlayProps> = ({ colorHsl, active, center, onEnd }) => {
  if (!active || !colorHsl) return null;

  const style = {
    // Dynamic HSL token for this flash
    "--flash-hsl": colorHsl,
    // Center of the flash in viewport coordinates
    "--flash-x": center ? `${center.x}px` : "50%",
    "--flash-y": center ? `${center.y}px` : "40%",
    // Layered gradients to create a soft flash
    background:
      "radial-gradient(circle at var(--flash-x) var(--flash-y), hsl(var(--flash-hsl) / 0.55) 0%, transparent 60%), " +
      "linear-gradient(135deg, hsl(var(--flash-hsl) / 0.25) 0%, hsl(var(--flash-hsl) / 0.05) 100%)",
  } as React.CSSProperties & Record<string, string>;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-40 pointer-events-none animate-flash will-change-transform will-change-opacity"
      style={style}
      onAnimationEnd={onEnd}
    />
  );
};

export default FlashOverlay;
