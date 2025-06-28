export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export type Subtask = {
  id: string;
  text: string;
  completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  subtasks: Subtask[];
  createdAt: any; // Can be Date, ISO string, or Firestore Timestamp
};
