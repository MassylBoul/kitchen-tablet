'use client';

import React, { useState } from 'react';
import TodoWidget from '@/components/TodoWidget';
import DrawingCanvas from '@/components/DrawingCanvas';
import AiAssistantWidget from '@/components/AiAssistantWidget';
import RecipeTimerWidget from '@/components/RecipeTimerWidget';
import WeatherWidget from '@/components/WeatherWidget';
import CalendarWidget from '@/components/CalendarWidget';
import WorldClockWidget from '@/components/WorldClockWidget';
import PrayerTimesWidget from '@/components/PrayerTimesWidget';
import VirtualKeyboard from '@/components/VirtualKeyboard';
import WidgetConfigMenu, { WidgetKey } from '@/components/WidgetConfigMenu';
import { Maximize2, Minimize2, ArrowUp, ArrowDown, Keyboard } from 'lucide-react';

export default function DashboardPage() {
  const [widgetOrder, setWidgetOrder] = useState<WidgetKey[]>([
    'todo',
    'canvas',
    'ai',
    'timer',
    'weather',
    'calendar',
    'clock',
    'prayer',
  ]);

  const [visibleWidgets, setVisibleWidgets] = useState<Record<WidgetKey, boolean>>({
    todo: true,
    canvas: true,
    ai: true,
    timer: false,
    weather: false,
    calendar: false,
    clock: false,
    prayer: false,
  });

  const [widgetSizes, setWidgetSizes] = useState<Record<WidgetKey, 'half' | 'full'>>({
    todo: 'half',
    canvas: 'half',
    ai: 'half',
    timer: 'half',
    weather: 'half',
    calendar: 'half',
    clock: 'half',
    prayer: 'half',
  });

  const [showKeyboard, setShowKeyboard] = useState(false);
  const [isUppercase, setIsUppercase] = useState(false);
  const [activeInputCallback, setActiveInputCallback] = useState<((action: 'add' | 'delete' | 'submit', char?: string) => void) | null>(null);

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...widgetOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setWidgetOrder(newOrder);
  };

  const toggleWidget = (key: WidgetKey) => {
    setVisibleWidgets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSize = (key: WidgetKey) => {
    setWidgetSizes((prev) => ({
      ...prev,
      [key]: prev[key] === 'half' ? 'full' : 'half',
    }));
  };

  const handleFocusInput = (callback: (action: 'add' | 'delete' | 'submit', char?: string) => void) => {
    setActiveInputCallback(() => callback);
    setShowKeyboard(true);
  };

  const handleKeyPress = (key: string) => {
    if (!activeInputCallback) return;

    if (key === 'BACKSPACE') {
      activeInputCallback('delete');
    } else if (key === 'ENTER') {
      activeInputCallback('submit');
    } else if (key === 'SPACE') {
      activeInputCallback('add', ' ');
    } else if (key === 'SHIFT') {
      setIsUppercase((prev) => !prev);
    } else {
      const character = isUppercase ? key : key.toLowerCase();
      activeInputCallback('add', character);
    }
  };

  const renderWidget = (key: WidgetKey, index: number) => {
    if (!visibleWidgets[key]) return null;

    const isFull = widgetSizes[key] === 'full';
    const titleMap: Record<WidgetKey, string> = {
      todo: 'Notes & Listes',
      canvas: 'Ardoise / Dessin',
      ai: 'Assistant IA Cuisine',
      timer: 'Minuteur de Cuisson',
      weather: 'Météo (Boisbriand)',
      calendar: 'Calendrier & Événements',
      clock: 'Horloge Mondiale',
      prayer: 'Heures de Prière (Boisbriand)',
    };

    return (
      <div
        key={key}
        className={`flex flex-col h-[480px] overflow-hidden rounded-2xl border border-[#E6E2D3] bg-[#F5F0E6] shadow-sm transition-all ${
          isFull ? 'md:col-span-12' : 'md:col-span-6'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#E6E2D3] bg-[#EFECE6] px-3 py-2 text-xs font-bold text-[#78716C]">
          <span>{titleMap[key]}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => moveWidget(index, 'up')}
              disabled={index === 0}
              className="p-1 hover:text-[#3E3A36] disabled:opacity-30"
              title="Monter"
            >
              <ArrowUp size={14} />
            </button>
            <button
              onClick={() => moveWidget(index, 'down')}
              disabled={index === widgetOrder.length - 1}
              className="p-1 hover:text-[#3E3A36] disabled:opacity-30"
              title="Descendre"
            >
              <ArrowDown size={14} />
            </button>
            <button
              onClick={() => toggleSize(key)}
              className="ml-1 p-1 hover:text-[#3E3A36]"
              title="Changer la taille"
            >
              {isFull ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {key === 'todo' && <TodoWidget onFocusInput={handleFocusInput} />}
          {key === 'canvas' && <DrawingCanvas />}
          {key === 'ai' && <AiAssistantWidget onFocusInput={handleFocusInput} />}
          {key === 'timer' && <RecipeTimerWidget />}
          {key === 'weather' && <WeatherWidget />}
          {key === 'calendar' && <CalendarWidget onFocusInput={handleFocusInput} />}
          {key === 'clock' && <WorldClockWidget />}
          {key === 'prayer' && <PrayerTimesWidget />}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] p-4 text-[#3E3A36] pb-72">
      <header className="mb-6 flex items-center justify-between border-b border-[#E6E2D3] pb-3">
        <h1 className="text-2xl font-black tracking-tight text-[#3E3A36]">
          🍳 Kitchen Dashboard
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyboard(!showKeyboard)}
            className={`flex items-center gap-1.5 rounded-xl border border-[#E6E2D3] px-3 py-2 text-xs font-bold transition-all ${
              showKeyboard ? 'bg-[#3E3A36] text-[#FDFBF7]' : 'bg-[#F5F0E6] text-[#78716C]'
            }`}
          >
            <Keyboard size={15} /> Clavier
          </button>

          <WidgetConfigMenu
            visibleWidgets={visibleWidgets}
            onToggleWidget={toggleWidget}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {widgetOrder.map((key, index) => renderWidget(key, index))}
      </div>

      <VirtualKeyboard
        show={showKeyboard}
        onClose={() => setShowKeyboard(false)}
        isUppercase={isUppercase}
        onKeyPress={handleKeyPress}
      />
    </main>
  );
}