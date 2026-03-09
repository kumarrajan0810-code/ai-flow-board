import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import type { Column, Card } from '@/types/kanban';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

interface KanbanColumnProps {
  column: Column;
  cards: Card[];
  onAddCard: (title: string) => void;
  onCardClick: (cardId: string) => void;
  onRename: (title: string) => void;
  onDelete: () => void;
  onSetWipLimit: (limit: number | null) => void;
}

export function KanbanColumn({ column, cards, onAddCard, onCardClick, onRename, onDelete, onSetWipLimit }: KanbanColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);

  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: 'column' } });

  const isOverWip = column.wipLimit !== null && cards.length > column.wipLimit;
  const isAtWip = column.wipLimit !== null && cards.length === column.wipLimit;

  const handleAdd = () => {
    if (newTitle.trim()) {
      onAddCard(newTitle.trim());
      setNewTitle('');
      setIsAdding(false);
    }
  };

  const handleRename = () => {
    if (editTitle.trim() && editTitle.trim() !== column.title) {
      onRename(editTitle.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className={cn(
      'flex flex-col w-72 shrink-0 rounded-xl bg-kanban-column-bg',
      isOver && 'ring-2 ring-primary/30',
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2 min-w-0">
          {isEditing ? (
            <Input
              autoFocus
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => e.key === 'Enter' && handleRename()}
              className="h-6 text-sm font-semibold px-1 bg-transparent border-none focus-visible:ring-1"
            />
          ) : (
            <h3
              className="text-sm font-semibold text-kanban-column-header truncate cursor-pointer"
              onDoubleClick={() => { setEditTitle(column.title); setIsEditing(true); }}
            >
              {column.title}
            </h3>
          )}
          <span className={cn(
            'text-xs font-medium px-1.5 py-0.5 rounded-full',
            isOverWip ? 'bg-wip-exceeded/15 text-wip-exceeded' :
            isAtWip ? 'bg-wip-warning/15 text-wip-warning' :
            'bg-muted text-muted-foreground'
          )}>
            {cards.length}{column.wipLimit !== null && `/${column.wipLimit}`}
          </span>
          {isOverWip && <AlertTriangle className="w-3.5 h-3.5 text-wip-exceeded" />}
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setIsAdding(true)}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => { setEditTitle(column.title); setIsEditing(true); }}>
                Rename column
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const val = prompt('Set WIP limit (leave empty for none):', column.wipLimit?.toString() ?? '');
                if (val === null) return;
                onSetWipLimit(val === '' ? null : parseInt(val, 10) || null);
              }}>
                Set WIP limit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                Delete column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cards */}
      <div ref={setNodeRef} className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto kanban-scrollbar min-h-[60px]">
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map(card => (
            <KanbanCard key={card.id} card={card} onClick={() => onCardClick(card.id)} />
          ))}
        </SortableContext>

        {/* Add card input */}
        {isAdding && (
          <div className="bg-kanban-card-bg border border-kanban-card-border rounded-lg p-2">
            <Input
              autoFocus
              placeholder="Task title..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') { setIsAdding(false); setNewTitle(''); }
              }}
              onBlur={() => { if (!newTitle.trim()) setIsAdding(false); }}
              className="h-8 text-sm border-none bg-transparent focus-visible:ring-0 px-1"
            />
          </div>
        )}
      </div>
    </div>
  );
}
