'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Pin, Edit2, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface Note {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface NotesEditorProps {
  projectId: string;
}

export default function NotesEditor({ projectId }: NotesEditorProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: [] as string[] });
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspace/notes/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes);
      }
    } catch (error) {
      console.error('Fetch notes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newNote.content.trim()) {
      alert('Note content is required');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspace/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId,
          title: newNote.title || 'Untitled Note',
          content: newNote.content,
          tags: newNote.tags
        })
      });

      if (res.ok) {
        const data = await res.json();
        setNotes([data.note, ...notes]);
        setNewNote({ title: '', content: '', tags: [] });
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Create note error:', error);
    }
  };

  const handleUpdate = async (noteId: string, updates: Partial<Note>) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspace/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        const data = await res.json();
        setNotes(notes.map(n => n.id === noteId ? data.note : n));
        setEditingId(null);
      }
    } catch (error) {
      console.error('Update note error:', error);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Delete this note?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspace/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setNotes(notes.filter(n => n.id !== noteId));
      }
    } catch (error) {
      console.error('Delete note error:', error);
    }
  };

  const togglePin = async (note: Note) => {
    await handleUpdate(note.id, { isPinned: !note.isPinned });
  };

  if (loading) {
    return <div className="text-center py-8">Loading notes...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground">
          Project Notes
        </h3>
        {!isCreating && (
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        )}
      </div>

      {/* Create Note Form */}
      {isCreating && (
        <Card className="p-4 border-2 border-primary/30">
          <input
            type="text"
            placeholder="Note title (optional)"
            value={newNote.title}
            onChange={e => setNewNote({ ...newNote, title: e.target.value })}
            className="w-full mb-3 p-2 border border-border rounded-lg bg-white text-foreground"
          />
          <textarea
            placeholder="Write your note here..."
            value={newNote.content}
            onChange={e => setNewNote({ ...newNote, content: e.target.value })}
            rows={6}
            className="w-full p-3 border border-border rounded-lg bg-white text-foreground resize-none"
          />
          <div className="flex gap-2 mt-3">
            <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700 text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Note
            </Button>
            <Button onClick={() => setIsCreating(false)} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Notes List */}
      <div className="grid gap-4 md:grid-cols-2">
        {notes.map(note => (
          <Card
            key={note.id}
            className={`p-4 ${note.isPinned ? 'border-2 border-yellow-400 bg-yellow-50' : ''}`}
          >
            {editingId === note.id ? (
              <div>
                <input
                  type="text"
                  value={note.title}
                  onChange={e => setNotes(notes.map(n => n.id === note.id ? { ...n, title: e.target.value } : n))}
                  aria-label="Note title"
                  className="w-full mb-2 p-2 border border-border rounded-lg bg-white"
                />
                <textarea
                  value={note.content}
                  onChange={e => setNotes(notes.map(n => n.id === note.id ? { ...n, content: e.target.value } : n))}
                  rows={4}
                  aria-label="Note content"
                  className="w-full p-2 border border-border rounded-lg bg-white resize-none"
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => handleUpdate(note.id, { title: note.title, content: note.content })}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Save
                  </Button>
                  <Button onClick={() => setEditingId(null)} size="sm" variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    {note.isPinned && <Pin className="w-4 h-4 text-yellow-600" />}
                    {note.title}
                  </h4>
                  <div className="flex gap-1">
                    <button
                      onClick={() => togglePin(note)}
                      className="p-1 hover:bg-muted rounded"
                      aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
                    >
                      <Pin className={`w-4 h-4 ${note.isPinned ? 'text-yellow-600' : 'text-gray-400'}`} />
                    </button>
                    <button
                      onClick={() => setEditingId(note.id)}
                      className="p-1 hover:bg-muted rounded"
                      aria-label="Edit note"
                    >
                      <Edit2 className="w-4 h-4 text-primary" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1 hover:bg-muted rounded"
                      aria-label="Delete note"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {note.content}
                </p>
                <div className="text-xs text-muted-foreground mt-2">
                  Updated {new Date(note.updatedAt).toLocaleDateString()}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {notes.length === 0 && !isCreating && (
        <div className="text-center py-12 text-muted-foreground">
          No notes yet. Click &quot;New Note&quot; to get started!
        </div>
      )}
    </div>
  );
}
