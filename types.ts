export interface Task {
  id: string;
  title: string;
  description: string;
  emoji: string;
  status: 'todo' | 'done';
  createdAt: number;
}

export type ModalMode = 'create' | 'edit' | 'closed';
