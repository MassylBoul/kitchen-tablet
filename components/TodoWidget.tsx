'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckSquare, Square, ArrowLeft, Folder, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface NoteList {
  id: string;
  title: string;
  items: TodoItem[];
}

interface TodoWidgetProps {
  onFocusInput: (callback: (action: 'add' | 'delete' | 'submit', char?: string) => void) => void;
}

export default function TodoWidget({ onFocusInput }: TodoWidgetProps) {
  const [lists, setLists] = useState<NoteList[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [newTitleText, setNewTitleText] = useState('');
  const [showNewListModal, setShowNewListModal] = useState(false);

  // Charger les listes depuis Supabase au démarrage
  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('kitchen_notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedLists: NoteList[] = data.map((row: any) => ({
          id: row.id,
          title: row.title,
          items: row.items || []
        }));
        setLists(formattedLists);
      } else {
        createDefaultList();
      }
    } catch (error) {
      console.error('Erreur chargement Supabase :', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultList = async () => {
    const defaultList = {
      title: '🛒 Courses de la semaine',
      items: []
    };
    const { data, error } = await supabase
      .from('kitchen_notes')
      .insert([defaultList])
      .select();

    if (!error && data) {
      setLists([{ id: data[0].id, title: data[0].title, items: data[0].items || [] }]);
    }
  };

  const updateListInSupabase = async (updatedLists: NoteList[], targetId: string) => {
    const target = updatedLists.find(l => l.id === targetId);
    if (!target) return;

    try {
      await supabase
        .from('kitchen_notes')
        .update({ title: target.title, items: target.items, updated_at: new Date() })
        .eq('id', targetId);
    } catch (error) {
      console.error('Erreur mise à jour Supabase :', error);
    }
  };

  const activeList = lists.find(l => l.id === activeListId);

  // Ajouter une tâche
  const addTodo = async () => {
    if (!inputText.trim() || !activeListId) return;

    const newItem: TodoItem = {
      id: Date.now().toString(),
      text: inputText.trim(),
      completed: false,
    };

    const updatedLists = lists.map(l => 
      l.id === activeListId ? { ...l, items: [newItem, ...l.items] } : l
    );
    
    setLists(updatedLists);
    setInputText('');
    await updateListInSupabase(updatedLists, activeListId);
  };

  const toggleTodo = async (itemId: string) => {
    if (!activeListId) return;
    const updatedLists = lists.map(l => {
      if (l.id !== activeListId) return l;
      return {
        ...l,
        items: l.items.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item)
      };
    });

    setLists(updatedLists);
    await updateListInSupabase(updatedLists, activeListId);
  };

  const deleteTodo = async (itemId: string) => {
    if (!activeListId) return;
    const updatedLists = lists.map(l => {
      if (l.id !== activeListId) return l;
      return {
        ...l,
        items: l.items.filter(item => item.id !== itemId)
      };
    });

    setLists(updatedLists);
    await updateListInSupabase(updatedLists, activeListId);
  };

  // Créer un nouveau carnet
  const createNewList = async () => {
    if (!newTitleText.trim()) return;

    const newListData = {
      title: newTitleText.trim(),
      items: []
    };

    try {
      const { data, error } = await supabase
        .from('kitchen_notes')
        .insert([newListData])
        .select();

      if (error) {
        console.error('Détail exact erreur Supabase création :', JSON.stringify(error, null, 2));
        return;
      }

      if (data && data.length > 0) {
        const created: NoteList = {
          id: data[0].id,
          title: data[0].title,
          items: data[0].items || []
        };
        setLists(prevLists => [...prevLists, created]);
        setActiveListId(created.id);
        setNewTitleText('');
        setShowNewListModal(false);
      }
    } catch (error) {
      console.error('Erreur inattendue création liste :', error);
    }
  };

  const deleteList = async (listId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (lists.length <= 1) return;

    try {
      const { error } = await supabase
        .from('kitchen_notes')
        .delete()
        .eq('id', listId);

      if (!error) {
        const updated = lists.filter(l => l.id !== listId);
        setLists(updated);
        if (activeListId === listId) setActiveListId(null);
      }
    } catch (error) {
      console.error('Erreur suppression Supabase :', error);
    }
  };

  // Gestion du clavier virtuel pour l'input d'ajout d'article
  const handleItemKeyboardAction = (action: 'add' | 'delete' | 'submit', char?: string) => {
    if (action === 'add' && char) {
      setInputText((prev) => prev + char);
    } else if (action === 'delete') {
      setInputText((prev) => prev.slice(0, -1));
    } else if (action === 'submit') {
      addTodo();
    }
  };

  // Gestion du clavier virtuel pour la création d'un carnet
  const handleListKeyboardAction = (action: 'add' | 'delete' | 'submit', char?: string) => {
    if (action === 'add' && char) {
      setNewTitleText((prev) => prev + char);
    } else if (action === 'delete') {
      setNewTitleText((prev) => prev.slice(0, -1));
    } else if (action === 'submit') {
      createNewList();
    }
  };

  if (loading) {
    return (
      <div className="bg-[#F5F0E6] border border-[#E6E2D3] rounded-2xl p-5 flex flex-col items-center justify-center h-[450px] shadow-sm text-[#78716C]">
        <Loader2 className="animate-spin mb-2" size={24} />
        <p className="text-sm">Connexion à la base de données...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F0E6] border border-[#E6E2D3] rounded-2xl p-5 flex flex-col h-[450px] shadow-sm">
      
      {/* VUE DETAIL (Une liste est ouverte) */}
      {activeListId && activeList ? (
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#E6E2D3]">
            <button
              onClick={() => setActiveListId(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EFECE6] hover:bg-[#E6E2D3] rounded-xl text-[#3E3A36] font-semibold text-xs transition-colors"
            >
              <ArrowLeft size={16} /> Retour aux notes
            </button>
            <h2 className="text-base font-bold text-[#3E3A36] truncate max-w-[180px]">
              {activeList.title}
            </h2>
          </div>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={() => onFocusInput(handleItemKeyboardAction)}
              placeholder="Ajouter un article..."
              className="flex-1 bg-[#FDFBF7] border border-[#E6E2D3] rounded-xl px-3 py-2 text-[#2C2A29] placeholder-[#A8A29E] focus:outline-none focus:border-[#D97706] text-sm"
            />
            <button
              type="button"
              onClick={addTodo}
              className="bg-[#D97706] hover:bg-[#B45309] text-white px-4 rounded-xl flex items-center justify-center transition-colors shadow-sm"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {activeList.items.length === 0 ? (
              <p className="text-[#A8A29E] text-center py-10 text-sm italic">Cette note est vide.</p>
            ) : (
              activeList.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    item.completed
                      ? 'bg-[#EFECE6]/50 border-[#E6E2D3] text-[#A8A29E] line-through'
                      : 'bg-[#FDFBF7] border-[#E6E2D3] text-[#2C2A29]'
                  }`}
                >
                  <div
                    onClick={() => toggleTodo(item.id)}
                    className="flex items-center gap-2.5 flex-1 cursor-pointer select-none"
                  >
                    {item.completed ? (
                      <CheckSquare className="text-[#D97706] shrink-0" size={18} />
                    ) : (
                      <Square className="text-[#A8A29E] shrink-0" size={18} />
                    )}
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                  <button
                    onClick={() => deleteTodo(item.id)}
                    className="text-[#A8A29E] hover:text-red-500 p-1 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* VUE DOSSIERS / LISTE DES NOTES */
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#E6E2D3]">
            <h2 className="text-lg font-bold text-[#3E3A36] flex items-center gap-2">
              <Folder size={18} /> Mes Carnets (Cloud)
            </h2>
            <button
              onClick={() => setShowNewListModal(true)}
              className="px-3 py-1.5 bg-[#3E3A36] hover:bg-[#2C2A29] text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm"
            >
              <Plus size={14} /> Nouvelle note
            </button>
          </div>

          {showNewListModal && (
            <div className="flex gap-2 mb-3 bg-[#EFECE6] p-2.5 rounded-xl border border-[#D8D2C5]">
              <input
                type="text"
                value={newTitleText}
                onChange={(e) => setNewTitleText(e.target.value)}
                onFocus={() => onFocusInput(handleListKeyboardAction)}
                placeholder="Nom du carnet..."
                className="flex-1 bg-[#FDFBF7] border border-[#D8D2C5] rounded-lg px-3 py-1.5 text-sm text-[#2C2A29]"
              />
              <button 
                type="button" 
                onClick={createNewList} 
                className="bg-[#D97706] text-white px-3 py-1.5 rounded-lg text-xs font-bold"
              >
                Créer
              </button>
              <button type="button" onClick={() => setShowNewListModal(false)} className="text-[#78716C] px-2 text-xs">
                ✕
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto grid grid-cols-1 gap-2.5 pr-1">
            {lists.map((l) => (
              <div
                key={l.id}
                onClick={() => setActiveListId(l.id)}
                className="bg-[#FDFBF7] hover:bg-[#FAF6EE] border border-[#E6E2D3] p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#F5F0E6] text-[#D97706] rounded-lg group-hover:scale-105 transition-transform">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#3E3A36]">{l.title}</h3>
                    <p className="text-xs text-[#78716C]">{l.items.length} élément(s)</p>
                  </div>
                </div>
                {lists.length > 1 && (
                  <button
                    onClick={(e) => deleteList(l.id, e)}
                    className="text-[#A8A29E] hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Supprimer ce carnet"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}