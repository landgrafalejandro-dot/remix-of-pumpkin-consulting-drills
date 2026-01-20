import React from "react";
import { Task } from "@/types/drill";
import { Clock } from "lucide-react";

interface TaskDisplayProps {
  task: Task | null;
  isLoading?: boolean;
  elapsedTime?: number;
}

const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const tenths = Math.floor((ms % 1000) / 100);
  return `${seconds},${tenths}s`;
};

const TaskDisplay: React.FC<TaskDisplayProps> = ({ task, isLoading, elapsedTime }) => {
  if (isLoading || !task) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Timer Display */}
      {elapsedTime !== undefined && (
        <div className="mb-4 flex items-center gap-2 rounded-full bg-muted/50 px-4 py-1.5">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-lg font-medium text-foreground tabular-nums">
            {formatTime(elapsedTime)}
          </span>
        </div>
      )}
      
      <p className="mb-2 text-sm uppercase tracking-wider text-muted-foreground">
        Berechne:
      </p>
      <h2 className="text-center text-4xl font-bold tracking-tight text-foreground md:text-5xl">
        {task.question} = ?
      </h2>
    </div>
  );
};

export default TaskDisplay;
