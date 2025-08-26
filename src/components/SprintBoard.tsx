"use client";

import React, { useEffect, useState } from "react";

type ColumnId = "todo" | "inprogress" | "done";

type Task = {
  id: string;
  title: string;
  description?: string;
  status: ColumnId;
};

const STORAGE_KEY = "sprintboard.tasks.v1";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function SprintBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTasks(JSON.parse(raw));
      else
        setTasks([
          { id: uid(), title: "Setup project repo", status: "todo" },
          { id: uid(), title: "Design landing page", status: "inprogress" },
          { id: uid(), title: "Release v1.0", status: "done" },
        ]);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      // ignore
    }
  }, [tasks]);

  function addTask(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks((s) => [{ id: uid(), title: trimmed, status: "todo" }, ...s]);
    setTitle("");
  }

  function onDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDrop(e: React.DragEvent, newStatus: ColumnId) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    setTasks((s) => s.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function removeTask(id: string) {
    setTasks((s) => s.filter((t) => t.id !== id));
  }

  const columns: { id: ColumnId; title: string }[] = [
    { id: "todo", title: "Todo" },
    { id: "inprogress", title: "In Progress" },
    { id: "done", title: "Done" },
  ];

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sprint Board Lite</h1>
        <form onSubmit={addTask} className="flex gap-2">
          <input
            aria-label="New task title"
            className="px-3 py-2 border rounded-md w-64 text-sm"
            placeholder="Add new task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            type="submit"
            className="px-3 py-2 bg-foreground text-background rounded-md text-sm font-medium"
          >
            Add
          </button>
        </form>
      </header>

      <div className="flex gap-4 items-start">
        {columns.map((col) => (
          <section
            key={col.id}
            onDrop={(e) => onDrop(e, col.id)}
            onDragOver={onDragOver}
            className="flex-1 bg-[color:var(--background)]/80 border rounded-lg p-4 min-h-[320px]"
          >
            <h2 className="text-sm font-semibold mb-3 flex items-center justify-between">
              <span>{col.title}</span>
              <span className="text-xs text-muted-foreground">
                {tasks.filter((t) => t.status === col.id).length}
              </span>
            </h2>

            <div className="flex flex-col gap-3">
              {tasks
                .filter((t) => t.status === col.id)
                .map((t) => (
                  <article
                    key={t.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, t.id)}
                    className="bg-white/90 dark:bg-gray-800 border rounded-md p-3 shadow-sm cursor-grab select-none"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-medium text-sm">{t.title}</h3>
                        {t.description ? (
                          <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => removeTask(t.id)}
                          className="text-xs text-red-500 hover:underline"
                          aria-label={`Remove ${t.title}`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-500">Drag cards between columns. Data is stored in localStorage.</p>
    </div>
  );
}
