import React from "react";
import { cn } from "@/lib/utils";
import "./siriOrb.css";

export type OrbState = "idle" | "speaking" | "thinking" | "listening";

interface SiriOrbProps {
  state: OrbState;
  size?: string;
  className?: string;
}

const SiriOrb: React.FC<SiriOrbProps> = ({ state, size = "240px", className }) => {
  const sizeValue = parseInt(size.replace("px", ""), 10);
  const blurAmount = Math.max(sizeValue * 0.08, 8);
  const contrastAmount = Math.max(sizeValue * 0.003, 1.8);

  return (
    <div
      className={cn("siri-orb", className)}
      data-orb-state={state}
      aria-hidden="true"
      style={
        {
          width: size,
          height: size,
          "--blur-amount": `${blurAmount}px`,
          "--contrast-amount": contrastAmount,
        } as React.CSSProperties
      }
    />
  );
};

export default SiriOrb;
