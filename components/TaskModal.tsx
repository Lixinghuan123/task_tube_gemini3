import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Task, ModalMode } from '../types';
import { EmojiPicker } from './EmojiPicker';
import { X, Type, Bold, List } from 'lucide-react';

interface TaskModalProps {
  mode: ModalMode;
  initialTask?: Task;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ mode, initialTask, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('📌');

  useEffect(() => {
    if (mode === 'edit' && initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setEmoji(initialTask.emoji);
    } else {
      setTitle('');
      setDescription('');
      setEmoji('📌');
    }
  }, [mode, initialTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Relaxed validation: Allow empty description. Title is nice to have but we can default if empty.
    const finalTitle = title.trim() || 'Untitled Task';
    onSave({ title: finalTitle, description, emoji });
    onClose();
  };

  const insertFormat = (format: string) => {
    const textarea = document.getElementById('task-desc') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const selection = text.substring(start, end);

    let newText = '';
    
    if (format === 'bold') newText = `${before}**${selection || 'text'}**${after}`;
    if (format === 'list') newText = `${before}\n- ${selection || 'item'}${after}`;
    if (format === 'strike') newText = `${before}~~${selection || 'text'}~~${after}`;

    setDescription(newText);
    setTimeout(() => {
        textarea.focus();
        // Try to put cursor after inserted text
        const newCursorPos = newText.length - after.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  if (mode === 'closed') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        className="w-full max-w-lg bg-white/90 border border-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-slate-900/5"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white/50">
          <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
             {mode === 'create' ? '✨ New Task' : '✏️ Edit Task'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          
          {/* Top Row: Emoji & Title */}
          <div className="flex gap-4">
             <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Icon</label>
              <div className="w-14 h-14 text-3xl bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm ring-offset-2 ring-offset-white focus-within:ring-2 ring-blue-400 transition">
                {emoji}
              </div>
            </div>
            
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Task Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Buy flowers..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition font-medium"
                autoFocus
              />
            </div>
          </div>

          <div>
             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Choose Icon</label>
             <div className="bg-slate-50 p-2 rounded-2xl border border-slate-100">
                <EmojiPicker selected={emoji} onSelect={setEmoji} />
             </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Details</label>
              <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                <button type="button" onClick={() => insertFormat('bold')} className="p-1.5 hover:bg-white rounded-md text-slate-500 hover:text-slate-700 hover:shadow-sm transition" title="Bold"><Bold size={14}/></button>
                <button type="button" onClick={() => insertFormat('strike')} className="p-1.5 hover:bg-white rounded-md text-slate-500 hover:text-slate-700 hover:shadow-sm transition" title="Strikethrough"><Type size={14} className="line-through"/></button>
                <button type="button" onClick={() => insertFormat('list')} className="p-1.5 hover:bg-white rounded-md text-slate-500 hover:text-slate-700 hover:shadow-sm transition" title="List"><List size={14}/></button>
              </div>
            </div>
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="- Step 1&#10;- Step 2&#10;~~Done~~"
              className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none font-mono leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-8 py-2.5 rounded-xl text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-200 transition transform active:scale-95"
            >
              {mode === 'create' ? 'Drop it in!' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};