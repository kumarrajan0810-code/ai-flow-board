import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Board, Card, Column, Priority, Label, Subtask } from '@/types/kanban';

const STORAGE_KEY = 'kanban-board';

function createDefaultBoard(): Board {
  const columns: Column[] = [
    { id: 'col-backlog', title: 'Backlog', cardIds: [], wipLimit: null },
    { id: 'col-todo', title: 'To Do', cardIds: [], wipLimit: null },
    { id: 'col-progress', title: 'In Progress', cardIds: [], wipLimit: 5 },
    { id: 'col-review', title: 'Review', cardIds: [], wipLimit: 3 },
    { id: 'col-done', title: 'Done', cardIds: [], wipLimit: null },
  ];

  // Sample cards
  const sampleCards: Card[] = [
    {
      id: uuidv4(), title: 'Set up project architecture', description: 'Define the folder structure, tech stack, and coding standards.',
      priority: 'high', assignee: 'Alex', dueDate: '2026-03-15', labels: [{ id: 'l2', name: 'Feature', color: 'blue' }],
      subtasks: [
        { id: uuidv4(), title: 'Define folder structure', completed: true },
        { id: uuidv4(), title: 'Set up linting', completed: false },
      ],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(), title: 'Design landing page', description: 'Create wireframes and high-fidelity mockups.',
      priority: 'medium', assignee: 'Sara', dueDate: '2026-03-20', labels: [{ id: 'l5', name: 'Design', color: 'pink' }],
      subtasks: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(), title: 'Fix login bug', description: 'Users report intermittent 401 errors on login.',
      priority: 'critical', assignee: 'Alex', dueDate: '2026-03-10', labels: [{ id: 'l1', name: 'Bug', color: 'red' }, { id: 'l6', name: 'Urgent', color: 'orange' }],
      subtasks: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(), title: 'Write API documentation', description: 'Document all REST endpoints.',
      priority: 'low', assignee: 'Jordan', dueDate: null, labels: [{ id: 'l7', name: 'Documentation', color: 'teal' }],
      subtasks: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(), title: 'Implement search feature', description: 'Add full-text search across all resources.',
      priority: 'high', assignee: 'Sara', dueDate: '2026-03-25', labels: [{ id: 'l2', name: 'Feature', color: 'blue' }],
      subtasks: [
        { id: uuidv4(), title: 'Backend search API', completed: false },
        { id: uuidv4(), title: 'Frontend search UI', completed: false },
        { id: uuidv4(), title: 'Search result ranking', completed: false },
      ],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
  ];

  const cards: Record<string, Card> = {};
  sampleCards.forEach(c => { cards[c.id] = c; });

  columns[0].cardIds = [sampleCards[3].id]; // Backlog
  columns[1].cardIds = [sampleCards[0].id, sampleCards[4].id]; // To Do
  columns[2].cardIds = [sampleCards[2].id]; // In Progress
  columns[3].cardIds = [sampleCards[1].id]; // Review

  return { id: 'board-1', title: 'Project Board', columns, cards };
}

function loadBoard(): Board {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return createDefaultBoard();
}

export function useKanbanStore() {
  const [board, setBoard] = useState<Board>(loadBoard);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  }, [board]);

  const updateBoard = useCallback((updater: (b: Board) => Board) => {
    setBoard(prev => updater(prev));
  }, []);

  // Column operations
  const addColumn = useCallback((title: string) => {
    updateBoard(b => ({
      ...b,
      columns: [...b.columns, { id: uuidv4(), title, cardIds: [], wipLimit: null }],
    }));
  }, [updateBoard]);

  const renameColumn = useCallback((colId: string, title: string) => {
    updateBoard(b => ({
      ...b,
      columns: b.columns.map(c => c.id === colId ? { ...c, title } : c),
    }));
  }, [updateBoard]);

  const deleteColumn = useCallback((colId: string) => {
    updateBoard(b => {
      const col = b.columns.find(c => c.id === colId);
      const newCards = { ...b.cards };
      col?.cardIds.forEach(id => delete newCards[id]);
      return { ...b, columns: b.columns.filter(c => c.id !== colId), cards: newCards };
    });
  }, [updateBoard]);

  const setWipLimit = useCallback((colId: string, limit: number | null) => {
    updateBoard(b => ({
      ...b,
      columns: b.columns.map(c => c.id === colId ? { ...c, wipLimit: limit } : c),
    }));
  }, [updateBoard]);

  const reorderColumns = useCallback((fromIndex: number, toIndex: number) => {
    updateBoard(b => {
      const cols = [...b.columns];
      const [moved] = cols.splice(fromIndex, 1);
      cols.splice(toIndex, 0, moved);
      return { ...b, columns: cols };
    });
  }, [updateBoard]);

  // Card operations
  const addCard = useCallback((colId: string, title: string) => {
    const card: Card = {
      id: uuidv4(), title, description: '', priority: 'none', assignee: '',
      dueDate: null, labels: [], subtasks: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    updateBoard(b => ({
      ...b,
      cards: { ...b.cards, [card.id]: card },
      columns: b.columns.map(c => c.id === colId ? { ...c, cardIds: [...c.cardIds, card.id] } : c),
    }));
    return card.id;
  }, [updateBoard]);

  const updateCard = useCallback((cardId: string, updates: Partial<Card>) => {
    updateBoard(b => ({
      ...b,
      cards: { ...b.cards, [cardId]: { ...b.cards[cardId], ...updates, updatedAt: new Date().toISOString() } },
    }));
  }, [updateBoard]);

  const deleteCard = useCallback((cardId: string) => {
    updateBoard(b => {
      const newCards = { ...b.cards };
      delete newCards[cardId];
      return {
        ...b,
        cards: newCards,
        columns: b.columns.map(c => ({ ...c, cardIds: c.cardIds.filter(id => id !== cardId) })),
      };
    });
  }, [updateBoard]);

  const moveCard = useCallback((cardId: string, fromColId: string, toColId: string, toIndex: number) => {
    updateBoard(b => ({
      ...b,
      columns: b.columns.map(c => {
        if (c.id === fromColId && c.id === toColId) {
          const ids = c.cardIds.filter(id => id !== cardId);
          ids.splice(toIndex, 0, cardId);
          return { ...c, cardIds: ids };
        }
        if (c.id === fromColId) return { ...c, cardIds: c.cardIds.filter(id => id !== cardId) };
        if (c.id === toColId) {
          const ids = [...c.cardIds];
          ids.splice(toIndex, 0, cardId);
          return { ...c, cardIds: ids };
        }
        return c;
      }),
    }));
  }, [updateBoard]);

  // Subtask operations
  const addSubtask = useCallback((cardId: string, title: string) => {
    updateBoard(b => {
      const card = b.cards[cardId];
      return {
        ...b,
        cards: { ...b.cards, [cardId]: { ...card, subtasks: [...card.subtasks, { id: uuidv4(), title, completed: false }], updatedAt: new Date().toISOString() } },
      };
    });
  }, [updateBoard]);

  const toggleSubtask = useCallback((cardId: string, subtaskId: string) => {
    updateBoard(b => {
      const card = b.cards[cardId];
      return {
        ...b,
        cards: { ...b.cards, [cardId]: { ...card, subtasks: card.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s), updatedAt: new Date().toISOString() } },
      };
    });
  }, [updateBoard]);

  const deleteSubtask = useCallback((cardId: string, subtaskId: string) => {
    updateBoard(b => {
      const card = b.cards[cardId];
      return {
        ...b,
        cards: { ...b.cards, [cardId]: { ...card, subtasks: card.subtasks.filter(s => s.id !== subtaskId), updatedAt: new Date().toISOString() } },
      };
    });
  }, [updateBoard]);

  const renameBoard = useCallback((title: string) => {
    updateBoard(b => ({ ...b, title }));
  }, [updateBoard]);

  return {
    board, addColumn, renameColumn, deleteColumn, setWipLimit, reorderColumns,
    addCard, updateCard, deleteCard, moveCard,
    addSubtask, toggleSubtask, deleteSubtask, renameBoard,
  };
}
