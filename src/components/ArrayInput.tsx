import React, { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface ArrayInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ArrayInput: React.FC<ArrayInputProps> = ({
  value = [],
  onChange,
  placeholder = "Type and press Enter or Space to add items",
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');

  const addItem = (item: string) => {
    const trimmedItem = item.trim();
    if (trimmedItem && !value.includes(trimmedItem)) {
      onChange([...value, trimmedItem]);
    }
    setInputValue('');
  };

  const removeItem = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      addItem(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeItem(value.length - 1);
    }
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addItem(inputValue);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-background">
        {value.map((item, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1"
          >
            <span className="text-xs">{item}</span>
            <button
              type="button"
              onClick={() => removeItem(index)}
              disabled={disabled}
              className="hover:bg-destructive/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          placeholder={value.length === 0 ? placeholder : "Add more..."}
          disabled={disabled}
          className="border-none shadow-none flex-1 min-w-[120px] h-auto p-0 focus-visible:ring-0"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Press Enter or Space to add items. Backspace to remove the last item.
      </p>
    </div>
  );
};