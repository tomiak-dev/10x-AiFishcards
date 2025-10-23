interface KeyboardHintsProps {
  isRevealed: boolean;
}

/**
 * Displays keyboard shortcut hints for the user
 */
export const KeyboardHints = ({ isRevealed }: KeyboardHintsProps) => {
  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <p className="text-xs text-gray-500 text-center">
        Skróty klawiszowe:{" "}
        {isRevealed ? (
            <span>
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">1</kbd> - Nie wiem,{" "}
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">2</kbd> - Wiem,{" "}
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">3</kbd> - Bardzo łatwe
          </span>
        ) : (
            <span>
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">Spacja</kbd> - odwróć fiszkę
          </span>
        )}
      </p>
    </div>
  );
};
