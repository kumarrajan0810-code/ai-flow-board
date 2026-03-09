export type Priority = 'critical' | 'high' | 'medium' | 'low' | 'none';

export type LabelColor = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'pink' | 'orange' | 'teal';

export interface Label {
  id: string;
  name: string;
  color: LabelColor;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  assignee: string;
  dueDate: string | null;
  labels: Label[];
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  cardIds: string[];
  wipLimit: number | null;
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
  cards: Record<string, Card>;
}

export const DEFAULT_LABELS: Label[] = [
  { id: 'l1', name: 'Bug', color: 'red' },
  { id: 'l2', name: 'Feature', color: 'blue' },
  { id: 'l3', name: 'Improvement', color: 'green' },
  { id: 'l4', name: 'Research', color: 'purple' },
  { id: 'l5', name: 'Design', color: 'pink' },
  { id: 'l6', name: 'Urgent', color: 'orange' },
  { id: 'l7', name: 'Documentation', color: 'teal' },
  { id: 'l8', name: 'Testing', color: 'yellow' },
];

export const PRIORITY_CONFIG: Record<Priority, { label: string; order: number }> = {
  critical: { label: 'Critical', order: 0 },
  high: { label: 'High', order: 1 },
  medium: { label: 'Medium', order: 2 },
  low: { label: 'Low', order: 3 },
  none: { label: 'None', order: 4 },
};
