'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CalendarEvent {
  id: string;
  date_key: string;
  time: string;
  title: string;
}

interface CalendarWidgetProps {
  onFocusInput?: (callback: (action: 'add' | 'delete' | 'submit', char?: string) => void) => void;
}

export default function CalendarWidget({ onFocusInput }: CalendarWidgetProps) {
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [titleInput, setTitleInput] = useState('');
  const [timeInput, setTimeInput] = useState('12:00');
  const [showAddForm, setShowAddForm] = useState(false);

  // Vérification automatique du changement de jour à minuit ou au réveil de la tablette
  useEffect(() => {
    const checkMidnight = setInterval(() => {
      const now = new Date();
      if (now.getDate() !== selectedDate.getDate() && !showAddForm) {
        setSelectedDate(now);
        setCurrentMonthDate(now);
      }
    }, 60000); // Vérifie chaque minute

    return () => clearInterval(checkMidnight);
  }, [selectedDate, showAddForm]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('kitchen_calendar')
        .select('*')
        .order('time', { ascending: true });

      if (error) throw error;
      if (data) setEvents(data);
    } catch (error) {
      console.error('Erreur chargement calendrier Supabase :', error);
    } finally {
      setLoading(false);
    }
  };

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;

  const selectedDateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  const changeMonth = (delta: number) => {
    setCurrentMonthDate(new Date(year, month + delta, 1));
  };

  const handleAddEvent = async () => {
    if (!titleInput.trim()) return;

    const newEventData = {
      date_key: selectedDateKey,
      time: timeInput,
      title: titleInput.trim(),
    };

    try {
      const { data, error } = await supabase
        .from('kitchen_calendar')
        .insert([newEventData])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setEvents((prev) => [...prev, data[0]]);
        setTitleInput('');
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Erreur ajout événement Supabase :', error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('kitchen_calendar')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error('Erreur suppression événement Supabase :', error);
    }
  };

  const selectedDayEvents = events.filter((e) => e.date_key === selectedDateKey);

  const handleKeyboardAction = (action: 'add' | 'delete' | 'submit', char?: string) => {
    if (action === 'add' && char) setTitleInput((prev) => prev + char);
    else if (action === 'delete') setTitleInput((prev) => prev.slice(0, -1));
    else if (action === 'submit') handleAddEvent();
  };

  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  if (loading && events.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-[#78716C]">
        <Loader2 className="animate-spin mb-2" size={24} />
        <p className="text-xs">Chargement du calendrier...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[#E6E2D3] pb-2 mb-2">
        <div className="flex items-center gap-1">
          <button onClick={() => changeMonth(-1)} className="p-1 text-[#78716C] hover:text-[#3E3A36]">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-[#3E3A36] capitalize">
            {currentMonthDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => changeMonth(1)} className="p-1 text-[#78716C] hover:text-[#3E3A36]">
            <ChevronRight size={16} />
          </button>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 rounded-lg bg-[#3E3A36] px-2 py-1 text-[11px] font-bold text-[#FDFBF7]"
        >
          <Plus size={13} /> Événement
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {daysOfWeek.map((d) => (
          <div key={d} className="text-[10px] font-bold text-[#78716C] py-0.5">
            {d}
          </div>
        ))}

        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-6" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const thisDateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const isSelected = selectedDateKey === thisDateKey;
          const hasEvents = events.some((e) => e.date_key === thisDateKey);

          return (
            <button
              key={dayNum}
              onClick={() => setSelectedDate(new Date(year, month, dayNum))}
              className={`relative flex h-6 w-full items-center justify-center rounded-lg text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-[#D97706] text-white shadow-xs'
                  : 'text-[#3E3A36] hover:bg-[#EFECE6]'
              }`}
            >
              {dayNum}
              {hasEvents && (
                <span
                  className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                    isSelected ? 'bg-white' : 'bg-[#D97706]'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {showAddForm && (
        <div className="mb-2 flex flex-col gap-1.5 rounded-xl border border-[#E6E2D3] bg-[#EFECE6] p-2">
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onFocus={() => onFocusInput && onFocusInput(handleKeyboardAction)}
            placeholder="Titre de l'événement..."
            className="rounded-lg border border-[#E6E2D3] bg-[#FDFBF7] px-2 py-1 text-xs text-[#3E3A36]"
          />
          <div className="flex gap-2">
            <input
              type="time"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              className="rounded-lg border border-[#E6E2D3] bg-[#FDFBF7] px-2 py-1 text-xs text-[#3E3A36]"
            />
            <button
              onClick={handleAddEvent}
              className="flex-1 rounded-lg bg-[#D97706] text-xs font-bold text-white py-1"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 border-t border-[#E6E2D3] pt-2">
        <div className="text-[10px] font-bold text-[#78716C] mb-1">
          Programme du {selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} :
        </div>
        {selectedDayEvents.length === 0 ? (
          <p className="text-[#A8A29E] text-center py-2 text-xs italic">Aucun événement prévu.</p>
        ) : (
          selectedDayEvents.map((ev) => (
            <div
              key={ev.id}
              className="flex items-center justify-between rounded-xl border border-[#E6E2D3] bg-[#FDFBF7] p-2 shadow-2xs"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-[10px] font-mono font-bold text-[#D97706] bg-[#EFECE6] px-1.5 py-0.5 rounded">
                  {ev.time}
                </span>
                <span className="text-xs font-medium text-[#3E3A36] truncate">{ev.title}</span>
              </div>
              <button
                onClick={() => handleDeleteEvent(ev.id)}
                className="text-[#A8A29E] hover:text-red-600 p-1 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}