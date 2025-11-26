import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';
import { cn, formatDate } from '../utils';

interface TaskBallProps {
  task: Task;
  onClick: (task: Task) => void;
  onDoubleClick: (task: Task) => void;
  onLongPress: (task: Task) => void;
  onDragStart?: (task: Task) => void;
  onDragRelease: (task: Task, point: { x: number, y: number }) => void;
}

export const TaskBall: React.FC<TaskBallProps> = ({ 
  task, 
  onClick, 
  onDoubleClick, 
  onLongPress,
  onDragStart,
  onDragRelease
}) => {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging = useRef(false);
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle Long Press
  const handleTouchStart = () => {
    isDragging.current = false;
    longPressTimer.current = setTimeout(() => {
      if (!isDragging.current) {
        onLongPress(task);
      }
    }, 800);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // Handle Hover
  const handleMouseEnter = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      if (!isDragging.current) {
        setIsHovering(true);
      }
    }, 500); // 500ms delay before showing tooltip
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setIsHovering(false);
  };

  // Simple Markdown Parser for tooltip
  const renderMarkdown = (text: string) => {
    if (!text) return 'No details...';
    
    return text.split('\n').slice(0, 3).map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)|(~~.*?~~)/g);
      return (
        <div key={i} className="truncate">
          {parts.map((part, j) => {
            if (!part) return null;
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('~~') && part.endsWith('~~')) {
              return <s key={j} className="text-slate-400">{part.slice(2, -2)}</s>;
            }
            return <span key={j}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div className={cn(
      "relative group",
      task.position ? "absolute pointer-events-auto" : ""
    )} style={task.position ? { left: task.position.x, top: task.position.y, transform: 'translate(-50%, -50%)' } : undefined}>
      <motion.div
        layoutId={task.id}
        drag
        dragConstraints={false}
        dragElastic={0.05}
        dragSnapToOrigin={true}
        dragMomentum={false}
        whileHover={{ scale: 1.1 }}
        whileDrag={{ scale: 1.2, cursor: 'grabbing' }}
        whileTap={{ scale: 0.95 }}
        onDragStart={() => {
          isDragging.current = true;
          setIsHovering(false);
          if (longPressTimer.current) clearTimeout(longPressTimer.current);
          if (hoverTimer.current) clearTimeout(hoverTimer.current);
          onDragStart?.(task);
        }}
        onDragEnd={(event, info) => {
          isDragging.current = false;
          onDragRelease(task, info.point);
        }}
        onPointerDown={handleTouchStart}
        onPointerUp={handleTouchEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          if (!isDragging.current) onClick(task);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onDoubleClick(task);
        }}
        className={cn(
          "relative w-14 h-14 md:w-16 md:h-16 rounded-full shadow-md flex items-center justify-center text-3xl md:text-4xl cursor-grab select-none shrink-0 border-2 border-white/40",
          task.status === 'todo' 
            ? "bg-gradient-to-b from-blue-200 to-blue-400 shadow-blue-300/50" 
            : "bg-gradient-to-b from-emerald-200 to-emerald-400 shadow-emerald-300/50"
        )}
        style={{
          zIndex: isDragging.current ? 100000 : 'auto'
        }}
      >
        {/* Glossy Reflection for Bubble Effect */}
        <div className="absolute top-2 left-3 w-4 h-3 bg-white/60 rounded-full blur-[2px]" />
        <div className="absolute bottom-2 right-3 w-2 h-2 bg-white/30 rounded-full blur-[1px]" />
        
        <span className="drop-shadow-sm filter">{task.emoji}</span>
      </motion.div>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {isHovering && !isDragging.current && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-[10000]"
          >
            <div className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl p-3 min-w-[200px] max-w-[280px]">
              {/* Arrow */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 border-r border-b border-white/60 rotate-45"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{task.emoji}</span>
                  <h4 className="font-bold text-slate-800 text-sm truncate flex-1">{task.title}</h4>
                </div>
                <div className="text-xs text-slate-600 leading-relaxed mb-2">
                  {renderMarkdown(task.description)}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {formatDate(task.createdAt)}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};