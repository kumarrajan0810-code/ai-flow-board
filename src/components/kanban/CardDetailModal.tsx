import { useState } from 'react';
import { X, Calendar, User, Tag, CheckSquare, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Card, Priority, Label } from '@/types/kanban';
import { DEFAULT_LABELS, PRIORITY_CONFIG } from '@/types/kanban';
import { cn } from '@/lib/utils';

interface CardDetailModalProps {
  card: Card | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (cardId: string, updates: Partial<Card>) => void;
  onDelete: (cardId: string) => void;
  onAddSubtask: (cardId: string, title: string) => void;
  onToggleSubtask: (cardId: string, subtaskId: string) => void;
  onDeleteSubtask: (cardId: string, subtaskId: string) => void;
}

const labelBg: Record<string, string> = {
  blue: 'bg-label-blue/15 text-label-blue border-label-blue/30',
  green: 'bg-label-green/15 text-label-green border-label-green/30',
  yellow: 'bg-label-yellow/15 text-label-yellow border-label-yellow/30',
  red: 'bg-label-red/15 text-label-red border-label-red/30',
  purple: 'bg-label-purple/15 text-label-purple border-label-purple/30',
  pink: 'bg-label-pink/15 text-label-pink border-label-pink/30',
  orange: 'bg-label-orange/15 text-label-orange border-label-orange/30',
  teal: 'bg-label-teal/15 text-label-teal border-label-teal/30',
};

export function CardDetailModal({ card, open, onClose, onUpdate, onDelete, onAddSubtask, onToggleSubtask, onDeleteSubtask }: CardDetailModalProps) {
  const [newSubtask, setNewSubtask] = useState('');
  const [showLabelPicker, setShowLabelPicker] = useState(false);

  if (!card) return null;

  const completedSubtasks = card.subtasks.filter(s => s.completed).length;
  const progress = card.subtasks.length > 0 ? (completedSubtasks / card.subtasks.length) * 100 : 0;

  const toggleLabel = (label: Label) => {
    const exists = card.labels.find(l => l.id === label.id);
    const newLabels = exists
      ? card.labels.filter(l => l.id !== label.id)
      : [...card.labels, label];
    onUpdate(card.id, { labels: newLabels });
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      onAddSubtask(card.id, newSubtask.trim());
      setNewSubtask('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Edit Task</DialogTitle>
        </DialogHeader>

        {/* Title */}
        <Input
          value={card.title}
          onChange={e => onUpdate(card.id, { title: e.target.value })}
          className="text-lg font-semibold border-none bg-transparent focus-visible:ring-0 px-0 h-auto"
          placeholder="Task title"
        />

        {/* Description */}
        <Textarea
          value={card.description}
          onChange={e => onUpdate(card.id, { description: e.target.value })}
          placeholder="Add a description..."
          className="min-h-[80px] border-none bg-muted/50 focus-visible:ring-1 resize-none text-sm"
        />

        {/* Fields grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              Priority
            </label>
            <Select value={card.priority} onValueChange={(v: Priority) => onUpdate(card.id, { priority: v })}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY_CONFIG).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <User className="w-3 h-3" /> Assignee
            </label>
            <Input
              value={card.assignee}
              onChange={e => onUpdate(card.id, { assignee: e.target.value })}
              placeholder="Assign to..."
              className="h-9 text-sm"
            />
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3 h-3" /> Due date
            </label>
            <Input
              type="date"
              value={card.dueDate ?? ''}
              onChange={e => onUpdate(card.id, { dueDate: e.target.value || null })}
              className="h-9 text-sm"
            />
          </div>
        </div>

        {/* Labels */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Tag className="w-3 h-3" /> Labels
            </label>
            <button
              onClick={() => setShowLabelPicker(!showLabelPicker)}
              className="text-xs text-primary hover:underline"
            >
              {showLabelPicker ? 'Done' : 'Edit'}
            </button>
          </div>
          {card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {card.labels.map(label => (
                <Badge key={label.id} variant="outline" className={cn('text-xs', labelBg[label.color])}>
                  {label.name}
                </Badge>
              ))}
            </div>
          )}
          {showLabelPicker && (
            <div className="flex flex-wrap gap-1.5 p-2 bg-muted/50 rounded-lg">
              {DEFAULT_LABELS.map(label => {
                const isActive = card.labels.find(l => l.id === label.id);
                return (
                  <button
                    key={label.id}
                    onClick={() => toggleLabel(label)}
                    className={cn(
                      'text-xs px-2 py-1 rounded border transition-all',
                      labelBg[label.color],
                      isActive ? 'ring-2 ring-primary/30' : 'opacity-60 hover:opacity-100',
                    )}
                  >
                    {label.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Subtasks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <CheckSquare className="w-3 h-3" /> Subtasks
              {card.subtasks.length > 0 && (
                <span className="text-muted-foreground">({completedSubtasks}/{card.subtasks.length})</span>
              )}
            </label>
          </div>

          {card.subtasks.length > 0 && (
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="space-y-1">
            {card.subtasks.map(subtask => (
              <div key={subtask.id} className="flex items-center gap-2 group py-1">
                <Checkbox
                  checked={subtask.completed}
                  onCheckedChange={() => onToggleSubtask(card.id, subtask.id)}
                />
                <span className={cn('text-sm flex-1', subtask.completed && 'line-through text-muted-foreground')}>
                  {subtask.title}
                </span>
                <button
                  onClick={() => onDeleteSubtask(card.id, subtask.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newSubtask}
              onChange={e => setNewSubtask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
              placeholder="Add subtask..."
              className="h-8 text-sm"
            />
            <Button size="sm" variant="ghost" onClick={handleAddSubtask} className="h-8 px-2">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Delete */}
        <div className="pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full justify-start"
            onClick={() => { onDelete(card.id); onClose(); }}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
