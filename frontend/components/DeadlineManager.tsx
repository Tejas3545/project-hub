'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface Deadline {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  isCompleted: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

interface DeadlineManagerProps {
  projectId: string;
}

export default function DeadlineManager({ projectId }: DeadlineManagerProps) {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newDeadline, setNewDeadline] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIUM' as const
  });

  const fetchDeadlines = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gamification/deadlines?projectId=${projectId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (res.ok) {
        const data = await res.json();
        setDeadlines(data.deadlines);
      }
    } catch (error) {
      console.error('Fetch deadlines error:', error);
    }
  };

  const handleCreate = async () => {
    if (!newDeadline.title || !newDeadline.dueDate) {
      alert('Title and due date are required');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gamification/deadlines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectId, ...newDeadline })
      });

      if (res.ok) {
        const data = await res.json();
        setDeadlines([...deadlines, data.deadline]);
        setNewDeadline({ title: '', description: '', dueDate: '', priority: 'MEDIUM' });
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Create deadline error:', error);
    }
  };

  const toggleComplete = async (deadline: Deadline) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gamification/deadlines/${deadline.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ isCompleted: !deadline.isCompleted })
        }
      );

      if (res.ok) {
        setDeadlines(deadlines.map(d => 
          d.id === deadline.id ? { ...d, isCompleted: !d.isCompleted } : d
        ));
      }
    } catch (error) {
      console.error('Toggle deadline error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this deadline?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gamification/deadlines/${id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (res.ok) {
        setDeadlines(deadlines.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error('Delete deadline error:', error);
    }
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600';
      case 'HIGH': return 'text-orange-600';
      case 'MEDIUM': return 'text-yellow-600';
      default: return 'text-emerald-600';
    }
  };

  return (
    <Card className="p-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Deadlines
          </h3>
        </div>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="mb-4 p-3 border-2 border-primary/30 rounded-lg">
          <input
            type="text"
            placeholder="Deadline title"
            value={newDeadline.title}
            onChange={e => setNewDeadline({ ...newDeadline, title: e.target.value })}
            className="w-full mb-2 p-2 border border-border rounded bg-white text-foreground"
          />
          <input
            type="date"
            value={newDeadline.dueDate}
            onChange={e => setNewDeadline({ ...newDeadline, dueDate: e.target.value })}
            aria-label="Due date"
            className="w-full mb-2 p-2 border border-border rounded bg-white text-foreground"
          />
          <select
            value={newDeadline.priority}
            onChange={e => setNewDeadline({ ...newDeadline, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' })}
            aria-label="Priority"
            className="w-full mb-2 p-2 border border-border rounded bg-white text-foreground"
          >
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="URGENT">Urgent</option>
          </select>
          <div className="flex gap-2">
            <Button onClick={handleCreate} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              Add
            </Button>
            <Button onClick={() => setIsCreating(false)} size="sm" variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Deadlines List */}
      <div className="space-y-2">
        {deadlines.map(deadline => (
          <div
            key={deadline.id}
            className={`p-3 rounded-lg border ${
              deadline.isCompleted
                ? 'bg-emerald-50 border-emerald-200'
                : isOverdue(deadline.dueDate)
                ? 'bg-red-50 border-red-200'
                : 'bg-secondary border-border'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleComplete(deadline)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      deadline.isCompleted
                        ? 'bg-green-600 border-green-600'
                        : 'border-gray-400'
                    }`}
                  >
                    {deadline.isCompleted && <Check className="w-4 h-4 text-white" />}
                  </button>
                  <span className={`font-medium ${deadline.isCompleted ? 'line-through text-gray-500' : 'text-foreground'}`}>
                    {deadline.title}
                  </span>
                  <span className={`text-xs font-semibold ${getPriorityColor(deadline.priority)}`}>
                    {deadline.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  {isOverdue(deadline.dueDate) && !deadline.isCompleted && (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>
                    {new Date(deadline.dueDate).toLocaleDateString()}
                  </span>
                  {isOverdue(deadline.dueDate) && !deadline.isCompleted && (
                    <span className="text-red-600 font-semibold">Overdue</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(deadline.id)}
                className="p-1 hover:bg-muted rounded"
                aria-label="Delete deadline"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {deadlines.length === 0 && !isCreating && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          No deadlines set
        </div>
      )}
    </Card>
  );
}
