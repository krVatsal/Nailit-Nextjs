export type Task = { id: string; title: string; description?: string; priority?: string; status: string };

export const store: Task[] = [
  { id: "t1", title: "Setup project repo", status: "todo", priority: "medium" },
  { id: "t2", title: "Design landing page", status: "inprogress", priority: "high" },
  { id: "t3", title: "Release v1.0", status: "done", priority: "low" },
];

export function maybeFail() {
  return Math.random() < 0.1;
}
