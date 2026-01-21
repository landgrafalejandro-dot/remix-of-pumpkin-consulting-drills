import React, { useState, useRef, useEffect } from "react";
import { DrillButton } from "@/components/ui/drill-button";
import { Input } from "@/components/ui/input";

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
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
    
    // Submit raw string - normalization happens in checkAnswer
    onSubmit(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex w-full gap-3">
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
      <p className="text-xs text-muted-foreground">
        Tipp: Du kannst Kürzel nutzen wie <span className="font-medium">10k</span>, <span className="font-medium">5mio</span> oder <span className="font-medium">2mrd</span>
      </p>
    </div>
  );
};

export default AnswerInput;
