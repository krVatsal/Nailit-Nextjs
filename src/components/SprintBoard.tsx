"use client";

import React, { useEffect, useState } from "react";
import CreateTaskModal from "./CreateTaskModal";
import { useRouter } from "next/navigation";

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

export default function SprintBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
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

  // optimistic update when moving a task
  function onDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  }

  async function onDrop(e: React.DragEvent, newStatus: ColumnId) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const prev = tasks;
    const next = tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t));
    setTasks(next);

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Server update failed");
    } catch (e) {
      setTasks(prev); // rollback
      alert("Failed to update task on server. Reverting change.");
    }
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  async function createTask(payload: { title: string; description?: string; priority?: any }) {
    // optimistic create: add temp id then replace on success
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
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sprint Board Lite</h1>
        <div className="flex gap-2 items-center">
          <button onClick={() => setModalOpen(true)} className="px-3 py-2 bg-foreground text-background rounded-md text-sm font-medium">New Task</button>
          <button onClick={logout} className="px-3 py-2 border rounded-md text-sm">Logout</button>
        </div>
      </header>

      {loading ? (
        <p>Loading tasks…</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <div className="flex gap-4 items-start">
          {columns.map((col) => (
            <section key={col.id} onDrop={(e) => onDrop(e, col.id)} onDragOver={onDragOver} className="flex-1 bg-[color:var(--background)]/80 border rounded-lg p-4 min-h-[320px]">
              <h2 className="text-sm font-semibold mb-3 flex items-center justify-between">
                <span>{col.title}</span>
                <span className="text-xs text-muted-foreground">{tasks.filter((t) => t.status === col.id).length}</span>
              </h2>

              <div className="flex flex-col gap-3">
                {tasks
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
      )}

      <p className="mt-4 text-xs text-gray-500">Drag cards between columns. Data is loaded from a mocked API with simulated failures (10%).</p>

      <CreateTaskModal open={isModalOpen} onClose={() => setModalOpen(false)} onCreate={createTask} />
    </div>
  );
}
