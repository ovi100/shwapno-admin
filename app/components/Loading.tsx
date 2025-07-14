import React from "react";
import { tv } from "tailwind-variants";
import { LoadingProps } from "../interfaces";

const loader = tv({
  base: "animate-spin",
  variants: {
    size: {
      small: "w-4 h-4",
      medium: "w-5 h-5",
      large: "w-6 h-6",
    },
    variant: {
      default: "text-black",
      brand: "text-white",
      primary: "text-white",
      secondary: "text-white",
      danger: "text-white",
      success: "text-white",
      warn: "text-white",
    },
  },
  defaultVariants: {
    size: "medium",
    variant: "default",
  },
});

function Loading({ size = "medium", variant = "default" }: LoadingProps) {
  return (
    <svg
      className={loader({ size, variant })}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}

export default Loading;
