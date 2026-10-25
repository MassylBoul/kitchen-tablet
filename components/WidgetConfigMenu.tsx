'use client';

import React, { useState } from 'react';
import { 
  Check, 
  ChevronDown, 
  CheckSquare, 
  PenTool, 
  Bot, 
  Timer, 
  CloudSun, 
  Calendar, 
  Globe,
  Moon
} from 'lucide-react';

export type WidgetKey = 'todo' | 'canvas' | 'ai' | 'timer' | 'weather' | 'calendar' | 'clock' | 'prayer';

interface WidgetConfigMenuProps {
  visibleWidgets: Record<WidgetKey, boolean>;
  onToggleWidget: (key: WidgetKey) => void;
}

export default function WidgetConfigMenu({ visibleWidgets, onToggleWidget }: WidgetConfigMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const widgetsList: { key: WidgetKey; label: string; icon: React.ReactNode }[] = [
    { key: 'todo', label: 'Notes & Listes', icon: <CheckSquare size={15} /> },
    { key: 'canvas', label: 'Ardoise / Dessin', icon: <PenTool size={15} /> },
    { key: 'ai', label: 'Assistant IA', icon: <Bot size={15} /> },
    { key: 'timer', label: 'Minuteur de Cuisson', icon: <Timer size={15} /> },
    { key: 'weather', label: 'Météo (Boisbriand)', icon: <CloudSun size={15} /> },
    { key: 'calendar', label: 'Calendrier', icon: <Calendar size={15} /> },
    { key: 'clock', label: 'Horloge Mondiale', icon: <Globe size={15} /> },
    { key: 'prayer', label: 'Heures de Prière', icon: <Moon size={15} /> },
  ];

  const activeCount = Object.values(visibleWidgets).filter(Boolean).length;

  return (
    <div className="relative">
      {/* Bouton déclencheur du menu déroulant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-[#E6E2D3] bg-[#F5F0E6] px-3.5 py-2 text-xs font-bold text-[#3E3A36] shadow-xs hover:bg-[#EFECE6] transition-all"
      >
        <span>Widgets ({activeCount})</span>
        <ChevronDown size={15} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Liste déroulante (Dropdown) */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2 z-50 w-64 rounded-2xl border border-[#E6E2D3] bg-[#FDFBF7] p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-2 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#78716C] border-b border-[#E6E2D3] mb-1">
              Afficher / Masquer les widgets
            </div>

            <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
              {widgetsList.map((w) => {
                const isActive = visibleWidgets[w.key];
                return (
                  <button
                    key={w.key}
                    onClick={() => onToggleWidget(w.key)}
                    className={`flex items-center justify-between w-full rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#EFECE6] text-[#3E3A36]'
                        : 'text-[#78716C] hover:bg-[#F5F0E6] hover:text-[#3E3A36]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? 'text-[#D97706]' : 'text-[#A8A29E]'}>
                        {w.icon}
                      </span>
                      <span>{w.label}</span>
                    </div>

                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-md border transition-all ${
                        isActive
                          ? 'border-[#3E3A36] bg-[#3E3A36] text-[#FDFBF7]'
                          : 'border-[#E6E2D3] bg-white'
                      }`}
                    >
                      {isActive && <Check size={11} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}