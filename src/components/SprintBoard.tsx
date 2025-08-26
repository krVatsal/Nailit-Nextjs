"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import CreateTaskModal from "./CreateTaskModal";

type ColumnId = "todo" | "inprogress" | "done";

type Task = {
  id: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  status: ColumnId;
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

type UndoEntry = {
  id: string;
  prevTasks: Task[];
  oldStatus: ColumnId;
  timerId: number;
};

export default function SprintBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [undo, setUndo] = useState<UndoEntry | null>(null);
  // avoid next/router in tests; use location fallback for navigation
  const mounted = useRef(false);

  // theme persisted: 'light' | 'dark'
  const [theme, setTheme] = useState<string>(() => {
    try {
      return localStorage.getItem("theme") || "system";
    } catch {
      return "system";
    }
  });

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    // apply persisted theme
    try {
      const t = localStorage.getItem("theme");
      if (t === "dark") document.documentElement.classList.add("dark");
      else if (t === "light") document.documentElement.classList.remove("dark");
    } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // safe-guard if fetch isn't available (tests)
    if (typeof fetch !== "function") {
      setLoading(false);
      return;
    }

    fetch("/api/tasks")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load tasks");
        return r.json();
      })
      .then((data: Task[]) => {
        if (cancelled) return;
        setTasks(data);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  function onDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  async function doServerUpdate(id: string, status: ColumnId) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Server update failed");
    return res.json();
  }

  function scheduleUndo(id: string, prevTasks: Task[], oldStatus: ColumnId) {
    // clear existing undo
    if (undo) {
      window.clearTimeout(undo.timerId);
      setUndo(null);
    }
    const timerId = window.setTimeout(() => {
      setUndo((u) => (u && u.id === id ? null : u));
    }, 5000) as unknown as number;
    setUndo({ id, prevTasks, oldStatus, timerId });
  }

  async function onDrop(e: React.DragEvent, newStatus: ColumnId) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const prev = tasks;
    const next = tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t));
    setTasks(next);

    // schedule undo for 5s
    const moved = tasks.find((t) => t.id === id);
    const oldStatus = moved?.status || ("todo" as ColumnId);
    scheduleUndo(id, prev, oldStatus);

    try {
      await doServerUpdate(id, newStatus);
    } catch (err) {
      // rollback on server failure
      setTasks(prev);
      if (undo) {
        window.clearTimeout(undo.timerId);
        setUndo(null);
      }
      alert("Failed to update task on server. Reverting change.");
    }
  }

  async function handleUndo() {
    if (!undo) return;
    const { id, prevTasks, oldStatus, timerId } = undo;
    window.clearTimeout(timerId);
    setTasks(prevTasks);
    setUndo(null);
    try {
      await doServerUpdate(id, oldStatus);
    } catch (e) {
      alert("Failed to revert move on server.");
    }
  }

  async function createTask(payload: { title: string; description?: string; priority?: any }) {
    const tempId = `temp-${uid()}`;
    const tempTask: Task = { id: tempId, title: payload.title, description: payload.description, priority: payload.priority, status: "todo" };
    setTasks((s) => [tempTask, ...s]);
    setModalOpen(false);

    try {
      const res = await fetch(`/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Create failed");
      const created: Task = await res.json();
      setTasks((s) => s.map((t) => (t.id === tempId ? created : t)));
    } catch (e) {
      setTasks((s) => s.filter((t) => t.id !== tempId));
      alert("Failed to create task on server.");
    }
  }

  async function removeTask(id: string) {
    const prev = tasks;
    setTasks((s) => s.filter((t) => t.id !== id));
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    } catch (e) {
      setTasks(prev);
      alert("Failed to delete task on server.");
    }
  }

  const columns: { id: ColumnId; title: string }[] = [
    { id: "todo", title: "Todo" },
    { id: "inprogress", title: "In Progress" },
    { id: "done", title: "Done" },
  ];

  function logout() {
    try {
      localStorage.removeItem("token");
    } catch {}
    if (typeof window !== "undefined") window.location.href = "/login";
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (!q) return true;
      return t.title.toLowerCase().includes(q);
    });
  }, [tasks, query, priorityFilter]);

  function toggleTheme() {
    try {
      const next = theme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      setTheme(next);
      if (next === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    } catch {}
  }

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      <header className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Sprint Board Lite</h1>
          <div className="hidden sm:flex items-center gap-2">
            <input aria-label="search" placeholder="Search by title" value={query} onChange={(e) => setQuery(e.target.value)} className="px-2 py-1 border rounded text-sm" />
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-2 py-1 border rounded text-sm">
              <option value="all">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="px-2 py-1 border rounded text-sm">{theme === "dark" ? "Dark" : "Light"}</button>
          <button onClick={() => setModalOpen(true)} className="px-3 py-2 bg-foreground text-background rounded-md text-sm font-medium">New Task</button>
          <button onClick={logout} className="px-3 py-2 border rounded-md text-sm">Logout</button>
        </div>
      </header>

      {loading ? (
        <div className="flex gap-3">
          {columns.map((col) => (
            <section key={col.id} className="flex-1 bg-[color:var(--background)]/80 border rounded-lg p-4">
              <div className="h-4 bg-gray-200/60 rounded w-24 mb-3 animate-pulse"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200/40 rounded animate-pulse" />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 border rounded bg-red-50 text-red-700">{error}</div>
      ) : tasks.length === 0 ? (
        <div className="p-6 border rounded text-center">
          <p>No tasks yet.</p>
          <div className="mt-3">
            <button onClick={() => setModalOpen(true)} className="px-3 py-2 bg-foreground text-background rounded">Create first task</button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex sm:hidden mb-3 gap-2">
            <input aria-label="search" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 px-2 py-1 border rounded text-sm" />
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-2 py-1 border rounded text-sm">
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex gap-4 items-start">
            {columns.map((col) => (
              <section key={col.id} onDrop={(e) => onDrop(e, col.id)} onDragOver={onDragOver} className="flex-1 bg-[color:var(--background)]/80 border rounded-lg p-4 min-h-[200px]">
                <h2 className="text-sm font-semibold mb-3 flex items-center justify-between">
                  <span>{col.title}</span>
                  <span className="text-xs text-muted-foreground">{visible.filter((t) => t.status === col.id).length}</span>
                </h2>

                <div className="flex flex-col gap-3">
                  {visible
                    .filter((t) => t.status === col.id)
                    .map((t) => (
                      <article key={t.id} draggable onDragStart={(e) => onDragStart(e, t.id)} className="bg-white/90 dark:bg-gray-800 border rounded-md p-3 shadow-sm cursor-grab select-none">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h3 className="font-medium text-sm">{t.title}</h3>
                            {t.description ? <p className="text-xs text-gray-500 mt-1">{t.description}</p> : null}
                            {t.priority ? <div className="text-xs mt-1">Priority: <strong>{t.priority}</strong></div> : null}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <button onClick={() => removeTask(t.id)} className="text-xs text-red-500 hover:underline" aria-label={`Remove ${t.title}`}>Remove</button>
                          </div>
                        </div>
                      </article>
                    ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-500">Drag cards between columns. Data is loaded from a mocked API with simulated failures (10%).</p>

      <CreateTaskModal open={isModalOpen} onClose={() => setModalOpen(false)} onCreate={createTask} />

      {/* Undo toast */}
      {undo ? (
        <div className="fixed bottom-4 right-4 bg-white border rounded shadow px-4 py-2 flex items-center gap-3">
          <span className="text-sm">Moved task</span>
          <button onClick={handleUndo} className="px-2 py-1 bg-gray-200 rounded text-sm">Undo</button>
        </div>
      ) : null}
    </div>
  );
}
