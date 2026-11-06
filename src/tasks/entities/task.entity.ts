export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  assignee: string;
  dueDate: Date;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}
