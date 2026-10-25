'use client';

import React, { useState, useEffect } from 'react';
import { CloudSun, Droplets, Wind, RefreshCw, MapPin } from 'lucide-react';

export default function WeatherWidget() {
  const [weather, setWeather] = useState<{ temp: number; humidity: number; wind: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    try {
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=45.6168&longitude=-73.8325&current=temperature_2m,relative_humidity_2m,wind_speed_10m'
      );
      const data = await res.json();
      if (data.current) {
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          humidity: data.current.relative_humidity_2m,
          wind: Math.round(data.current.wind_speed_10m),
        });
      }
    } catch (err) {
      console.error('Erreur météo Boisbriand :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();

    // Actualisation automatique toutes les heures (3600000 ms)
    const interval = setInterval(() => {
      fetchWeather();
    }, 60 * 60 * 1000);

    // Actualisation si la tablette sort de veille / l'onglet redevient actif
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchWeather();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="flex h-full flex-col justify-between p-1">
      <div className="flex items-center justify-between border-b border-[#E6E2D3] pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#3E3A36]">
          <MapPin className="text-[#D97706]" size={14} />
          <span>Boisbriand, QC</span>
        </div>
        <button
          onClick={fetchWeather}
          disabled={loading}
          className="p-1 text-[#78716C] hover:text-[#3E3A36] disabled:opacity-50"
          title="Actualiser la météo"
        >
          <RefreshCw className={loading ? 'animate-spin' : ''} size={13} />
        </button>
      </div>

      {loading && !weather ? (
        <div className="flex h-32 items-center justify-center text-xs font-bold text-[#78716C]">
          Chargement de la météo...
        </div>
      ) : weather ? (
        <>
          <div className="flex items-center justify-around my-auto">
            <CloudSun className="text-[#D97706]" size={52} />
            <div className="text-right">
              <span className="text-4xl font-black text-[#3E3A36]">{weather.temp}°C</span>
              <p className="text-xs text-[#78716C] font-medium">Météo en direct</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E6E2D3]">
            <div className="flex items-center gap-2 rounded-xl bg-[#FDFBF7] border border-[#E6E2D3] p-2">
              <Droplets className="text-blue-600" size={16} />
              <div>
                <span className="text-[10px] uppercase font-bold text-[#78716C] block">Humidité</span>
                <span className="text-xs font-black text-[#3E3A36]">{weather.humidity}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-[#FDFBF7] border border-[#E6E2D3] p-2">
              <Wind className="text-[#78716C]" size={16} />
              <div>
                <span className="text-[10px] uppercase font-bold text-[#78716C] block">Vent</span>
                <span className="text-xs font-black text-[#3E3A36]">{weather.wind} km/h</span>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}