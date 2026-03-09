import { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useKanbanStore } from '@/hooks/useKanbanStore';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { CardDetailModal } from './CardDetailModal';
import { BoardHeader, type Filters } from './BoardHeader';
import type { Card } from '@/types/kanban';

export function KanbanBoard() {
  const store = useKanbanStore();
  const { board } = store;

  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ search: '', priority: 'all', assignee: '', label: '' });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Compute unique assignees
  const assignees = useMemo(() => {
    const set = new Set<string>();
    Object.values(board.cards).forEach(c => { if (c.assignee) set.add(c.assignee); });
    return Array.from(set).sort();
  }, [board.cards]);

  // Filter cards
  const filterCard = useCallback((card: Card) => {
    if (filters.search && !card.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.priority !== 'all' && card.priority !== filters.priority) return false;
    if (filters.assignee && card.assignee !== filters.assignee) return false;
    if (filters.label && !card.labels.find(l => l.id === filters.label)) return false;
    return true;
  }, [filters]);

  const getFilteredCards = useCallback((cardIds: string[]) => {
    return cardIds.map(id => board.cards[id]).filter(c => c && filterCard(c));
  }, [board.cards, filterCard]);

  // Find which column a card belongs to
  const findColumnOfCard = (cardId: string) => {
    return board.columns.find(col => col.cardIds.includes(cardId));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = board.cards[active.id as string];
    if (card) setActiveCard(card);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCol = findColumnOfCard(activeId);
    // Check if over is a column or a card
    const overCol = board.columns.find(c => c.id === overId) || findColumnOfCard(overId);

    if (!activeCol || !overCol || activeCol.id === overCol.id) return;

    // Moving to different column
    const overIndex = overCol.cardIds.indexOf(overId);
    const insertIndex = overIndex >= 0 ? overIndex : overCol.cardIds.length;
    store.moveCard(activeId, activeCol.id, overCol.id, insertIndex);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeCol = findColumnOfCard(activeId);
    if (!activeCol) return;

    // Same column reorder
    if (activeCol.cardIds.includes(overId)) {
      const overIndex = activeCol.cardIds.indexOf(overId);
      store.moveCard(activeId, activeCol.id, activeCol.id, overIndex);
    }
    // Dropped on empty column
    const targetCol = board.columns.find(c => c.id === overId);
    if (targetCol && !targetCol.cardIds.includes(activeId)) {
      const fromCol = findColumnOfCard(activeId);
      if (fromCol) {
        store.moveCard(activeId, fromCol.id, targetCol.id, targetCol.cardIds.length);
      }
    }
  };

  const selectedCard = selectedCardId ? board.cards[selectedCardId] : null;

  return (
    <div className="flex flex-col h-screen bg-kanban-bg">
      <BoardHeader
        title={board.title}
        onRename={store.renameBoard}
        onAddColumn={store.addColumn}
        filters={filters}
        onFiltersChange={setFilters}
        assignees={assignees}
      />

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 kanban-scrollbar">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full">
            <SortableContext items={board.columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
              {board.columns.map(column => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  cards={getFilteredCards(column.cardIds)}
                  onAddCard={title => store.addCard(column.id, title)}
                  onCardClick={setSelectedCardId}
                  onRename={title => store.renameColumn(column.id, title)}
                  onDelete={() => store.deleteColumn(column.id)}
                  onSetWipLimit={limit => store.setWipLimit(column.id, limit)}
                />
              ))}
            </SortableContext>
          </div>

          <DragOverlay>
            {activeCard && (
              <KanbanCard card={activeCard} onClick={() => {}} isDragOverlay />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      <CardDetailModal
        card={selectedCard}
        open={!!selectedCard}
        onClose={() => setSelectedCardId(null)}
        onUpdate={store.updateCard}
        onDelete={store.deleteCard}
        onAddSubtask={store.addSubtask}
        onToggleSubtask={store.toggleSubtask}
        onDeleteSubtask={store.deleteSubtask}
      />
    </div>
  );
}
