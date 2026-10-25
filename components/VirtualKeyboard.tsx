'use client';

import React from 'react';
import { X } from 'lucide-react';

interface VirtualKeyboardProps {
  show: boolean;
  onClose: () => void;
  isUppercase: boolean;
  onKeyPress: (key: string) => void;
}

export default function VirtualKeyboard({ show, onClose, isUppercase, onKeyPress }: VirtualKeyboardProps) {
  if (!show) return null;

  const qwertyRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'BACKSPACE'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'ENTER'],
    ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'SPACE'],
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E6E2D3] bg-[#EFECE6] p-2 shadow-2xl touch-none">
      <div className="mx-auto max-w-3xl">
        <div className="mb-1 flex items-center justify-between border-b border-[#E6E2D3] pb-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#78716C]">
            Clavier QWERTY ({isUppercase ? 'MAJ' : 'min'})
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#78716C] hover:bg-[#E6E2D3]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          {qwertyRows.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1">
              {row.map((key) => {
                const isSpecial = ['BACKSPACE', 'ENTER', 'SPACE', 'SHIFT'].includes(key);
                const displayChar = isSpecial 
                  ? key 
                  : (isUppercase ? key : key.toLowerCase());

                return (
                  <button
                    key={key}
                    onClick={() => onKeyPress(key)}
                    className={`rounded-lg border border-[#E6E2D3] text-xs font-bold shadow-sm transition-colors ${
                      key === 'SHIFT' && isUppercase 
                        ? 'bg-[#3E3A36] text-[#FDFBF7]' 
                        : 'bg-[#FDFBF7] text-[#3E3A36] active:bg-[#3E3A36] active:text-[#FDFBF7]'
                    } ${
                      key === 'SPACE'
                        ? 'w-40 py-2.5'
                        : isSpecial
                        ? 'px-2 py-2.5 bg-[#F5F0E6] text-[10px]'
                        : 'w-7 py-2.5 sm:w-10'
                    }`}
                  >
                    {key === 'BACKSPACE' 
                      ? '⌫' 
                      : key === 'ENTER' 
                      ? '↵' 
                      : key === 'SPACE' 
                      ? 'Espace' 
                      : key === 'SHIFT' 
                      ? '⬆ Shift' 
                      : displayChar}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}