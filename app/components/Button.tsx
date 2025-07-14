import React from "react";
import { tv } from "tailwind-variants";
import Loading from "./Loading";
import { ButtonProps } from "../interfaces";

const button = tv({
  base: "flex items-center justify-center font-medium transition-all duration-200 focus:outline-none",
  variants: {
    size: {
      small: "px-2.5 py-1 text-xs lg:px-3 lg:py-1.5 lg:text-sm",
      medium: "px-3 py-1.5 text-sm lg:px-4 lg:py-2 lg:text-base",
      large: "px-4 py-2 text-base lg:px-5 lg:py-3 lg:text-lg",
    },
    variant: {
      default: "bg-gray-600 text-white hover:bg-gray-700",
      brand: "bg-indigo-600 text-white hover:bg-indigo-700",
      primary: "bg-blue-600 text-white hover:bg-blue-700",
      secondary: "bg-purple-600 text-white hover:bg-purple-700",
      danger: "bg-red-600 text-white hover:bg-red-700",
      success: "bg-green-600 text-white hover:bg-green-700",
      warn: "bg-yellow-500 text-black hover:bg-yellow-600",
    },
    type: {
      filled: "",
      outline: "bg-transparent border",
      text: "bg-transparent hover:underline",
      icon: "p-2",
    },
    edge: {
      rounded: "w-full rounded-md",
      capsule: "w-full rounded-full",
      circular: "rounded-full justify-center items-center",
    },
    disabled: {
      true: "opacity-50 cursor-not-allowed",
      false: "cursor-pointer",
    },
  },
  compoundVariants: [
    // OUTLINE
    {
      type: "outline",
      variant: "default",
      class: "text-black border-gray-300 hover:bg-gray-100",
    },
    {
      type: "outline",
      variant: "brand",
      class: "text-indigo-600 border-indigo-600 hover:bg-indigo-50",
    },
    {
      type: "outline",
      variant: "primary",
      class: "text-blue-600 border-blue-600 hover:bg-blue-50",
    },
    {
      type: "outline",
      variant: "secondary",
      class: "text-gray-600 border-gray-600 hover:bg-gray-100",
    },
    {
      type: "outline",
      variant: "danger",
      class: "text-red-600 border-red-600 hover:bg-red-50",
    },
    {
      type: "outline",
      variant: "success",
      class: "text-green-600 border-green-600 hover:bg-green-50",
    },
    {
      type: "outline",
      variant: "warn",
      class: "text-yellow-600 border-yellow-500 hover:bg-yellow-100",
    },
    // TEXT
    {
      type: "text",
      variant: "default",
      class: "text-black hover:text-gray-700",
    },
    {
      type: "text",
      variant: "brand",
      class: "text-indigo-600 hover:text-indigo-700",
    },
    {
      type: "text",
      variant: "primary",
      class: "text-blue-600 hover:text-blue-700",
    },
    {
      type: "text",
      variant: "secondary",
      class: "text-gray-600 hover:text-gray-700",
    },
    {
      type: "text",
      variant: "danger",
      class: "text-red-600 hover:text-red-700",
    },
    {
      type: "text",
      variant: "success",
      class: "text-green-600 hover:text-green-700",
    },
    {
      type: "text",
      variant: "warn",
      class: "text-yellow-600 hover:text-yellow-700",
    },
    // ICON
    {
      type: "icon",
      variant: "default",
      class: "bg-gray-200 text-black hover:bg-gray-300",
    },
    {
      type: "icon",
      variant: "brand",
      class: "bg-indigo-600 text-white hover:bg-indigo-700",
    },
    {
      type: "icon",
      variant: "primary",
      class: "bg-blue-600 text-white hover:bg-blue-700",
    },
    {
      type: "icon",
      variant: "secondary",
      class: "bg-gray-600 text-white hover:bg-gray-700",
    },
    {
      type: "icon",
      variant: "danger",
      class: "bg-red-600 text-white hover:bg-red-700",
    },
    {
      type: "icon",
      variant: "success",
      class: "bg-green-600 text-white hover:bg-green-700",
    },
    {
      type: "icon",
      variant: "warn",
      class: "bg-yellow-500 text-black hover:bg-yellow-600",
    },
    // CIRCULAR
    { edge: "circular", size: "small", class: "w-8 h-8 p-0" },
    { edge: "circular", size: "medium", class: "w-10 h-10 p-0" },
    { edge: "circular", size: "large", class: "w-12 h-12 p-0" },
  ],
  defaultVariants: {
    size: "medium",
    variant: "default",
    type: "filled",
    edge: "rounded",
    disabled: false,
  },
});

const iconSize = tv({
  base: "inline-block",
  variants: {
    size: {
      small: "w-4 h-4",
      medium: "w-5 h-5",
      large: "w-6 h-6",
    },
  },
  defaultVariants: {
    size: "medium",
  },
});

const Button: React.FC<ButtonProps> = ({
  children = null,
  size,
  variant,
  type,
  edge,
  text = "Button text",
  onClick = null,
  icon = null,
  disabled = false,
  loading = false,
}) => {
  const isIconOnly = type === "icon";
  const preventAction = loading || disabled;

  return (
    <button
      className={button({ size, variant, type, edge, disabled })}
      onClick={preventAction ? undefined : onClick ?? undefined}
      aria-busy={loading}
      disabled={disabled}
    >
      {children ? (
        children
      ) : (
        <>
          {loading && (
            <div className="flex items-center justify-center">
              <Loading size={size} variant={variant} />
              {text ? <span className="ml-2">{text}</span> : null}
            </div>
          )}
          {icon && (
            <span className={!isIconOnly && text ? "mr-2" : ""}>
              {React.cloneElement(icon, {
                className: iconSize({ size }),
              })}
            </span>
          )}
          {!isIconOnly && !loading && text}
        </>
      )}
    </button>
  );
};

export default Button;
