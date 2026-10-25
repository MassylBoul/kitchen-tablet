'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

export default function RecipeTimerWidget() {
  const [minutesInput, setMinutesInput] = useState('5');
  const [timeLeft, setTimeLeft] = useState(300); // En secondes (5 min par défaut)
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleSetTime = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(minutesInput, 10);
    if (!isNaN(mins) && mins > 0) {
      setTimeLeft(mins * 60);
      setIsRunning(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#E6E2D3] pb-2">
        <form onSubmit={handleSetTime} className="flex items-center gap-2">
          <input
            type="number"
            value={minutesInput}
            onChange={(e) => setMinutesInput(e.target.value)}
            className="w-16 rounded-lg border border-[#E6E2D3] bg-[#FDFBF7] px-2 py-1 text-xs font-bold text-[#3E3A36] text-center"
            min="1"
            max="180"
          />
          <span className="text-xs font-semibold text-[#78716C]">min</span>
          <button
            type="submit"
            className="rounded-lg bg-[#3E3A36] px-2.5 py-1 text-xs font-bold text-[#FDFBF7]"
          >
            Définir
          </button>
        </form>
      </div>

      <div className="flex flex-col items-center justify-center my-auto">
        <span className={`text-5xl font-mono font-black tracking-wider ${timeLeft === 0 ? 'text-red-600 animate-pulse' : 'text-[#3E3A36]'}`}>
          {formatTime(timeLeft)}
        </span>
        <span className="text-xs font-medium text-[#78716C] mt-1">
          {timeLeft === 0 ? "Temps écoulé !" : isRunning ? "Cuisson en cours..." : "En pause"}
        </span>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2 border-t border-[#E6E2D3]">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm ${
            isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#3E3A36] hover:bg-black'
          }`}
        >
          {isRunning ? <Pause size={14} /> : <Play size={14} />}
          {isRunning ? 'Pause' : 'Démarrer'}
        </button>
        <button
          onClick={() => {
            setIsRunning(false);
            setTimeLeft((parseInt(minutesInput, 10) || 5) * 60);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E6E2D3] bg-[#FDFBF7] text-xs font-bold text-[#78716C] hover:text-[#3E3A36]"
        >
          <RotateCcw size={14} /> Réinitialiser
        </button>
      </div>
    </div>
  );
}