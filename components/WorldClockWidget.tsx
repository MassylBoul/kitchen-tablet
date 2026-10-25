'use client';

import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

export default function WorldClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const boisbriandTime = time.toLocaleTimeString('fr-FR', {
    timeZone: 'America/Toronto',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const algerTime = time.toLocaleTimeString('fr-FR', {
    timeZone: 'Africa/Algiers',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center gap-1.5 border-b border-[#E6E2D3] pb-2">
        <Globe className="text-[#D97706]" size={16} />
        <span className="text-xs font-bold text-[#3E3A36]">Horloge Mondiale</span>
      </div>

      {/* Affichage côte à côte avec des polices plus grandes */}
      <div className="grid grid-cols-2 gap-3 my-auto">
        {/* Boisbriand */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-[#FDFBF7] border border-[#E6E2D3] p-4 text-center shadow-2xs">
          <span className="text-xs uppercase font-extrabold tracking-wider text-[#78716C] mb-1">
            Boisbriand
          </span>
          <span className="text-2xl sm:text-3xl font-mono font-black text-[#3E3A36] tracking-tight">
            {boisbriandTime}
          </span>
          <span className="text-[11px] font-semibold text-[#A8A29E] mt-1">Canada (Est)</span>
        </div>

        {/* Alger */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-[#FDFBF7] border border-[#E6E2D3] p-4 text-center shadow-2xs">
          <span className="text-xs uppercase font-extrabold tracking-wider text-[#78716C] mb-1">
            Alger
          </span>
          <span className="text-2xl sm:text-3xl font-mono font-black text-[#D97706] tracking-tight">
            {algerTime}
          </span>
          <span className="text-[11px] font-semibold text-[#A8A29E] mt-1">Algérie</span>
        </div>
      </div>

      <div className="text-[11px] text-[#78716C] text-center border-t border-[#E6E2D3] pt-2 font-medium">
        Synchronisation en temps réel
      </div>
    </div>
  );
}