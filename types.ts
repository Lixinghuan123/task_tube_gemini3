export interface Task {
  id: string;
  title: string;
  description: string;
  emoji: string;
  status: 'todo' | 'done';
  createdAt: number;
  position?: { x: number; y: number };
}

export type ModalMode = 'create' | 'edit' | 'closed';
