import React from "react";
import { DrillButton } from "@/components/ui/drill-button";
import { TaskType } from "@/types/drill";

interface TaskTypeSelectorProps {
  selectedType: TaskType;
  onTypeChange: (type: TaskType) => void;
}

const taskTypes: { type: TaskType; label: string }[] = [
  { type: "all", label: "Alle mischen" },
  { type: "multiplication", label: "Multiplikation" },
  { type: "percentage", label: "Prozentrechnung" },
  { type: "division", label: "Division" },
  { type: "zeros", label: "Nullen-Management" },
];

const TaskTypeSelector: React.FC<TaskTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {taskTypes.map(({ type, label }) => (
        <DrillButton
          key={type}
          variant={selectedType === type ? "active" : "inactive"}
          onClick={() => onTypeChange(type)}
          size="default"
        >
          {label}
        </DrillButton>
      ))}
    </div>
  );
};

export default TaskTypeSelector;
