import React from "react";
import { Task } from "@/types/drill";

interface TaskDisplayProps {
  task: Task | null;
  isLoading?: boolean;
}

const TaskDisplay: React.FC<TaskDisplayProps> = ({ task, isLoading }) => {
  if (isLoading || !task) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
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
