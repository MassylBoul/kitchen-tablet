'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Eraser, RotateCcw, Undo2, Pencil } from 'lucide-react';

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3E3A36');
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Adapter le canvas à la taille réelle du conteneur
    canvas.width = canvas.parentElement?.clientWidth || 400;
    canvas.height = canvas.parentElement?.clientHeight || 350;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;

    // Sauvegarder l'état initial (vide)
    saveState();
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory((prev) => [...prev, imageData]);
    }
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Retirer l'état actuel
    const previousState = newHistory[newHistory.length - 1];

    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      setHistory(newHistory);
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineWidth = isEraser ? 20 : 3;
      ctx.strokeStyle = isEraser ? '#FDFBF7' : color;
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHistory([]);
      saveState();
    }
  };

  return (
    <div className="flex h-full flex-col gap-2">
      {/* Barre d'outils du Dessin */}
      <div className="flex items-center justify-between border-b border-[#E6E2D3] pb-2">
        {/* Choix des couleurs et Gomme */}
        <div className="flex items-center gap-2">
          {['#3E3A36', '#DC2626', '#2563EB', '#16A34A'].map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setIsEraser(false);
              }}
              style={{ backgroundColor: c }}
              className={`h-6 w-6 rounded-full border border-white shadow-sm transition-transform ${
                color === c && !isEraser ? 'scale-110 ring-2 ring-[#3E3A36]' : ''
              }`}
            />
          ))}

          <div className="h-4 w-[1px] bg-[#E6E2D3] mx-1" />

          {/* Bouton Crayon / Gomme */}
          <button
            onClick={() => setIsEraser(!isEraser)}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition-colors ${
              isEraser
                ? 'bg-[#3E3A36] text-[#FDFBF7]'
                : 'bg-[#EFECE6] text-[#78716C] hover:text-[#3E3A36]'
            }`}
            title={isEraser ? 'Mode Crayon' : 'Mode Gomme'}
          >
            {isEraser ? <Pencil size={14} /> : <Eraser size={14} />}
            <span>{isEraser ? 'Crayon' : 'Gomme'}</span>
          </button>
        </div>

        {/* Boutons Retour et Effacer Tout */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="flex items-center gap-1 text-xs font-bold text-[#78716C] hover:text-[#3E3A36] disabled:opacity-30"
            title="Annuler le dernier trait"
          >
            <Undo2 size={14} /> Retour
          </button>
          <button
            onClick={clearCanvas}
            className="flex items-center gap-1 text-xs font-bold text-[#78716C] hover:text-[#3E3A36]"
            title="Tout effacer"
          >
            <RotateCcw size={14} /> Effacer
          </button>
        </div>
      </div>

      {/* Surface de dessin */}
      <div className="relative flex-1 overflow-hidden rounded-xl border border-[#E6E2D3] bg-[#FDFBF7]">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="touch-none cursor-crosshair w-full h-full"
        />
      </div>
    </div>
  );
}