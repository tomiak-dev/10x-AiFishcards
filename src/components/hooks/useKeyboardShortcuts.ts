import { useEffect } from "react";

interface KeyboardShortcutsConfig {
  onReveal?: () => void;
  onRateAgain?: () => void;
  onRateGood?: () => void;
  onRateEasy?: () => void;
  enabled?: boolean;
}

/**
 * Custom hook for handling keyboard shortcuts in study session
 *
 * Shortcuts:
 * - Space/Enter: Reveal answer (when not revealed)
 * - 1: Rate as "again" (when revealed)
 * - 2: Rate as "good" (when revealed)
 * - 3: Rate as "easy" (when revealed)
 */
export const useKeyboardShortcuts = ({
  onReveal,
  onRateAgain,
  onRateGood,
  onRateEasy,
  enabled = true,
}: KeyboardShortcutsConfig) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      // Prevent default for shortcuts
      if (event.key === " " || event.key === "Enter" || event.key === "1" || event.key === "2" || event.key === "3") {
        event.preventDefault();
      }

      // Handle reveal shortcuts
      if ((event.key === " " || event.key === "Enter") && onReveal) {
        onReveal();
        return;
      }

      // Handle rating shortcuts
      if (event.key === "1" && onRateAgain) {
        onRateAgain();
        return;
      }

      if (event.key === "2" && onRateGood) {
        onRateGood();
        return;
      }

      if (event.key === "3" && onRateEasy) {
        onRateEasy();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, onReveal, onRateAgain, onRateGood, onRateEasy]);
};
