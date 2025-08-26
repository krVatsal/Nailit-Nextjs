"use client";

import React, { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: { title: string; description?: string; priority?: string }) => void;
};

export default function CreateTaskModal({ open, onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setPriority("medium");
    }
  }, [open]);

  if (!open) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({ title: title.trim(), description: description.trim(), priority });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 p-4 rounded shadow-md w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2">Create Task</h3>
        <form onSubmit={submit} className="flex flex-col gap-2">
          <input className="px-3 py-2 border rounded" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="px-3 py-2 border rounded" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <select className="px-3 py-2 border rounded" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
            <button type="submit" className="px-3 py-2 bg-foreground text-background rounded">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
