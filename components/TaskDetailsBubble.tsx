import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';
import { formatDate } from '../utils';
import { X, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

interface TaskDetailsBubbleProps {
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleStatus: (task: Task) => void;
}

// Simple Markdown Parser
const MarkdownText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return <em className="text-slate-400">No details provided...</em>;

  return (
    <div className="space-y-1">
      {text.split('\n').map((line, lineIndex) => {
        // Regex to capture **bold** and ~~strike~~
        // Groups: 1=bold, 2=strike
        const parts = line.split(/(\*\*.*?\*\*)|(~~.*?~~)/g);
        
        return (
          <div key={lineIndex} className="min-h-[1.2em]">
            {parts.map((part, partIndex) => {
              if (!part) return null;
              
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={partIndex} className="font-bold text-slate-800">{part.slice(2, -2)}</strong>;
              }
              
              if (part.startsWith('~~') && part.endsWith('~~')) {
                return <s key={partIndex} className="text-slate-400 decoration-slate-400">{part.slice(2, -2)}</s>;
              }
              
              return <span key={partIndex}>{part}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
};

export const TaskDetailsBubble: React.FC<TaskDetailsBubbleProps> = ({ 
  task, 
  onClose,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  if (!task) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm bg-white/80 border border-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl text-slate-700 ring-1 ring-white/50"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="text-5xl filter drop-shadow-sm transform -rotate-6">{task.emoji}</span>
              <div>
                <h3 className={`text-xl font-bold ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {task.title}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1 bg-slate-100 inline-block px-2 py-0.5 rounded-full">
                  {formatDate(task.createdAt)}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="bg-white/50 rounded-2xl p-4 mb-6 max-h-60 overflow-y-auto text-sm leading-relaxed border border-white shadow-inner text-slate-600">
            <MarkdownText text={task.description} />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <button 
              onClick={() => { onDelete(task.id); onClose(); }}
              className="flex flex-col items-center justify-center w-10 h-10 hover:bg-red-50 rounded-full text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
            
            <div className="flex gap-2 flex-1 justify-end">
               <button 
                onClick={() => { onEdit(task); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold transition-all text-slate-600 shadow-sm hover:shadow text-sm"
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button 
                onClick={() => { onToggleStatus(task); onClose(); }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow text-sm text-white ${
                  task.status === 'done' 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 shadow-orange-200' 
                    : 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-emerald-200'
                }`}
              >
                <CheckCircle2 size={18} />
                {task.status === 'done' ? 'Undone' : 'Done!'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};