import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, ModalMode } from './types';
import { generateId, cn } from './utils';
import { TaskBall } from './components/TaskBall';
import { TaskModal } from './components/TaskModal';
import { TaskDetailsBubble } from './components/TaskDetailsBubble';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Buy Cookies', description: '- Chocolate Chip\n- ~~Oatmeal~~', emoji: '🍪', status: 'todo', createdAt: Date.now() },
    { id: '2', title: 'Walk the Dog', description: 'Remember the leash!', emoji: '🐕', status: 'done', createdAt: Date.now() - 100000 },
  ]);

  const [modalMode, setModalMode] = useState<ModalMode>('closed');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [activeTube, setActiveTube] = useState<'todo' | 'done' | null>(null);
  
  // Refs for collision detection
  const todoTubeRef = useRef<HTMLDivElement>(null);
  const doneTubeRef = useRef<HTMLDivElement>(null);

  const todoTasks = useMemo(() => tasks.filter(t => t.status === 'todo').sort((a,b) => b.createdAt - a.createdAt), [tasks]);
  const doneTasks = useMemo(() => tasks.filter(t => t.status === 'done').sort((a,b) => b.createdAt - a.createdAt), [tasks]);

  const handleCreateTask = (data: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    const newTask: Task = {
      ...data,
      id: generateId(),
      status: 'todo',
      createdAt: Date.now(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleUpdateTask = (data: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...data } : t));
    } else {
      handleCreateTask(data);
    }
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm("Pop this task bubble?")) {
      setTasks(prev => prev.filter(t => t.id !== id));
      setSelectedTask(null);
    }
  };

  const handleDragStart = (task: Task) => {
    setActiveTube(task.status);
  };

  const handleDragRelease = (task: Task, point: { x: number, y: number }) => {
    setActiveTube(null);
    const todoRect = todoTubeRef.current?.getBoundingClientRect();
    const doneRect = doneTubeRef.current?.getBoundingClientRect();

    if (!todoRect || !doneRect) return;

    // Check collision with the visual tube area
    const inTodo = point.y >= todoRect.top && point.y <= todoRect.bottom && point.x >= todoRect.left && point.x <= todoRect.right;
    const inDone = point.y >= doneRect.top && point.y <= doneRect.bottom && point.x >= doneRect.left && point.x <= doneRect.right;

    if (task.status === 'todo' && inDone) {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'done' } : t));
    } else if (task.status === 'done' && inTodo) {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'todo' } : t));
    }
  };

  const toggleStatus = (task: Task) => {
    const newStatus = task.status === 'todo' ? 'done' : 'todo';
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 gap-8">
      
      {/* Header */}
      <header className="z-10 text-center mt-4">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-700 tracking-tight drop-shadow-sm font-[Fredoka]">
          TubeTasker
        </h1>
        <p className="text-slate-400 font-medium mt-2">Drag bubbles to complete tasks!</p>
      </header>

      {/* --- TUBE 1: TO DO --- */}
      <div className="relative w-full max-w-3xl flex flex-col gap-3" style={{ zIndex: activeTube === 'todo' ? 9998 : 5 }}>
        {/* CREATE BALL - positioned above the todo tube */}
        <div className="relative z-[100] h-20 flex items-center justify-center -mb-2">
          <motion.button
            layoutId="create-ball"
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { 
              setEditingTask(undefined);
              setModalMode('create'); 
            }}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-b from-white to-slate-100 shadow-[0_10px_25px_rgba(0,0,0,0.1)] flex items-center justify-center text-3xl md:text-4xl cursor-pointer ring-4 ring-white/50 relative group text-slate-700"
          >
            <div className="absolute top-2 left-4 w-4 h-3 bg-white rounded-full blur-[1px]" />
            ➕
            <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-slate-500 whitespace-nowrap bg-white/80 px-3 py-1 rounded-full shadow-sm pointer-events-none">
              New Task
            </div>
          </motion.button>
        </div>

        <div className="flex items-center gap-3 px-6">
           <div className="w-3 h-3 rounded-full bg-blue-400"></div>
           <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Waiting Area</span>
        </div>
        
        {/* 
          Container Strategy for Clipping: 
          The 'visual-tube' is absolute and sets the glass look.
          The 'scroll-container' is taller (h-40) but pulled back with negative margins (-my-6).
          This allows the ball to move partially vertically outside the "visual" tube without getting clipped immediately.
        */}
        <div className="relative w-full h-28 md:h-32 overflow-visible">
          {/* Visual Glass Tube */}
          <div 
            ref={todoTubeRef}
            className="absolute inset-0 w-full h-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-[60px] shadow-sm z-0 overflow-hidden"
          ></div>

          {/* Interaction/Scroll Layer - Taller to prevent immediate clipping */}
          <div className="absolute inset-x-0 -top-6 -bottom-6 z-10 flex items-center overflow-x-auto overflow-y-visible tube-scroll px-8 pointer-events-auto">
            <div className="flex items-center gap-6 min-w-max py-8"> {/* extra vertical padding for drag space */}
              <AnimatePresence mode='popLayout'>
                {todoTasks.map((task) => (
                  <TaskBall 
                    key={task.id} 
                    task={task} 
                    onClick={() => setSelectedTask(task)}
                    onDoubleClick={() => {
                      setEditingTask(task);
                      setModalMode('edit');
                    }}
                    onLongPress={() => handleDeleteTask(task.id)}
                    onDragStart={handleDragStart}
                    onDragRelease={handleDragRelease}
                  />
                ))}
                {todoTasks.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                    className="text-slate-400/60 text-sm font-medium italic ml-4 select-none"
                  >
                    Drop tasks here...
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* --- TUBE 2: DONE --- */}
      <div className="relative w-full max-w-3xl flex flex-col gap-3" style={{ zIndex: activeTube === 'done' ? 9998 : 5 }}>
        <div className="flex items-center gap-3 px-6">
           <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
           <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Completed</span>
        </div>

        <div className="relative w-full h-28 md:h-32 overflow-visible">
          {/* Visual Glass Tube */}
          <div 
            ref={doneTubeRef}
            className="absolute inset-0 w-full h-full bg-emerald-50/30 backdrop-blur-xl border border-white/60 rounded-[60px] shadow-inner z-0 overflow-hidden"
          ></div>

          {/* Interaction/Scroll Layer */}
          <div className="absolute inset-x-0 -top-6 -bottom-6 z-10 flex items-center overflow-x-auto overflow-y-visible tube-scroll px-8 pointer-events-auto">
             <div className="flex items-center gap-6 min-w-max py-8">
              <AnimatePresence mode='popLayout'>
                {doneTasks.map((task) => (
                  <TaskBall 
                    key={task.id} 
                    task={task} 
                    onClick={() => setSelectedTask(task)}
                    onDoubleClick={() => {
                      setEditingTask(task);
                      setModalMode('edit');
                    }}
                    onLongPress={() => handleDeleteTask(task.id)}
                    onDragStart={handleDragStart}
                    onDragRelease={handleDragRelease}
                  />
                ))}
                 {doneTasks.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                    className="text-slate-400/60 text-sm font-medium italic ml-4 select-none"
                  >
                    Completed tasks appear here
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {modalMode !== 'closed' && (
          <TaskModal 
            mode={modalMode} 
            initialTask={editingTask}
            onClose={() => setModalMode('closed')} 
            onSave={(data) => {
              handleUpdateTask(data);
              setModalMode('closed');
            }}
          />
        )}
        
        {selectedTask && (
          <TaskDetailsBubble
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onDelete={handleDeleteTask}
            onEdit={(task) => {
               setEditingTask(task);
               setModalMode('edit');
               setSelectedTask(null);
            }}
            onToggleStatus={toggleStatus}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-4 text-[10px] text-slate-300 font-mono">
         TubeTasker v1.1 • Double-tap to edit • Long-press to delete
      </div>

    </div>
  );
};

export default App;