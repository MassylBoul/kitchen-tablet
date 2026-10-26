'use client';

import React, { useState, useEffect } from 'react';
import { Moon, Sun, Sunrise, Sunset, RefreshCw, Loader2 } from 'lucide-react';

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  date: string;
}

export default function PrayerTimesWidget() {
  const [timings, setTimings] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentDay, setCurrentDay] = useState(new Date().getDate());

  const fetchPrayerTimes = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=Boisbriand&country=Canada&method=2`
      );
      const data = await res.json();
      
      if (data && data.code === 200 && data.data) {
        const t = data.data.timings;
        setTimings({
          Fajr: t.Fajr,
          Dhuhr: t.Dhuhr,
          Asr: t.Asr,
          Maghrib: t.Maghrib,
          Isha: t.Isha,
          date: data.data.date.readable,
        });
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Erreur récupération heures de prière :', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayerTimes();

    // Vérifie chaque minute si le jour a changé (ex: passage à minuit)
    const checkDayInterval = setInterval(() => {
      const nowDay = new Date().getDate();
      if (nowDay !== currentDay) {
        setCurrentDay(nowDay);
        fetchPrayerTimes();
      }
    }, 60000);

    return () => clearInterval(checkDayInterval);
  }, [currentDay]);

  const prayers = [
    { name: 'Fajr', time: timings?.Fajr, icon: <Sunrise size={16} className="text-indigo-500" />  },
    { name: 'Dhuhr', time: timings?.Dhuhr, icon: <Sun size={16} className="text-amber-500" /> },
    { name: 'Asr', time: timings?.Asr, icon: <Sun size={16} className="text-orange-500" /> },
    { name: 'Maghrib', time: timings?.Maghrib, icon: <Sunset size={16} className="text-red-500" /> },
    { name: 'Isha', time: timings?.Isha, icon: <Moon size={16} className="text-blue-500" />},
  ];

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#E6E2D3] pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#3E3A36]">
          <Moon size={14} className="text-[#D97706]" />
          <span>Prières (Boisbriand)</span>
        </div>
        <button
          onClick={fetchPrayerTimes}
          disabled={loading}
          className="p-1 text-[#78716C] hover:text-[#3E3A36] disabled:opacity-50"
          title="Actualiser"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading && !timings ? (
        <div className="flex h-32 items-center justify-center text-xs font-bold text-[#78716C] gap-2">
          <Loader2 className="animate-spin" size={16} />
          <span>Chargement des horaires...</span>
        </div>
      ) : error ? (
        <div className="flex h-32 items-center justify-center text-xs text-red-600 text-center px-4">
          Impossible de charger les horaires. Vérifiez votre connexion.
        </div>
      ) : (
        <div className="flex flex-col gap-2 my-auto">
          {prayers.map((p) => (
            <div
              key={p.name}
              className="flex items-center justify-between rounded-xl bg-[#FDFBF7] border border-[#E6E2D3] px-3.5 py-2.5 shadow-2xs"
            >
              <div className="flex items-center gap-3">
                {p.icon}
                <span className="text-sm font-bold text-[#3E3A36]">{p.name}</span>
              </div>
              <span className="text-sm sm:text-base font-mono font-black text-[#D97706]">
                {p.time || '--:--'}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="text-[11px] text-[#78716C] text-center border-t border-[#E6E2D3] pt-1.5 font-medium">
        Méthode ISNA • {timings?.date || 'Calculé pour Boisbriand'}
      </div>
    </div>
  );
}