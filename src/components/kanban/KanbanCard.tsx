import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, CheckSquare, User, GripVertical } from 'lucide-react';
import type { Card } from '@/types/kanban';
import { cn } from '@/lib/utils';
import { format, isPast, isToday } from 'date-fns';

interface KanbanCardProps {
  card: Card;
  onClick: () => void;
  isDragOverlay?: boolean;
}

const priorityDot: Record<string, string> = {
  critical: 'bg-priority-critical',
  high: 'bg-priority-high',
  medium: 'bg-priority-medium',
  low: 'bg-priority-low',
  none: 'bg-priority-none',
};

const labelBg: Record<string, string> = {
  blue: 'bg-label-blue/15 text-label-blue',
  green: 'bg-label-green/15 text-label-green',
  yellow: 'bg-label-yellow/15 text-label-yellow',
  red: 'bg-label-red/15 text-label-red',
  purple: 'bg-label-purple/15 text-label-purple',
  pink: 'bg-label-pink/15 text-label-pink',
  orange: 'bg-label-orange/15 text-label-orange',
  teal: 'bg-label-teal/15 text-label-teal',
};

export function KanbanCard({ card, onClick, isDragOverlay }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card', card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const completedSubtasks = card.subtasks.filter(s => s.completed).length;
  const totalSubtasks = card.subtasks.length;
  const isOverdue = card.dueDate && isPast(new Date(card.dueDate)) && !isToday(new Date(card.dueDate));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group bg-kanban-card-bg border border-kanban-card-border rounded-lg p-3 cursor-pointer',
        'hover:bg-kanban-card-hover transition-colors duration-150',
        'shadow-sm hover:shadow-md',
        isDragging && 'opacity-30',
        isDragOverlay && 'shadow-xl rotate-2 border-primary/50',
      )}
      onClick={onClick}
    >
      {/* Labels */}
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map(label => (
            <span key={label.id} className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded', labelBg[label.color])}>
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Title row with drag handle */}
      <div className="flex items-start gap-1.5">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 opacity-0 group-hover:opacity-50 hover:!opacity-100 cursor-grab active:cursor-grabbing shrink-0"
          onClick={e => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', priorityDot[card.priority])} />
          <span className="text-sm font-medium leading-snug text-foreground line-clamp-2">{card.title}</span>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 mt-2.5 text-muted-foreground">
        {card.dueDate && (
          <span className={cn('flex items-center gap-1 text-[11px]', isOverdue && 'text-destructive font-medium')}>
            <Calendar className="w-3 h-3" />
            {format(new Date(card.dueDate), 'MMM d')}
          </span>
        )}
        {totalSubtasks > 0 && (
          <span className="flex items-center gap-1 text-[11px]">
            <CheckSquare className="w-3 h-3" />
            {completedSubtasks}/{totalSubtasks}
          </span>
        )}
        {card.assignee && (
          <span className="flex items-center gap-1 text-[11px] ml-auto">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
              {card.assignee[0].toUpperCase()}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
