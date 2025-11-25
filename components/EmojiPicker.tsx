import React from 'react';
import { cn } from '../utils';

const EMOJIS = ['😀', '🚀', '💻', '📝', '🎨', '📅', '🔥', '✨', '💡', '⏰', '🎉', '🛒', '🍎', '🏋️', '💤', '💊', '🧸', '🎈', '🎀', '🌻', '🍄', '🍕', '🍩', '🍪'];

interface EmojiPickerProps {
  selected: string;
  onSelect: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ selected, onSelect }) => {
  return (
    <div className="grid grid-cols-8 gap-2 mt-1">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className={cn(
            "text-xl md:text-2xl p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all",
            selected === emoji ? "bg-white shadow-md ring-2 ring-blue-200 scale-110" : "grayscale-[0.3] hover:grayscale-0"
          )}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};