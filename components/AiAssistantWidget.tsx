'use client';

import React, { useState } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AiAssistantWidgetProps {
  onFocusInput: (callback: (action: 'add' | 'delete' | 'submit', char?: string) => void) => void;
}

export default function AiAssistantWidget({ onFocusInput }: AiAssistantWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Bonjour ! Je suis ton chef cuisinier. Une idée de recette ou besoin d'une astuce ?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: "Oups, une erreur est survenue avec l'IA." }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: 'assistant', content: "Erreur de connexion au serveur." }]);
    } finally {
      setLoading(false);
    }
  };

  // Connexion au clavier virtuel
  const handleKeyboardAction = (action: 'add' | 'delete' | 'submit', char?: string) => {
    if (action === 'add' && char) {
      setInput((prev) => prev + char);
    } else if (action === 'delete') {
      setInput((prev) => prev.slice(0, -1));
    } else if (action === 'submit') {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Historique du chat avec style carnet */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3 bg-[#FDFBF7] p-3 rounded-xl border border-[#E6E2D3]">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-[#3E3A36] text-white' : 'bg-[#D97706] text-white'}`}>
              {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${m.role === 'user' ? 'bg-[#3E3A36] text-white rounded-tr-none' : 'bg-[#EFECE6] text-[#2C2A29] rounded-tl-none shadow-sm'}`}>
              {m.role === 'assistant' ? (
                <div className="markdown-content space-y-2">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-[#78716C] text-sm italic">
            <Loader2 className="animate-spin" size={16} />
            <span>Le chef écrit sa recette...</span>
          </div>
        )}
      </div>

      {/* Formulaire d'envoi */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => onFocusInput(handleKeyboardAction)}
          placeholder="Demande une recette..."
          className="flex-1 bg-[#FDFBF7] border border-[#D8D2C5] rounded-xl px-4 py-2.5 text-[#2C2A29] placeholder-[#A8A29E] focus:outline-none focus:border-[#D97706] text-base"
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={loading}
          className="bg-[#3E3A36] hover:bg-[#2C2A29] disabled:opacity-50 text-white px-4 rounded-xl flex items-center justify-center transition-colors shadow-sm"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}