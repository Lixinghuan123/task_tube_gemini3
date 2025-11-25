import React, { useRef } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { Task } from '../types';
import { cn } from '../utils';

interface TaskBallProps {
  task: Task;
  onClick: (task: Task) => void;
  onDoubleClick: (task: Task) => void;
  onLongPress: (task: Task) => void;
  onDragRelease: (task: Task, point: { x: number, y: number }) => void;
}

export const TaskBall: React.FC<TaskBallProps> = ({ 
  task, 
  onClick, 
  onDoubleClick, 
  onLongPress,
  onDragRelease
}) => {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging = useRef(false);

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

  return (
    <motion.div
      layoutId={task.id}
      drag
      dragConstraints={{ top: -300, left: -300, right: 300, bottom: 300 }}
      dragElastic={0.1}
      dragSnapToOrigin={true}
      whileHover={{ scale: 1.1, zIndex: 50 }}
      whileDrag={{ scale: 1.2, zIndex: 100, cursor: 'grabbing' }}
      whileTap={{ scale: 0.95 }}
      onDragStart={() => {
        isDragging.current = true;
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
      }}
      onDragEnd={(event, info) => {
        isDragging.current = false;
        onDragRelease(task, info.point);
      }}
      onPointerDown={handleTouchStart}
      onPointerUp={handleTouchEnd}
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
    >
      {/* Glossy Reflection for Bubble Effect */}
      <div className="absolute top-2 left-3 w-4 h-3 bg-white/60 rounded-full blur-[2px]" />
      <div className="absolute bottom-2 right-3 w-2 h-2 bg-white/30 rounded-full blur-[1px]" />
      
      <span className="drop-shadow-sm filter">{task.emoji}</span>
    </motion.div>
  );
};