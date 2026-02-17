import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TimeRange = "today" | "7d" | "30d" | "90d" | "all";

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  today: "Heute",
  "7d": "Letzte 7 Tage",
  "30d": "Letzte 30 Tage",
  "90d": "Letzte 90 Tage",
  all: "Gesamte Zeit",
};

interface TimeFilterProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

export const getDateSince = (range: TimeRange): Date | undefined => {
  const now = new Date();
  switch (range) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "all":
      return undefined;
  }
};

const TimeFilter: React.FC<TimeFilterProps> = ({ value, onChange }) => (
  <Select value={value} onValueChange={(v) => onChange(v as TimeRange)}>
    <SelectTrigger className="w-[200px]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {Object.entries(TIME_RANGE_LABELS).map(([key, label]) => (
        <SelectItem key={key} value={key}>
          {label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default TimeFilter;
