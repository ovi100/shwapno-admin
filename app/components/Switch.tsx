import React from "react";
import { tv } from "tailwind-variants";
import { SwitchProps } from "../interfaces";

const switchBase = tv({
  base: "relative inline-flex items-center transition-colors duration-300 ease-in-out outline-none focus:ring-0",
  variants: {
    size: {
      small: "w-10 h-5",
      medium: "w-12 h-6",
      large: "w-16 h-8",
    },
    type: {
      square: "rounded",
      toggle: "rounded-full",
    },
    variant: {
      default: "bg-gray-300 dark:bg-gray-600",
      brand: "bg-indigo-500 dark:bg-indigo-400",
      primary: "bg-blue-500 dark:bg-blue-400",
      secondary: "bg-purple-500 dark:bg-purple-400",
      danger: "bg-red-500 dark:bg-red-400",
      success: "bg-green-500 dark:bg-green-400",
      warn: "bg-yellow-400 dark:bg-yellow-300",
    },
    disabled: {
      true: "opacity-50 cursor-not-allowed pointer-events-none",
      false: "cursor-pointer",
    },
  },
});

const thumbStyles = tv({
  base: "absolute top-0.5 left-0.5 bg-white dark:bg-gray-100 transition-all duration-300 ease-in-out shadow",
  variants: {
    size: {
      small: "w-4 h-4",
      medium: "w-5 h-5",
      large: "w-6 h-6",
    },
    type: {
      square: "rounded",
      toggle: "rounded-full",
    },
  },
});

const labelTextSize: Record<string, string> = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
};

const Switch: React.FC<SwitchProps> = ({
  size = "medium",
  variant = "default",
  type = "toggle",
  value = false,
  noChange = null,
  disabled = false,
  label,
}) => {
  const keyboardEvents = [" ", "Enter", "ArrowRight", "ArrowLeft"];
  const handleToggle = () => {
    if (!disabled && noChange) noChange();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (keyboardEvents.includes(e.key) && !disabled) {
      e.preventDefault();
      handleToggle();
    }
  };

  const translateAmount: Record<string, string> = {
    small: "translate-x-5",
    medium: "translate-x-6",
    large: "translate-x-8",
  };

  // Determine the track color class based on value
  const trackColor = value
    ? "bg-green-500 dark:bg-green-400"
    : switchBase({ variant });

  return (
    <div className="inline-flex items-center space-x-2 select-none">
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-disabled={disabled}
        disabled={disabled}
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`${switchBase({
          size,
          type,
          disabled,
        })} ${trackColor}`}
      >
        <span
          className={`${thumbStyles({ size, type })} ${
            value ? translateAmount[size] : "translate-x-0"
          }`}
        />
      </button>
      {label && (
        <span
          className={`${labelTextSize[size]} ${
            disabled
              ? "text-gray-400 dark:text-gray-500"
              : "text-gray-800 dark:text-white"
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default Switch;
