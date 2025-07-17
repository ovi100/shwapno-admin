import React, { useState, useRef, useLayoutEffect, KeyboardEvent } from "react";
import { TabProps } from "../interfaces";
import { backgrounds, colors } from "../lib/common";

const Tab: React.FC<TabProps> = ({
  tabs = [],
  theme = "classic",
  size = "medium",
  variant = "default",
  type = "horizontal",
  trackVisibility = true,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  const goTo = (index: number) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
      setFadeKey((prev) => prev + 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (type === "horizontal") {
      if (e.key === "ArrowRight") goTo((activeIndex + 1) % tabs.length);
      if (e.key === "ArrowLeft")
        goTo((activeIndex - 1 + tabs.length) % tabs.length);
    } else {
      if (e.key === "ArrowDown") goTo((activeIndex + 1) % tabs.length);
      if (e.key === "ArrowUp")
        goTo((activeIndex - 1 + tabs.length) % tabs.length);
    }
  };

  useLayoutEffect(() => {
    const tabEl = tabRefs.current[activeIndex];
    const indicator = indicatorRef.current;
    const bg = bgRef.current;

    if (tabEl) {
      const tabRect = tabEl.getBoundingClientRect();
      const parentRect = tabEl.parentElement?.getBoundingClientRect();

      const left = tabRect.left - (parentRect?.left || 0);
      const top = tabRect.top - (parentRect?.top || 0);

      if (theme === "classic" && indicator) {
        if (type === "horizontal") {
          indicator.style.width = `${tabRect.width}px`;
          indicator.style.transform = `translateX(${left}px)`;
        } else {
          indicator.style.height = `${tabRect.height}px`;
          indicator.style.transform = `translateY(${top}px)`;
        }
      }

      if ((theme === "rounded" || theme === "capsule") && bg) {
        bg.style.width = `${tabRect.width}px`;
        bg.style.height = `${tabRect.height}px`;
        bg.style.transform = `translate(${left}px, ${top}px)`;
      }
    }
  }, [activeIndex, type, theme]);

  const getContainerClass = () => {
    const fd = type === "horizontal" ? "flex-col" : "flex-row";
    return `flex ${fd} gap-3`;
  };

  const getHeaderClass = () => {
    const visibleTrack =
      trackVisibility && theme !== "classic" && type == "horizontal";
    const tt = visibleTrack
      ? theme === "rounded"
        ? "bg-white rounded-md"
        : "bg-white rounded-full"
      : "";
    const fd =
      type === "horizontal" ? "items-center flex-row" : "items-start flex-col";
    const overflowClass =
      type === "horizontal"
        ? "overflow-x-auto scrollbar-hide"
        : "overflow-y-auto";
    const hb =
      theme === "classic"
        ? `${type === "horizontal" ? "border-b" : "border-l"} border-gray-300`
        : theme === "rounded"
        ? "rounded-md"
        : "rounded-full";
    return `relative w-fit ${tt} inline-flex ${fd} ${hb} ${overflowClass}`;
  };

  const getButtonClass = () => {
    const bs =
      size === "small"
        ? "px-2.5 py-1 lg:px-3 lg:py-1.5"
        : size === "medium"
        ? "px-3 py-1.5 lg:px-4 lg:py-2"
        : "px-4 py-2 lg:px-5 lg:py-3";
    const bb = theme === "classic" ? "" : "relative z-10";
    return `flex items-center gap-2 cursor-pointer whitespace-nowrap ${bb} ${bs} focus:outline-0`;
  };

  const getIconClass = (index: number) => {
    const s =
      size === "small" ? "w-4 h-4" : size === "medium" ? "w-5 h-5" : "w-6 h-6";
    const ic =
      theme === "classic"
        ? `${index === activeIndex ? colors[variant] : "text-black"}`
        : `${index === activeIndex ? "text-white" : "text-black"}`;
    return `${s} ${ic}`;
  };

  const getTextClass = (index: number) => {
    const ts =
      size === "small"
        ? "text-xs lg:text-sm"
        : size === "medium"
        ? "text-sm lg:text-base"
        : "text-base lg:text-lg";
    const tc =
      theme === "classic"
        ? `${index === activeIndex ? colors[variant] : "text-black"}`
        : `${index === activeIndex ? "text-white" : "text-black"}`;
    return `${ts} ${tc}`;
  };

  return (
    <div className={getContainerClass()} tabIndex={0} onKeyDown={handleKeyDown}>
      <div className={getHeaderClass()}>
        {/* Background slider for capsule/rounded */}
        {(theme === "rounded" || theme === "capsule") && (
          <div
            ref={bgRef}
            className={`absolute z-0 ${
              theme == "rounded" ? "rounded-md" : "rounded-full"
            } transition-all duration-300 ease-in-out ${backgrounds[variant]}`}
            style={{ top: 0, left: 0 }}
          />
        )}

        {tabs.map((tab, index) => (
          <button
            key={index}
            className={getButtonClass()}
            onClick={() => goTo(index)}
            ref={(el: HTMLButtonElement | null) => {
              tabRefs.current[index] = el;
            }}
          >
            {tab.icon && (
              <span>
                {React.cloneElement(tab.icon, {
                  className: getIconClass(index),
                })}
              </span>
            )}
            <span className={getTextClass(index)}>{tab.label}</span>
          </button>
        ))}

        {/* Indicator bar for classic */}
        {theme === "classic" && (
          <div
            ref={indicatorRef}
            className={`absolute ${
              type === "horizontal" ? "bottom-0 h-0.5" : "left-0 w-0.5 top-0"
            } ${backgrounds[variant]} transition-all duration-300 ease-in-out`}
          />
        )}
      </div>

      <div key={fadeKey} className="flex-1/2 opacity-0 animate-fadeIn mt-2">
        {tabs[activeIndex]?.content}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Tab;
