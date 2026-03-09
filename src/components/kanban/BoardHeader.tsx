import { useState } from 'react';
import { Filter, Plus, Search, X, LayoutGrid, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Priority } from '@/types/kanban';
import { PRIORITY_CONFIG, DEFAULT_LABELS } from '@/types/kanban';
import { cn } from '@/lib/utils';

export interface Filters {
  search: string;
  priority: Priority | 'all';
  assignee: string;
  label: string;
}

interface BoardHeaderProps {
  title: string;
  onRename: (title: string) => void;
  onAddColumn: (title: string) => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  assignees: string[];
}

export function BoardHeader({ title, onRename, onAddColumn, filters, onFiltersChange, assignees }: BoardHeaderProps) {
  const { signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);

  const hasActiveFilters = filters.search || filters.priority !== 'all' || filters.assignee || filters.label;

  const clearFilters = () => onFiltersChange({ search: '', priority: 'all', assignee: '', label: '' });

  const handleRename = () => {
    if (editTitle.trim()) onRename(editTitle.trim());
    setIsEditing(false);
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-card">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-primary" />
          {isEditing ? (
            <Input
              autoFocus
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => e.key === 'Enter' && handleRename()}
              className="h-8 text-xl font-bold border-none bg-transparent focus-visible:ring-1 px-1 w-60"
            />
          ) : (
            <h1
              className="text-xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
              onDoubleClick={() => { setEditTitle(title); setIsEditing(true); }}
            >
              {title}
            </h1>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={e => onFiltersChange({ ...filters, search: e.target.value })}
            placeholder="Search tasks..."
            className="h-9 pl-9 w-52 text-sm"
          />
        </div>

        {/* Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn('h-9 gap-1.5', hasActiveFilters && 'border-primary text-primary')}>
              <Filter className="w-4 h-4" />
              Filter
              {hasActiveFilters && <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">Active</Badge>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4 space-y-3" align="end">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Filters</span>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-primary hover:underline">Clear all</button>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Priority</label>
              <Select value={filters.priority} onValueChange={(v: Priority | 'all') => onFiltersChange({ ...filters, priority: v })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  {Object.entries(PRIORITY_CONFIG).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Assignee</label>
              <Select value={filters.assignee || 'all'} onValueChange={v => onFiltersChange({ ...filters, assignee: v === 'all' ? '' : v })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All assignees</SelectItem>
                  {assignees.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Label</label>
              <Select value={filters.label || 'all'} onValueChange={v => onFiltersChange({ ...filters, label: v === 'all' ? '' : v })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All labels</SelectItem>
                  {DEFAULT_LABELS.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>

        {/* Add column */}
        <Button
          size="sm"
          className="h-9 gap-1.5"
          onClick={() => {
            const name = prompt('Column name:');
            if (name?.trim()) onAddColumn(name.trim());
          }}
        >
          <Plus className="w-4 h-4" /> Add Column
        </Button>

        {/* Sign out */}
        <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-muted-foreground" onClick={signOut}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
