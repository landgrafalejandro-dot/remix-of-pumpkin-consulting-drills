import React from "react";

interface AccuracyRingProps {
  percentage: number;
  disabled?: boolean;
  size?: number;
}

const AccuracyRing: React.FC<AccuracyRingProps> = ({
  percentage,
  disabled = false,
  size = 52,
}) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Color based on percentage
  const getStrokeColor = () => {
    if (disabled) return "hsl(var(--muted-foreground) / 0.3)";
    if (percentage >= 80) return "hsl(var(--primary))";
    if (percentage >= 50) return "hsl(var(--warning, 38 92% 50%))";
    return "hsl(var(--destructive))";
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted) / 0.5)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        {!disabled && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        )}
      </svg>
      <span
        className={`absolute text-xs font-semibold ${disabled ? "text-muted-foreground/50" : "text-foreground"}`}
      >
        {disabled ? "–" : `${percentage}%`}
      </span>
    </div>
  );
};

export default AccuracyRing;
