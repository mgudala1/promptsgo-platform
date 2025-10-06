import React, { useState, useCallback } from 'react';
import { ProfessionalCard } from './ProfessionalCard';
import { ProfessionalBadge } from './ProfessionalBadge';
import { cn } from './utils';
import { FileText, Image, Code, Bot, Link2, Check } from 'lucide-react';

export type PromptType = 'text' | 'image' | 'code' | 'agent' | 'chain';

export interface PromptTypeOption {
  value: PromptType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface PromptTypeSelectorProps {
  value?: PromptType;
  onChange?: (value: PromptType) => void;
  className?: string;
}

const promptTypeOptions: PromptTypeOption[] = [
  {
    value: 'text',
    label: 'Text Prompt',
    description: 'General text generation and completion',
    icon: FileText,
  },
  {
    value: 'image',
    label: 'Image Prompt',
    description: 'Image generation and visual content',
    icon: Image,
  },
  {
    value: 'code',
    label: 'Code Prompt',
    description: 'Code generation and programming assistance',
    icon: Code,
  },
  {
    value: 'agent',
    label: 'AI Agent',
    description: 'Complex multi-step AI agent workflows',
    icon: Bot,
  },
  {
    value: 'chain',
    label: 'Prompt Chain',
    description: 'Sequential prompt workflows',
    icon: Link2,
  },
];

export const PromptTypeSelector: React.FC<PromptTypeSelectorProps> = ({
  value,
  onChange,
  className,
}) => {
  const [selectedValue, setSelectedValue] = useState<PromptType | undefined>(value);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const handleSelect = useCallback((option: PromptTypeOption) => {
    const newValue = option.value;
    setSelectedValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleSelect(promptTypeOptions[index]);
        break;
      case 'ArrowRight':
        event.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % promptTypeOptions.length);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + promptTypeOptions.length) % promptTypeOptions.length);
        break;
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 2, promptTypeOptions.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 2, 0));
        break;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setFocusedIndex(promptTypeOptions.length - 1);
        break;
    }
  }, [handleSelect]);

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
      role="radiogroup"
      aria-label="Select prompt type"
    >
      {promptTypeOptions.map((option, index) => {
        const Icon = option.icon;
        const isSelected = selectedValue === option.value;
        const isFocused = focusedIndex === index;

        return (
          <ProfessionalCard
            key={option.value}
            className={cn(
              "relative cursor-pointer transition-all duration-200 p-6",
              "hover:shadow-lg hover:scale-[1.02]",
              "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
              isSelected && "ring-2 ring-primary ring-offset-2 shadow-lg",
              isFocused && "ring-2 ring-primary ring-offset-2"
            )}
            onClick={() => handleSelect(option)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            tabIndex={0}
            role="radio"
            aria-checked={isSelected}
            aria-label={`${option.label}: ${option.description}`}
          >
            {/* Selected Badge */}
            {isSelected && (
              <div className="absolute -top-2 -right-2 z-10">
                <ProfessionalBadge gradient className="flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Selected
                </ProfessionalBadge>
              </div>
            )}

            <div className="flex flex-col items-center text-center space-y-3">
              {/* Icon */}
              <div className={cn(
                "p-3 rounded-lg transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10"
              )}>
                <Icon className="h-6 w-6" />
              </div>

              {/* Title */}
              <h3 className={cn(
                "font-semibold text-sm transition-colors",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {option.label}
              </h3>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                {option.description}
              </p>
            </div>
          </ProfessionalCard>
        );
      })}
    </div>
  );
};

PromptTypeSelector.displayName = "PromptTypeSelector";