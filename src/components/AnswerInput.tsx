import React, { useState, useRef, useEffect } from "react";
import { DrillButton } from "@/components/ui/drill-button";
import { Input } from "@/components/ui/input";

interface AnswerInputProps {
  onSubmit: (answer: number) => void;
  disabled?: boolean;
}

const AnswerInput: React.FC<AnswerInputProps> = ({ onSubmit, disabled }) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    
    // Parse German number format (comma as decimal separator)
    const parsed = parseFloat(value.replace(/\./g, "").replace(",", "."));
    
    if (!isNaN(parsed)) {
      onSubmit(parsed);
      setValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-3">
      <Input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ergebnis eingeben..."
        disabled={disabled}
        className="h-12 flex-1 rounded-xl border-border bg-input px-4 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
      />
      <DrillButton
        type="submit"
        variant="active"
        size="lg"
        disabled={disabled || !value.trim()}
      >
        Check
      </DrillButton>
    </form>
  );
};

export default AnswerInput;
